"""
Django signals for salon notification system
"""
from django.db.models.signals import post_save, post_delete, pre_save
from django.dispatch import receiver
from django.utils import timezone
from django.contrib.auth.models import User
from django.conf import settings
import logging

from .models import Booking, Notification, NotificationSettings, Customer, Staff
from .email_service import EmailNotificationService

logger = logging.getLogger(__name__)


@receiver(post_save, sender=Booking)
def booking_created_or_updated(sender, instance, created, **kwargs):
    """
    Signal triggered when a booking is created or updated
    """
    try:
        if created:
            # New booking created
            logger.info(f"New booking created: {instance.id}")
            
            # Create in-app notification for admin
            notification = Notification.create_booking_notification(
                booking=instance,
                notification_type='booking_created',
                title=f'حجز جديد من {instance.customer.name}',
                message=f'تم إنشاء حجز جديد للخدمة "{instance.service.name}" في {instance.booking_date} الساعة {instance.booking_time}',
                priority='high'
            )
            
            # Send email notification to admin (if enabled)
            try:
                email_service = EmailNotificationService()
                email_service.send_admin_notification(instance)
                notification.mark_as_sent()
                logger.info(f"Admin notification email sent for booking {instance.id}")
            except Exception as e:
                logger.error(f"Failed to send admin notification email: {e}")
            
            # Send confirmation email to customer (if enabled)
            try:
                # Check if customer has email notifications enabled
                if instance.customer.user:
                    settings_obj = NotificationSettings.get_or_create_for_user(instance.customer.user)
                    if settings_obj.email_booking_created:
                        email_service = EmailNotificationService()
                        email_service.send_booking_confirmation(instance)
                        logger.info(f"Customer confirmation email sent for booking {instance.id}")
            except Exception as e:
                logger.error(f"Failed to send customer confirmation email: {e}")
        
        else:
            # Booking updated - check for status changes
            if hasattr(instance, '_original_status'):
                old_status = instance._original_status
                new_status = instance.status
                
                if old_status != new_status:
                    logger.info(f"Booking {instance.id} status changed from {old_status} to {new_status}")
                    
                    # Create notification based on status change
                    if new_status == 'confirmed':
                        notification = Notification.create_booking_notification(
                            booking=instance,
                            notification_type='booking_confirmed',
                            title=f'تم تأكيد حجز {instance.customer.name}',
                            message=f'تم تأكيد الحجز للخدمة "{instance.service.name}" في {instance.booking_date} الساعة {instance.booking_time}',
                            priority='medium'
                        )
                        
                        # Send confirmation email to customer
                        try:
                            if instance.customer.user:
                                settings_obj = NotificationSettings.get_or_create_for_user(instance.customer.user)
                                if settings_obj.email_booking_confirmed:
                                    email_service = EmailNotificationService()
                                    # You might want to create a specific confirmation email template
                                    email_service.send_booking_confirmation(instance)
                        except Exception as e:
                            logger.error(f"Failed to send booking confirmation email: {e}")
                    
                    elif new_status == 'cancelled':
                        notification = Notification.create_booking_notification(
                            booking=instance,
                            notification_type='booking_cancelled',
                            title=f'تم إلغاء حجز {instance.customer.name}',
                            message=f'تم إلغاء الحجز للخدمة "{instance.service.name}" في {instance.booking_date} الساعة {instance.booking_time}',
                            priority='high'
                        )
                    
                    elif new_status == 'completed':
                        notification = Notification.create_booking_notification(
                            booking=instance,
                            notification_type='system',
                            title=f'تم إكمال حجز {instance.customer.name}',
                            message=f'تم إكمال الحجز للخدمة "{instance.service.name}" بنجاح',
                            priority='low'
                        )
    
    except Exception as e:
        logger.error(f"Error in booking_created_or_updated signal: {e}")


@receiver(pre_save, sender=Booking)
def booking_pre_save(sender, instance, **kwargs):
    """
    Store the original status before saving to detect changes
    """
    if instance.pk:
        try:
            original = Booking.objects.get(pk=instance.pk)
            instance._original_status = original.status
        except Booking.DoesNotExist:
            instance._original_status = None
    else:
        instance._original_status = None


@receiver(post_save, sender=User)
def user_created(sender, instance, created, **kwargs):
    """
    Create notification settings when a new user is created
    """
    if created:
        try:
            NotificationSettings.get_or_create_for_user(instance)
            logger.info(f"Notification settings created for user {instance.username}")
        except Exception as e:
            logger.error(f"Failed to create notification settings for user {instance.username}: {e}")


