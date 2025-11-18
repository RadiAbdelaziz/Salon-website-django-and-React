from django.core.management.base import BaseCommand
from salon.models import ServiceCategory, ServiceItem


class Command(BaseCommand):
    help = 'Quickly add a new service example'

    def handle(self, *args, **options):
        # Get or create a category
        category, created = ServiceCategory.objects.get_or_create(
            name='خدمات إضافية',
            defaults={
                'icon': 'fa-plus-circle',
                'order': 10,
                'is_active': True
            }
        )
        
        # Add a new service item
        service, created = ServiceItem.objects.get_or_create(
            title='خدمة تجريبية جديدة',
            category=category,
            defaults={'order': 1}
        )
        
        if created:
            print('Service added successfully!')
            print('You can see it at:')
            print('   - Admin: http://127.0.0.1:8000/admin/')
            print('   - Services page: http://127.0.0.1:8000/services/')
        else:
            print('Service already exists')
