from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from django.utils import timezone
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from ..models import (
    Booking, Config, WorkingHours, DayOff, AppointmentRequest, 
    AppointmentRescheduleHistory, PasswordResetToken, AdminSlotAvailability
)


class BookingAdmin(admin.ModelAdmin):
    list_display = ['formatted_booking_info', 'customer_info', 'service_info', 'booking_datetime', 'status', 'price_info', 'created_at']
    list_filter = ['status', 'payment_method', 'booking_date', 'created_at']
    search_fields = ['customer__name', 'service__name', 'customer__email', 'customer__phone']
    list_editable = ['status']  # ✅ تعديل مباشر للحالة
    readonly_fields = ['customer_full_info', 'client_location_info', 'discount_amount', 'final_price', 'created_at', 'updated_at']
    date_hierarchy = 'booking_date'
    ordering = ['-created_at']  # أحدث الحجوزات أولاً
    list_per_page = 20  # 20 حجز في كل صفحة
    actions = ['mark_as_completed', 'mark_as_pending', 'mark_as_cancelled', 'mark_as_in_progress']
    
    def changelist_view(self, request, extra_context=None):
        """Add export buttons to the changelist view"""
        extra_context = extra_context or {}
        
        # Add export URLs (Excel only - PDF removed)
        extra_context['export_urls'] = {
            'export_bookings_excel': reverse('admin_salon_export_bookings_excel'),
            'export_customers_excel': reverse('admin_salon_export_customers_excel'),
            'export_services_excel': reverse('admin_salon_export_services_excel'),
            'export_revenue_excel': reverse('admin_salon_export_revenue_excel'),
        }
        
        return super().changelist_view(request, extra_context)
    
    def has_view_permission(self, request, obj=None):
        """Allow all staff users to view bookings"""
        return request.user.is_staff
    
    def has_add_permission(self, request):
        """Allow all staff users to add bookings"""
        return request.user.is_staff
    
    def has_change_permission(self, request, obj=None):
        """Allow all staff users to change bookings"""
        return request.user.is_staff
    
    def has_delete_permission(self, request, obj=None):
        """Allow all staff users to delete bookings"""
        return request.user.is_staff
    
    fieldsets = (
        ('معلومات الحجز', {
            'fields': ('customer', 'service', 'staff', 'address')
        }),
        ('معلومات العميل الكاملة', {
            'fields': ('customer_full_info', 'client_location_info'),
            'classes': ('collapse',),
            'description': 'جميع تفاصيل العميل والموقع'
        }),
        ('التوقيت', {
            'fields': ('booking_date', 'booking_time')
        }),
        ('الدفع', {
            'fields': ('payment_method', 'price', 'coupon', 'discount_amount', 'final_price')
        }),
        ('الحالة والملاحظات', {
            'fields': ('status', 'special_requests')
        }),
        ('معلومات إضافية', {
            'fields': ('created_at', 'updated_at')
        }),
    )
    
    def formatted_booking_info(self, obj):
        """Display booking ID and basic info"""
        return f"#{obj.id} - {obj.customer.name}"
    formatted_booking_info.short_description = "الحجز"
    formatted_booking_info.admin_order_field = 'id'
    
    def customer_info(self, obj):
        """Display customer information with styling"""
        return format_html(
            "{}<br><small style='color: #666;'>{}</small>",
            obj.customer.name,
            obj.customer.email
        )
    customer_info.short_description = "العميل"
    customer_info.admin_order_field = 'customer__name'
    
    def service_info(self, obj):
        """Display service information"""
        first_category = obj.service.categories.first()
        category_name = first_category.name if first_category else 'غير محدد'
        return format_html(
            "{}<br><small style='color: #666;'>{}</small>",
            obj.service.name,
            category_name
        )
    service_info.short_description = "الخدمة"
    service_info.admin_order_field = 'service__name'
    
    def booking_datetime(self, obj):
        """Display booking date and time with styling"""
        date_str = obj.booking_date.strftime('%Y-%m-%d')
        time_str = obj.booking_time.strftime('%H:%M')
        return format_html(
            "<strong style='color: #2c3e50;'>{}</strong><br><span style='color: #7f8c8d;'>{}</span>",
            date_str,
            time_str
        )
    booking_datetime.short_description = "التاريخ والوقت"
    booking_datetime.admin_order_field = 'booking_date'
    
    def status_badge(self, obj):
        """Display status with colored badge"""
        status_colors = {
            'pending': '#f39c12',
            'confirmed': '#27ae60',
            'in_progress': '#3498db',
            'completed': '#2ecc71',
            'cancelled': '#e74c3c'
        }
        status_names = {
            'pending': 'في الانتظار',
            'confirmed': 'مؤكد',
            'in_progress': 'جاري التنفيذ',
            'completed': 'مكتمل',
            'cancelled': 'ملغي'
        }
        color = status_colors.get(obj.status, '#95a5a6')
        name = status_names.get(obj.status, obj.status)
        return format_html(
            "<span style='background-color: {}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;'>{}</span>",
            color,
            name
        )
    status_badge.short_description = "الحالة"
    status_badge.admin_order_field = 'status'
    
    def price_info(self, obj):
        """Display price information with discount if applicable"""
        if obj.discount_amount > 0:
            return format_html(
                "<strong style='color: #27ae60;'>{} ر.س</strong><br><small style='color: #e74c3c;'>خصم: {} ر.س</small>",
                obj.final_price,
                obj.discount_amount
            )
        else:
            return format_html(
                "<strong style='color: #2c3e50;'>{} ر.س</strong>",
                obj.final_price
            )
    price_info.short_description = "السعر"
    price_info.admin_order_field = 'final_price'

    def customer_full_info(self, obj):
        """Display complete customer information"""
        customer = obj.customer
        return format_html(
            '<div style="background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #3498db;">'
            '<h3 style="margin: 0 0 10px 0; color: #2c3e50;">📋 معلومات العميل الكاملة</h3>'
            '<table style="width: 100%; border-collapse: collapse;">'
            '<tr style="border-bottom: 1px solid #dee2e6;">'
            '<td style="padding: 8px; font-weight: bold; color: #495057;">👤 الاسم:</td>'
            '<td style="padding: 8px; color: #212529;">{}</td>'
            '</tr>'
            '<tr style="border-bottom: 1px solid #dee2e6;">'
            '<td style="padding: 8px; font-weight: bold; color: #495057;">📧 البريد الإلكتروني:</td>'
            '<td style="padding: 8px; color: #212529;"><a href="mailto:{}">{}</a></td>'
            '</tr>'
            '<tr style="border-bottom: 1px solid #dee2e6;">'
            '<td style="padding: 8px; font-weight: bold; color: #495057;">📱 رقم الهاتف:</td>'
            '<td style="padding: 8px; color: #212529;"><a href="tel:{}">{}</a></td>'
            '</tr>'
            '<tr style="border-bottom: 1px solid #dee2e6;">'
            '<td style="padding: 8px; font-weight: bold; color: #495057;">🎂 تاريخ الميلاد:</td>'
            '<td style="padding: 8px; color: #212529;">{}</td>'
            '</tr>'
            '<tr>'
            '<td style="padding: 8px; font-weight: bold; color: #495057;">✅ الحالة:</td>'
            '<td style="padding: 8px;"><span style="background: {}; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px;">{}</span></td>'
            '</tr>'
            '</table>'
            '</div>',
            customer.name,
            customer.email, customer.email,
            customer.phone, customer.phone,
            customer.date_of_birth if customer.date_of_birth else 'غير محدد',
            '#27ae60' if customer.is_active else '#e74c3c',
            'نشط' if customer.is_active else 'غير نشط'
        )
    customer_full_info.short_description = "معلومات العميل الكاملة"

    def client_location_info(self, obj):
        """Display client location information with map link"""
        address = obj.address
        
        # Prepare Google Maps link if coordinates are available
        map_link = ''
        if address.latitude and address.longitude:
            map_link = f'https://www.google.com/maps?q={address.latitude},{address.longitude}'
            map_embed = f'https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q={address.latitude},{address.longitude}&zoom=15'
        
        return format_html(
            '<div style="background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #e74c3c;">'
            '<h3 style="margin: 0 0 10px 0; color: #2c3e50;">📍 معلومات موقع العميل</h3>'
            '<table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">'
            '<tr style="border-bottom: 1px solid #dee2e6;">'
            '<td style="padding: 8px; font-weight: bold; color: #495057;">🏷️ عنوان الموقع:</td>'
            '<td style="padding: 8px; color: #212529;">{}</td>'
            '</tr>'
            '<tr style="border-bottom: 1px solid #dee2e6;">'
            '<td style="padding: 8px; font-weight: bold; color: #495057;">📮 العنوان التفصيلي:</td>'
            '<td style="padding: 8px; color: #212529;">{}</td>'
            '</tr>'
            '<tr style="border-bottom: 1px solid #dee2e6;">'
            '<td style="padding: 8px; font-weight: bold; color: #495057;">🌐 خط العرض:</td>'
            '<td style="padding: 8px; color: #212529; font-family: monospace;">{}</td>'
            '</tr>'
            '<tr style="border-bottom: 1px solid #dee2e6;">'
            '<td style="padding: 8px; font-weight: bold; color: #495057;">🌐 خط الطول:</td>'
            '<td style="padding: 8px; color: #212529; font-family: monospace;">{}</td>'
            '</tr>'
            '<tr>'
            '<td style="padding: 8px; font-weight: bold; color: #495057;">⭐ افتراضي:</td>'
            '<td style="padding: 8px;"><span style="background: {}; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px;">{}</span></td>'
            '</tr>'
            '</table>'
            '{}'
            '</div>',
            address.title,
            address.address,
            address.latitude if address.latitude else 'غير محدد',
            address.longitude if address.longitude else 'غير محدد',
            '#f39c12' if address.is_default else '#95a5a6',
            'نعم' if address.is_default else 'لا',
            format_html(
                '<div style="margin-top: 10px;">'
                '<a href="{}" target="_blank" style="display: inline-block; background: #e74c3c; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px; font-weight: bold;">'
                '🗺️ فتح الموقع في خرائط جوجل'
                '</a>'
                '<div style="margin-top: 15px; padding: 10px; background: white; border-radius: 8px; border: 1px solid #dee2e6;">'
                '<iframe width="100%" height="300" frameborder="0" style="border:0; border-radius: 4px;" '
                'src="https://maps.google.com/maps?q={},{}&hl=ar&z=15&output=embed" allowfullscreen></iframe>'
                '</div>'
                '</div>',
                map_link,
                address.latitude, address.longitude
            ) if address.latitude and address.longitude else format_html(
                '<p style="color: #e74c3c; margin-top: 10px; padding: 10px; background: #fee; border-radius: 4px;">⚠️ لا توجد إحداثيات GPS لهذا العنوان</p>'
            )
        )
    client_location_info.short_description = "موقع العميل"

    def get_queryset(self, request):
        """Ensure proper ordering for the admin list view"""
        qs = super().get_queryset(request)
        return qs.select_related('customer', 'service', 'coupon').order_by('-booking_date', '-created_at')
    
    def changelist_view(self, request, extra_context=None):
        """Add extra context for the changelist view"""
        extra_context = extra_context or {}
        extra_context['title'] = 'إدارة الحجوزات - أحدث الحجوزات أولاً'
        return super().changelist_view(request, extra_context)

    def save_model(self, request, obj, form, change):
        # Store the original status before saving
        original_status = None
        if change:
            try:
                original_obj = Booking.objects.get(pk=obj.pk)
                original_status = original_obj.status
            except Booking.DoesNotExist:
                pass
        
        # Auto-calculate pricing when saving
        if obj.coupon and obj.coupon.is_valid():
            if obj.coupon.discount_type == 'percentage':
                discount = (obj.price * obj.coupon.discount_value) / 100
                if obj.coupon.maximum_discount:
                    discount = min(discount, obj.coupon.maximum_discount)
            else:
                discount = obj.coupon.discount_value
            obj.discount_amount = min(discount, obj.price)
        else:
            obj.discount_amount = 0
        
        obj.final_price = obj.price - obj.discount_amount
        
        # Save the model first
        super().save_model(request, obj, form, change)
        
        # Send email if status changed to specific values
        if change and original_status != obj.status:
            self.send_status_update_email(obj, original_status)

    def send_status_update_email(self, booking, original_status):
        """Send email notification when booking status changes"""
        # Status mapping with proper Arabic subjects for all statuses
        status_config = {
            'pending': {
                'subject': 'تحديث حالة حجزك - في الانتظار',
                'message': 'حجزك في حالة الانتظار',
                'class': 'pending'
            },
            'confirmed': {
                'subject': 'تأكيد حجزك في صالون الجمال',
                'message': 'تم تأكيد حجزك',
                'class': 'confirmed'
            },
            'in_progress': {
                'subject': 'تحديث حالة حجزك - جاري التنفيذ',
                'message': 'جاري تنفيذ حجزك',
                'class': 'in_progress'
            },
            'cancelled': {
                'subject': 'تم إلغاء حجزك',
                'message': 'تم إلغاء حجزك',
                'class': 'cancelled'
            },
            'completed': {
                'subject': 'شكرًا لك! تم تنفيذ الحجز بنجاح',
                'message': 'تم إكمال الخدمة',
                'class': 'completed'
            }
        }
        
        # Payment method mapping
        payment_methods = {
            'visa': 'فيزا',
            'mastercard': 'ماستركارد',
            'mada': 'مدى',
            'apple_pay': 'Apple Pay',
            'stc_pay': 'STC Pay',
            'cash': 'نقدي'
        }
        
        config = status_config.get(booking.status, {})
        if not config:
            return
        
        # Prepare context for email template
        context = {
            'customer_name': booking.customer.name,
            'booking_id': booking.id,
            'service_name': booking.service.name,
            'booking_date': booking.booking_date.strftime('%Y-%m-%d'),
            'booking_time': booking.booking_time.strftime('%H:%M'),
            'payment_method': payment_methods.get(booking.payment_method, booking.payment_method),
            'final_price': booking.final_price,
            'discount_amount': booking.discount_amount,
            'status': booking.status,
            'status_message': config['message'],
            'status_class': config['class'],
            'website_name': 'صالون الجمال'
        }
        
        # Render HTML email template
        html_content = render_to_string('emails/booking_status_update.html', context)
        
        # Create plain text version
        text_content = strip_tags(html_content)
        
        # Create email with proper subject
        subject = config['subject']
        
        email = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email='info@takweensoft.com',
            to=[booking.customer.email]
        )
        email.attach_alternative(html_content, "text/html")
        
        # Send email
        try:
            email.send()
            print(f"✅ Status update email sent to {booking.customer.email} for booking #{booking.id}")
        except Exception as e:
            print(f"❌ Failed to send status update email: {e}")

    def mark_as_completed(self, request, queryset):
        """تحديث الحجوزات المحددة كمكتملة"""
        # Get bookings before update to send emails
        bookings_to_notify = list(queryset.filter(status__in=['pending', 'confirmed', 'in_progress']))
        
        updated = queryset.update(status='completed')
        
        # Send emails for status change
        for booking in bookings_to_notify:
            booking.status = 'completed'  # Update the instance for email
            self.send_status_update_email(booking, booking.status)
        
        self.message_user(request, f'تم تحديث {updated} حجز كمكتمل.')
    mark_as_completed.short_description = "تحديد كمكتمل"

    def mark_as_pending(self, request, queryset):
        """تحديث الحجوزات المحددة كفي الانتظار"""
        updated = queryset.update(status='pending')
        self.message_user(request, f'تم تحديث {updated} حجز كفي الانتظار.')
    mark_as_pending.short_description = "تحديد كفي الانتظار"

    def mark_as_cancelled(self, request, queryset):
        """تحديث الحجوزات المحددة كملغية"""
        # Get bookings before update to send emails
        bookings_to_notify = list(queryset.filter(status__in=['pending', 'confirmed', 'in_progress']))
        
        updated = queryset.update(status='cancelled')
        
        # Send emails for status change
        for booking in bookings_to_notify:
            booking.status = 'cancelled'  # Update the instance for email
            self.send_status_update_email(booking, booking.status)
        
        self.message_user(request, f'تم تحديث {updated} حجز كملغي.')
    mark_as_cancelled.short_description = "تحديد كملغي"

    def mark_as_in_progress(self, request, queryset):
        """تحديث الحجوزات المحددة كجاري التنفيذ"""
        updated = queryset.update(status='in_progress')
        self.message_user(request, f'تم تحديث {updated} حجز كجاري التنفيذ.')
    mark_as_in_progress.short_description = "تحديد كجاري التنفيذ"
    
    def changelist_view(self, request, extra_context=None):
        """Add latest 3 bookings to the changelist view"""
        extra_context = extra_context or {}
        
        # Get the latest 3 bookings
        latest_bookings = Booking.objects.select_related(
            'customer', 'service', 'staff'
        ).order_by('-created_at')[:3]
        
        # Prepare booking data for display
        bookings_data = []
        for booking in latest_bookings:
            bookings_data.append({
                'id': booking.id,
                'customer_name': booking.customer.name,
                'service_name': booking.service.name,
                'staff_name': booking.staff.name if booking.staff else 'غير محدد',
                'booking_time': booking.booking_time.strftime('%H:%M'),
                'status': booking.get_status_display(),
                'status_class': booking.status,
                'created_at': booking.created_at.strftime('%Y-%m-%d %H:%M'),
            })
        
        extra_context['latest_bookings'] = bookings_data
        extra_context['latest_bookings_count'] = len(bookings_data)
        
        return super().changelist_view(request, extra_context)


