from django.core.management.base import BaseCommand
from salon.models import ServiceCategory, ServiceItem


class Command(BaseCommand):
    help = 'Populate ServiceCategory and ServiceItem with sample data'

    def handle(self, *args, **options):
        # Create Service Categories
        categories_data = [
            {
                'name': 'المكياج',
                'icon': 'fa-palette',
                'order': 1,
                'items': [
                    'مكياج المناسبات',
                    'مكياج العروس',
                    'دروس المكياج',
                    'مكياج يومي'
                ]
            },
            {
                'name': 'العناية بالأظافر',
                'icon': 'fa-hand-paper',
                'order': 2,
                'items': [
                    'مانيكير',
                    'باديكير',
                    'أظافر الأكريليك',
                    'تصميم الأظافر'
                ]
            },
            {
                'name': 'بكجات خاصة',
                'icon': 'fa-crown',
                'order': 3,
                'items': [
                    'بكج العروس',
                    'بكج التحول الكامل',
                    'بكج العافية',
                    'بكج العائلة'
                ]
            },
            {
                'name': 'العناية بالشعر',
                'icon': 'fa-cut',
                'order': 4,
                'items': [
                    'قص وتصفيف',
                    'صبغ الشعر',
                    'علاجات الشعر',
                    'تسريحات المناسبات'
                ]
            },
            {
                'name': 'العناية بالبشرة',
                'icon': 'fa-heart',
                'order': 5,
                'items': [
                    'علاجات الوجه',
                    'التقشير',
                    'الماسكات',
                    'العناية بالبشرة الحساسة'
                ]
            },
            {
                'name': 'المساج والاسترخاء',
                'icon': 'fa-spa',
                'order': 6,
                'items': [
                    'مساج تايلندي',
                    'مساج عطري',
                    'مساج الحوامل',
                    'مساج الاسترخاء'
                ]
            }
        ]

        for cat_data in categories_data:
            category, created = ServiceCategory.objects.get_or_create(
                name=cat_data['name'],
                defaults={
                    'icon': cat_data['icon'],
                    'order': cat_data['order'],
                    'is_active': True
                }
            )
            
            # Create service items for this category
            for i, item_title in enumerate(cat_data['items']):
                ServiceItem.objects.get_or_create(
                    title=item_title,
                    category=category,
                    defaults={'order': i + 1}
                )

        print('Successfully populated services data!')
