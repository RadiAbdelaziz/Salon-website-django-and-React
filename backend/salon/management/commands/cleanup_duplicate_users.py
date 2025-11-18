from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from salon.models import Customer
from django.db import transaction


class Command(BaseCommand):
    help = 'Clean up duplicate users and customers'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be deleted without actually deleting',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        
        if dry_run:
            self.stdout.write(self.style.WARNING('DRY RUN MODE - No changes will be made'))
        
        # Find duplicate users by email
        duplicate_emails = {}
        for user in User.objects.all():
            email = user.email
            if email in duplicate_emails:
                duplicate_emails[email].append(user)
            else:
                duplicate_emails[email] = [user]
        
        # Filter to only emails with duplicates
        duplicate_emails = {email: users for email, users in duplicate_emails.items() if len(users) > 1}
        
        if not duplicate_emails:
            self.stdout.write(self.style.SUCCESS('No duplicate users found'))
            return
        
        self.stdout.write(f'Found {len(duplicate_emails)} emails with duplicate users:')
        
        total_deleted = 0
        
        for email, users in duplicate_emails.items():
            self.stdout.write(f'\nEmail: {email}')
            self.stdout.write(f'Users: {len(users)}')
            
            # Keep the first user (oldest), delete the rest
            users_sorted = sorted(users, key=lambda u: u.date_joined)
            keep_user = users_sorted[0]
            delete_users = users_sorted[1:]
            
            self.stdout.write(f'Keeping: {keep_user.username} (ID: {keep_user.id}, Joined: {keep_user.date_joined})')
            
            for user in delete_users:
                self.stdout.write(f'Would delete: {user.username} (ID: {user.id}, Joined: {user.date_joined})')
                
                if not dry_run:
                    try:
                        with transaction.atomic():
                            # Delete associated customer if exists
                            try:
                                customer = Customer.objects.get(user=user)
                                customer.delete()
                                self.stdout.write(f'  Deleted customer for user {user.username}')
                            except Customer.DoesNotExist:
                                pass
                            
                            # Delete the user
                            user.delete()
                            self.stdout.write(f'  Deleted user {user.username}')
                            total_deleted += 1
                            
                    except Exception as e:
                        self.stdout.write(self.style.ERROR(f'  Error deleting user {user.username}: {e}'))
                else:
                    total_deleted += 1
        
        if dry_run:
            self.stdout.write(self.style.WARNING(f'\nDRY RUN: Would delete {total_deleted} duplicate users'))
        else:
            self.stdout.write(self.style.SUCCESS(f'\nSuccessfully deleted {total_deleted} duplicate users'))
        
        # Also clean up customers without users
        orphaned_customers = Customer.objects.filter(user__isnull=True)
        if orphaned_customers.exists():
            self.stdout.write(f'\nFound {orphaned_customers.count()} orphaned customers (without users)')
            
            if not dry_run:
                orphaned_customers.delete()
                self.stdout.write(self.style.SUCCESS('Deleted orphaned customers'))
            else:
                self.stdout.write(self.style.WARNING('DRY RUN: Would delete orphaned customers'))