class ConfigAdmin(admin.ModelAdmin):
    list_display = (
        'website_name', 'slot_duration', 'lead_time', 'finish_time', 
        'appointment_buffer_time', 'default_reschedule_limit'
    )
    fieldsets = (
        ('إعدادات الموقع', {
            'fields': ('website_name',)
        }),
        ('إعدادات المواعيد', {
            'fields': ('slot_duration', 'lead_time', 'finish_time', 'appointment_buffer_time')
        }),
        ('إعدادات إعادة الجدولة', {
            'fields': ('default_reschedule_limit', 'allow_staff_change_on_reschedule')
        }),
    )

    def has_add_permission(self, request):
        # Only allow one config object
        return not Config.objects.exists()

    def has_delete_permission(self, request, obj=None):
        # Prevent deletion of config
        return False


class WorkingHoursAdmin(admin.ModelAdmin):
    list_display = ('staff', 'day_of_week', 'start_time', 'end_time')
    list_filter = ('day_of_week', 'staff')
    search_fields = ('staff__name',)
    ordering = ('staff', 'day_of_week', 'start_time')
    
    fieldsets = (
        ('معلومات الموظف', {
            'fields': ('staff',)
        }),
        ('أوقات العمل', {
            'fields': ('day_of_week', 'start_time', 'end_time')
        }),
    )


