from django.contrib import admin
from django.utils import timezone
from django.template.response import TemplateResponse
from django.urls import reverse
from django.db.models import Sum, Count
from datetime import timedelta
from payments.models import Payment


# Import all admin configurations
from .admin_configs.core_services import (
    CategoryAdmin, ServiceAdmin, StaffAdmin, CustomerAdmin, AddressAdmin, 
    CouponAdmin, HeroImageAdmin, ServiceCategoryAdmin, ServiceItemAdmin, 
    TestimonialAdmin, OfferAdmin, ContactInfoAdmin, ContactAdmin
)
from .admin_configs.bookings import (
    BookingAdmin, ConfigAdmin, WorkingHoursAdmin, DayOffAdmin, 
    AppointmentRequestAdmin, AppointmentRescheduleHistoryAdmin, 
    PasswordResetTokenAdmin, AdminSlotAvailabilityAdmin
)
from .admin_configs.content import (
    BlogAuthorAdmin, BlogCategoryAdmin, BlogPostAdmin, 
    BlogCommentAdmin, NewsletterSubscriberAdmin
)
from .admin_configs.notifications import (
    NotificationAdmin, NotificationSettingsAdmin
)

# Import all models
from .models import (
    Category, Service, Staff, Customer, Address, Coupon, Booking, HeroImage,
    Config, WorkingHours, DayOff, AppointmentRequest, AppointmentRescheduleHistory, 
    PasswordResetToken, ServiceCategory, ServiceItem, Testimonial, ContactInfo, 
    Contact, Offer, BlogAuthor, BlogCategory, BlogPost, BlogComment, 
    NewsletterSubscriber, Notification, NotificationSettings, AdminSlotAvailability
)

# Register all models with their admin classes
admin.site.register(Category, CategoryAdmin)
admin.site.register(Service, ServiceAdmin)
admin.site.register(Staff, StaffAdmin)
admin.site.register(Customer, CustomerAdmin)
admin.site.register(Address, AddressAdmin)
admin.site.register(Coupon, CouponAdmin)
admin.site.register(Booking, BookingAdmin)
admin.site.register(HeroImage, HeroImageAdmin)
admin.site.register(Config, ConfigAdmin)
admin.site.register(WorkingHours, WorkingHoursAdmin)
admin.site.register(DayOff, DayOffAdmin)
admin.site.register(AppointmentRequest, AppointmentRequestAdmin)
admin.site.register(AppointmentRescheduleHistory, AppointmentRescheduleHistoryAdmin)
admin.site.register(PasswordResetToken, PasswordResetTokenAdmin)
admin.site.register(ServiceCategory, ServiceCategoryAdmin)
admin.site.register(ServiceItem, ServiceItemAdmin)
admin.site.register(Testimonial, TestimonialAdmin)
admin.site.register(Offer, OfferAdmin)
admin.site.register(ContactInfo, ContactInfoAdmin)
admin.site.register(Contact, ContactAdmin)
admin.site.register(AdminSlotAvailability, AdminSlotAvailabilityAdmin)

# Blog models are already registered in content.py using @admin.register decorator
# Notification models are already registered in notifications.py using @admin.register decorator

# Customize admin site headers
admin.site.site_header = "إدارة صالون Glámmy"
admin.site.site_title = "صالون Glámmy"
admin.site.index_title = "لوحة التحكم"

# Enable enhanced admin features
admin.site.enable_nav_sidebar = True
admin.site.site_url = None  # Remove "View site" link if needed


