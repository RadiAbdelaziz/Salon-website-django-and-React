from django.core.management.base import BaseCommand
from salon.models import Testimonial


class Command(BaseCommand):
    help = 'Populate sample testimonials'

    def handle(self, *args, **options):
        self.stdout.write("=== Adding Sample Testimonials ===")
        
        testimonials_data = [
            {
                'customer_name': 'فاطمة أحمد',
                'customer_name_en': 'Fatima Ahmed',
                'testimonial_text': 'تجربة رائعة جداً! الخدمة كانت احترافية والنتيجة تفوق توقعاتي. أنصح الجميع بتجربة خدمات صالون Glammy.',
                'testimonial_text_en': 'Amazing experience! The service was professional and the result exceeded my expectations. I recommend everyone to try Glammy salon services.',
                'rating': 5,
                'service_used': 'مكياج العروس',
                'is_featured': True,
                'is_active': True,
                'order': 1
            },
            {
                'customer_name': 'سارة محمد',
                'customer_name_en': 'Sara Mohammed',
                'testimonial_text': 'أفضل صالون في المنطقة! الموظفات محترفات جداً والخدمة سريعة وجودة عالية. سأعود مرة أخرى قريباً.',
                'testimonial_text_en': 'Best salon in the area! The staff are very professional, service is fast and high quality. I will come back again soon.',
                'rating': 5,
                'service_used': 'العناية بالشعر',
                'is_featured': True,
                'is_active': True,
                'order': 2
            },
            {
                'customer_name': 'نورا العتيبي',
                'customer_name_en': 'Nora Al-Otaibi',
                'testimonial_text': 'خدمة ممتازة وأسعار معقولة. الموظفات ودودات جداً والنتيجة رائعة. شكراً لكم على الخدمة المميزة.',
                'testimonial_text_en': 'Excellent service and reasonable prices. The staff are very friendly and the result is great. Thank you for the outstanding service.',
                'rating': 4,
                'service_used': 'العناية بالأظافر',
                'is_featured': False,
                'is_active': True,
                'order': 3
            },
            {
                'customer_name': 'ريم السعد',
                'customer_name_en': 'Reem Al-Saad',
                'testimonial_text': 'تجربة لا تُنسى! الخدمة كانت متميزة والنتيجة رائعة. أنصح جميع صديقاتي بتجربة خدماتكم.',
                'testimonial_text_en': 'Unforgettable experience! The service was outstanding and the result is amazing. I recommend all my friends to try your services.',
                'rating': 5,
                'service_used': 'المساج والاسترخاء',
                'is_featured': True,
                'is_active': True,
                'order': 4
            },
            {
                'customer_name': 'هند القحطاني',
                'customer_name_en': 'Hind Al-Qahtani',
                'testimonial_text': 'أشكركم على الخدمة المميزة. الموظفات محترفات جداً والنتيجة تفوق توقعاتي. بالتأكيد سأعود مرة أخرى.',
                'testimonial_text_en': 'Thank you for the outstanding service. The staff are very professional and the result exceeded my expectations. I will definitely come back again.',
                'rating': 5,
                'service_used': 'العناية بالبشرة',
                'is_featured': False,
                'is_active': True,
                'order': 5
            }
        ]
        
        created_count = 0
        for testimonial_data in testimonials_data:
            testimonial, created = Testimonial.objects.get_or_create(
                customer_name=testimonial_data['customer_name'],
                defaults=testimonial_data
            )
            if created:
                created_count += 1
                self.stdout.write(f"[SUCCESS] Created testimonial: {testimonial.customer_name}")
            else:
                self.stdout.write(f"[INFO] Testimonial already exists")
        
        self.stdout.write(f"\n=== Summary ===")
        self.stdout.write(f"Total testimonials in database: {Testimonial.objects.count()}")
        self.stdout.write(f"New testimonials created: {created_count}")
        self.stdout.write(f"Active testimonials: {Testimonial.objects.filter(is_active=True).count()}")
        self.stdout.write(f"Featured testimonials: {Testimonial.objects.filter(is_featured=True).count()}")
        
        self.stdout.write(f"\n=== Test API Endpoint ===")
        self.stdout.write(f"API URL: http://127.0.0.1:8000/api/testimonials/")
        self.stdout.write(f"Admin URL: http://127.0.0.1:8000/admin/salon/testimonial/")
        
        self.stdout.write(f"\n=== Test Complete ===")
