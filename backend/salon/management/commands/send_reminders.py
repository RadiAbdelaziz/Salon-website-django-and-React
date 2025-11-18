"""
Management command to send reminder emails for appointments
Based on Django Appointment System features
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta

from salon.email_service import send_reminder_emails


class Command(BaseCommand):
    help = 'Send reminder emails for appointments tomorrow'

    def handle(self, *args, **options):
        self.stdout.write('Starting to send reminder emails...')
        
        try:
            send_reminder_emails()
            self.stdout.write(
                self.style.SUCCESS('Successfully sent reminder emails')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error sending reminder emails: {e}')
            )
