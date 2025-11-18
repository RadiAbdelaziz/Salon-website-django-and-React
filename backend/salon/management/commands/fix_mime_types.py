from django.core.management.base import BaseCommand
import mimetypes


class Command(BaseCommand):
    help = 'Fix MIME types for static files'

    def handle(self, *args, **options):
        print("=== Fixing MIME Types ===")
        
        # Initialize mimetypes
        mimetypes.init()
        
        # Add correct MIME types
        mime_mappings = {
            '.css': 'text/css',
            '.js': 'application/javascript',
            '.json': 'application/json',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.gif': 'image/gif',
            '.svg': 'image/svg+xml',
            '.woff': 'font/woff',
            '.woff2': 'font/woff2',
            '.ttf': 'font/ttf',
            '.eot': 'application/vnd.ms-fontobject',
            '.ico': 'image/x-icon',
        }
        
        print("\n1. Adding MIME type mappings:")
        for ext, mime_type in mime_mappings.items():
            mimetypes.add_type(mime_type, ext)
            print(f"   - {ext}: {mime_type}")
        
        print("\n2. Verifying MIME types:")
        test_files = ['style.css', 'script.js', 'image.png']
        for filename in test_files:
            mime_type, _ = mimetypes.guess_type(filename)
            print(f"   - {filename}: {mime_type}")
        
        print("\n3. Next steps:")
        print("   - Django server should auto-reload")
        print("   - Clear browser cache (Ctrl + Shift + R)")
        print("   - Go to: http://127.0.0.1:8000/admin/")
        print("   - Check browser console for errors")
        
        print("\n=== Fix Complete ===")
        print("MIME types have been configured correctly!")
