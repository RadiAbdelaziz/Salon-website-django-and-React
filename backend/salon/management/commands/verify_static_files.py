from django.core.management.base import BaseCommand
from django.conf import settings
import os


class Command(BaseCommand):
    help = 'Verify all static files are collected and accessible'

    def handle(self, *args, **options):
        print("=== Static Files Verification ===")
        
        # Check if static root exists
        print(f"\n1. Static Root: {settings.STATIC_ROOT}")
        print(f"   Exists: {os.path.exists(settings.STATIC_ROOT)}")
        
        # Check required files
        required_files = [
            'salon/css/glammy_unfold_overrides.css',
            'salon/css/unfold_form_fixes.css',
            'salon/css/sidebar_expanded.css',
            'salon/js/glammy_unfold.js',
            'salon/js/sidebar_expanded.js',
            'salon_backend\media\logo-05.png',
            'admin/css/base.css',
            'admin/js/core.js',
        ]
        
        print(f"\n2. Required Files:")
        for file_path in required_files:
            full_path = os.path.join(settings.STATIC_ROOT, file_path)
            exists = os.path.exists(full_path)
            status = "OK" if exists else "MISSING"
            print(f"   [{status}] {file_path}")
            if exists:
                size = os.path.getsize(full_path)
                print(f"      Size: {size} bytes")
        
        print(f"\n3. Static URL: {settings.STATIC_URL}")
        print(f"\n4. Test URLs:")
        print(f"   http://127.0.0.1:8000/static/salon/css/glammy_unfold_overrides.css")
        print(f"   http://127.0.0.1:8000/static/salon/js/glammy_unfold.js")
        print(f"   http://127.0.0.1:8000/static/admin/css/base.css")
        
        print(f"\n5. Next Steps:")
        print(f"   - Server should be running with MIME types configured")
        print(f"   - Clear browser cache (Ctrl + Shift + R)")
        print(f"   - Go to: http://127.0.0.1:8000/admin/")
        print(f"   - Check browser console for errors")
        
        print(f"\n=== Verification Complete ===")

