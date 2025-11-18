from django.core.management.base import BaseCommand
from django.conf import settings
from django.core.management import call_command
import os
import shutil


class Command(BaseCommand):
    help = 'Fix admin static files issues'

    def handle(self, *args, **options):
        print("=== Fixing Admin Static Files ===")
        
        # Clear static files
        if os.path.exists(settings.STATIC_ROOT):
            print("1. Clearing existing static files...")
            shutil.rmtree(settings.STATIC_ROOT)
        
        # Collect static files
        print("2. Collecting static files...")
        call_command('collectstatic', '--noinput', '--clear')
        
        # Check if admin files exist
        admin_css = os.path.join(settings.STATIC_ROOT, 'admin', 'css', 'base.css')
        admin_js = os.path.join(settings.STATIC_ROOT, 'admin', 'js', 'core.js')
        
        print(f"3. Checking admin files:")
        print(f"   - Admin CSS: {os.path.exists(admin_css)}")
        print(f"   - Admin JS: {os.path.exists(admin_js)}")
        
        if os.path.exists(admin_css) and os.path.exists(admin_js):
            print("✅ Admin static files are properly collected!")
            print("\n📋 Next steps:")
            print("1. Clear browser cache (Ctrl + Shift + R)")
            print("2. Go to: http://127.0.0.1:8000/admin/")
            print("3. Check browser console for any remaining errors")
        else:
            print("❌ Admin static files are missing!")
            print("Try running: python manage.py collectstatic --noinput")
        
        print("\n=== Fix Complete ===")
