from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from django.utils import timezone
from ..models import (
    Category, Service, Staff, Customer, Address, Coupon, HeroImage,
    ServiceCategory, ServiceItem, Testimonial, ContactInfo, Contact, Offer
)


class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'name_en', 'primary_color', 'is_active', 'order', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'name_en', 'description']
    list_editable = ['is_active', 'order']
    ordering = ['order', 'name']
    
    fieldsets = (
        ('معلومات أساسية', {
            'fields': ('name', 'name_en', 'description', 'description_en')
        }),
        ('التصميم والألوان', {
            'fields': ('icon', 'image', 'primary_color'),
            'description': 'يمكنك اختيار لون مخصص للزر الأساسي لهذه الفئة'
        }),
        ('الإعدادات', {
            'fields': ('is_active', 'order')
        }),
    )
    
    def get_form(self, request, obj=None, **kwargs):
        form = super().get_form(request, obj, **kwargs)
        # Add HTML5 color input widget for primary_color field
        if 'primary_color' in form.base_fields:
            form.base_fields['primary_color'].widget.attrs.update({
                'type': 'color',
                'style': 'width: 100px; height: 40px;'
            })
        return form
    
    def changelist_view(self, request, extra_context=None):
        # Add category colors to context for JavaScript
        extra_context = extra_context or {}
        category_colors = {}
        for category in Category.objects.all():
            category_colors[category.name] = category.primary_color
        extra_context['category_colors'] = category_colors
        return super().changelist_view(request, extra_context)


class ServiceAdmin(admin.ModelAdmin):
    list_display = ['name', 'get_categories', 'price_display', 'duration', 'is_active', 'is_featured', 'order']
    list_filter = ['categories', 'is_active', 'is_featured', 'created_at']
    search_fields = ['name', 'name_en', 'description']
    list_editable = ['is_active', 'is_featured', 'order']
    ordering = ['order', 'name']
    filter_horizontal = ['categories']
    
    fieldsets = (
        ('معلومات أساسية', {
            'fields': ('categories', 'name', 'name_en', 'description', 'description_en')
        }),
        ('التسعير والمدة', {
            'fields': ('price', 'duration')
        }),
        ('الإعدادات', {
            'fields': ('image', 'is_active', 'is_featured', 'order')
        }),
    )
    
    def get_categories(self, obj):
        """Display categories in list view"""
        categories = obj.categories.all()
        if categories:
            return ", ".join([cat.name for cat in categories])
        return "بدون فئة"
    get_categories.short_description = "الفئات"


class StaffAdmin(admin.ModelAdmin):
    list_display = ['name', 'specialization', 'rating', 'work_on_saturday', 'work_on_sunday', 'is_active', 'created_at']
    list_filter = ['is_active', 'rating', 'work_on_saturday', 'work_on_sunday', 'created_at']
    search_fields = ['name', 'name_en', 'specialization']
    list_editable = ['is_active', 'rating']
    filter_horizontal = ['services']
    
    fieldsets = (
        ('معلومات أساسية', {
            'fields': ('user', 'name', 'name_en', 'specialization', 'specialization_en')
        }),
        ('السيرة الذاتية', {
            'fields': ('bio', 'bio_en')
        }),
        ('أوقات العمل', {
            'fields': ('lead_time', 'finish_time', 'slot_duration', 'appointment_buffer_time')
        }),
        ('أيام العمل', {
            'fields': ('work_on_saturday', 'work_on_sunday')
        }),
        ('الإعدادات', {
            'fields': ('image', 'rating', 'is_active', 'services')
        }),
    )


class CustomerAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'phone', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'email', 'phone']
    list_editable = ['is_active']
    readonly_fields = ['user']
    
    fieldsets = (
        ('معلومات أساسية', {
            'fields': ('user', 'name', 'email', 'phone')
        }),
        ('معلومات إضافية', {
            'fields': ('date_of_birth', 'is_active')
        }),
    )


class AddressAdmin(admin.ModelAdmin):
    list_display = ['customer', 'title', 'address', 'is_default', 'created_at']
    list_filter = ['is_default', 'created_at']
    search_fields = ['customer__name', 'title', 'address']
    list_editable = ['is_default']
    
    fieldsets = (
        ('معلومات العنوان', {
            'fields': ('customer', 'title', 'address')
        }),
        ('الموقع الجغرافي', {
            'fields': ('latitude', 'longitude')
        }),
        ('الإعدادات', {
            'fields': ('is_default',)
        }),
    )


