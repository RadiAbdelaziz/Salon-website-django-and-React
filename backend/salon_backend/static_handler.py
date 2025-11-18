"""
Enhanced static file handler for Django development
"""
import os
import mimetypes
from django.http import HttpResponse, Http404
from django.conf import settings
from django.utils.deprecation import MiddlewareMixin


class AdminStaticFilesMiddleware(MiddlewareMixin):
    """
    Enhanced middleware to serve static files with correct MIME types
    """
    
    def __init__(self, get_response):
        super().__init__(get_response)
        # Initialize mimetypes with comprehensive mappings
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
            # Handle /static/ URLs
            if request.path.startswith(settings.STATIC_URL):
                file_path = request.path[len(settings.STATIC_URL):]
                full_path = os.path.join(settings.STATIC_ROOT, file_path)
                
                if os.path.exists(full_path) and os.path.isfile(full_path):
                    return self._serve_file(full_path)
            
            # Handle /admin/salon/ static files (for admin custom files)
            if request.path.startswith('/admin/salon/'):
                # Extract the file path after /admin/salon/
                file_path = request.path[len('/admin/salon/'):]
                
                # Try to find the file in salon static directory
                salon_static_path = os.path.join(settings.STATIC_ROOT, 'salon', file_path)
                if os.path.exists(salon_static_path) and os.path.isfile(salon_static_path):
                    return self._serve_file(salon_static_path)
                
                # Try to find the file in salon app static directory
                app_static_path = os.path.join(settings.BASE_DIR, 'salon', 'static', 'salon', file_path)
                if os.path.exists(app_static_path) and os.path.isfile(app_static_path):
                    return self._serve_file(app_static_path)
            
            # Handle direct static file requests that might be getting HTML responses
            if request.path.endswith(('.css', '.js', '.png', '.jpg', '.jpeg', '.svg', '.ico', '.woff', '.woff2', '.ttf')):
                # Try to find the file in staticfiles
                static_file_path = os.path.join(settings.STATIC_ROOT, request.path.lstrip('/'))
                if os.path.exists(static_file_path) and os.path.isfile(static_file_path):
                    return self._serve_file(static_file_path)
        
        return None
    
    def _serve_file(self, file_path):
        """Serve a file with correct MIME type"""
        try:
            # Get the correct MIME type
            mime_type, _ = mimetypes.guess_type(file_path)
            if not mime_type:
                # Default MIME types based on extension
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
                else:
                    mime_type = 'application/octet-stream'
            
            # Read and serve the file
            with open(file_path, 'rb') as f:
                content = f.read()
            
            response = HttpResponse(content, content_type=mime_type)
            response['Content-Length'] = len(content)
            
            # Add cache headers for static files
            if mime_type.startswith('text/css') or mime_type.startswith('application/javascript'):
                response['Cache-Control'] = 'public, max-age=3600'
            
            return response
            
        except Exception as e:
            # Log the error but don't crash
            print(f"Error serving static file {file_path}: {e}")
            raise Http404("Static file not found")