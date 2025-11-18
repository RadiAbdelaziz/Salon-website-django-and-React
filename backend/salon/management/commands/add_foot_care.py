from django.core.management.base import BaseCommand
from salon.models import ServiceCategory, ServiceItem


class Command(BaseCommand):
    help = 'Add foot care services as an example'

    def handle(self, *args, **options):
        # Create foot care category
        category, created = ServiceCategory.objects.get_or_create(
            name='العناية بالقدمين',
            defaults={
                'icon': 'fa-shoe-prints',
                'order': 7,
                'is_active': True
            }
        )
        
        if created:
            print('Created category: Foot Care')
        
        # Create service items for foot care
        foot_care_services = [
            'علاج القدمين المتخصص',
            'إزالة الجلد الميت',
            'علاج الأظافر المنغرزة',
            'تدليك القدمين',
            'علاج الفطريات',
            'العناية بالكعب المتشقق'
        ]
        
        for i, service_title in enumerate(foot_care_services):
            item, created = ServiceItem.objects.get_or_create(
                title=service_title,
                category=category,
                defaults={'order': i + 1}
            )
            
            if created:
                print('Created item: ' + service_title)

        print('Successfully added foot care services!')
