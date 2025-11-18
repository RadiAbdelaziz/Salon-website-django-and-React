from django.core.management.base import BaseCommand
from salon.models import Testimonial


class Command(BaseCommand):
    help = 'Add a new testimonial quickly'

    def add_arguments(self, parser):
        parser.add_argument('--name', type=str, help='Customer name')
        parser.add_argument('--text', type=str, help='Testimonial text')
        parser.add_argument('--rating', type=int, default=5, help='Rating (1-5)')
        parser.add_argument('--service', type=str, help='Service used')
        parser.add_argument('--featured', action='store_true', help='Mark as featured')

    def handle(self, *args, **options):
        name = options.get('name') or 'عميل جديد'
        text = options.get('text') or 'تجربة رائعة! أنصح الجميع بتجربة خدماتكم.'
        rating = options.get('rating', 5)
        service = options.get('service') or 'خدمة عامة'
        featured = options.get('featured', False)
        
        testimonial = Testimonial.objects.create(
            customer_name=name,
            customer_name_en=name,
            testimonial_text=text,
            testimonial_text_en=text,
            rating=rating,
            service_used=service,
            is_featured=featured,
            is_active=True,
            order=Testimonial.objects.count() + 1
        )
        
        self.stdout.write(f"[SUCCESS] Created testimonial: {testimonial.customer_name}")
        self.stdout.write(f"Rating: {'*' * testimonial.rating}")
        self.stdout.write(f"Service: Hair Care")
        self.stdout.write(f"Featured: {'Yes' if testimonial.is_featured else 'No'}")
        self.stdout.write(f"Admin URL: http://127.0.0.1:8000/admin/salon/testimonial/{testimonial.id}/change/")
