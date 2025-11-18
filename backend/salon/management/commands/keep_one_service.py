from django.core.management.base import BaseCommand
from salon.models import Service, Category


class Command(BaseCommand):
    help = 'Keep only one service in hair-care category, delete all others'

    def handle(self, *args, **options):
        self.stdout.write('🔧 Keeping only one service...')
        
        # Get hair care category
        try:
            hair_care_category = Category.objects.get(name='العناية بالشعر')
            
            # Get all services in hair care category
            hair_care_services = Service.objects.filter(category=hair_care_category)
            
            if hair_care_services.exists():
                # Keep the first service, delete the rest
                first_service = hair_care_services.first()
                deleted_count = hair_care_services.exclude(id=first_service.id).delete()[0]
                
                self.stdout.write(f'✅ Kept service: {first_service.name}')
                self.stdout.write(f'✅ Deleted {deleted_count} other services in hair care')
            else:
                # Create one sample service if none exist
                sample_service = Service.objects.create(
                    category=hair_care_category,
                    name='صبغات لون واحد - شعر قصير',
                    name_en='Single Color Dye - Short Hair',
                    description='صبغة لون واحد للشعر القصير بأحدث التقنيات',
                    description_en='Single color dye for short hair with latest techniques',
                    duration='2-3 ساعات',
                    price_min=300.00,
                    is_active=True,
                    is_featured=True,
                    order=1
                )
                self.stdout.write(f'✅ Created sample service: {sample_service.name}')
            
            # Delete all services from other categories
            other_services = Service.objects.exclude(category=hair_care_category)
            other_count = other_services.count()
            other_services.delete()
            self.stdout.write(f'✅ Deleted {other_count} services from other categories')
            
        except Category.DoesNotExist:
            self.stdout.write(self.style.ERROR('❌ Hair care category not found'))
            return
        
        # Show final count
        total_services = Service.objects.count()
        self.stdout.write(
            self.style.SUCCESS(f'🎉 Complete! Now you have {total_services} service(s) total.')
        )
        self.stdout.write(
            self.style.WARNING('💡 You can now add your services through Django admin panel.')
        )
