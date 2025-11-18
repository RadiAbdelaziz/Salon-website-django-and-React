from django.core.management.base import BaseCommand
from salon.models import ServiceCategory, ServiceItem


class Command(BaseCommand):
    help = 'Add sample services'

    def handle(self, *args, **options):
        # Create a new category
        category, created = ServiceCategory.objects.get_or_create(
            name='العناية بالقدمين',
            defaults={
                'icon': 'fa-shoe-prints',
                'order': 7,
                'is_active': True
            }
        )
        
        # Add services to this category
        services = [
            'علاج القدمين المتخصص',
            'ازالة الجلد الميت',
            'علاج الاظافر المنغرزة',
            'تدليك القدمين'
        ]
        
        for i, service in enumerate(services):
            ServiceItem.objects.get_or_create(
                title=service,
                category=category,
                defaults={'order': i + 1}
            )

        print('Sample services added successfully!')
