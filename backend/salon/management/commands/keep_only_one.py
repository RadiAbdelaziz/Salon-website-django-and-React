from django.core.management.base import BaseCommand
from salon.models import Service


class Command(BaseCommand):
    help = 'Keep only one service total in the entire database'

    def handle(self, *args, **options):
        self.stdout.write('🔧 Keeping only one service...')
        
        # Get all services
        all_services = Service.objects.all()
        service_count = all_services.count()
        
        if service_count > 1:
            # Keep the first service, delete all others
            first_service = all_services.first()
            deleted_services = all_services.exclude(id=first_service.id)
            deleted_count = deleted_services.count()
            deleted_services.delete()
            
            self.stdout.write(f'✅ Kept service: {first_service.name}')
            self.stdout.write(f'✅ Deleted {deleted_count} other services')
        elif service_count == 1:
            first_service = all_services.first()
            self.stdout.write(f'✅ Already have only one service: {first_service.name}')
        else:
            self.stdout.write('ℹ️ No services found in database')
        
        # Show final count
        final_count = Service.objects.count()
        self.stdout.write(
            self.style.SUCCESS(f'🎉 Complete! Total services: {final_count}')
        )
        
        if final_count > 0:
            remaining_service = Service.objects.first()
            self.stdout.write(f'📋 Remaining service: {remaining_service.name} (ID: {remaining_service.id})')
            self.stdout.write(f'📂 Category: {remaining_service.category.name}')
