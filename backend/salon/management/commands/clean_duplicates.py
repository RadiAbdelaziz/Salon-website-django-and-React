from django.core.management.base import BaseCommand
from salon.models import Service
from django.db.models import Count


class Command(BaseCommand):
    help = 'Remove duplicate services and clean database'

    def handle(self, *args, **options):
        self.stdout.write('🔍 Looking for duplicate services...')
        
        # Find services with same name
        duplicates = Service.objects.values('name', 'category').annotate(
            count=Count('id')
        ).filter(count__gt=1)
        
        total_deleted = 0
        for duplicate in duplicates:
            # Keep the first one, delete the rest
            services_with_same_name = Service.objects.filter(
                name=duplicate['name'],
                category=duplicate['category']
            ).order_by('id')
            
            # Delete all except the first
            to_delete = services_with_same_name[1:]
            deleted_count = len(to_delete)
            for service in to_delete:
                service.delete()
            
            total_deleted += deleted_count
            self.stdout.write(f'✅ Removed {deleted_count} duplicates of "{duplicate["name"]}"')
        
        # Show final count
        final_count = Service.objects.count()
        self.stdout.write(
            self.style.SUCCESS(f'🎉 Cleanup complete! Removed {total_deleted} duplicates.')
        )
        self.stdout.write(f'📊 Total services now: {final_count}')
        
        # List all remaining services
        remaining_services = Service.objects.all()
        self.stdout.write('\n📋 Remaining services:')
        for service in remaining_services:
            self.stdout.write(f'  • {service.name} (ID: {service.id}) - {service.category.name}')
