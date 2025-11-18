from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from salon.models import Category, Service, Staff, HeroImage, Coupon


class Command(BaseCommand):
    help = 'Populate database with initial salon data'

    def handle(self, *args, **options):
        self.stdout.write('Starting data population...')
        
        # Create Categories
        categories_data = [
            {
                'name': 'العناية بالشعر',
                'name_en': 'Hair Care',
                'description': 'مجموعة شاملة من علاجات الشعر المتقدمة لجميع أنواع الشعر، من العناية اليومية إلى العلاجات المتخصصة.',
                'description_en': 'Comprehensive range of advanced hair treatments for all hair types, from daily care to specialized treatments.',
                'icon': '💇‍♀️',
                'order': 1
            },
            {
                'name': 'المكياج',
                'name_en': 'Makeup',
                'description': 'فن المكياج الاحترافي بأحدث التقنيات والمنتجات عالية الجودة لجميع المناسبات.',
                'description_en': 'Professional makeup artistry with the latest techniques and high-quality products for all occasions.',
                'icon': '💄',
                'order': 2
            },
            {
                'name': 'العناية بالبشرة',
                'name_en': 'Skincare',
                'description': 'علاجات متقدمة للبشرة باستخدام أحدث التقنيات والمنتجات الطبيعية لبشرة صحية ومتألقة.',
                'description_en': 'Advanced skincare treatments using the latest techniques and natural products for healthy, radiant skin.',
                'icon': '✨',
                'order': 3
            },
            {
                'name': 'العناية بالأظافر',
                'name_en': 'Nail Care',
                'description': 'خدمات العناية بالأظافر الاحترافية من المانيكير والباديكير إلى التصاميم الفنية المبتكرة.',
                'description_en': 'Professional nail care services from manicures and pedicures to innovative artistic designs.',
                'icon': '💅',
                'order': 4
            },
            {
                'name': 'المساج والاسترخاء',
                'name_en': 'Massage & Relaxation',
                'description': 'مجموعة منوعة من خدمات التدليك التي تمنح الاسترخاء الكامل، وإزالة التوتر لإعادة التوازن إلى الجسم.',
                'description_en': 'A diverse range of massage services that provide complete relaxation and stress relief to restore body balance.',
                'icon': '💆‍♀️',
                'order': 5
            },
            {
                'name': 'حمام الجسم',
                'name_en': 'Body Bath',
                'description': 'خدمات حمام الجسم المتنوعة للاسترخاء والتنظيف العميق.',
                'description_en': 'Various body bath services for relaxation and deep cleansing.',
                'icon': '🛁',
                'order': 6
            },
            {
                'name': 'خدمات أخرى',
                'name_en': 'Other Services',
                'description': 'خدمات متنوعة أخرى للعناية الشاملة بالجسم.',
                'description_en': 'Various other services for comprehensive body care.',
                'icon': '🌟',
                'order': 7
            },
            {
                'name': 'بكجات خاصة',
                'name_en': 'Special Packages',
                'description': 'بكجات شاملة ومخصصة تجمع بين عدة خدمات لتحقيق أفضل النتائج.',
                'description_en': 'Comprehensive and customized packages combining multiple services for optimal results.',
                'icon': '🎁',
                'order': 8
            }
        ]

        categories = {}
        for cat_data in categories_data:
            category, created = Category.objects.get_or_create(
                name=cat_data['name'],
                defaults=cat_data
            )
            categories[cat_data['name_en'].lower().replace(' ', '_')] = category
            if created:
                self.stdout.write(f'Created category: {category.name}')

        # Create Services
        services_data = [
            # Hair Care Services
            {
                'category': 'hair_care',
                'name': 'صبغات لون واحد - شعر قصير',
                'name_en': 'Single Color Dye - Short Hair',
                'description': 'صبغة لون واحد للشعر القصير',
                'description_en': 'Single color dye for short hair',
                'duration': '2-3 ساعات',
                'price_min': 300.00,
                'is_featured': True
            },
            {
                'category': 'hair_care',
                'name': 'صبغات لون واحد - شعر متوسط',
                'name_en': 'Single Color Dye - Medium Hair',
                'description': 'صبغة لون واحد للشعر المتوسط',
                'description_en': 'Single color dye for medium hair',
                'duration': '2-3 ساعات',
                'price_min': 450.00
            },
            {
                'category': 'hair_care',
                'name': 'خصل ولون أو بيلياج - شعر قصير',
                'name_en': 'Highlights or Balayage - Short Hair',
                'description': 'خصل ولون أو بيلياج سبب كامل أو أومبريه للشعر القصير',
                'description_en': 'Highlights or balayage for short hair',
                'duration': '3-4 ساعات',
                'price_min': 600.00
            },
            {
                'category': 'hair_care',
                'name': 'بشتوار شعر عادي',
                'name_en': 'Regular Hair Styling',
                'description': 'تسريح وتصفيف عادي للشعر',
                'description_en': 'Regular hair styling and blow-dry',
                'duration': '45-60 دقيقة',
                'price_min': 100.00,
                'price_max': 300.00
            },
            {
                'category': 'hair_care',
                'name': 'علاج شعر حار',
                'name_en': 'Hot Hair Treatment',
                'description': 'علاج الشعر بالحرارة',
                'description_en': 'Hot hair treatment therapy',
                'duration': '60-90 دقيقة',
                'price_min': 1100.00,
                'price_max': 1600.00,
                'is_featured': True
            },

            # Makeup Services
            {
                'category': 'makeup',
                'name': 'مكياج المناسبات',
                'name_en': 'Event Makeup',
                'description': 'مكياج أنيق ومناسب للمناسبات الخاصة',
                'description_en': 'Elegant makeup suitable for special occasions',
                'duration': '2-3 ساعات',
                'price_min': 500.00,
                'price_max': 800.00,
                'is_featured': True
            },
            {
                'category': 'makeup',
                'name': 'مكياج العروس',
                'name_en': 'Bridal Makeup',
                'description': 'مكياج احترافي متكامل للعروس في يومها الخاص',
                'description_en': 'Complete professional bridal makeup for your special day',
                'duration': '3-4 ساعات',
                'price_min': 1000.00,
                'price_max': 2000.00,
                'is_featured': True
            },
            {
                'category': 'makeup',
                'name': 'مكياج يومي',
                'name_en': 'Daily Makeup',
                'description': 'مكياج طبيعي وأنيق للاستخدام اليومي',
                'description_en': 'Natural and elegant makeup for daily use',
                'duration': '1 ساعة',
                'price_min': 200.00,
                'price_max': 400.00
            },

            # Skincare Services
            {
                'category': 'skincare',
                'name': 'علاجات الوجه لجميع أنواع البشرة',
                'name_en': 'Facial Treatments for All Skin Types',
                'description': 'علاجات شاملة للوجه لجميع أنواع البشرة',
                'description_en': 'Comprehensive facial treatments for all skin types',
                'duration': '60-90 دقيقة',
                'price_min': 400.00,
                'price_max': 800.00,
                'is_featured': True
            },
            {
                'category': 'skincare',
                'name': 'الماسكات',
                'name_en': 'Face Masks',
                'description': 'ماسكات طبيعية مغذية ومرطبة للبشرة',
                'description_en': 'Natural nourishing and moisturizing face masks',
                'duration': '30-60 دقيقة',
                'price_min': 200.00,
                'price_max': 500.00
            },

            # Nail Care Services
            {
                'category': 'nail_care',
                'name': 'جل اكستنشن',
                'name_en': 'Gel Extensions',
                'description': 'تطويل الأظافر بالجل',
                'description_en': 'Nail extensions with gel',
                'duration': '90-120 دقيقة',
                'price_min': 500.00,
                'is_featured': True
            },
            {
                'category': 'nail_care',
                'name': 'لون جل',
                'name_en': 'Gel Color',
                'description': 'طلاء الأظافر بالجل الملون',
                'description_en': 'Colored gel nail polish',
                'duration': '45 دقيقة',
                'price_min': 90.00
            },
            {
                'category': 'nail_care',
                'name': 'لون فرنسي',
                'name_en': 'French Manicure',
                'description': 'طلاء فرنسي كلاسيكي',
                'description_en': 'Classic French manicure',
                'duration': '60 دقيقة',
                'price_min': 110.00
            },

            # Massage Services
            {
                'category': 'massage_&_relaxation',
                'name': 'مساج خاص تايلندي',
                'name_en': 'Special Thai Massage',
                'description': 'مساج تايلندي تقليدي للاسترخاء العميق',
                'description_en': 'Traditional Thai massage for deep relaxation',
                'duration': '60-90 دقيقة',
                'price_min': 400.00,
                'is_featured': True
            },
            {
                'category': 'massage_&_relaxation',
                'name': 'مساج الحوامل',
                'name_en': 'Pregnancy Massage',
                'description': 'مساج آمن ومخصص للحوامل لتخفيف التوتر والألم',
                'description_en': 'Safe and specialized massage for pregnant women',
                'duration': '60-75 دقيقة',
                'price_min': 500.00
            },

            # Body Bath Services
            {
                'category': 'body_bath',
                'name': 'حمام العروس',
                'name_en': 'Bridal Bath',
                'description': 'حمام خاص للعروس مع جلسة كاملة',
                'description_en': 'Special bridal bath with complete session',
                'duration': '120-150 دقيقة',
                'price_min': 600.00,
                'is_featured': True
            },
            {
                'category': 'body_bath',
                'name': 'حمام العود الملكي',
                'name_en': 'Royal Oud Bath',
                'description': 'حمام فاخر بالعود والعطور الملكية',
                'description_en': 'Luxurious bath with oud and royal fragrances',
                'duration': '90 دقيقة',
                'price_min': 400.00
            },

            # Other Services
            {
                'category': 'other_services',
                'name': 'حلاوة - جسم كامل',
                'name_en': 'Full Body Waxing',
                'description': 'إزالة الشعر من الجسم كاملاً بالحلاوة',
                'description_en': 'Full body hair removal with sugar wax',
                'duration': '90-120 دقيقة',
                'price_min': 500.00
            },
            {
                'category': 'other_services',
                'name': 'فتلة الوجه',
                'name_en': 'Face Threading',
                'description': 'إزالة الشعر من الوجه بالفتلة',
                'description_en': 'Facial hair removal with threading',
                'duration': '30 دقيقة',
                'price_min': 140.00
            },

            # Special Packages
            {
                'category': 'special_packages',
                'name': 'بكج العروس',
                'name_en': 'Bridal Package',
                'description': 'بكج شامل للعروس يشمل جميع الخدمات',
                'description_en': 'Complete bridal package including all services',
                'duration': '4-6 ساعات',
                'price_min': 2000.00,
                'price_max': 5000.00,
                'is_featured': True
            },
            {
                'category': 'special_packages',
                'name': 'بكج التحول الكامل',
                'name_en': 'Complete Transformation Package',
                'description': 'تحول كامل من الرأس إلى القدمين',
                'description_en': 'Complete transformation from head to toe',
                'duration': '3-5 ساعات',
                'price_min': 1500.00,
                'price_max': 3000.00
            }
        ]

        for service_data in services_data:
            category_key = service_data.pop('category')
            category = categories.get(category_key)
            if category:
                service, created = Service.objects.get_or_create(
                    name=service_data['name'],
                    category=category,
                    defaults=service_data
                )
                if created:
                    self.stdout.write(f'Created service: {service.name}')

        # Create Staff
        staff_data = [
            {
                'name': 'سارة أحمد',
                'name_en': 'Sarah Ahmed',
                'specialization': 'الشعر والمكياج',
                'specialization_en': 'Hair and Makeup',
                'bio': 'خبيرة في العناية بالشعر والمكياج مع أكثر من 5 سنوات من الخبرة',
                'bio_en': 'Expert in hair care and makeup with over 5 years of experience',
                'rating': 4.9
            },
            {
                'name': 'مريم السعد',
                'name_en': 'Mariam Al-Saad',
                'specialization': 'العناية بالبشرة والمساج',
                'specialization_en': 'Skincare and Massage',
                'bio': 'متخصصة في العناية بالبشرة والعلاجات الطبيعية',
                'bio_en': 'Specialist in skincare and natural treatments',
                'rating': 4.8
            },
            {
                'name': 'عائشة محمد',
                'name_en': 'Aisha Mohammed',
                'specialization': 'العناية بالأظافر',
                'specialization_en': 'Nail Care',
                'bio': 'فنانة أظافر محترفة مع إبداع في التصاميم',
                'bio_en': 'Professional nail artist with creative designs',
                'rating': 4.9
            },
            {
                'name': 'إيما ويلسون',
                'name_en': 'Emma Wilson',
                'specialization': 'خدمات شاملة',
                'specialization_en': 'Comprehensive Services',
                'bio': 'خبيرة في جميع خدمات التجميل والعناية',
                'bio_en': 'Expert in all beauty and care services',
                'rating': 5.0
            }
        ]

        for staff_info in staff_data:
            staff, created = Staff.objects.get_or_create(
                name=staff_info['name'],
                defaults=staff_info
            )
            if created:
                self.stdout.write(f'Created staff: {staff.name}')

        # Create Sample Coupons
        coupons_data = [
            {
                'code': 'WELCOME10',
                'name': 'خصم الترحيب',
                'description': 'خصم 10% للعملاء الجدد',
                'discount_type': 'percentage',
                'discount_value': 10.00,
                'minimum_amount': 100.00,
                'maximum_discount': 50.00,
                'valid_from': timezone.now(),
                'valid_until': timezone.now() + timedelta(days=30)
            },
            {
                'code': 'BRIDE50',
                'name': 'خصم العروس',
                'description': 'خصم 50 ريال على بكجات العروس',
                'discount_type': 'fixed',
                'discount_value': 50.00,
                'minimum_amount': 500.00,
                'valid_from': timezone.now(),
                'valid_until': timezone.now() + timedelta(days=60)
            },
            {
                'code': 'SUMMER20',
                'name': 'خصم الصيف',
                'description': 'خصم 20% على جميع خدمات المساج',
                'discount_type': 'percentage',
                'discount_value': 20.00,
                'minimum_amount': 200.00,
                'maximum_discount': 100.00,
                'usage_limit': 100,
                'valid_from': timezone.now(),
                'valid_until': timezone.now() + timedelta(days=90)
            }
        ]

        for coupon_data in coupons_data:
            coupon, created = Coupon.objects.get_or_create(
                code=coupon_data['code'],
                defaults=coupon_data
            )
            if created:
                self.stdout.write(f'Created coupon: {coupon.code}')

        # Create Sample Hero Images
        hero_images_data = [
            {
                'title': 'عرض مساج كاسات الهواء',
                'title_en': 'Air Cupping Massage Offer',
                'description': 'استمتعي بجلسة مساج كاسات الهواء المريحة',
                'description_en': 'Enjoy a relaxing air cupping massage session',
                'order': 1
            },
            {
                'title': 'مساج تايلاندي + ترطيب سريع للشعر',
                'title_en': 'Thai Massage + Quick Hair Moisturizing',
                'description': 'عرض خاص يجمع بين المساج التايلاندي وترطيب الشعر',
                'description_en': 'Special offer combining Thai massage and hair moisturizing',
                'order': 2
            },
            {
                'title': 'بكج العروس الشامل',
                'title_en': 'Complete Bridal Package',
                'description': 'كل ما تحتاجينه ليوم زفافك المميز',
                'description_en': 'Everything you need for your special wedding day',
                'order': 3
            }
        ]

        for hero_data in hero_images_data:
            hero, created = HeroImage.objects.get_or_create(
                title=hero_data['title'],
                defaults=hero_data
            )
            if created:
                self.stdout.write(f'Created hero image: {hero.title}')

        self.stdout.write(
            self.style.SUCCESS('Successfully populated database with initial data!')
        )