class CouponAdmin(admin.ModelAdmin):
    list_display = ['code', 'name', 'discount_type', 'discount_value', 'valid_from', 'valid_until', 'is_active', 'used_count']
    list_filter = ['discount_type', 'is_active', 'valid_from', 'valid_until']
    search_fields = ['code', 'name', 'description']
    list_editable = ['is_active']
    readonly_fields = ['used_count']
    
    fieldsets = (
        ('معلومات أساسية', {
            'fields': ('code', 'name', 'description')
        }),
        ('إعدادات الخصم', {
            'fields': ('discount_type', 'discount_value', 'minimum_amount', 'maximum_discount')
        }),
        ('إعدادات الاستخدام', {
            'fields': ('usage_limit', 'used_count', 'valid_from', 'valid_until')
        }),
        ('الحالة', {
            'fields': ('is_active',)
        }),
    )


class HeroImageAdmin(admin.ModelAdmin):
    list_display = ['title', 'image_preview', 'is_active', 'order', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['title', 'title_en', 'description']
    list_editable = ['is_active', 'order']
    ordering = ['order', '-created_at']
    
    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;" />', obj.image.url)
        return "لا توجد صورة"
    image_preview.short_description = "معاينة الصورة"
    
    fieldsets = (
        ('معلومات أساسية', {
            'fields': ('title', 'title_en', 'description', 'description_en')
        }),
        ('الصورة والرابط', {
            'fields': ('image', 'link_url')
        }),
        ('الإعدادات', {
            'fields': ('is_active', 'order')
        }),
    )


class ServiceCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'icon', 'is_active', 'order', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name']
    list_editable = ['is_active', 'order']
    ordering = ['order', 'name']
    
    fieldsets = (
        ('معلومات أساسية', {
            'fields': ('name', 'icon')
        }),
        ('الإعدادات', {
            'fields': ('is_active', 'order')
        }),
    )


class ServiceItemAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'order', 'created_at']
    list_filter = ['category', 'created_at']
    search_fields = ['title', 'category__name']
    list_editable = ['order']
    ordering = ['category', 'order', 'title']
    
    fieldsets = (
        ('معلومات أساسية', {
            'fields': ('category', 'title')
        }),
        ('الإعدادات', {
            'fields': ('order',)
        }),
    )


class TestimonialAdmin(admin.ModelAdmin):
    list_display = ['customer_name', 'rating_display', 'service_used', 'is_featured', 'is_active', 'order', 'created_at']
    list_filter = ['rating', 'is_featured', 'is_active', 'created_at']
    search_fields = ['customer_name', 'customer_name_en', 'testimonial_text', 'service_used']
    list_editable = ['is_featured', 'is_active', 'order']
    ordering = ['order', '-created_at']
    actions = ['mark_as_featured', 'mark_as_not_featured', 'activate_testimonials', 'deactivate_testimonials']
    
    def rating_display(self, obj):
        return obj.get_rating_display()
    rating_display.short_description = 'التقييم'
    
    def image_preview(self, obj):
        if obj.customer_image:
            return format_html('<img src="{}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 50%;" />', obj.customer_image.url)
        return "لا توجد صورة"
    image_preview.short_description = "صورة العميل"
    
    def mark_as_featured(self, request, queryset):
        updated = queryset.update(is_featured=True)
        self.message_user(request, f'تم تمييز {updated} شهادة كمميزة.')
    mark_as_featured.short_description = "تمييز كشهادات مميزة"
    
    def mark_as_not_featured(self, request, queryset):
        updated = queryset.update(is_featured=False)
        self.message_user(request, f'تم إلغاء تمييز {updated} شهادة.')
    mark_as_not_featured.short_description = "إلغاء التمييز"
    
    def activate_testimonials(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, f'تم تفعيل {updated} شهادة.')
    activate_testimonials.short_description = "تفعيل الشهادات"
    
    def deactivate_testimonials(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, f'تم إلغاء تفعيل {updated} شهادة.')
    deactivate_testimonials.short_description = "إلغاء تفعيل الشهادات"
    
    fieldsets = (
        ('معلومات العميل', {
            'fields': ('customer_name', 'customer_name_en', 'customer_image')
        }),
        ('الشهادة', {
            'fields': ('testimonial_text', 'testimonial_text_en', 'rating')
        }),
        ('تفاصيل إضافية', {
            'fields': ('service_used',)
        }),
        ('الإعدادات', {
            'fields': ('is_featured', 'is_active', 'order')
        }),
    )


