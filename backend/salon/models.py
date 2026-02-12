from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from django.core.exceptions import ValidationError
from django.utils import timezone
from datetime import timedelta
from django.utils.translation import gettext_lazy as _
from django.utils.text import slugify
from PIL import Image
import os
import uuid
import random
import string


class Customer(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True, verbose_name="المستخدم")

    name = models.CharField(max_length=100, null=True, blank=True, verbose_name="الاسم")
    email = models.EmailField(null=True, blank=True, verbose_name="البريد الإلكتروني")

    phone = models.CharField(max_length=20, unique=True, verbose_name="رقم الهاتف")
    is_phone_verified = models.BooleanField(default=False, verbose_name="تم التحقق من الهاتف")

    date_of_birth = models.DateField(blank=True, null=True, verbose_name="تاريخ الميلاد")
    is_active = models.BooleanField(default=True, verbose_name="نشط")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "عميل"
        verbose_name_plural = "العملاء"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.phone}"





class Category(models.Model):
    """Service categories like hair care, makeup, skincare, etc."""
    name = models.CharField(max_length=100, verbose_name="اسم الفئة")
    name_en = models.CharField(max_length=100, verbose_name="اسم الفئة بالإنجليزية")
    slug_en = models.SlugField(max_length=100, unique=True, blank=True, null=True, verbose_name="الرابط الإنجليزي", help_text="سيتم إنشاؤه تلقائياً من الاسم الإنجليزي")
    description = models.TextField(verbose_name="وصف الفئة")
    description_en = models.TextField(verbose_name="وصف الفئة بالإنجليزية")
    icon = models.CharField(max_length=50, blank=True, verbose_name="أيقونة")
    image = models.ImageField(upload_to='categories/', blank=True, null=True, verbose_name="صورة الفئة")
    primary_color = models.CharField(max_length=7, default='#B89F67', verbose_name="اللون الأساسي", help_text="لون الزر الأساسي لهذه الفئة (مثل #B89F67)")
    is_active = models.BooleanField(default=True, verbose_name="نشطة")
    order = models.PositiveIntegerField(default=0, verbose_name="ترتيب العرض")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "فئة"
        verbose_name_plural = "الفئات"
        ordering = ['order', 'name']

    def save(self, *args, **kwargs):
        if not self.slug_en and self.name_en:
            self.slug_en = slugify(self.name_en)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Service(models.Model):
    """Individual services offered by the salon"""
    categories = models.ManyToManyField(Category, related_name='services', verbose_name="الفئات", help_text="يمكن اختيار أكثر من فئة")
    name = models.CharField(max_length=200, verbose_name="اسم الخدمة")
    name_en = models.CharField(max_length=200, verbose_name="اسم الخدمة بالإنجليزية")
    description = models.TextField(verbose_name="وصف الخدمة")
    description_en = models.TextField(verbose_name="وصف الخدمة بالإنجليزية")
    duration = models.CharField(max_length=50, verbose_name="المدة")
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="السعر")
    image = models.ImageField(upload_to='services/', blank=True, null=True, verbose_name="صورة الخدمة")
    is_active = models.BooleanField(default=True, verbose_name="نشطة")
    is_featured = models.BooleanField(default=False, verbose_name="مميزة")
    order = models.PositiveIntegerField(default=0, verbose_name="ترتيب العرض")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "خدمة"
        verbose_name_plural = "الخدمات"
        ordering = ['order', 'name']

    @property
    def category(self):
        """Get the first category for backward compatibility"""
        return self.categories.first()
    
    @property
    def category_name(self):
        """Get the name of the first category for backward compatibility"""
        first_category = self.categories.first()
        return first_category.name if first_category else ""

    def __str__(self):
        first_category = self.categories.first()
        category_name = first_category.name if first_category else "بدون فئة"
        return f"{category_name} - {self.name}"

    @property
    def price_display(self):
        return str(self.price)



