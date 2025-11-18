from django.core.management.base import BaseCommand
from django.contrib.auth.models import User, Permission
from django.contrib.contenttypes.models import ContentType
from salon.models import Booking, Customer, Service, Staff


class Command(BaseCommand):
    help = 'Fix admin permissions for all staff users'

    def handle(self, *args, **options):
        # Get all staff users
        staff_users = User.objects.filter(is_staff=True)
        
        # Get content types for salon models
        models = [Booking, Customer, Service, Staff]
        
        for model in models:
            ct = ContentType.objects.get_for_model(model)
            perms = Permission.objects.filter(content_type=ct)
            
            self.stdout.write(f'Processing {model.__name__} permissions...')
            
            for user in staff_users:
                # Assign all permissions for this model to the user
                user.user_permissions.add(*perms)
                self.stdout.write(f'  - Assigned {perms.count()} permissions to {user.username}')
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully assigned permissions to {staff_users.count()} staff users'
            )
        )
