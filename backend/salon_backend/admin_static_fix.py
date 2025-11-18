"""
Admin Static Files Fix Middleware
Specifically handles static file issues in Django admin
"""

import os
import mimetypes
from django.http import HttpResponse, Http404
from django.conf import settings
from django.utils.deprecation import MiddlewareMixin


class AdminStaticFixMiddleware(MiddlewareMixin):
    """
    Middleware specifically for fixing static file issues in Django admin
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
    
    def process_request(self, request):
        if settings.DEBUG:
            # Handle admin static file requests
            if self._is_admin_static_request(request.path):
                return self._serve_admin_static_file(request.path)
        
        return None
    
    def _is_admin_static_request(self, path):
        """Check if this is an admin static file request"""
        # Check if it's a static file request that's getting HTML response
        if path.endswith(('.css', '.js', '.png', '.jpg', '.jpeg', '.svg', '.ico', '.woff', '.woff2', '.ttf')):
            return True
        
        # Check if it's a request to /admin/ that should be a static file
        if path.startswith('/admin/') and any(path.endswith(ext) for ext in ['.css', '.js', '.png', '.jpg', '.jpeg', '.svg', '.ico']):
            return True
        
        return False
    
    def _serve_admin_static_file(self, path):
        """Serve admin static file"""
        try:
            # Extract file name from path
            file_name = path.split('/')[-1]
            
            # Define search paths for admin static files
            search_paths = [
                # Salon static files
                os.path.join(settings.STATIC_ROOT, 'salon', 'css', file_name),
                os.path.join(settings.STATIC_ROOT, 'salon', 'js', file_name),
                os.path.join(settings.STATIC_ROOT, 'salon', 'img', file_name),
                os.path.join(settings.STATIC_ROOT, file_name),
                
                # App static files
                os.path.join(settings.BASE_DIR, 'salon', 'static', 'salon', 'css', file_name),
                os.path.join(settings.BASE_DIR, 'salon', 'static', 'salon', 'js', file_name),
                os.path.join(settings.BASE_DIR, 'salon', 'static', 'salon', 'img', file_name),
                
                # Admin static files
                os.path.join(settings.STATIC_ROOT, 'admin', 'css', file_name),
                os.path.join(settings.STATIC_ROOT, 'admin', 'js', file_name),
                os.path.join(settings.STATIC_ROOT, 'admin', 'img', file_name),
            ]
            
            # Try to find the file
            for file_path in search_paths:
                if os.path.exists(file_path) and os.path.isfile(file_path):
                    return self._serve_file_with_headers(file_path)
            
            # If not found, try to find by partial name match
            return self._find_file_by_partial_match(file_name)
            
        except Exception as e:
            print(f"Error serving admin static file {path}: {e}")
            return None
    
    def _find_file_by_partial_match(self, file_name):
        """Find file by partial name match"""
        try:
            # Search in salon static directory
            salon_static_dir = os.path.join(settings.STATIC_ROOT, 'salon')
            if os.path.exists(salon_static_dir):
                for root, dirs, files in os.walk(salon_static_dir):
                    for file in files:
                        if file_name in file or file in file_name:
                            file_path = os.path.join(root, file)
                            if os.path.isfile(file_path):
                                return self._serve_file_with_headers(file_path)
            
            return None
            
        except Exception as e:
            print(f"Error finding file by partial match {file_name}: {e}")
            return None
    
    def _serve_file_with_headers(self, file_path):
        """Serve file with proper headers"""
        try:
            # Get MIME type
            mime_type, _ = mimetypes.guess_type(file_path)
            if not mime_type:
                # Fallback MIME types
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
            
            # Read file content
            with open(file_path, 'rb') as f:
                content = f.read()
            
            # Create response
            response = HttpResponse(content, content_type=mime_type)
            response['Content-Length'] = len(content)
            
            # Add cache headers
            if mime_type.startswith('text/css'):
                response['Cache-Control'] = 'public, max-age=3600'
            elif mime_type.startswith('application/javascript'):
                response['Cache-Control'] = 'public, max-age=3600'
            elif mime_type.startswith('image/'):
                response['Cache-Control'] = 'public, max-age=86400'
            elif mime_type.startswith('font/'):
                response['Cache-Control'] = 'public, max-age=31536000'
            
            # Add CORS headers for development
            response['Access-Control-Allow-Origin'] = '*'
            response['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
            response['Access-Control-Allow-Headers'] = 'Content-Type'
            
            return response
            
        except Exception as e:
            print(f"Error serving file {file_path}: {e}")
            return None