@receiver(post_save, sender=Customer)
def customer_created(sender, instance, created, **kwargs):
    """
    Create notification settings when a new customer is created
    """
    if created and instance.user:
        try:
            NotificationSettings.get_or_create_for_user(instance.user)
            logger.info(f"Notification settings created for customer {instance.name}")
        except Exception as e:
            logger.error(f"Failed to create notification settings for customer {instance.name}: {e}")


@receiver(post_save, sender=Staff)
def staff_created(sender, instance, created, **kwargs):
    """
    Create notification settings when a new staff member is created
    """
    if created and instance.user:
        try:
            NotificationSettings.get_or_create_for_user(instance.user)
            logger.info(f"Notification settings created for staff {instance.name}")
        except Exception as e:
            logger.error(f"Failed to create notification settings for staff {instance.name}: {e}")


# Signal for appointment rescheduling
@receiver(post_save, sender=Booking)
def booking_rescheduled(sender, instance, created, **kwargs):
    """
    Handle booking rescheduling notifications
    """
    if not created and hasattr(instance, '_original_date') and hasattr(instance, '_original_time'):
        old_date = instance._original_date
        old_time = instance._original_time
        
        if old_date != instance.booking_date or old_time != instance.booking_time:
            logger.info(f"Booking {instance.id} rescheduled from {old_date} {old_time} to {instance.booking_date} {instance.booking_time}")
            
            # Create reschedule notification
            notification = Notification.create_booking_notification(
                booking=instance,
                notification_type='booking_rescheduled',
                title=f'تم إعادة جدولة حجز {instance.customer.name}',
                message=f'تم تغيير موعد الحجز من {old_date} {old_time} إلى {instance.booking_date} {instance.booking_time}',
                priority='medium'
            )
            
            # Send reschedule email to customer
            try:
                if instance.customer.user:
                    settings_obj = NotificationSettings.get_or_create_for_user(instance.customer.user)
                    if settings_obj.email_booking_rescheduled:
                        email_service = EmailNotificationService()
                        email_service.send_reschedule_notification(instance, old_date, old_time)
            except Exception as e:
                logger.error(f"Failed to send reschedule notification email: {e}")


@receiver(pre_save, sender=Booking)
def booking_pre_save_reschedule(sender, instance, **kwargs):
    """
    Store original date and time for reschedule detection
    """
    if instance.pk:
        try:
            original = Booking.objects.get(pk=instance.pk)
            instance._original_date = original.booking_date
            instance._original_time = original.booking_time
        except Booking.DoesNotExist:
            instance._original_date = None
            instance._original_time = None
    else:
        instance._original_date = None
        instance._original_time = None


# Signal for payment status changes
@receiver(post_save, sender=Booking)
def payment_status_changed(sender, instance, created, **kwargs):
    """
    Handle payment status change notifications
    """
    if not created and hasattr(instance, '_original_payment_status'):
        old_payment_status = instance._original_payment_status
        new_payment_status = instance.payment_status
        
        if old_payment_status != new_payment_status and new_payment_status == 'paid':
            logger.info(f"Payment received for booking {instance.id}")
            
            # Create payment notification
            notification = Notification.create_booking_notification(
                booking=instance,
                notification_type='payment_received',
                title=f'تم استلام الدفع من {instance.customer.name}',
                message=f'تم استلام مبلغ {instance.final_price} ريال للحجز رقم {instance.id}',
                priority='high'
            )
            
            # Send payment confirmation email to customer
            try:
                if instance.customer.user:
                    settings_obj = NotificationSettings.get_or_create_for_user(instance.customer.user)
                    if settings_obj.email_payment_received:
                        # You might want to create a specific payment confirmation email template
                        email_service = EmailNotificationService()
                        email_service.send_booking_confirmation(instance)
            except Exception as e:
                logger.error(f"Failed to send payment confirmation email: {e}")


@receiver(pre_save, sender=Booking)
def booking_pre_save_payment(sender, instance, **kwargs):
    """
    Store original payment status for change detection
    """
    if instance.pk:
        try:
            original = Booking.objects.get(pk=instance.pk)
            instance._original_payment_status = original.payment_status
        except Booking.DoesNotExist:
            instance._original_payment_status = None
    else:
        instance._original_payment_status = None
