from django.contrib import admin
from django.utils.html import format_html
from django.utils import timezone
from ..models import Notification, NotificationSettings


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'notification_type', 'priority', 'is_read', 'is_sent', 
        'customer_name', 'staff_name', 'created_at'
    ]
    list_filter = [
        'notification_type', 'priority', 'is_read', 'is_sent', 'created_at'
    ]
    search_fields = ['title', 'message', 'customer__name', 'staff__name']
    list_editable = ['is_read', 'priority']
    ordering = ['-created_at']
    readonly_fields = ['created_at', 'updated_at', 'sent_at']
    
    fieldsets = (
        ('معلومات الإشعار', {
            'fields': ('title', 'message', 'notification_type', 'priority')
        }),
        ('الكائنات المرتبطة', {
            'fields': ('booking', 'customer', 'staff'),
            'classes': ('collapse',)
        }),
        ('حالة الإشعار', {
            'fields': ('is_read', 'is_sent', 'sent_at')
        }),
        ('بيانات إضافية', {
            'fields': ('action_url', 'metadata'),
            'classes': ('collapse',)
        }),
        ('التواريخ', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def customer_name(self, obj):
        return obj.customer.name if obj.customer else '-'
    customer_name.short_description = 'اسم العميل'
    
    def staff_name(self, obj):
        return obj.staff.name if obj.staff else '-'
    staff_name.short_description = 'اسم الموظف'
    
    actions = ['mark_as_read', 'mark_as_unread', 'mark_as_sent']
    
    def mark_as_read(self, request, queryset):
        updated = queryset.update(is_read=True)
        self.message_user(request, f'تم تمييز {updated} إشعار كمقروء.')
    mark_as_read.short_description = 'تمييز الإشعارات كمقروءة'
    
    def mark_as_unread(self, request, queryset):
        updated = queryset.update(is_read=False)
        self.message_user(request, f'تم تمييز {updated} إشعار كغير مقروء.')
    mark_as_unread.short_description = 'تمييز الإشعارات كغير مقروءة'
    
    def mark_as_sent(self, request, queryset):
        from django.utils import timezone
        updated = queryset.update(is_sent=True, sent_at=timezone.now())
        self.message_user(request, f'تم تمييز {updated} إشعار كمرسل.')
    mark_as_sent.short_description = 'تمييز الإشعارات كمرسلة'


@admin.register(NotificationSettings)
class NotificationSettingsAdmin(admin.ModelAdmin):
    list_display = [
        'user', 'email_booking_created', 'email_booking_confirmed', 
        'in_app_notifications', 'reminder_hours_before', 'created_at'
    ]
    list_filter = [
        'email_booking_created', 'email_booking_confirmed', 'email_booking_cancelled',
        'email_booking_rescheduled', 'email_payment_received', 'email_reminders',
        'in_app_notifications', 'push_notifications', 'created_at'
    ]
    search_fields = ['user__username', 'user__email', 'user__first_name', 'user__last_name']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('المستخدم', {
            'fields': ('user',)
        }),
        ('إشعارات البريد الإلكتروني', {
            'fields': (
                'email_booking_created', 'email_booking_confirmed', 'email_booking_cancelled',
                'email_booking_rescheduled', 'email_payment_received', 'email_reminders'
            )
        }),
        ('إشعارات التطبيق', {
            'fields': ('in_app_notifications', 'push_notifications')
        }),
        ('إعدادات التوقيت', {
            'fields': ('reminder_hours_before',)
        }),
        ('التواريخ', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['enable_all_notifications', 'disable_all_notifications']
    
    def enable_all_notifications(self, request, queryset):
        updated = queryset.update(
            email_booking_created=True,
            email_booking_confirmed=True,
            email_booking_cancelled=True,
            email_booking_rescheduled=True,
            email_payment_received=True,
            email_reminders=True,
            in_app_notifications=True,
            push_notifications=True
        )
        self.message_user(request, f'تم تفعيل جميع الإشعارات لـ {updated} مستخدم.')
    enable_all_notifications.short_description = 'تفعيل جميع الإشعارات'
    
    def disable_all_notifications(self, request, queryset):
        updated = queryset.update(
            email_booking_created=False,
            email_booking_confirmed=False,
            email_booking_cancelled=False,
            email_booking_rescheduled=False,
            email_payment_received=False,
            email_reminders=False,
            in_app_notifications=False,
            push_notifications=False
        )
        self.message_user(request, f'تم إلغاء تفعيل جميع الإشعارات لـ {updated} مستخدم.')
    disable_all_notifications.short_description = 'إلغاء تفعيل جميع الإشعارات'
