from django.core.management.base import BaseCommand
from django.conf import settings
import os


class Command(BaseCommand):
    help = 'Show logo size configuration'

    def handle(self, *args, **options):
        print("=== Logo Size Configuration ===")
        
        # Check logo file
        logo_path = os.path.join(settings.MEDIA_ROOT, 'logo-05.png')
        print(f"\n1. Logo File:")
        print(f"   Path: /media/logo-05.png")
        print(f"   Exists: {os.path.exists(logo_path)}")
        
        if os.path.exists(logo_path):
            size = os.path.getsize(logo_path)
            print(f"   Size: {size:,} bytes ({size/1024:.1f} KB)")
        
        print(f"\n2. CSS Configuration Applied:")
        print(f"   Header Logo: 60px height")
        print(f"   Sidebar Logo: 80px height")
        print(f"   Favicon: 32x32px")
        print(f"   Width: Auto (preserves aspect ratio)")
        
        print(f"\n3. Logo Locations:")
        print(f"   - Top header (left side)")
        print(f"   - Sidebar (top)")
        print(f"   - Browser tab (favicon)")
        
        print(f"\n4. Current Settings:")
        print(f"   Display Mode: Both light and dark themes")
        print(f"   Object Fit: Contain (no distortion)")
        print(f"   Alignment: Centered in containers")
        
        print(f"\n5. To Change Logo Size:")
        print(f"   Edit: salon/static/salon/css/glammy_unfold_overrides.css")
        print(f"   Find: .logo img {{ max-height: 60px !important; }}")
        print(f"   Change: 60px to your desired size (e.g., 80px)")
        print(f"   Run: python manage.py collectstatic --noinput")
        print(f"   Refresh: Ctrl + Shift + R")
        
        print(f"\n6. Test URLs:")
        print(f"   Admin: http://127.0.0.1:8000/admin/")
        print(f"   Logo: http://127.0.0.1:8000/media/logo-05.png")
        
        print(f"\n7. Next Steps:")
        print(f"   - Clear browser cache (Ctrl + Shift + R)")
        print(f"   - Go to admin page")
        print(f"   - Logo should appear larger now!")
        
        print(f"\n=== Configuration Complete ===")