class DayOffAdmin(admin.ModelAdmin):
    list_display = ('staff', 'start_date', 'end_date', 'description')
    list_filter = ('start_date', 'end_date', 'staff')
    search_fields = ('staff__name', 'description')
    date_hierarchy = 'start_date'
    
    fieldsets = (
        ('معلومات الموظف', {
            'fields': ('staff',)
        }),
        ('تفاصيل الإجازة', {
            'fields': ('start_date', 'end_date', 'description')
        }),
    )


class AppointmentRequestAdmin(admin.ModelAdmin):
    list_display = ('date', 'start_time', 'end_time', 'service', 'staff', 'customer', 'payment_type', 'created_at')
    list_filter = ('date', 'service', 'staff', 'payment_type', 'created_at')
    search_fields = ('customer__name', 'service__name', 'id_request')
    date_hierarchy = 'date'
    ordering = ('-created_at',)
    
    fieldsets = (
        ('معلومات الموعد', {
            'fields': ('date', 'start_time', 'end_time', 'service', 'staff')
        }),
        ('معلومات العميل', {
            'fields': ('customer',)
        }),
        ('معلومات الدفع', {
            'fields': ('payment_type',)
        }),
        ('معلومات إضافية', {
            'fields': ('id_request', 'reschedule_attempts')
        }),
    )


