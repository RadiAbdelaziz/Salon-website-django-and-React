from django.core.management.base import BaseCommand
from salon.models import Service, Staff, Booking, HeroImage


class Command(BaseCommand):
    help = 'Clear all services, staff, bookings, and hero images - keep only categories'

    def handle(self, *args, **options):
        self.stdout.write('🗑️ Starting data cleanup...')
        
        # Delete all bookings first (they reference services)
        booking_count = Booking.objects.count()
        Booking.objects.all().delete()
        self.stdout.write(f'✅ Deleted {booking_count} bookings')
        
        # Delete all services
        service_count = Service.objects.count()
        Service.objects.all().delete()
        self.stdout.write(f'✅ Deleted {service_count} services')
        
        # Delete all staff
        staff_count = Staff.objects.count()
        Staff.objects.all().delete()
        self.stdout.write(f'✅ Deleted {staff_count} staff members')
        
        # Delete all hero images
        hero_count = HeroImage.objects.count()
        HeroImage.objects.all().delete()
        self.stdout.write(f'✅ Deleted {hero_count} hero images')
        
        # Keep categories - they will remain
        from salon.models import Category
        category_count = Category.objects.count()
        self.stdout.write(f'✅ Kept {category_count} categories')
        
        # Add one sample service for testing
        if category_count > 0:
            first_category = Category.objects.first()
            sample_service = Service.objects.create(
                category=first_category,
                name='خدمة تجريبية',
                name_en='Sample Service',
                description='هذه خدمة تجريبية لاختبار النظام',
                description_en='This is a sample service for testing',
                duration='60 دقيقة',
                price_min=100.00,
                is_active=True,
                is_featured=True,
                order=1
            )
            self.stdout.write(f'✅ Created sample service: {sample_service.name}')
        
        self.stdout.write(
            self.style.SUCCESS('🎉 Data cleanup complete! Categories preserved, all other data cleared.')
        )
        self.stdout.write(
            self.style.WARNING('💡 You can now add your services through Django admin panel.')
        )