class OfferAdmin(admin.ModelAdmin):
    list_display = ['title', 'offer_type', 'discount_display', 'valid_from', 'valid_until', 'is_active', 'is_featured', 'is_new', 'order']
    list_filter = ['offer_type', 'is_active', 'is_featured', 'is_new', 'valid_from', 'valid_until', 'created_at']
    search_fields = ['title', 'title_en', 'description', 'short_description']
    list_editable = ['is_active', 'is_featured', 'is_new', 'order']
    ordering = ['order', '-is_featured', '-created_at']
    filter_horizontal = ['services', 'categories']
    date_hierarchy = 'valid_from'
    actions = ['mark_as_featured', 'mark_as_not_featured', 'activate_offers', 'deactivate_offers', 'mark_as_new', 'mark_as_not_new']
    
    def discount_display(self, obj):
        """Display discount information with styling"""
        if obj.offer_type == 'percentage' and obj.discount_value:
            return format_html(
                "<span style='background-color: #e74c3c; color: white; padding: 2px 6px; border-radius: 3px; font-size: 11px; font-weight: bold;'>-{}%</span>",
                obj.discount_value
            )
        elif obj.offer_type == 'fixed' and obj.discount_value:
            return format_html(
                "<span style='background-color: #27ae60; color: white; padding: 2px 6px; border-radius: 3px; font-size: 11px; font-weight: bold;'>-{} ر.س</span>",
                obj.discount_value
            )
        elif obj.offer_type == 'package':
            return format_html(
                "<span style='background-color: #9b59b6; color: white; padding: 2px 6px; border-radius: 3px; font-size: 11px; font-weight: bold;'>بكج</span>"
            )
        elif obj.offer_type == 'free_service':
            return format_html(
                "<span style='background-color: #f39c12; color: white; padding: 2px 6px; border-radius: 3px; font-size: 11px; font-weight: bold;'>مجاني</span>"
            )
        return "عرض خاص"
    discount_display.short_description = "نوع الخصم"
    
    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;" />', obj.image.url)
        return "لا توجد صورة"
    image_preview.short_description = "معاينة الصورة"
    
    def validity_status(self, obj):
        """Display validity status with color coding"""
        from django.utils import timezone
        now = timezone.now()
        
        if obj.valid_from > now:
            return format_html(
                "<span style='background-color: #3498db; color: white; padding: 2px 6px; border-radius: 3px; font-size: 11px;'>قريباً</span>"
            )
        elif obj.valid_until < now:
            return format_html(
                "<span style='background-color: #95a5a6; color: white; padding: 2px 6px; border-radius: 3px; font-size: 11px;'>منتهي</span>"
            )
        else:
            return format_html(
                "<span style='background-color: #27ae60; color: white; padding: 2px 6px; border-radius: 3px; font-size: 11px;'>نشط</span>"
            )
    validity_status.short_description = "الحالة"
    
    def color_preview(self, obj):
        """Display color preview"""
        if obj.pk:  # Only show preview for existing objects
            return format_html(
                '<div style="display: flex; gap: 10px; align-items: center;">'
                '<div style="display: flex; flex-direction: column; align-items: center;">'
                '<div style="width: 40px; height: 40px; background-color: {}; border: 2px solid #ddd; border-radius: 8px; margin-bottom: 5px;"></div>'
                '<small>لون البطاقة</small>'
                '</div>'
                '<div style="display: flex; flex-direction: column; align-items: center;">'
                '<div style="width: 40px; height: 40px; background-color: {}; border: 2px solid #ddd; border-radius: 8px; margin-bottom: 5px;"></div>'
                '<small>لون النص</small>'
                '</div>'
                '</div>',
                obj.card_color, obj.text_color
            )
        return "سيظهر معاينة الألوان بعد الحفظ"
    color_preview.short_description = "معاينة الألوان"
    
    def mark_as_featured(self, request, queryset):
        updated = queryset.update(is_featured=True)
        self.message_user(request, f'تم تمييز {updated} عرض كمميز.')
    mark_as_featured.short_description = "تمييز كعروض مميزة"
    
    def mark_as_not_featured(self, request, queryset):
        updated = queryset.update(is_featured=False)
        self.message_user(request, f'تم إلغاء تمييز {updated} عرض.')
    mark_as_not_featured.short_description = "إلغاء التمييز"
    
    def activate_offers(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, f'تم تفعيل {updated} عرض.')
    activate_offers.short_description = "تفعيل العروض"
    
    def deactivate_offers(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, f'تم إلغاء تفعيل {updated} عرض.')
    deactivate_offers.short_description = "إلغاء تفعيل العروض"
    
    def mark_as_new(self, request, queryset):
        updated = queryset.update(is_new=True)
        self.message_user(request, f'تم تمييز {updated} عرض كجديد.')
    mark_as_new.short_description = "تمييز كعروض جديدة"
    
    def mark_as_not_new(self, request, queryset):
        updated = queryset.update(is_new=False)
        self.message_user(request, f'تم إلغاء تمييز {updated} عرض كجديد.')
    mark_as_not_new.short_description = "إلغاء التمييز كجديد"
    
    fieldsets = (
        ('معلومات أساسية', {
            'fields': ('title', 'title_en', 'description', 'description_en', 'short_description', 'short_description_en')
        }),
        ('تفاصيل العرض', {
            'fields': ('offer_type', 'discount_value', 'original_price', 'offer_price')
        }),
        ('الصور', {
            'fields': ('image', 'thumbnail', 'image_preview'),
            'description': 'يتم إنشاء الصورة المصغرة تلقائياً إذا لم يتم تحديدها'
        }),
        ('فترة الصلاحية', {
            'fields': ('valid_from', 'valid_until')
        }),
        ('الخدمات والفئات', {
            'fields': ('services', 'categories'),
            'description': 'اختر الخدمات والفئات المرتبطة بهذا العرض'
        }),
        ('الشروط والأحكام', {
            'fields': ('terms_conditions', 'terms_conditions_en'),
            'classes': ('collapse',)
        }),
        ('حدود الاستخدام', {
            'fields': ('usage_limit', 'used_count'),
            'classes': ('collapse',)
        }),
        ('التصميم والألوان', {
            'fields': ('card_color', 'text_color', 'color_preview'),
            'description': 'يمكنك تخصيص ألوان البطاقة والنص'
        }),
        ('الإعدادات', {
            'fields': ('is_active', 'is_featured', 'is_new', 'order')
        }),
    )
    
    readonly_fields = ['image_preview', 'used_count', 'color_preview']
    
    def get_form(self, request, obj=None, **kwargs):
        form = super().get_form(request, obj, **kwargs)
        # Add help text for offer type
        if 'offer_type' in form.base_fields:
            form.base_fields['offer_type'].help_text = 'نسبة مئوية: خصم بنسبة معينة، مبلغ ثابت: خصم بمبلغ محدد، بكج: عرض خاص، خدمة مجانية: خدمة بدون مقابل'
        return form


