"""
Custom middleware for handling static files and MIME types
"""

from django.http import HttpResponse
from django.conf import settings
import mimetypes
import os


class StaticFilesMimeMiddleware:
    """
    Middleware to ensure proper MIME types for static files
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
        
        # Add common MIME types
        mimetypes.add_type("text/css", ".css", True)
        mimetypes.add_type("application/javascript", ".js", True)
        mimetypes.add_type("image/png", ".png", True)
        mimetypes.add_type("image/jpeg", ".jpg", True)
        mimetypes.add_type("image/jpeg", ".jpeg", True)
        mimetypes.add_type("image/gif", ".gif", True)
        mimetypes.add_type("image/svg+xml", ".svg", True)
        mimetypes.add_type("font/woff", ".woff", True)
        mimetypes.add_type("font/woff2", ".woff2", True)
        
    def __call__(self, request):
        response = self.get_response(request)
        
        # Fix MIME types for static files
        if request.path.startswith(settings.STATIC_URL):
            file_ext = os.path.splitext(request.path)[1].lower()
            
            if file_ext == '.css':
                response['Content-Type'] = 'text/css'
            elif file_ext == '.js':
                response['Content-Type'] = 'application/javascript'
            elif file_ext in ['.png', '.jpg', '.jpeg', '.gif']:
                response['Content-Type'] = f'image/{file_ext[1:]}'
            elif file_ext == '.svg':
                response['Content-Type'] = 'image/svg+xml'
            elif file_ext in ['.woff', '.woff2']:
                response['Content-Type'] = f'font/{file_ext[1:]}'
                
        return response


class CSPMiddleware:
    """
    Middleware to set proper Content Security Policy headers
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
        
    def __call__(self, request):
        response = self.get_response(request)
        
        # For development, disable CSP to allow images from Django backend
        # In production, you should set proper CSP headers
        if settings.DEBUG:
            # Remove any existing CSP headers (handle different response types)
            if hasattr(response, 'pop'):
                response.pop('Content-Security-Policy', None)
                response.pop('Content-Security-Policy-Report-Only', None)
            else:
                # For TemplateResponse and other response types, just don't set CSP
                pass
        else:
            # Set CSP headers for production
            csp_directives = [
                "default-src 'self'",
                "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
                "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
                "font-src 'self' fonts.googleapis.com fonts.gstatic.com",
                "img-src 'self' data: blob: http://localhost:8000 http://127.0.0.1:8000",
                "connect-src 'self' http://localhost:8000 http://127.0.0.1:8000",
                "frame-ancestors 'self'",
            ]
            response['Content-Security-Policy'] = '; '.join(csp_directives)
        
        # Set CORS headers to allow cross-origin requests
        response['Access-Control-Allow-Origin'] = '*'
        response['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
        response['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
            
        return response