class Staff(models.Model):
    """Staff members who provide services"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True, verbose_name=_("User"))
    name = models.CharField(max_length=100, verbose_name="الاسم")
    name_en = models.CharField(max_length=100, verbose_name="الاسم بالإنجليزية")
    specialization = models.CharField(max_length=200, verbose_name="التخصص")
    specialization_en = models.CharField(max_length=200, verbose_name="التخصص بالإنجليزية")
    bio = models.TextField(blank=True, verbose_name="نبذة")
    bio_en = models.TextField(blank=True, verbose_name="نبذة بالإنجليزية")
    image = models.ImageField(upload_to='staff/', blank=True, null=True, verbose_name="الصورة")
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=5.0, 
                                validators=[MinValueValidator(0), MaxValueValidator(5)], 
                                verbose_name="التقييم")
    is_active = models.BooleanField(default=True, verbose_name="نشط")
    services = models.ManyToManyField(Service, blank=True, verbose_name="الخدمات")
    
    # Additional fields from django-appointment-main
    slot_duration = models.PositiveIntegerField(
        null=True, blank=True,
        verbose_name=_("Slot Duration (minutes)"),
        help_text=_("Minimum time for an appointment in minutes, recommended 30.")
    )
    lead_time = models.TimeField(
        null=True, blank=True,
        verbose_name=_("Lead Time"),
        help_text=_("Time when the staff member starts working.")
    )
    finish_time = models.TimeField(
        null=True, blank=True,
        verbose_name=_("Finish Time"),
        help_text=_("Time when the staff member stops working.")
    )
    appointment_buffer_time = models.FloatField(
        blank=True, null=True,
        verbose_name=_("Appointment Buffer Time (minutes)"),
        help_text=_("Time between now and the first available slot for the current day.")
    )
    work_on_saturday = models.BooleanField(
        default=False,
        verbose_name=_("Work on Saturday"),
        help_text=_("Indicates whether this staff member works on Saturdays.")
    )
    work_on_sunday = models.BooleanField(
        default=False,
        verbose_name=_("Work on Sunday"),
        help_text=_("Indicates whether this staff member works on Sundays.")
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "موظف"
        verbose_name_plural = "الموظفون"
        ordering = ['-rating', 'name']

    def __str__(self):
        return self.name

    def get_slot_duration(self):
        config = Config.objects.first()
        return self.slot_duration or (config.slot_duration if config else 30)

    def get_lead_time(self):
        config = Config.objects.first()
        return self.lead_time or (config.lead_time if config else None)

    def get_finish_time(self):
        config = Config.objects.first()
        return self.finish_time or (config.finish_time if config else None)

    def get_appointment_buffer_time(self):
        config = Config.objects.first()
        return self.appointment_buffer_time or (config.appointment_buffer_time if config else 0)

    def get_non_working_days(self):
        non_working_days = []
        if not self.work_on_saturday:
            non_working_days.append(6)  # Saturday
        if not self.work_on_sunday:
            non_working_days.append(0)  # Sunday
        return non_working_days

    def is_working_day(self, day: int):
        return day not in self.get_non_working_days()

    def get_working_hours(self):
        return self.workinghours_set.all()

    def get_days_off(self):
        return self.dayoff_set.all()

from django.db import models
from django.utils import timezone
from datetime import timedelta
# from .models import Customer  # تأكد من المسار الصحيح لموديل Customer

class PhoneOTP(models.Model):
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE  , null = True , blank = True)
    otp_code = models.CharField(max_length=6)
    is_used = models.BooleanField(default=False)
    attempts = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    def save(self, *args, **kwargs):
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(minutes=5)
        super().save(*args, **kwargs)

    def is_expired(self):
        return timezone.now() > self.expires_at


# class CustomerOTP(models.Model):
#     customer = models.ForeignKey(Customer, on_delete=models.CASCADE, verbose_name="العميل")
#     code = models.CharField(max_length=6, verbose_name="كود التحقق")
#     created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاريخ الإنشاء")

#     def is_valid(self):
#         """التحقق من صلاحية الكود لمدة 5 دقائق"""
#         return timezone.now() < self.created_at + timedelta(minutes=5)

#     def __str__(self):
#         return f"{self.customer.phone} - {self.code}"

class Address(models.Model):
    """Customer addresses"""
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE  , null = True , blank = True)
    title = models.CharField(max_length=50, verbose_name="عنوان العنوان")
    address = models.TextField(verbose_name="العنوان التفصيلي")
    latitude = models.DecimalField(max_digits=10, decimal_places=7, blank=True, null=True, verbose_name="خط العرض")
    longitude = models.DecimalField(max_digits=10, decimal_places=7, blank=True, null=True, verbose_name="خط الطول")
    is_default = models.BooleanField(default=False, verbose_name="افتراضي")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "عنوان"
        verbose_name_plural = "العناوين"
        ordering = ['-is_default', '-created_at']

    def __str__(self):
        return f"{self.customer.name} - {self.title}"


class Coupon(models.Model):
    """Discount coupons"""
    DISCOUNT_TYPES = [
        ('percentage', 'نسبة مئوية'),
        ('fixed', 'مبلغ ثابت'),
    ]
    
    code = models.CharField(max_length=50, unique=True, verbose_name="كود الكوبون")
    name = models.CharField(max_length=100, verbose_name="اسم الكوبون")
    description = models.TextField(blank=True, verbose_name="الوصف")
    discount_type = models.CharField(max_length=10, choices=DISCOUNT_TYPES, verbose_name="نوع الخصم")
    discount_value = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="قيمة الخصم")
    minimum_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0, verbose_name="الحد الأدنى للمبلغ")
    maximum_discount = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True, verbose_name="الحد الأقصى للخصم")
    usage_limit = models.PositiveIntegerField(blank=True, null=True, verbose_name="حد الاستخدام")
    used_count = models.PositiveIntegerField(default=0, verbose_name="عدد مرات الاستخدام")
    valid_from = models.DateTimeField(verbose_name="صالح من")
    valid_until = models.DateTimeField(verbose_name="صالح حتى")
    is_active = models.BooleanField(default=True, verbose_name="نشط")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "كوبون"
        verbose_name_plural = "الكوبونات"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.code} - {self.name}"

    def is_valid(self):
        from django.utils import timezone
        now = timezone.now()
        return (self.is_active and 
                self.valid_from <= now <= self.valid_until and
                (self.usage_limit is None or self.used_count < self.usage_limit))


class Booking(models.Model):
    """Customer bookings"""
    STATUS_CHOICES = [
        ('pending_payment', 'في انتظار الدفع'),
        ('pending', 'في الانتظار'),
        ('confirmed', 'مؤكد'),
        ('in_progress', 'جاري التنفيذ'),
        ('completed', 'مكتمل'),
        ('cancelled', 'ملغي'),
    ]
    
    PAYMENT_METHODS = [
        ('cash', 'نقدي'),
    ]
    
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE , null = True , blank = True)
    service = models.ForeignKey(Service, on_delete=models.CASCADE, verbose_name="الخدمة")
    staff = models.ForeignKey(Staff, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="الموظف")
    address = models.ForeignKey(Address, on_delete=models.CASCADE, verbose_name="العنوان")
    booking_date = models.DateField(verbose_name="تاريخ الحجز")
    booking_time = models.TimeField(verbose_name="وقت الحجز")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending_payment', verbose_name="الحالة")
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS, verbose_name="طريقة الدفع")
    special_requests = models.TextField(blank=True, verbose_name="طلبات خاصة")
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="السعر")
    coupon = models.ForeignKey(Coupon, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="الكوبون")
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0, verbose_name="مبلغ الخصم")
    final_price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="السعر النهائي")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Rescheduling fields
    reschedule_count = models.PositiveIntegerField(default=0, verbose_name="عدد مرات إعادة الجدولة")
    max_reschedules = models.PositiveIntegerField(default=2, verbose_name="الحد الأقصى لإعادة الجدولة")
    can_reschedule = models.BooleanField(default=True, verbose_name="يمكن إعادة الجدولة")
    
    # Payment tracking fields
    payment_status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'في الانتظار'),
            ('partial', 'دفع جزئي'),
            ('paid', 'مدفوع'),
            ('failed', 'فشل الدفع'),
            ('refunded', 'مسترد'),
        ],
        default='pending',
        verbose_name="حالة الدفع"
    )
    payment_reference = models.CharField(max_length=100, blank=True, verbose_name="مرجع الدفع")
    reference = models.CharField(max_length=255, unique=True, blank=True, default='', verbose_name="مرجع الحجز", help_text="مرجع فريد للحجز")
    payment_date = models.DateTimeField(null=True, blank=True, verbose_name="تاريخ الدفع")
    refund_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0, verbose_name="مبلغ الاسترداد")
    refund_date = models.DateTimeField(null=True, blank=True, verbose_name="تاريخ الاسترداد")
    

    class Meta:
        verbose_name = "حجز"
        verbose_name_plural = "الحجوزات"
        ordering = ['-booking_date', '-booking_time']

    def __str__(self):
        return f"{self.customer.name} - {self.service.name} - {self.booking_date}"

    def generate_reference(self):
        """Generate a unique reference for the booking"""
        if not self.reference:
            # Generate a unique reference: BK + timestamp + random string
            timestamp = timezone.now().strftime('%Y%m%d%H%M%S')
            random_str = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
            self.reference = f"BK{timestamp}{random_str}"
        return self.reference

    def save(self, *args, **kwargs):
        # Generate reference if not exists
        if not self.reference:
            self.generate_reference()
        
        # Calculate final price with discount
        if self.coupon and self.coupon.is_valid():
            if self.coupon.discount_type == 'percentage':
                discount = (self.price * self.coupon.discount_value) / 100
                if self.coupon.maximum_discount:
                    discount = min(discount, self.coupon.maximum_discount)
            else:  # fixed amount
                discount = self.coupon.discount_value
            
            self.discount_amount = min(discount, self.price)
        else:
            self.discount_amount = 0
        
        self.final_price = self.price - self.discount_amount
        super().save(*args, **kwargs)


class BookingRescheduleHistory(models.Model):
    """تتبع تاريخ إعادة جدولة الحجوزات"""
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='reschedule_history', verbose_name="الحجز")
    old_date = models.DateField(verbose_name="التاريخ السابق")
    old_time = models.TimeField(verbose_name="الوقت السابق")
    new_date = models.DateField(verbose_name="التاريخ الجديد")
    new_time = models.TimeField(verbose_name="الوقت الجديد")
    reason = models.TextField(blank=True, verbose_name="سبب إعادة الجدولة")
    rescheduled_by = models.CharField(max_length=100, verbose_name="أعيدت الجدولة بواسطة")  # 'customer' or 'admin'
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاريخ إعادة الجدولة")

    class Meta:
        verbose_name = "تاريخ إعادة الجدولة"
        verbose_name_plural = "تاريخ إعادة الجدولة"
        ordering = ['-created_at']

    def __str__(self):
        return f"إعادة جدولة {self.booking.id} - {self.old_date} إلى {self.new_date}"


class PaymentHistory(models.Model):
    """تتبع تاريخ المدفوعات"""
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='payment_history', verbose_name="الحجز")
    amount = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="المبلغ")
    payment_method = models.CharField(max_length=20, verbose_name="طريقة الدفع")
    payment_reference = models.CharField(max_length=100, blank=True, verbose_name="مرجع الدفع")
    status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'في الانتظار'),
            ('success', 'نجح'),
            ('failed', 'فشل'),
            ('refunded', 'مسترد'),
        ],
        default='pending',
        verbose_name="حالة الدفع"
    )
    transaction_id = models.CharField(max_length=100, blank=True, verbose_name="رقم المعاملة")
    gateway_response = models.TextField(blank=True, verbose_name="استجابة البوابة")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاريخ الدفع")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="تاريخ التحديث")

    class Meta:
        verbose_name = "تاريخ الدفع"
        verbose_name_plural = "تاريخ المدفوعات"
        ordering = ['-created_at']

    def __str__(self):
        return f"دفع {self.booking.id} - {self.amount} ريال - {self.get_status_display()}"


class HeroImage(models.Model):
    """Hero section images for the website"""
    title = models.CharField(max_length=200, verbose_name="العنوان")
    title_en = models.CharField(max_length=200, verbose_name="العنوان بالإنجليزية")
    description = models.TextField(blank=True, verbose_name="الوصف")
    description_en = models.TextField(blank=True, verbose_name="الوصف بالإنجليزية")
    image = models.ImageField(upload_to='hero/', verbose_name="الصورة")
    link_url = models.URLField(blank=True, verbose_name="رابط")
    is_active = models.BooleanField(default=True, verbose_name="نشطة")
    order = models.PositiveIntegerField(default=0, verbose_name="ترتيب العرض")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "صورة رئيسية"
        verbose_name_plural = "الصور الرئيسية"
        ordering = ['order', '-created_at']

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        
        # Resize image if it's too large
        if self.image:
            img = Image.open(self.image.path)
            if img.height > 800 or img.width > 1200:
                output_size = (1200, 800)
                img.thumbnail(output_size)
                img.save(self.image.path)


# Days of week choices
DAYS_OF_WEEK = (
    (0, _('Sunday')),
    (1, _('Monday')),
    (2, _('Tuesday')),
    (3, _('Wednesday')),
    (4, _('Thursday')),
    (5, _('Friday')),
    (6, _('Saturday')),
)


class Config(models.Model):
    """
    System-wide configuration settings for the salon.
    There can only be one Config object in the database.
    """
    slot_duration = models.PositiveIntegerField(
        null=True,
        verbose_name=_("Slot Duration (minutes)"),
        help_text=_("Minimum time for an appointment in minutes, recommended 30."),
    )
    lead_time = models.TimeField(
        null=True,
        verbose_name=_("Lead Time"),
        help_text=_("Time when the salon starts working."),
    )
    finish_time = models.TimeField(
        null=True,
        verbose_name=_("Finish Time"),
        help_text=_("Time when the salon stops working."),
    )
    appointment_buffer_time = models.FloatField(
        null=True,
        verbose_name=_("Appointment Buffer Time (minutes)"),
        help_text=_("Time between now and the first available slot for the current day."),
    )
    website_name = models.CharField(
        max_length=255,
        default="صالون Glammy",
        verbose_name=_("Website Name"),
        help_text=_("Name of your salon website."),
    )
    default_reschedule_limit = models.PositiveIntegerField(
        default=3,
        verbose_name=_("Default Reschedule Limit"),
        help_text=_("Default maximum number of times an appointment can be rescheduled.")
    )
    allow_staff_change_on_reschedule = models.BooleanField(
        default=True,
        verbose_name=_("Allow Staff Change on Reschedule"),
        help_text=_("Allows clients to change the staff member when rescheduling.")
    )
    
    # meta data
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("Updated At"))

    class Meta:
        verbose_name = _("Configuration")
        verbose_name_plural = _("Configurations")
        ordering = ['-created_at']

    def clean(self):
        if Config.objects.exists() and not self.pk:
            raise ValidationError(_("You can only create one Config object"))
        if self.lead_time is not None and self.finish_time is not None:
            if self.lead_time >= self.finish_time:
                raise ValidationError(_("Lead time must be before finish time"))
        if self.appointment_buffer_time is not None and self.appointment_buffer_time < 0:
            raise ValidationError(_("Appointment buffer time cannot be negative"))
        if self.slot_duration is not None and self.slot_duration <= 0:
            raise ValidationError(_("Slot duration must be greater than 0"))

    def save(self, *args, **kwargs):
        self.clean()
        self.pk = 1
        super(Config, self).save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        pass

    @classmethod
    def get_instance(cls):
        obj, created = cls.objects.get_or_create(pk=1)
        return obj

    def __str__(self):
        return f"Salon Configuration - {self.website_name}"


class WorkingHours(models.Model):
    """Staff working hours for each day of the week"""
    staff = models.ForeignKey(Staff, on_delete=models.CASCADE, verbose_name=_("Staff Member"))
    day_of_week = models.PositiveIntegerField(choices=DAYS_OF_WEEK, verbose_name=_("Day of Week"))
    start_time = models.TimeField(verbose_name=_("Start Time"))
    end_time = models.TimeField(verbose_name=_("End Time"))
    
    # meta data
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("Updated At"))

    class Meta:
        verbose_name = _("Working Hour")
        verbose_name_plural = _("Working Hours")
        ordering = ['day_of_week', 'start_time']
        unique_together = ['staff', 'day_of_week']
        constraints = [
            models.CheckConstraint(
                check=models.Q(start_time__lt=models.F('end_time')),
                name='start_time_before_end_time'
            )
        ]

    def __str__(self):
        return f"{self.staff.name} - {self.get_day_of_week_display()} - {self.start_time} to {self.end_time}"

    def clean(self):
        if self.start_time >= self.end_time:
            raise ValidationError(_("Start time must be before end time"))

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Update staff weekend working status
        if self.day_of_week == 6:  # Saturday
            self.staff.work_on_saturday = True
        elif self.day_of_week == 0:  # Sunday
            self.staff.work_on_sunday = True
        self.staff.save()


class DayOff(models.Model):
    """Staff days off and vacation time"""
    staff = models.ForeignKey(Staff, on_delete=models.CASCADE, verbose_name=_("Staff Member"))
    start_date = models.DateField(verbose_name=_("Start Date"))
    end_date = models.DateField(verbose_name=_("End Date"))
    description = models.CharField(max_length=255, blank=True, null=True, verbose_name=_("Description"))
    
    # meta data
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("Updated At"))

    class Meta:
        verbose_name = _("Day Off")
        verbose_name_plural = _("Days Off")
        ordering = ['-start_date']

    def __str__(self):
        return f"{self.staff.name} - {self.start_date} to {self.end_date} - {self.description or 'Day off'}"

    def clean(self):
        if self.start_date is not None and self.end_date is not None:
            if self.start_date > self.end_date:
                raise ValidationError(_("Start date must be before end date"))


class AppointmentRequest(models.Model):
    """Appointment requests before confirmation"""
    PAYMENT_TYPES = (
        ('full', _('Full payment')),
        ('down', _('Down payment')),
    )
    
    date = models.DateField(verbose_name=_("Date"), help_text=_("The date of the appointment request."))
    start_time = models.TimeField(
        verbose_name=_("Start Time"),
        help_text=_("The start time of the appointment request.")
    )
    end_time = models.TimeField(
        verbose_name=_("End Time"),
        help_text=_("The end time of the appointment request.")
    )
    service = models.ForeignKey(Service, on_delete=models.CASCADE, verbose_name=_("Service"))
    staff = models.ForeignKey(Staff, on_delete=models.SET_NULL, null=True, verbose_name=_("Staff Member"))
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE  , null = True , blank = True)
    payment_type = models.CharField(
        max_length=4,
        choices=PAYMENT_TYPES,
        default='full',
        verbose_name=_("Payment Type")
    )
    id_request = models.CharField(max_length=100, blank=True, null=True, verbose_name=_("Request ID"))
    reschedule_attempts = models.PositiveIntegerField(
        default=0,
        verbose_name=_("Reschedule Attempts"),
        help_text=_("Number of times this appointment has been rescheduled.")
    )
    
    # meta data
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("Updated At"))

    class Meta:
        verbose_name = _("Appointment Request")
        verbose_name_plural = _("Appointment Requests")
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['date', 'start_time']),
            models.Index(fields=['staff', 'date']),
        ]

    def __str__(self):
        return f"{self.date} - {self.start_time} to {self.end_time} - {self.service.name}"

    def clean(self):
        if self.start_time is not None and self.end_time is not None:
            if self.start_time > self.end_time:
                raise ValidationError(_("Start time must be before end time"))
            if self.start_time == self.end_time:
                raise ValidationError(_("Start time and end time cannot be the same"))

        # Ensure the date is not in the past
        if self.date and self.date < timezone.now().date():
            raise ValidationError(_("Date cannot be in the past"))

    def save(self, *args, **kwargs):
        # Generate request ID if not provided
        if self.id_request is None:
            self.id_request = f"{timezone.now().timestamp()}{self.service.id}{random.randint(1000, 9999)}"
        super().save(*args, **kwargs)


class AppointmentRescheduleHistory(models.Model):
    """Track appointment reschedule history"""
    appointment_request = models.ForeignKey(
        'AppointmentRequest',
        on_delete=models.CASCADE, 
        related_name='reschedule_histories',
        verbose_name=_("Appointment Request")
    )
    date = models.DateField(
        verbose_name=_("Date"),
        help_text=_("The previous date of the appointment before it was rescheduled.")
    )
    start_time = models.TimeField(
        verbose_name=_("Start Time"),
        help_text=_("The previous start time of the appointment before it was rescheduled.")
    )
    end_time = models.TimeField(
        verbose_name=_("End Time"),
        help_text=_("The previous end time of the appointment before it was rescheduled.")
    )
    staff = models.ForeignKey(
        Staff, on_delete=models.SET_NULL, null=True,
        verbose_name=_("Staff Member"),
        help_text=_("The previous staff member of the appointment before it was rescheduled.")
    )
    reason_for_rescheduling = models.TextField(
        blank=True, null=True,
        verbose_name=_("Reason for Rescheduling"),
        help_text=_("Reason for the appointment reschedule.")
    )
    reschedule_status = models.CharField(
        max_length=10,
        choices=[('pending', _('Pending')), ('confirmed', _('Confirmed'))],
        default='pending',
        verbose_name=_("Reschedule Status")
    )
    id_request = models.CharField(max_length=100, blank=True, null=True, verbose_name=_("Request ID"))
    
    # meta data
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("Updated At"))

    class Meta:
        verbose_name = _("Appointment Reschedule History")
        verbose_name_plural = _("Appointment Reschedule Histories")
        ordering = ['-created_at']

    def __str__(self):
        return f"Reschedule history for {self.appointment_request} from {self.date}"


class ServiceCategory(models.Model):
    """Service categories for the services page"""
    name = models.CharField(max_length=100, verbose_name="اسم الفئة")
    icon = models.CharField(max_length=50, blank=True, verbose_name="أيقونة", 
                           help_text="اسم أيقونة FontAwesome أو emoji")
    order = models.PositiveIntegerField(default=0, verbose_name="ترتيب العرض")
    is_active = models.BooleanField(default=True, verbose_name="نشطة")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "فئة الخدمات"
        verbose_name_plural = "فئات الخدمات"
        ordering = ['order', 'name']

    def __str__(self):
        return self.name


class ServiceItem(models.Model):
    """Individual service items within categories"""
    title = models.CharField(max_length=200, verbose_name="عنوان الخدمة")
    category = models.ForeignKey(ServiceCategory, on_delete=models.CASCADE, related_name='items', verbose_name="الفئة")
    order = models.PositiveIntegerField(default=0, verbose_name="ترتيب العرض")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "عنصر الخدمة"
        verbose_name_plural = "عناصر الخدمات"
        ordering = ['category', 'order', 'title']

    def __str__(self):
        return f"{self.category.name} - {self.title}"


class Testimonial(models.Model):
    """Customer testimonials and reviews"""
    
    RATING_CHOICES = [
        (1, '⭐'),
        (2, '⭐⭐'),
        (3, '⭐⭐⭐'),
        (4, '⭐⭐⭐⭐'),
        (5, '⭐⭐⭐⭐⭐'),
    ]
    
    customer_name = models.CharField(max_length=100, verbose_name="اسم العميل")
    customer_name_en = models.CharField(max_length=100, blank=True, verbose_name="اسم العميل بالإنجليزية")
    testimonial_text = models.TextField(verbose_name="نص الشهادة")
    testimonial_text_en = models.TextField(blank=True, verbose_name="نص الشهادة بالإنجليزية")
    rating = models.IntegerField(choices=RATING_CHOICES, default=5, verbose_name="التقييم")
    customer_image = models.ImageField(upload_to='testimonials/', blank=True, null=True, verbose_name="صورة العميل")
    service_used = models.CharField(max_length=200, blank=True, verbose_name="الخدمة المستخدمة")
    is_featured = models.BooleanField(default=False, verbose_name="مميز")
    is_active = models.BooleanField(default=True, verbose_name="نشط")
    order = models.PositiveIntegerField(default=0, verbose_name="ترتيب العرض")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "شهادة عميل"
        verbose_name_plural = "شهادات العملاء"
        ordering = ['order', '-created_at']

    def __str__(self):
        return f"{self.customer_name} - {self.rating}⭐"

    def get_rating_display(self):
        return '⭐' * self.rating


class Offer(models.Model):
    """Special offers and promotions for the salon"""
    
    OFFER_TYPES = [
        ('percentage', 'نسبة مئوية'),
        ('fixed', 'مبلغ ثابت'),
        ('package', 'بكج'),
        ('free_service', 'خدمة مجانية'),
    ]
    
    title = models.CharField(max_length=200, verbose_name="عنوان العرض")
    title_en = models.CharField(max_length=200, blank=True, verbose_name="عنوان العرض بالإنجليزية")
    description = models.TextField(verbose_name="وصف العرض")
    description_en = models.TextField(blank=True, verbose_name="وصف العرض بالإنجليزية")
    short_description = models.CharField(max_length=300, verbose_name="وصف مختصر")
    short_description_en = models.CharField(max_length=300, blank=True, verbose_name="وصف مختصر بالإنجليزية")
    
    # Offer details
    offer_type = models.CharField(max_length=20, choices=OFFER_TYPES, default='percentage', verbose_name="نوع العرض")
    discount_value = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, verbose_name="قيمة الخصم")
    original_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, verbose_name="السعر الأصلي")
    offer_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, verbose_name="سعر العرض")
    
    # Media
    image = models.ImageField(upload_to='offers/', verbose_name="صورة العرض")
    thumbnail = models.ImageField(upload_to='offers/thumbnails/', blank=True, null=True, verbose_name="صورة مصغرة")
    
    # Validity
    valid_from = models.DateTimeField(verbose_name="صالح من")
    valid_until = models.DateTimeField(verbose_name="صالح حتى")
    
    # Status and visibility
    is_active = models.BooleanField(default=True, verbose_name="نشط")
    is_featured = models.BooleanField(default=False, verbose_name="مميز")
    is_new = models.BooleanField(default=False, verbose_name="جديد")
    
    # Related services
    services = models.ManyToManyField(Service, blank=True, verbose_name="الخدمات المشمولة")
    categories = models.ManyToManyField(Category, blank=True, verbose_name="الفئات المشمولة")
    
    # Terms and conditions
    terms_conditions = models.TextField(blank=True, verbose_name="الشروط والأحكام")
    terms_conditions_en = models.TextField(blank=True, verbose_name="الشروط والأحكام بالإنجليزية")
    
    # Usage limits
    usage_limit = models.PositiveIntegerField(null=True, blank=True, verbose_name="حد الاستخدام")
    used_count = models.PositiveIntegerField(default=0, verbose_name="عدد مرات الاستخدام")
    
    # Display order
    order = models.PositiveIntegerField(default=0, verbose_name="ترتيب العرض")
    
    # Custom styling
    card_color = models.CharField(max_length=7, default='#B89F67', verbose_name="لون البطاقة", help_text="أدخل لون البطاقة بصيغة HEX (مثل: #B89F67)")
    text_color = models.CharField(max_length=7, default='#8B4513', verbose_name="لون النص", help_text="أدخل لون النص بصيغة HEX (مثل: #8B4513)")
    
    # Meta
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "عرض"
        verbose_name_plural = "العروض"
        ordering = ['order', '-is_featured', '-created_at']

    def __str__(self):
        return self.title

    def is_valid(self):
        """Check if the offer is currently valid"""
        from django.utils import timezone
        now = timezone.now()
        return (self.is_active and 
                self.valid_from <= now <= self.valid_until and
                (self.usage_limit is None or self.used_count < self.usage_limit))

    def get_discount_display(self):
        """Get formatted discount display"""
        if self.offer_type == 'percentage' and self.discount_value:
            return f"{self.discount_value}%"
        elif self.offer_type == 'fixed' and self.discount_value:
            return f"{self.discount_value} ريال"
        elif self.offer_type == 'package':
            return "بكج خاص"
        elif self.offer_type == 'free_service':
            return "خدمة مجانية"
        return "عرض خاص"

    def get_savings_amount(self):
        """Calculate savings amount"""
        if self.original_price and self.offer_price:
            return self.original_price - self.offer_price
        return None

    def get_savings_percentage(self):
        """Calculate savings percentage"""
        if self.original_price and self.offer_price:
            savings = self.original_price - self.offer_price
            return round((savings / self.original_price) * 100, 1)
        return None

    def save(self, *args, **kwargs):
        # Auto-generate thumbnail if not provided
        if self.image and not self.thumbnail:
            # This would typically be handled by a signal or image processing
            pass
        super().save(*args, **kwargs)


class ContactInfo(models.Model):
    """Contact information for the salon"""
    
    phone_number = models.CharField(max_length=20, verbose_name="رقم الهاتف", default="+966 55 123 4567")
    phone_number_en = models.CharField(max_length=20, blank=True, verbose_name="رقم الهاتف بالإنجليزية")
    location = models.CharField(max_length=200, verbose_name="الموقع", default="الرياض، المملكة العربية السعودية")
    location_en = models.CharField(max_length=200, blank=True, verbose_name="الموقع بالإنجليزية")
    working_hours = models.CharField(max_length=100, verbose_name="ساعات العمل", default="الأحد - الخميس: 10ص - 8م")
    working_hours_en = models.CharField(max_length=100, blank=True, verbose_name="ساعات العمل بالإنجليزية")
    is_active = models.BooleanField(default=True, verbose_name="نشط")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "معلومات الاتصال"
        verbose_name_plural = "معلومات الاتصال"
        ordering = ['-created_at']

    def __str__(self):
        return f"معلومات الاتصال - {self.phone_number}"

    def save(self, *args, **kwargs):
        # Ensure only one active contact info record
        if self.is_active:
            ContactInfo.objects.filter(is_active=True).update(is_active=False)
        super().save(*args, **kwargs)


class Contact(models.Model):
    """Contact form submissions"""
    
    name = models.CharField(max_length=100, verbose_name="الاسم")
    email = models.EmailField(verbose_name="البريد الإلكتروني")
    phone = models.CharField(max_length=20, blank=True, verbose_name="رقم الهاتف")
    subject = models.CharField(max_length=200, blank=True, verbose_name="موضوع الرسالة")
    message = models.TextField(verbose_name="الرسالة")
    is_read = models.BooleanField(default=False, verbose_name="تم القراءة")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاريخ الإرسال")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="تاريخ التحديث")

    class Meta:
        verbose_name = "رسالة تواصل"
        verbose_name_plural = "رسائل التواصل"
        ordering = ['-created_at']

    def __str__(self):
        return f"رسالة من {self.name} - {self.subject or 'بدون موضوع'}"

    def mark_as_read(self):
        """Mark the contact message as read"""
        self.is_read = True
        self.save(update_fields=['is_read', 'updated_at'])


# Note: Notification model is defined below after NewsletterSubscriber


class PasswordResetToken(models.Model):
    """Password reset tokens for users"""
    
    class TokenStatus(models.TextChoices):
        ACTIVE = 'active', _('Active')
        VERIFIED = 'verified', _('Verified')
        INVALIDATED = 'invalidated', _('Invalidated')

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='password_reset_tokens',
        verbose_name=_("User"),
    )
    token = models.UUIDField(default=uuid.uuid4, editable=False, unique=True, verbose_name=_("Token"))
    expires_at = models.DateTimeField(verbose_name=_("Expires At"))
    status = models.CharField(
        max_length=11,
        choices=TokenStatus.choices,
        default=TokenStatus.ACTIVE,
        verbose_name=_("Status"),
    )
    
    # meta data
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Created At"))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("Updated At"))

    class Meta:
        verbose_name = _("Password Reset Token")
        verbose_name_plural = _("Password Reset Tokens")
        ordering = ['-created_at']

    def __str__(self):
        return f"Password reset token for {self.user} [{self.token} status: {self.status} expires at {self.expires_at}]"

    @property
    def is_expired(self):
        """Checks if the token has expired."""
        return timezone.now() >= self.expires_at

    @property
    def is_verified(self):
        """Checks if the token has been verified."""
        return self.status == self.TokenStatus.VERIFIED

    @property
    def is_active(self):
        """Checks if the token is still active."""
        return self.status == self.TokenStatus.ACTIVE

    @classmethod
    def create_token(cls, user, expiration_minutes=60):
        """Generates a new token for the user with a specified expiration time."""
        cls.objects.filter(user=user, expires_at__gte=timezone.now(), status=cls.TokenStatus.ACTIVE).update(
            status=cls.TokenStatus.INVALIDATED)
        expires_at = timezone.now() + timezone.timedelta(minutes=expiration_minutes)
        token = cls.objects.create(user=user, expires_at=expires_at, status=cls.TokenStatus.ACTIVE)
        return token

    def mark_as_verified(self):
        """Marks the token as verified."""
        self.status = self.TokenStatus.VERIFIED
        self.save(update_fields=['status'])

    @classmethod
    def verify_token(cls, user, token):
        """Verifies if the provided token is valid and belongs to the given user."""
        try:
            return cls.objects.get(user=user, token=token, expires_at__gte=timezone.now(),
                                   status=cls.TokenStatus.ACTIVE)
        except cls.DoesNotExist:
            return None


# Blog Models
class BlogAuthor(models.Model):
    """Blog authors/contributors"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, verbose_name="المستخدم")
    bio = models.TextField(blank=True, verbose_name="نبذة شخصية")
    bio_en = models.TextField(blank=True, verbose_name="نبذة شخصية بالإنجليزية")
    profile_image = models.ImageField(upload_to='blog/authors/', blank=True, null=True, verbose_name="صورة الملف الشخصي")
    social_instagram = models.URLField(blank=True, verbose_name="إنستغرام")
    social_facebook = models.URLField(blank=True, verbose_name="فيسبوك")
    social_twitter = models.URLField(blank=True, verbose_name="تويتر")
    is_active = models.BooleanField(default=True, verbose_name="نشط")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "كاتب المدونة"
        verbose_name_plural = "كتاب المدونة"
        ordering = ['user__first_name', 'user__last_name']

    def __str__(self):
        return f"{self.user.get_full_name() or self.user.username}"

    @property
    def full_name(self):
        return self.user.get_full_name() or self.user.username

    @property
    def email(self):
        return self.user.email


