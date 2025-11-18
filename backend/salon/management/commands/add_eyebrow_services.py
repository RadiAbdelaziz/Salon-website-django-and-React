from django.core.management.base import BaseCommand
from salon.models import ServiceCategory, ServiceItem


class Command(BaseCommand):
    help = 'Add eyebrow services as example'

    def handle(self, *args, **options):
        # Create eyebrow services category
        category, created = ServiceCategory.objects.get_or_create(
            name='العناية بالحواجب',
            defaults={
                'icon': 'fa-eye',
                'order': 9,
                'is_active': True
            }
        )
        
        # Add eyebrow services
        services = [
            'تصميم الحواجب',
            'صبغ الحواجب',
            'ميكروبلادينج',
            'تاتو الحواجب',
            'إزالة الشعر بالخيط',
            'علاج نمو الحواجب'
        ]
        
        for i, service in enumerate(services):
            ServiceItem.objects.get_or_create(
                title=service,
                category=category,
                defaults={'order': i + 1}
            )

        print('Eyebrow services added successfully!')
        print('You can now see them in admin: http://127.0.0.1:8000/admin/')
        print('And on the services page: http://127.0.0.1:8000/services/')
