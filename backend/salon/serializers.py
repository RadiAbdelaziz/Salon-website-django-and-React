from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth import get_user_model
from rest_framework.validators import UniqueValidator
from .models import CustomerOTP, Customer
from .views.utility_views import generate_otp
from .views.services import send_whatsapp_message
from .models import (
    Category, Service, Staff, Customer, Address, Coupon, Booking, HeroImage,
    Config, WorkingHours, DayOff, AppointmentRequest, AppointmentRescheduleHistory, PasswordResetToken,
    BlogAuthor, BlogCategory, BlogPost, BlogComment, NewsletterSubscriber,
    Notification, NotificationSettings, AdminSlotAvailability
)


class CategorySerializer(serializers.ModelSerializer):
    services_count = serializers.SerializerMethodField()
    services = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'name_en', 'slug_en', 'description', 'description_en', 
                 'icon', 'image', 'primary_color', 'is_active', 'order', 'services_count', 'services']
    
    def get_services_count(self, obj):
        return obj.services.filter(is_active=True).count()
    
    def get_services(self, obj):
        """Get services for this category"""
        services = self.context.get('services', obj.services.filter(is_active=True))
        if services:
            return ServiceSerializer(services, many=True, context=self.context).data
        return []


class ServiceSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(read_only=True)
    category = serializers.SerializerMethodField()
    category_ids = serializers.SerializerMethodField()
    price_display = serializers.CharField(read_only=True)
    
    class Meta:
        model = Service
        fields = ['id', 'category', 'category_name', 'category_ids', 'name', 'name_en', 
                 'description', 'description_en', 'duration', 'price', 
                 'price_display', 'image', 'is_active', 
                 'is_featured', 'order']
    
    def get_category(self, obj):
        """Get the first category ID for backward compatibility"""
        try:
            first_category = obj.categories.first()
            return first_category.id if first_category else None
        except Exception as e:
            print(f"Error getting category for service {obj.id}: {e}")
            return None
    
    def get_category_ids(self, obj):
        """Get all category IDs for this service"""
        try:
            return list(obj.categories.values_list('id', flat=True))
        except Exception as e:
            print(f"Error getting category IDs for service {obj.id}: {e}")
            return []


class ServiceDetailSerializer(ServiceSerializer):
    # category is already handled by the parent class as a SerializerMethodField
    
    class Meta(ServiceSerializer.Meta):
        fields = ServiceSerializer.Meta.fields + ['created_at', 'updated_at']


class StaffSerializer(serializers.ModelSerializer):
    services = ServiceSerializer(many=True, read_only=True)
    services_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Staff
        fields = ['id', 'name', 'name_en', 'specialization', 'specialization_en',
                 'bio', 'bio_en', 'image', 'rating', 'is_active', 'services', 
                 'services_count']
    
    def get_services_count(self, obj):
        return obj.services.filter(is_active=True).count()



User = get_user_model()


# (Register)
class RegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        required=True,
        validators=[UniqueValidator(queryset=User.objects.all())]
    )
    phone_number = serializers.CharField(
        required=True,
        validators=[UniqueValidator(queryset=User.objects.all())]
    )
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ['username', 'email', 'phone_number', 'password']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            phone_number=validated_data['phone_number'],
            password=validated_data['password']
        )
        # 🌀 إنشاء رمز التحقق
        otp_code = generate_otp()
        CustomerOTP.objects.create(user=user, code=otp_code)
        send_whatsapp_message(user.phone_number, otp_code)
        return user


#  التحقق من رمز OTP
class VerifyOTPSerializer(serializers.Serializer):
    phone_number = serializers.CharField(max_length=15)
    otp = serializers.CharField(max_length=6)


#  عرض المستخدمين (UserSerializer)
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
        read_only_fields = ['id']


# (CustomerSerializer)
class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = ['id', 'name', 'email', 'phone', 'date_of_birth', 'is_active']
        read_only_fields = ['id', 'is_active']


# copy one
class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = ['id', 'name', 'email', 'phone', 'date_of_birth', 'is_active']
        read_only_fields = ['id', 'is_active']


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = ['id', 'customer', 'title', 'address', 'latitude', 'longitude', 
                 'is_default']
        read_only_fields = ['id']


class CouponSerializer(serializers.ModelSerializer):
    is_valid = serializers.SerializerMethodField()
    
    class Meta:
        model = Coupon
        fields = ['id', 'code', 'name', 'description', 'discount_type', 
                 'discount_value', 'minimum_amount', 'maximum_discount',
                 'usage_limit', 'used_count', 'valid_from', 'valid_until',
                 'is_active', 'is_valid']
        read_only_fields = ['id', 'used_count', 'is_valid']
    
    def get_is_valid(self, obj):
        return obj.is_valid()


class BookingSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    service_name = serializers.CharField(source='service.name', read_only=True)
    staff_name = serializers.CharField(source='staff.name', read_only=True)
    address_title = serializers.CharField(source='address.title', read_only=True)
    coupon_code = serializers.CharField(source='coupon.code', read_only=True)
    
    class Meta:
        model = Booking
        fields = ['id', 'customer', 'customer_name', 'service', 'service_name',
                 'staff', 'staff_name', 'address', 'address_title', 
                 'booking_date', 'booking_time', 'status', 'payment_method',
                 'special_requests', 'price', 'coupon', 'coupon_code',
                 'discount_amount', 'final_price', 'created_at', 'updated_at']
        read_only_fields = ['id', 'discount_amount', 'final_price', 'created_at', 'updated_at']


class BookingCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = ['id', 'customer', 'service', 'staff', 'address', 'booking_date',
                 'booking_time', 'payment_method', 'special_requests', 'price', 'final_price', 'coupon', 'status']
        read_only_fields = ['id', 'status']
    
    def create(self, validated_data):
        # Set status to confirmed for all bookings
        validated_data['status'] = 'confirmed'
        
        # Let the model's save method handle discount calculations and reference generation
        booking = Booking.objects.create(**validated_data)
        
        # Update coupon usage count if applicable
        if booking.coupon and booking.coupon.is_valid():
            booking.coupon.used_count += 1
            booking.coupon.save()
        
        return booking


class HeroImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = HeroImage