class ContactInfoAdmin(admin.ModelAdmin):
    list_display = ['phone_number', 'location', 'working_hours', 'is_active', 'updated_at']
    list_filter = ['is_active', 'created_at', 'updated_at']
    search_fields = ['phone_number', 'location', 'working_hours']
    list_editable = ['is_active']
    ordering = ['-created_at']
    
    def has_add_permission(self, request):
        # Allow adding only if no active contact info exists
        return not ContactInfo.objects.filter(is_active=True).exists()
    
    def has_delete_permission(self, request, obj=None):
        # Prevent deletion of active contact info
        if obj and obj.is_active:
            return False
        return True
    
    fieldsets = (
        ('معلومات الاتصال', {
            'fields': ('phone_number', 'phone_number_en', 'location', 'location_en', 'working_hours', 'working_hours_en')
        }),
        ('الإعدادات', {
            'fields': ('is_active',)
        }),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request)
    
    def save_model(self, request, obj, form, change):
        # Ensure only one active contact info
        if obj.is_active:
            ContactInfo.objects.filter(is_active=True).exclude(pk=obj.pk).update(is_active=False)
        super().save_model(request, obj, form, change)


class ContactAdmin(admin.ModelAdmin):
    """Admin interface for Contact form submissions"""
    
    list_display = ['name', 'email', 'subject', 'is_read', 'created_at']
    list_filter = ['is_read', 'created_at']
    search_fields = ['name', 'email', 'subject', 'message']
    list_editable = ['is_read']
    ordering = ['-created_at']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('معلومات المرسل', {
            'fields': ('name', 'email', 'phone')
        }),
        ('محتوى الرسالة', {
            'fields': ('subject', 'message')
        }),
        ('حالة الرسالة', {
            'fields': ('is_read', 'created_at', 'updated_at')
        }),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related()
    
    def mark_as_read(self, request, queryset):
        """Mark selected messages as read"""
        updated = queryset.update(is_read=True)
        self.message_user(request, f'تم تمييز {updated} رسالة كمقروءة.')
    mark_as_read.short_description = "تمييز الرسائل المحددة كمقروءة"
    
    def mark_as_unread(self, request, queryset):
        """Mark selected messages as unread"""
        updated = queryset.update(is_read=False)
        self.message_user(request, f'تم تمييز {updated} رسالة كغير مقروءة.')
    mark_as_unread.short_description = "تمييز الرسائل المحددة كغير مقروءة"
    
    actions = [mark_as_read, mark_as_unread]
