"""
Static URL Fix Middleware for Django Admin
Fixes static file URL issues in Django admin
"""

import os
import mimetypes
from django.http import HttpResponse, Http404
from django.conf import settings
from django.utils.deprecation import MiddlewareMixin
from django.urls import reverse


class StaticUrlFixMiddleware(MiddlewareMixin):
    """
    Middleware to fix static file URL issues in Django admin
    """
    
    def __init__(self, get_response):
        super().__init__(get_response)
        # Initialize comprehensive MIME types
        mimetypes.init()
        mimetypes.add_type('text/css', '.css')
        mimetypes.add_type('application/javascript', '.js')
        mimetypes.add_type('application/json', '.json')
        mimetypes.add_type('image/png', '.png')
        mimetypes.add_type('image/jpeg', '.jpg')
        mimetypes.add_type('image/jpeg', '.jpeg')
        mimetypes.add_type('image/svg+xml', '.svg')
        mimetypes.add_type('font/woff', '.woff')
        mimetypes.add_type('font/woff2', '.woff2')
        mimetypes.add_type('font/ttf', '.ttf')
        mimetypes.add_type('image/x-icon', '.ico')
        mimetypes.add_type('image/webp', '.webp')
        mimetypes.add_type('text/plain', '.txt')
        mimetypes.add_type('application/x-font-woff', '.woff')
        mimetypes.add_type('application/font-woff2', '.woff2')
    
    def process_request(self, request):
        if settings.DEBUG:
            # Handle requests that should be static files but are getting HTML responses
            if self._is_static_file_request(request.path):
                return self._serve_static_file(request.path)
            
            # Handle admin static file requests that are getting redirected
            if request.path.startswith('/admin/') and self._is_static_file_request(request.path):
                # Extract the file name from the path
                file_name = request.path.split('/')[-1]
                return self._find_and_serve_static_file(file_name)
        
        return None
    
    def _is_static_file_request(self, path):
        """Check if the request is for a static file"""
        static_extensions = ('.css', '.js', '.png', '.jpg', '.jpeg', '.svg', '.ico', 
                           '.woff', '.woff2', '.ttf', '.webp', '.gif', '.pdf')
        return any(path.endswith(ext) for ext in static_extensions)
    
    def _serve_static_file(self, path):
        """Serve static file with correct MIME type"""
        try:
            # Remove leading slash
            clean_path = path.lstrip('/')
            
            # Try different possible locations
            possible_paths = [
                os.path.join(settings.STATIC_ROOT, clean_path),
                os.path.join(settings.STATIC_ROOT, 'salon', clean_path.split('/')[-1]),
                os.path.join(settings.BASE_DIR, 'salon', 'static', 'salon', clean_path.split('/')[-1]),
            ]
            
            # If path starts with static/, try to find it in STATIC_ROOT
            if clean_path.startswith('static/'):
                static_relative_path = clean_path[7:]  # Remove 'static/' prefix
                possible_paths.insert(0, os.path.join(settings.STATIC_ROOT, static_relative_path))
            
            # Try to find the file
            file_path = None
            for possible_path in possible_paths:
                if os.path.exists(possible_path) and os.path.isfile(possible_path):
                    file_path = possible_path
                    break
            
            if not file_path:
                return None
            
            return self._serve_file_with_mime_type(file_path)
            
        except Exception as e:
            print(f"Error serving static file {path}: {e}")
            return None
    
    def _find_and_serve_static_file(self, file_name):
        """Find and serve a static file by name"""
        try:
            # Search for the file in common locations
            search_paths = [
                os.path.join(settings.STATIC_ROOT, 'salon', 'css', file_name),
                os.path.join(settings.STATIC_ROOT, 'salon', 'js', file_name),
                os.path.join(settings.STATIC_ROOT, 'salon', 'img', file_name),
                os.path.join(settings.STATIC_ROOT, file_name),
                os.path.join(settings.BASE_DIR, 'salon', 'static', 'salon', 'css', file_name),
                os.path.join(settings.BASE_DIR, 'salon', 'static', 'salon', 'js', file_name),
                os.path.join(settings.BASE_DIR, 'salon', 'static', 'salon', 'img', file_name),
            ]
            
            for file_path in search_paths:
                if os.path.exists(file_path) and os.path.isfile(file_path):
                    return self._serve_file_with_mime_type(file_path)
            
            return None
            
        except Exception as e:
            print(f"Error finding static file {file_name}: {e}")
            return None
    
    def _serve_file_with_mime_type(self, file_path):
        """Serve a file with correct MIME type"""
        try:
            # Get MIME type
            mime_type, _ = mimetypes.guess_type(file_path)
            if not mime_type:
                # Fallback MIME types based on extension
                if file_path.endswith('.css'):
                    mime_type = 'text/css'
                elif file_path.endswith('.js'):
                    mime_type = 'application/javascript'
                elif file_path.endswith('.png'):
                    mime_type = 'image/png'
                elif file_path.endswith('.jpg') or file_path.endswith('.jpeg'):
                    mime_type = 'image/jpeg'
                elif file_path.endswith('.svg'):
                    mime_type = 'image/svg+xml'
                elif file_path.endswith('.ico'):
                    mime_type = 'image/x-icon'
                elif file_path.endswith('.woff'):
                    mime_type = 'font/woff'
                elif file_path.endswith('.woff2'):
                    mime_type = 'font/woff2'
                elif file_path.endswith('.ttf'):
                    mime_type = 'font/ttf'
                else:
                    mime_type = 'application/octet-stream'
            
            # Read and serve the file
            with open(file_path, 'rb') as f:
                content = f.read()
            
            response = HttpResponse(content, content_type=mime_type)
            response['Content-Length'] = len(content)
            
            # Add appropriate headers
            if mime_type.startswith('text/css'):
                response['Cache-Control'] = 'public, max-age=3600'
            elif mime_type.startswith('application/javascript'):
                response['Cache-Control'] = 'public, max-age=3600'
            elif mime_type.startswith('image/'):
                response['Cache-Control'] = 'public, max-age=86400'
            elif mime_type.startswith('font/'):
                response['Cache-Control'] = 'public, max-age=31536000'
            
            return response
            
        except Exception as e:
            print(f"Error serving file {file_path}: {e}")
            return None
