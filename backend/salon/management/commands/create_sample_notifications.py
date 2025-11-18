"""
Management command to create sample notifications for testing
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from salon.models import Notification, Booking, Customer, Service, Address
from datetime import timedelta


class Command(BaseCommand):
    help = 'Create sample notifications for testing the notification system'

    def add_arguments(self, parser):
        parser.add_argument(
            '--count',
            type=int,
            default=5,
            help='Number of sample notifications to create (default: 5)'
        )

    def handle(self, *args, **options):
        count = options['count']
        
        self.stdout.write(f'Creating {count} sample notifications...')
        
        # Create sample notifications
        notifications_created = 0
        
        for i in range(count):
            # Create different types of notifications
            notification_types = [
                ('booking_created', 'حجز جديد', 'تم إنشاء حجز جديد من عميل'),
                ('booking_confirmed', 'تأكيد الحجز', 'تم تأكيد حجز العميل'),
                ('payment_received', 'استلام الدفع', 'تم استلام مبلغ الدفع'),
                ('system', 'إشعار نظام', 'إشعار نظام عام'),
                ('reminder', 'تذكير', 'تذكير بالموعد القادم'),
            ]
            
            notification_type, title, message = notification_types[i % len(notification_types)]
            
            # Create notification with different priorities
            priorities = ['high', 'medium', 'low']
            priority = priorities[i % len(priorities)]
            
            # Create notification
            notification = Notification.objects.create(
                title=f'{title} #{i+1}',
                message=f'{message} - إشعار تجريبي رقم {i+1}',
                notification_type=notification_type,
                priority=priority,
                is_read=i % 3 == 0,  # Some notifications are read
                metadata={
                    'sample': True,
                    'created_by': 'management_command',
                    'test_id': i+1
                }
            )
            
            notifications_created += 1
            
            # Add some delay between notifications
            notification.created_at = timezone.now() - timedelta(hours=i)
            notification.save()
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully created {notifications_created} sample notifications!'
            )
        )
        
        # Show statistics
        total_notifications = Notification.objects.count()
        unread_notifications = Notification.objects.filter(is_read=False).count()
        
        self.stdout.write(f'Total notifications: {total_notifications}')
        self.stdout.write(f'Unread notifications: {unread_notifications}')
        
        # Show notification types breakdown
        self.stdout.write('\nNotification types breakdown:')
        for notification_type, _, _ in notification_types:
            count_by_type = Notification.objects.filter(notification_type=notification_type).count()
            self.stdout.write(f'  {notification_type}: {count_by_type}')
        
        self.stdout.write(
            self.style.SUCCESS(
                '\nYou can now test the notification widget in the Django admin!'
            )
        )