class AppointmentRescheduleHistoryAdmin(admin.ModelAdmin):
    list_display = (
        'appointment_request', 'date', 'start_time', 'end_time', 
        'staff', 'reschedule_status', 'created_at'
    )
    list_filter = ('reschedule_status', 'date', 'created_at', 'staff')
    search_fields = (
        'appointment_request__id_request', 'staff__name', 
        'reason_for_rescheduling'
    )
    date_hierarchy = 'created_at'
    ordering = ('-created_at',)
    
    fieldsets = (
        ('معلومات الموعد الأصلي', {
            'fields': ('appointment_request',)
        }),
        ('التوقيت السابق', {
            'fields': ('date', 'start_time', 'end_time', 'staff')
        }),
        ('معلومات إعادة الجدولة', {
            'fields': ('reason_for_rescheduling', 'reschedule_status', 'id_request')
        }),
    )


class PasswordResetTokenAdmin(admin.ModelAdmin):
    list_display = ('user', 'token', 'expires_at', 'status', 'created_at')
    list_filter = ('status', 'expires_at', 'created_at')
    search_fields = ('user__email', 'user__username', 'token')
    date_hierarchy = 'expires_at'
    ordering = ('-expires_at',)
    readonly_fields = ('token', 'created_at', 'updated_at')
    
    fieldsets = (
        ('معلومات المستخدم', {
            'fields': ('user',)
        }),
        ('معلومات الرمز', {
            'fields': ('token', 'expires_at', 'status')
        }),
        ('معلومات إضافية', {
            'fields': ('created_at', 'updated_at')
        }),
    )