class BlogCategory(models.Model):
    """Blog post categories"""
    name = models.CharField(max_length=100, verbose_name="اسم الفئة")
    name_en = models.CharField(max_length=100, verbose_name="اسم الفئة بالإنجليزية")
    description = models.TextField(blank=True, verbose_name="وصف الفئة")
    description_en = models.TextField(blank=True, verbose_name="وصف الفئة بالإنجليزية")
    color = models.CharField(max_length=7, default='#B89F67', verbose_name="اللون", help_text="لون الفئة (مثل #B89F67)")
    icon = models.CharField(max_length=50, blank=True, verbose_name="أيقونة")
    is_active = models.BooleanField(default=True, verbose_name="نشطة")
    order = models.PositiveIntegerField(default=0, verbose_name="ترتيب العرض")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "فئة المدونة"
        verbose_name_plural = "فئات المدونة"
        ordering = ['order', 'name']

    def __str__(self):
        return self.name


class BlogPost(models.Model):
    """Blog posts"""
    STATUS_CHOICES = [
        ('draft', 'مسودة'),
        ('published', 'منشور'),
        ('archived', 'مؤرشف'),
    ]

    title = models.CharField(max_length=200, verbose_name="العنوان")
    title_en = models.CharField(max_length=200, blank=True, verbose_name="العنوان بالإنجليزية")
    slug = models.SlugField(max_length=200, unique=True, verbose_name="الرابط")
    excerpt = models.TextField(verbose_name="الملخص")
    excerpt_en = models.TextField(blank=True, verbose_name="الملخص بالإنجليزية")
    content = models.TextField(verbose_name="المحتوى")
    content_en = models.TextField(blank=True, verbose_name="المحتوى بالإنجليزية")
    
    author = models.ForeignKey(BlogAuthor, on_delete=models.CASCADE, related_name='posts', verbose_name="الكاتب")
    category = models.ForeignKey(BlogCategory, on_delete=models.CASCADE, related_name='posts', verbose_name="الفئة")
    
    featured_image = models.ImageField(upload_to='blog/posts/', verbose_name="الصورة المميزة")
    featured_image_alt = models.CharField(max_length=200, blank=True, verbose_name="نص بديل للصورة")
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft', verbose_name="الحالة")
    is_featured = models.BooleanField(default=False, verbose_name="مميز")
    is_trending = models.BooleanField(default=False, verbose_name="رائج")
    
    read_time = models.PositiveIntegerField(default=5, verbose_name="وقت القراءة (بالدقائق)")
    views = models.PositiveIntegerField(default=0, verbose_name="عدد المشاهدات")
    likes = models.PositiveIntegerField(default=0, verbose_name="عدد الإعجابات")
    comments_count = models.PositiveIntegerField(default=0, verbose_name="عدد التعليقات")
    
    tags = models.CharField(max_length=500, blank=True, verbose_name="العلامات", help_text="افصل بين العلامات بفاصلة")
    meta_description = models.CharField(max_length=160, blank=True, verbose_name="وصف SEO")
    meta_keywords = models.CharField(max_length=500, blank=True, verbose_name="كلمات مفتاحية SEO")
    
    published_at = models.DateTimeField(null=True, blank=True, verbose_name="تاريخ النشر")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "مقال المدونة"
        verbose_name_plural = "مقالات المدونة"
        ordering = ['-published_at', '-created_at']

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if self.status == 'published' and not self.published_at:
            self.published_at = timezone.now()
        super().save(*args, **kwargs)

    @property
    def tags_list(self):
        """Return tags as a list"""
        if self.tags:
            return [tag.strip() for tag in self.tags.split(',') if tag.strip()]
        return []

    @property
    def formatted_read_time(self):
        """Return formatted read time"""
        return f"{self.read_time} دقائق"

    @property
    def formatted_views(self):
        """Return formatted views count"""
        if self.views >= 1000:
            return f"{self.views / 1000:.1f}K"
        return str(self.views)

    @property
    def formatted_likes(self):
        """Return formatted likes count"""
        if self.likes >= 1000:
            return f"{self.likes / 1000:.1f}K"
        return str(self.likes)

    def increment_views(self):
        """Increment view count"""
        self.views += 1
        self.save(update_fields=['views'])


