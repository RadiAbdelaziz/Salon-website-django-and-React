"""
URL configuration for salon_backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import RedirectView
from django.http import HttpResponse
from django.views.decorators.cache import cache_control
from salon import export_views

@cache_control(max_age=86400)  # Cache for 24 hours
def favicon_view(request):
    """Serve favicon.ico"""
    import os
    favicon_path = os.path.join(settings.STATIC_ROOT, 'salon', 'favicon.ico')
    if os.path.exists(favicon_path):
        with open(favicon_path, 'rb') as f:
            return HttpResponse(f.read(), content_type='image/x-icon')
    else:
        # Fallback to a simple 1x1 pixel favicon
        return HttpResponse(
            b'\x00\x00\x01\x00\x01\x00\x10\x10\x00\x00\x01\x00\x20\x00\x68\x04\x00\x00\x16\x00\x00\x00\x28\x00\x00\x00\x10\x00\x00\x00\x20\x00\x00\x00\x01\x00\x20\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00',
            content_type='image/x-icon'
        )

urlpatterns = [
    # Favicon
    path('favicon.ico', favicon_view, name='favicon'),
    # Export URLs for admin interface (Excel only - PDF removed)
    path('admin/salon/export/bookings/excel/', export_views.export_bookings_excel, name='admin_salon_export_bookings_excel'),
    path('admin/salon/export/customers/excel/', export_views.export_customers_excel, name='admin_salon_export_customers_excel'),
    path('admin/salon/export/services/excel/', export_views.export_services_excel, name='admin_salon_export_services_excel'),
    path('admin/salon/export/revenue/excel/', export_views.export_revenue_report_excel, name='admin_salon_export_revenue_excel'),
    
    # Admin URLs
    path('admin/', admin.site.urls),
    path('api/', include('salon.urls')),

    # Payment Url
    path("payments/", include("payments.urls")),
    path("api/payments/", include("payments.urls"))
]

# Serve static and media files in development
if settings.DEBUG:
    import mimetypes
    # Initialize mimetypes with correct mappings
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
    
    # Serve media files
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    
    # Serve static files from STATIC_ROOT (collected files)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    
    # Also serve static files from STATICFILES_DIRS
    from django.contrib.staticfiles.views import serve
    from django.urls import re_path
    urlpatterns += [
        re_path(r'^static/(?P<path>.*)$', serve),
    ]
