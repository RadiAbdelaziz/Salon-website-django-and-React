from django.core.management.base import BaseCommand
from salon.models import ServiceCategory, ServiceItem


class Command(BaseCommand):
    help = 'Add beauty treatments category'

    def handle(self, *args, **options):
        # Create beauty treatments category
        category, created = ServiceCategory.objects.get_or_create(
            name='العلاجات التجميلية',
            defaults={
                'icon': 'fa-magic',
                'order': 8,
                'is_active': True
            }
        )
        
        # Add beauty treatment services
        treatments = [
            'حقن البوتوكس',
            'حقن الفيلر',
            'الليزر لإزالة الشعر',
            'التقشير الكيميائي',
            'الميزوثيرابي',
            'علاج حب الشباب'
        ]
        
        for i, treatment in enumerate(treatments):
            ServiceItem.objects.get_or_create(
                title=treatment,
                category=category,
                defaults={'order': i + 1}
            )

        print('Beauty treatments added successfully!')