class BlogComment(models.Model):
    """Blog post comments"""
    post = models.ForeignKey(BlogPost, on_delete=models.CASCADE, related_name='comments', verbose_name="المقال")
    name = models.CharField(max_length=100, verbose_name="الاسم")
    email = models.EmailField(verbose_name="البريد الإلكتروني")
    content = models.TextField(verbose_name="التعليق")
    is_approved = models.BooleanField(default=False, verbose_name="موافق عليه")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "تعليق المدونة"
        verbose_name_plural = "تعليقات المدونة"
        ordering = ['-created_at']

    def __str__(self):
        return f"تعليق من {self.name} على {self.post.title}"


class NewsletterSubscriber(models.Model):
    """Newsletter subscribers"""
    email = models.EmailField(unique=True, verbose_name="البريد الإلكتروني")
    name = models.CharField(max_length=100, blank=True, verbose_name="الاسم")
    is_active = models.BooleanField(default=True, verbose_name="نشط")
    subscribed_at = models.DateTimeField(auto_now_add=True)
    unsubscribed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = "مشترك النشرة الإخبارية"
        verbose_name_plural = "مشتركو النشرة الإخبارية"
        ordering = ['-subscribed_at']

    def __str__(self):
        return self.email


class Notification(models.Model):
    """In-app notification system"""
    NOTIFICATION_TYPES = [
        ('booking_created', 'حجز جديد'),
        ('booking_confirmed', 'تأكيد الحجز'),
        ('booking_cancelled', 'إلغاء الحجز'),
        ('booking_rescheduled', 'إعادة جدولة الحجز'),
        ('payment_received', 'استلام الدفع'),
        ('reminder', 'تذكير بالموعد'),
        ('system', 'إشعار نظام'),
    ]
    
    PRIORITY_LEVELS = [
        ('low', 'منخفض'),
        ('medium', 'متوسط'),
        ('high', 'عالي'),
        ('urgent', 'عاجل'),
    ]
    
    # Notification details
    title = models.CharField(max_length=200, verbose_name="عنوان الإشعار")
    message = models.TextField(verbose_name="رسالة الإشعار")
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES, verbose_name="نوع الإشعار")
    priority = models.CharField(max_length=10, choices=PRIORITY_LEVELS, default='medium', verbose_name="الأولوية")
    
    # Related objects
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, null=True, blank=True, related_name='notifications', verbose_name="الحجز")
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE  , null = True , blank = True)
    staff = models.ForeignKey(Staff, on_delete=models.CASCADE, null=True, blank=True, related_name='notifications', verbose_name="الموظف")
    
    # Notification status
    is_read = models.BooleanField(default=False, verbose_name="مقروء")
    is_sent = models.BooleanField(default=False, verbose_name="مرسل")
    sent_at = models.DateTimeField(null=True, blank=True, verbose_name="تاريخ الإرسال")
    
    # Additional data
    action_url = models.URLField(blank=True, verbose_name="رابط الإجراء")
    metadata = models.JSONField(default=dict, blank=True, verbose_name="بيانات إضافية")
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاريخ الإنشاء")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="تاريخ التحديث")

    class Meta:
        verbose_name = "إشعار"
        verbose_name_plural = "الإشعارات"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['is_read', 'created_at']),
            models.Index(fields=['notification_type', 'created_at']),
            models.Index(fields=['customer', 'is_read']),
            models.Index(fields=['staff', 'is_read']),
        ]

    def __str__(self):
        return f"{self.get_notification_type_display()} - {self.title}"

    def mark_as_read(self):
        """Mark notification as read"""
        self.is_read = True
        self.save(update_fields=['is_read', 'updated_at'])

    def mark_as_sent(self):
        """Mark notification as sent"""
        self.is_sent = True
        self.sent_at = timezone.now()
        self.save(update_fields=['is_sent', 'sent_at', 'updated_at'])

    @classmethod
    def create_booking_notification(cls, booking, notification_type, title, message, priority='medium', staff=None):
        """Create a booking-related notification"""
        return cls.objects.create(
            title=title,
            message=message,
            notification_type=notification_type,
            priority=priority,
            booking=booking,
            customer=booking.customer,
            staff=staff or booking.staff,
            metadata={
                'booking_id': booking.id,
                'booking_date': booking.booking_date.isoformat(),
                'booking_time': booking.booking_time.isoformat(),
                'service_name': booking.service.name,
                'customer_name': booking.customer.name,
            }
        )

    @classmethod
    def get_unread_count(cls, user_type='admin'):
        """Get count of unread notifications"""
        if user_type == 'admin':
            return cls.objects.filter(is_read=False).count()
        return 0

    @classmethod
    def get_recent_notifications(cls, limit=10, user_type='admin'):
        """Get recent notifications"""
        if user_type == 'admin':
            return cls.objects.all()[:limit]
        return cls.objects.none()


