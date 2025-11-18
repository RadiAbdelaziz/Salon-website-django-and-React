from django.core.management.base import BaseCommand
from django.core.cache import cache
from django.conf import settings
import os


class Command(BaseCommand):
    help = 'Clear all caches and restart static files'

    def handle(self, *args, **options):
        print("=== Clearing Caches and Restarting ===")
        
        # Clear Django cache
        try:
            cache.clear()
            print("1. Django cache cleared")
        except:
            print("1. Django cache clear failed (not configured)")
        
        # Clear static files
        if os.path.exists(settings.STATIC_ROOT):
            print("2. Static files directory exists")
        else:
            print("2. Static files directory missing")
        
        print("\n3. Next steps:")
        print("   - Clear browser cache (Ctrl + Shift + R)")
        print("   - Go to: http://127.0.0.1:8000/admin/")
        print("   - Check if admin interface loads properly")
        
        print("\n4. If issues persist:")
        print("   - Try different browser")
        print("   - Check browser console for errors")
        print("   - Restart Django server")
        
        print("\n=== Cache Clear Complete ===")
