"""
Comprehensive MIME type fix for Django admin static files
This addresses the MIME type errors you're seeing in the browser console
"""

import mimetypes
import os
from django.conf import settings
from django.http import HttpResponse, Http404
from django.utils.deprecation import MiddlewareMixin


class MimeTypeFixMiddleware(MiddlewareMixin):
    """
    Middleware to fix MIME type issues for static files
    """
    
    def __init__(self, get_response):
        super().__init__(get_response)
        # Initialize comprehensive MIME type mappings
        self._init_mime_types()
    
    def _init_mime_types(self):
        """Initialize comprehensive MIME type mappings"""
        mimetypes.init()
        
        # CSS files
        mimetypes.add_type('text/css', '.css')
        
        # JavaScript files
        mimetypes.add_type('application/javascript', '.js')
        mimetypes.add_type('text/javascript', '.js')
        
        # JSON files
        mimetypes.add_type('application/json', '.json')
        
        # Image files
        mimetypes.add_type('image/png', '.png')
        mimetypes.add_type('image/jpeg', '.jpg')
        mimetypes.add_type('image/jpeg', '.jpeg')
        mimetypes.add_type('image/gif', '.gif')
        mimetypes.add_type('image/svg+xml', '.svg')
        mimetypes.add_type('image/webp', '.webp')
        mimetypes.add_type('image/x-icon', '.ico')
        
        # Font files
        mimetypes.add_type('font/woff', '.woff')
        mimetypes.add_type('font/woff2', '.woff2')
        mimetypes.add_type('font/ttf', '.ttf')
        mimetypes.add_type('font/otf', '.otf')
        
        # Other files
        mimetypes.add_type('text/plain', '.txt')
        mimetypes.add_type('text/html', '.html')
        mimetypes.add_type('text/xml', '.xml')
    
    def process_request(self, request):
        """Process requests to fix MIME type issues"""
        if not settings.DEBUG:
            return None
        
        # Handle static file requests
        if request.path.startswith('/static/'):
            return self._handle_static_file(request)
        
        # Handle potential misrouted admin static files
        if request.path.startswith('/admin/') and self._is_static_file_request(request.path):
            return self._handle_misrouted_static_file(request)
        
        return None
    
    def _is_static_file_request(self, path):
        """Check if the request is for a static file"""
        static_extensions = ['.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf', '.otf']
        return any(path.endswith(ext) for ext in static_extensions)
    
    def _handle_static_file(self, request):
        """Handle static file requests with correct MIME types"""
        try:
            # Remove /static/ prefix
            file_path = request.path[len('/static/'):]
            
            # Try to find the file in STATIC_ROOT
            full_path = os.path.join(settings.STATIC_ROOT, file_path)
            
            if os.path.exists(full_path) and os.path.isfile(full_path):
                return self._serve_file_with_correct_mime_type(full_path)
            
            # Try to find the file in STATICFILES_DIRS
            for static_dir in settings.STATICFILES_DIRS:
                full_path = os.path.join(static_dir, file_path)
                if os.path.exists(full_path) and os.path.isfile(full_path):
                    return self._serve_file_with_correct_mime_type(full_path)
            
        except Exception as e:
            print(f"Error handling static file {request.path}: {e}")
        
        return None
    
    def _handle_misrouted_static_file(self, request):
        """Handle static files that are being requested from /admin/ instead of /static/"""
        try:
            # Extract the file path after /admin/
            file_path = request.path[len('/admin/'):]
            
            # Try to find the file in salon static directory
            salon_static_path = os.path.join(settings.STATIC_ROOT, 'salon', file_path)
            if os.path.exists(salon_static_path) and os.path.isfile(salon_static_path):
                return self._serve_file_with_correct_mime_type(salon_static_path)
            
            # Try to find the file in salon app static directory
            app_static_path = os.path.join(settings.BASE_DIR, 'salon', 'static', 'salon', file_path)
            if os.path.exists(app_static_path) and os.path.isfile(app_static_path):
                return self._serve_file_with_correct_mime_type(app_static_path)
            
        except Exception as e:
            print(f"Error handling misrouted static file {request.path}: {e}")
        
        return None
    
    def _serve_file_with_correct_mime_type(self, file_path):
        """Serve a file with the correct MIME type"""
        try:
            # Get the correct MIME type
            mime_type, _ = mimetypes.guess_type(file_path)
            
            # Fallback MIME types based on extension
            if not mime_type:
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
                else:
                    mime_type = 'application/octet-stream'
            
            # Read and serve the file
            with open(file_path, 'rb') as f:
                content = f.read()
            
            response = HttpResponse(content, content_type=mime_type)
            response['Content-Length'] = len(content)
            
            # Add appropriate cache headers
            if mime_type.startswith('text/css') or mime_type.startswith('application/javascript'):
                response['Cache-Control'] = 'public, max-age=3600'
            elif mime_type.startswith('image/'):
                response['Cache-Control'] = 'public, max-age=86400'
            
            return response
            
        except Exception as e:
            print(f"Error serving file {file_path}: {e}")
            raise Http404("File not found")