class NotificationSettings(models.Model):
    """Notification preferences for users"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='notification_settings', verbose_name="المستخدم")
    
    # Email notification preferences
    email_booking_created = models.BooleanField(default=True, verbose_name="إشعارات البريد الإلكتروني للحجوزات الجديدة")
    email_booking_confirmed = models.BooleanField(default=True, verbose_name="إشعارات البريد الإلكتروني لتأكيد الحجوزات")
    email_booking_cancelled = models.BooleanField(default=True, verbose_name="إشعارات البريد الإلكتروني لإلغاء الحجوزات")
    email_booking_rescheduled = models.BooleanField(default=True, verbose_name="إشعارات البريد الإلكتروني لإعادة جدولة الحجوزات")
    email_payment_received = models.BooleanField(default=True, verbose_name="إشعارات البريد الإلكتروني لاستلام المدفوعات")
    email_reminders = models.BooleanField(default=True, verbose_name="إشعارات البريد الإلكتروني للتذكيرات")
    
    # In-app notification preferences
    in_app_notifications = models.BooleanField(default=True, verbose_name="الإشعارات داخل التطبيق")
    push_notifications = models.BooleanField(default=True, verbose_name="الإشعارات الفورية")
    
    # Timing preferences
    reminder_hours_before = models.PositiveIntegerField(default=24, verbose_name="ساعات التذكير قبل الموعد")
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاريخ الإنشاء")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="تاريخ التحديث")

    class Meta:
        verbose_name = "إعدادات الإشعارات"
        verbose_name_plural = "إعدادات الإشعارات"
        ordering = ['-created_at']

    def __str__(self):
        return f"إعدادات الإشعارات - {self.user.username}"

    @classmethod
    def get_or_create_for_user(cls, user):
        """Get or create notification settings for a user"""
        settings, created = cls.objects.get_or_create(user=user)
        return settings


class AdminSlotAvailability(models.Model):
    """
    Admin-controlled availability slots for booking system.
    The admin sets which dates and times are available for each service.
    """
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name='admin_slots', verbose_name="الخدمة")
    date = models.DateField(verbose_name="التاريخ")
    time = models.TimeField(verbose_name="الوقت")
    is_available = models.BooleanField(default=True, verbose_name="متاح")
    max_bookings = models.PositiveIntegerField(default=1, verbose_name="الحد الأقصى للحجوزات", help_text="عدد الحجوزات المسموح بها في هذا الوقت")
    current_bookings = models.PositiveIntegerField(default=0, verbose_name="الحجوزات الحالية")
    staff = models.ForeignKey(Staff, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="الموظف المخصص")
    notes = models.TextField(blank=True, verbose_name="ملاحظات")
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاريخ الإنشاء")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="تاريخ التحديث")
    
    class Meta:
        verbose_name = "إدارة المواعيد المتاحة"
        verbose_name_plural = "إدارة المواعيد المتاحة"
        ordering = ['date', 'time']
        unique_together = ['service', 'date', 'time']
    
    def __str__(self):
        return f"{self.service.name} - {self.date} {self.time}"
    
    def is_slot_available(self):
        """Check if the slot is available for booking"""
        return self.is_available and self.current_bookings < self.max_bookings





from django.db import models
from django.utils import timezone
from datetime import timedelta

class PhoneOTP(models.Model):
    phone_number = models.CharField(max_length=20)
    otp_code = models.CharField(max_length=6)
    is_used = models.BooleanField(default=False)
    attempts = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(blank=True, null=True)

    def save(self, *args, **kwargs):
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(minutes=5)
        super().save(*args, **kwargs)

    def is_expired(self):
        return timezone.now() > self.expires_at