def custom_admin_index(request):
    """Custom admin index view with dashboard statistics"""
    if not request.user.is_staff:
        from django.contrib.auth.views import redirect_to_login
        return redirect_to_login(request.get_full_path())
    
    # Get current date and time ranges
    today = timezone.now().date()
    week_ago = today - timedelta(days=7)
    month_ago = today - timedelta(days=30)
    
    # Calculate basic statistics
    total_bookings = Booking.objects.count()
    bookings_today = Booking.objects.filter(booking_date=today).count()
    total_revenue = Booking.objects.aggregate(total=Sum('final_price'))['total'] or 0
    revenue_30d = Booking.objects.filter(booking_date__gte=month_ago).aggregate(total=Sum('final_price'))['total'] or 0
    # === Payment statistics ===
    total_payments = Payment.objects.count()
    successful_payments = Payment.objects.filter(status="paid").count()
    failed_payments = Payment.objects.filter(status="failed").count()
    pending_payments = Payment.objects.filter(status="pending").count()
    revenue_from_payments = Payment.objects.aggregate(total=Sum("amount"))["total"] or 0


    # Advanced KPIs
    avg_booking_value = total_revenue / total_bookings if total_bookings > 0 else 0
    cancelled_bookings = Booking.objects.filter(status='cancelled').count()
    cancellation_rate = (cancelled_bookings / total_bookings * 100) if total_bookings > 0 else 0
    
    # Weekly revenue comparison
    week_start = today - timedelta(days=today.weekday())
    last_week_start = week_start - timedelta(days=7)
    last_week_end = week_start - timedelta(days=1)
    
    this_week_revenue = Booking.objects.filter(
        booking_date__gte=week_start
    ).aggregate(total=Sum('final_price'))['total'] or 0
    
    last_week_revenue = Booking.objects.filter(
        booking_date__gte=last_week_start,
        booking_date__lte=last_week_end
    ).aggregate(total=Sum('final_price'))['total'] or 0
    
    revenue_change = ((this_week_revenue - last_week_revenue) / last_week_revenue * 100) if last_week_revenue > 0 else 0
    
    # Service insights
    popular_services = Service.objects.annotate(
        booking_count=Count('booking')
    ).order_by('-booking_count')[:5]
    
    service_revenue = {}
    for service in Service.objects.all():
        service_revenue[service.name] = Booking.objects.filter(
            service=service
        ).aggregate(total=Sum('final_price'))['total'] or 0
    
    # Time analytics
    hourly_distribution = {}
    for hour in range(9, 18):  # 9 AM to 6 PM
        hourly_distribution[hour] = Booking.objects.filter(
            booking_time__hour=hour
        ).count()
    
    # Operational alerts
    upcoming_bookings_1h = Booking.objects.filter(
        booking_date=today,
        booking_time__gte=timezone.now().time(),
        booking_time__lte=(timezone.now() + timedelta(hours=1)).time()
    ).count()
    
    daily_revenue_today = Booking.objects.filter(
        booking_date=today
    ).aggregate(total=Sum('final_price'))['total'] or 0
    
    # Calculate average daily revenue for comparison
    avg_daily_revenue = Booking.objects.filter(
        booking_date__gte=month_ago
    ).aggregate(total=Sum('final_price'))['total'] or 0
    avg_daily_revenue = float(avg_daily_revenue) / 30 if avg_daily_revenue > 0 else 0
    
    revenue_alert = float(daily_revenue_today) < (avg_daily_revenue * 0.5)  # 50% below average
    
    stats = {
        'total_bookings': total_bookings,
        'bookings_today': bookings_today,
        'total_customers': Customer.objects.count(),
        'new_customers_7d': Customer.objects.filter(created_at__gte=week_ago).count(),
        'revenue_total': total_revenue,
        'revenue_30d': revenue_30d,
        'active_staff': Staff.objects.filter(is_active=True).count(),
        'total_staff': Staff.objects.count(),
        # Advanced KPIs
        'avg_booking_value': round(avg_booking_value, 2),
        'cancellation_rate': round(cancellation_rate, 1),
        'new_bookings_today': bookings_today,
        'this_week_revenue': this_week_revenue,
        'last_week_revenue': last_week_revenue,
        'revenue_change': round(revenue_change, 1),
        # Service insights
        'popular_services': popular_services,
        'service_revenue': service_revenue,
        # Time analytics
        'hourly_distribution': hourly_distribution,
        # Operational alerts
        'upcoming_bookings_1h': upcoming_bookings_1h,
        'revenue_alert': revenue_alert,
        'daily_revenue_today': daily_revenue_today,
        # Payments
        'total_payments': total_payments,
        'successful_payments': successful_payments,
        'failed_payments': failed_payments,
        'pending_payments': pending_payments,
        'revenue_from_payments': revenue_from_payments,

    }
    
    # Get the next 3 upcoming bookings for the table
    todays_bookings = Booking.objects.filter(
        booking_date__gte=today
    ).select_related('customer', 'service', 'staff').order_by('booking_date', 'booking_time')[:3]
    
    # Prepare chart data for the next 7 days (including today and future bookings)
    chart_data = []
    chart_labels = []
    chart_bookings = []
    chart_revenue = []
    
    for i in range(7):
        date = today + timedelta(days=i)
        day_bookings = Booking.objects.filter(booking_date=date).count()
        day_revenue = Booking.objects.filter(
            booking_date=date
        ).aggregate(total=Sum('final_price'))['total'] or 0
        
        chart_labels.append(date.strftime('%m/%d'))
        chart_bookings.append(day_bookings)
        chart_revenue.append(float(day_revenue))
    
    # Prepare additional chart data
    # Service distribution pie chart
    service_distribution = []
    service_labels = []
    for service in popular_services:
        service_labels.append(service.name)
        service_distribution.append(service.booking_count)
    
    # Monthly revenue bar chart (last 6 months)
    monthly_revenue = []
    monthly_labels = []
    for i in range(6):
        month_date = today.replace(day=1) - timedelta(days=30*i)
        month_revenue = Booking.objects.filter(
            booking_date__year=month_date.year,
            booking_date__month=month_date.month
        ).aggregate(total=Sum('final_price'))['total'] or 0
        monthly_revenue.insert(0, float(month_revenue))
        monthly_labels.insert(0, month_date.strftime('%Y-%m'))
    
    # Heatmap data for daily bookings (last 7 days)
    heatmap_data = []
    for i in range(7):
        date = today - timedelta(days=i)
        day_bookings = Booking.objects.filter(booking_date=date).count()
        heatmap_data.append({
            'date': date.strftime('%m/%d'),
            'bookings': day_bookings,
            'revenue': Booking.objects.filter(booking_date=date).aggregate(total=Sum('final_price'))['total'] or 0
        })
    
    charts = {
        'labels': chart_labels,
        'bookings': chart_bookings,
        'revenue': chart_revenue,
        # Additional charts
        'service_labels': service_labels,
        'service_distribution': service_distribution,
        'monthly_labels': monthly_labels,
        'monthly_revenue': monthly_revenue,
        'heatmap_data': heatmap_data,
        'hourly_labels': list(hourly_distribution.keys()),
        'hourly_values': list(hourly_distribution.values()),
    }
    
    # Get recent activity (latest bookings)
    recent_activity = []
    latest_bookings = Booking.objects.select_related(
        'customer', 'service', 'staff'
    ).order_by('-created_at')[:5]
    
    for booking in latest_bookings:
        recent_activity.append({
            'title': f'حجز جديد من {booking.customer.name}',
            'subtitle': f'{booking.service.name} - {booking.booking_date}',
            'timestamp': booking.created_at.strftime('%Y-%m-%d %H:%M'),
        })
    
    # Operational alerts
    alerts = []
    
    # Cancellation alerts
    recent_cancellations = Booking.objects.filter(
        status='cancelled',
        updated_at__gte=timezone.now() - timedelta(days=1)
    ).count()
    if recent_cancellations > 0:
        alerts.append({
            'type': 'warning',
            'title': f'تم إلغاء {recent_cancellations} حجز خلال آخر 24 ساعة',
            'icon': 'warning',
            'color': '#f39c12'
        })
    
    # Upcoming bookings alert
    if upcoming_bookings_1h > 0:
        alerts.append({
            'type': 'info',
            'title': f'لديك {upcoming_bookings_1h} حجز خلال الساعة القادمة',
            'icon': 'schedule',
            'color': '#3498db'
        })
    
    # Revenue alert
    if revenue_alert:
        alerts.append({
            'type': 'error',
            'title': 'تحذير: الإيرادات اليومية أقل من المتوسط',
            'icon': 'trending_down',
            'color': '#e74c3c'
        })
    
    # High cancellation rate alert
    if cancellation_rate > 20:  # More than 20% cancellation rate
        alerts.append({
            'type': 'warning',
            'title': f'معدل الإلغاء مرتفع: {cancellation_rate}%',
            'icon': 'cancel',
            'color': '#f39c12'
        })
    
    # Get featured category ID for quick filters
    featured_category = Category.objects.filter(is_active=True).first()
    featured_category_id = featured_category.id if featured_category else None
    
    # Get the default admin context
    context = admin.site.each_context(request)
    
    # Add our custom data to context
    context.update({
        'stats': stats,
        'charts': charts,
        'todays_bookings': todays_bookings,
        'recent_activity': recent_activity,
        'featured_category_id': featured_category_id,
        'alerts': alerts,
    })
    
    return TemplateResponse(request, 'admin/index.html', context)


# Override the default admin index view
admin.site.index = custom_admin_index

# Organize admin apps
admin.site.index_template = 'admin/custom_index.html'