class NotificationSerializer(serializers.ModelSerializer):
    """Serializer for notifications"""
    notification_type_display = serializers.CharField(source='get_notification_type_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    staff_name = serializers.CharField(source='staff.name', read_only=True)
    booking_service = serializers.CharField(source='booking.service.name', read_only=True)
    booking_date = serializers.DateField(source='booking.booking_date', read_only=True)
    booking_time = serializers.TimeField(source='booking.booking_time', read_only=True)
    
    class Meta:
        model = Notification
        fields = [
            'id', 'title', 'message', 'notification_type', 'notification_type_display',
            'priority', 'priority_display', 'is_read', 'is_sent', 'sent_at',
            'action_url', 'metadata', 'created_at', 'updated_at',
            'customer_name', 'staff_name', 'booking_service', 'booking_date', 'booking_time'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'sent_at']


class NotificationSettingsSerializer(serializers.ModelSerializer):
    """Serializer for notification settings"""
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = NotificationSettings
        fields = [
            'id', 'username', 'email_booking_created', 'email_booking_confirmed',
            'email_booking_cancelled', 'email_booking_rescheduled', 'email_payment_received',
            'email_reminders', 'in_app_notifications', 'push_notifications',
            'reminder_hours_before', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class HeroImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = HeroImage
        fields = ['id', 'title', 'title_en', 'description', 'description_en',
                 'image', 'link_url', 'is_active', 'order']


class CouponValidationSerializer(serializers.Serializer):
    code = serializers.CharField(max_length=50)
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    
    def validate(self, data):
        try:
            coupon = Coupon.objects.get(code=data['code'])
            if not coupon.is_valid():
                raise serializers.ValidationError("هذا الكوبون غير صالح أو منتهي الصلاحية")
            
            if data['amount'] < coupon.minimum_amount:
                raise serializers.ValidationError(f"الحد الأدنى لاستخدام هذا الكوبون هو {coupon.minimum_amount} ريال")
            
            # Calculate discount
            if coupon.discount_type == 'percentage':
                discount = (data['amount'] * coupon.discount_value) / 100
                if coupon.maximum_discount:
                    discount = min(discount, coupon.maximum_discount)
            else:  # fixed amount
                discount = coupon.discount_value
            
            discount = min(discount, data['amount'])
            
            data['coupon'] = coupon
            data['discount_amount'] = discount
            data['final_amount'] = data['amount'] - discount
            
        except Coupon.DoesNotExist:
            raise serializers.ValidationError("كود الكوبون غير صحيح")
        
        return data


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
        read_only_fields = ['id']




# New serializers for enhanced features
class ConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = Config
        fields = '__all__'


class WorkingHoursSerializer(serializers.ModelSerializer):
    staff_name = serializers.CharField(source='staff.name', read_only=True)
    
    class Meta:
        model = WorkingHours
        fields = ['id', 'staff', 'staff_name', 'day_of_week', 'start_time', 'end_time', 'created_at', 'updated_at']


class DayOffSerializer(serializers.ModelSerializer):
    staff_name = serializers.CharField(source='staff.name', read_only=True)
    
    class Meta:
        model = DayOff
        fields = ['id', 'staff', 'staff_name', 'start_date', 'end_date', 'description', 'created_at', 'updated_at']


class AppointmentRequestSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    service_name = serializers.CharField(source='service.name', read_only=True)
    staff_name = serializers.CharField(source='staff.name', read_only=True)
    customer_phone = serializers.CharField(source='customer.phone', read_only=True)
    customer_email = serializers.CharField(source='customer.email', read_only=True)
    customer_address = serializers.CharField(source='customer.addresses.first.address', read_only=True)
    
    class Meta:
        model = AppointmentRequest
        fields = ['id', 'date', 'start_time', 'end_time', 'service', 'service_name', 
                 'staff', 'staff_name', 'customer', 'customer_name', 'customer_phone', 
                 'customer_email', 'customer_address', 'payment_type', 'id_request', 
                 'reschedule_attempts', 'created_at', 'updated_at']


class AppointmentRescheduleHistorySerializer(serializers.ModelSerializer):
    appointment_request_id = serializers.CharField(source='appointment_request.id', read_only=True)
    staff_name = serializers.CharField(source='staff.name', read_only=True)
    
    class Meta:
        model = AppointmentRescheduleHistory
        fields = ['id', 'appointment_request', 'appointment_request_id', 'date', 'start_time', 
                 'end_time', 'staff', 'staff_name', 'reason_for_rescheduling', 
                 'reschedule_status', 'id_request', 'created_at', 'updated_at']


class PasswordResetTokenSerializer(serializers.ModelSerializer):
    class Meta:
        model = PasswordResetToken
        fields = ['id', 'user', 'token', 'expires_at', 'status', 'created_at', 'updated_at']
        read_only_fields = ['id', 'token', 'created_at', 'updated_at']


# Blog Serializers
class BlogAuthorSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(read_only=True)
    email = serializers.CharField(read_only=True)
    
    class Meta:
        model = BlogAuthor
        fields = ['id', 'user', 'full_name', 'email', 'bio', 'bio_en', 'profile_image', 
                 'social_instagram', 'social_facebook', 'social_twitter', 'is_active', 
                 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class BlogCategorySerializer(serializers.ModelSerializer):
    posts_count = serializers.SerializerMethodField()
    
    class Meta:
        model = BlogCategory
        fields = ['id', 'name', 'name_en', 'description', 'description_en', 
                 'color', 'icon', 'is_active', 'order', 'posts_count', 
                 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_posts_count(self, obj):
        return obj.posts.filter(status='published').count()


class BlogPostListSerializer(serializers.ModelSerializer):
    author = BlogAuthorSerializer(read_only=True)
    category = BlogCategorySerializer(read_only=True)
    tags_list = serializers.ReadOnlyField()
    formatted_read_time = serializers.ReadOnlyField()
    formatted_views = serializers.ReadOnlyField()
    formatted_likes = serializers.ReadOnlyField()
    
    class Meta:
        model = BlogPost
        fields = ['id', 'title', 'title_en', 'slug', 'excerpt', 'excerpt_en', 
                 'author', 'category', 'featured_image', 'featured_image_alt',
                 'status', 'is_featured', 'is_trending', 'read_time', 
                 'formatted_read_time', 'views', 'formatted_views', 'likes', 
                 'formatted_likes', 'comments_count', 'tags', 'tags_list',
                 'published_at', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class BlogPostDetailSerializer(BlogPostListSerializer):
    class Meta(BlogPostListSerializer.Meta):
        fields = BlogPostListSerializer.Meta.fields + ['content', 'content_en', 
                                                      'meta_description', 'meta_keywords']


class BlogCommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogComment
        fields = ['id', 'post', 'name', 'email', 'content', 'is_approved', 
                 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class BlogCommentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogComment
        fields = ['post', 'name', 'email', 'content']


class NewsletterSubscriberSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsletterSubscriber
        fields = ['id', 'email', 'name', 'is_active', 'subscribed_at', 'unsubscribed_at']
        read_only_fields = ['id', 'subscribed_at', 'unsubscribed_at']


class NewsletterSubscriberCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsletterSubscriber
        fields = ['email', 'name']


class AdminSlotAvailabilitySerializer(serializers.ModelSerializer):
    """Serializer for admin slot availability management"""
    service_name = serializers.CharField(source='service.name', read_only=True)
    staff_name = serializers.CharField(source='staff.name', read_only=True)
    is_slot_available = serializers.SerializerMethodField()
    
    class Meta:
        model = AdminSlotAvailability
        fields = [
            'id', 'service', 'service_name', 'date', 'time', 'is_available', 
            'max_bookings', 'current_bookings', 'staff', 'staff_name', 
            'notes', 'is_slot_available', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'current_bookings', 'created_at', 'updated_at']
    
    def get_is_slot_available(self, obj):
        """Check if slot is available for booking"""
        return obj.is_slot_available()
    
    def validate(self, data):
        """Validate slot availability data"""
        if data.get('max_bookings', 1) < 1:
            raise serializers.ValidationError("الحد الأقصى للحجوزات يجب أن يكون أكبر من 0")
        
        if data.get('current_bookings', 0) > data.get('max_bookings', 1):
            raise serializers.ValidationError("عدد الحجوزات الحالية لا يمكن أن يكون أكبر من الحد الأقصى")
        
        return data


class AdminSlotAvailabilityCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating admin slot availability"""
    class Meta:
        model = AdminSlotAvailability
        fields = [
            'service', 'date', 'time', 'is_available', 'max_bookings', 
            'staff', 'notes'
        ]
    
    def validate(self, data):
        """Validate slot creation data"""
        # Check for duplicate slots
        existing_slot = AdminSlotAvailability.objects.filter(
            service=data['service'],
            date=data['date'],
            time=data['time']
        ).first()
        
        if existing_slot:
            raise serializers.ValidationError("هذا الموعد موجود بالفعل لهذه الخدمة")
        
        return data