class AdminSlotAvailabilityAdmin(admin.ModelAdmin):
    """Admin interface for managing available booking slots"""
    list_display = ['service', 'date', 'time', 'is_available', 'current_bookings', 'max_bookings', 'staff', 'created_at']
    list_filter = ['service', 'date', 'is_available', 'staff', 'created_at']
    search_fields = ['service__name', 'service__name_en', 'staff__name', 'notes']
    list_editable = ['is_available', 'max_bookings']
    ordering = ['date', 'time']
    date_hierarchy = 'date'
    
    fieldsets = (
        ('معلومات الموعد', {
            'fields': ('service', 'date', 'time', 'staff')
        }),
        ('إعدادات التوفر', {
            'fields': ('is_available', 'max_bookings', 'current_bookings'),
            'description': 'الحد الأقصى للحجوزات: عدد الحجوزات المسموح بها في هذا الوقت'
        }),
        ('ملاحظات إضافية', {
            'fields': ('notes',),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['current_bookings', 'created_at', 'updated_at']
    
    def get_queryset(self, request):
        """Optimize queries"""
        return super().get_queryset(request).select_related('service', 'staff')
    
    def has_add_permission(self, request):
        """Allow adding new slots"""
        return True
    
    def has_change_permission(self, request, obj=None):
        """Allow modifying slots"""
        return True
    
    def has_delete_permission(self, request, obj=None):
        """Allow deleting slots"""
        return True
