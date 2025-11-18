"""
Email notification service for salon bookings
Based on Django Appointment System features
"""
import os
from datetime import datetime, timedelta
from typing import Optional

from django.conf import settings
from django.core.mail import send_mail, EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils import timezone
from django.utils.html import strip_tags

from .models import Booking, Customer, Service


class EmailNotificationService:
    """Service for sending email notifications for salon bookings"""
    
    def __init__(self):
        self.from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@salon.com')
        self.website_name = getattr(settings, 'SALON_WEBSITE_NAME', 'صالون الجمال')
    
    def send_booking_confirmation(self, booking: Booking, cart_items=None) -> bool:
        """Send booking confirmation email to customer"""
        try:
            print(f"📧 Preparing to send booking confirmation email...")
            print(f"   Booking ID: {booking.id}")
            
            customer = booking.customer
            service = booking.service
            
            print(f"   Customer: {customer.name}")
            print(f"   Email: {customer.email}")
            print(f"   Service: {service.name}")
            
            # Process cart items if provided
            processed_cart_items = None
            if cart_items:
                print(f"   Processing {len(cart_items)} cart items...")
                processed_cart_items = []
                for item in cart_items:
                    processed_cart_items.append({
                        'service_name': item.get('name', 'خدمة غير محددة'),
                        'quantity': item.get('quantity', 1),
                        'price': float(item.get('price', 0)),
                        'total_price': float(item.get('price', 0)) * int(item.get('quantity', 1))
                    })
            
            # Prepare email data
            context = {
                'customer_name': customer.name,
                'service_name': service.name,
                'booking_date': booking.booking_date.strftime('%Y/%m/%d'),
                'booking_time': booking.booking_time.strftime('%H:%M'),
                'service_price': booking.final_price,  # Use final price after discount
                'website_name': self.website_name,
                'booking_id': booking.id,
                'special_requests': booking.special_requests or 'لا توجد طلبات خاصة',
                'payment_method': booking.get_payment_method_display(),
                'cart_items': processed_cart_items,
            }
            
            print(f"📝 Rendering email template...")
            # Render HTML email template - use the final enhanced template
            html_content = render_to_string('emails/booking_confirmation_final.html', context)
            text_content = strip_tags(html_content)
            
            # Create email
            subject = f'تأكيد حجزك في {self.website_name}'
            
            print(f"📮 Creating email message...")
            print(f"   From: {self.from_email}")
            print(f"   To: {customer.email}")
            print(f"   Subject: {subject}")
            
            email = EmailMultiAlternatives(
                subject=subject,
                body=text_content,
                from_email=self.from_email,
                to=[customer.email]
            )
            email.attach_alternative(html_content, "text/html")
            
            # Send email
            print(f"📤 Sending email...")
            email.send()
            
            print(f"✅ Booking confirmation email sent successfully to {customer.email}")
            return True
            
        except Exception as e:
            print(f"❌ Failed to send booking confirmation email: {e}")
            import traceback
            traceback.print_exc()
            return False
    
    
    def send_admin_notification(self, booking: Booking) -> bool:
        """Send notification to admin about new booking"""
        try:
            admin_email = getattr(settings, 'ADMIN_EMAIL', 'admin@salon.com')
            customer = booking.customer
            service = booking.service
            
            # Prepare email data
            context = {
                'customer_name': customer.name,
                'customer_email': customer.email,
                'customer_phone': customer.phone,
                'service_name': service.name,
                'booking_date': booking.booking_date,
                'booking_time': booking.booking_time,
                'service_price': booking.price,
                'website_name': self.website_name,
                'booking_id': booking.id,
                'special_requests': booking.special_requests or 'لا توجد طلبات خاصة',
                'payment_method': booking.get_payment_method_display(),
                'created_at': booking.created_at,
            }
            
            # Render HTML email template
            html_content = render_to_string('emails/admin_booking_notification.html', context)
            text_content = strip_tags(html_content)
            
            # Create email
            subject = f'حجز جديد في {self.website_name}'
            
            email = EmailMultiAlternatives(
                subject=subject,
                body=text_content,
                from_email=self.from_email,
                to=[admin_email]
            )
            email.attach_alternative(html_content, "text/html")
            
            # Send email
            email.send()
            
            print(f"✅ Admin notification email sent to {admin_email}")
            return True
            
        except Exception as e:
            print(f"❌ Failed to send admin notification email: {e}")
            return False
    
    def send_reminder_email(self, booking: Booking) -> bool:
        """Send reminder email 24 hours before appointment"""
        try:
            customer = booking.customer
            service = booking.service
            
            # Prepare email data
            context = {
                'customer_name': customer.name,
                'service_name': service.name,
                'booking_date': booking.booking_date,
                'booking_time': booking.booking_time,
                'website_name': self.website_name,
                'booking_id': booking.id,
                'special_requests': booking.special_requests or 'لا توجد طلبات خاصة',
            }
            
            # Render HTML email template
            html_content = render_to_string('emails/booking_reminder.html', context)
            text_content = strip_tags(html_content)
            
            # Create email
            subject = f'تذكير: موعدك غداً في {self.website_name}'
            
            email = EmailMultiAlternatives(
                subject=subject,
                body=text_content,
                from_email=self.from_email,
                to=[customer.email]
            )
            email.attach_alternative(html_content, "text/html")
            
            # Send email
            email.send()
            
            print(f"✅ Reminder email sent to {customer.email}")
            return True
            
        except Exception as e:
            print(f"❌ Failed to send reminder email: {e}")
            return False
    
    def send_reschedule_notification(self, booking: Booking, old_date, old_time) -> bool:
        """Send notification about appointment reschedule"""
        try:
            customer = booking.customer
            service = booking.service
            
            # Prepare email data
            context = {
                'customer_name': customer.name,
                'service_name': service.name,
                'old_date': old_date,
                'old_time': old_time,
                'new_date': booking.booking_date,
                'new_time': booking.booking_time,
                'website_name': self.website_name,
                'booking_id': booking.id,
            }
            
            # Render HTML email template
            html_content = render_to_string('emails/booking_reschedule.html', context)
            text_content = strip_tags(html_content)
            
            # Create email
            subject = f'تم تغيير موعدك في {self.website_name}'
            
            email = EmailMultiAlternatives(
                subject=subject,
                body=text_content,
                from_email=self.from_email,
                to=[customer.email]
            )
            email.attach_alternative(html_content, "text/html")
            
            # Send email
            email.send()
            
            print(f"✅ Reschedule notification email sent to {customer.email}")
            return True
            
        except Exception as e:
            print(f"❌ Failed to send reschedule notification email: {e}")
            return False


def send_booking_emails(booking: Booking, cart_items=None):
    """Send all booking-related emails"""
    email_service = EmailNotificationService()
    
    # Send confirmation to customer
    email_service.send_booking_confirmation(booking, cart_items)
    
    # Send notification to admin
    email_service.send_admin_notification(booking)


def send_reminder_emails():
    """Send reminder emails for appointments tomorrow"""
    email_service = EmailNotificationService()
    tomorrow = timezone.now().date() + timedelta(days=1)
    
    # Get bookings for tomorrow
    bookings = Booking.objects.filter(
        booking_date=tomorrow,
        status__in=['pending', 'confirmed']
    )
    
    for booking in bookings:
        email_service.send_reminder_email(booking)
    
    print(f"✅ Sent {bookings.count()} reminder emails for tomorrow")
