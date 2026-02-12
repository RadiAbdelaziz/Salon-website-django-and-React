from django.urls import path, include
from . import views
from . import export_views
from . import notification_views
# from . import admin_slot_views
from .views import booking_views
# from .views import WhatsAppTestView

app_name = 'salon'

urlpatterns = [
    # Categories
    path('categories/', views.CategoryListView.as_view(), name='category-list'),
    path('categories/<str:slug_en>/', views.CategoryBySlugView.as_view(), name='category-by-slug'),
    
    # Services
    path('services/', views.ServiceListView.as_view(), name='service-list'),
    path('services/<int:pk>/', views.ServiceDetailView.as_view(), name='service-detail'),
    
    # Staff
    path('staff/', views.StaffListView.as_view(), name='staff-list'),
    
    # Hero Images
    path('hero-images/', views.HeroImageListView.as_view(), name='hero-image-list'),
    
    # Customers
    path('customers/', views.CustomerCreateView.as_view(), name='customer-create'),
    path('customers/<int:pk>/', views.CustomerDetailView.as_view(), name='customer-detail'),
    
    # Addresses
    path('addresses/', views.AddressListCreateView.as_view(), name='address-list-create'),
    path('addresses/<int:pk>/', views.AddressDetailView.as_view(), name='address-detail'),
    
    # Bookings
    path('bookings/', views.BookingListCreateView.as_view(), name='booking-list-create'),
    path('bookings/<int:pk>/', views.BookingDetailView.as_view(), name='booking-detail'),
    path('bookings/<int:booking_id>/verify-payment/', booking_views.verify_payment, name='verify-payment'),
    path('bookings/<int:booking_id>/confirm/', booking_views.confirm_booking, name='confirm-booking'),
    path('booking-time-slots/', views.booking_time_slots, name='booking-time-slots'),
    path('availability/', views.availability, name='availability'),
    
    # Coupons
    path('validate-coupon/', views.validate_coupon, name='validate-coupon'),
    
    # Dashboard
    path('dashboard-stats/', views.dashboard_stats, name='dashboard-stats'),
    
    # Authentication

    # path('auth/register/', views.register, name='register'),
    # path('auth/verify-otp/', views.verify_otp, name='verify_otp') ,
    # path('auth/send-otp/', views.send_otp),

    # path('auth/register/', views.register, name='register'),
    # path('auth/login/', views.login, name='login'),
    path('auth/logout/', views.logout, name='logout'),
    path('auth/profile/', views.user_profile, name='user-profile'),
    path('auth/update-profile/', views.update_profile, name='update-profile'),
    
    # Email notifications
    path('send-booking-emails/', views.send_booking_emails_api, name='send-booking-emails'),
    
    # Rescheduling
    path('reschedule-booking/', views.reschedule_booking, name='reschedule-booking'),
    path('booking-reschedule-history/<int:booking_id>/', views.get_booking_reschedule_history, name='booking-reschedule-history'),
    
    # New APIs for enhanced features
    path('config/', views.config_view, name='config'),
    path('working-hours/', views.WorkingHoursListCreateView.as_view(), name='working-hours-list'),
    path('working-hours/<int:pk>/', views.WorkingHoursDetailView.as_view(), name='working-hours-detail'),
    path('days-off/', views.DayOffListCreateView.as_view(), name='days-off-list'),
    path('days-off/<int:pk>/', views.DayOffDetailView.as_view(), name='days-off-detail'),
    path('appointment-requests/', views.AppointmentRequestListCreateView.as_view(), name='appointment-requests-list'),
    path('appointment-requests/<int:pk>/', views.AppointmentRequestDetailView.as_view(), name='appointment-requests-detail'),
    path('appointment-requests/<int:pk>/reschedule/', views.reschedule_appointment_request, name='reschedule-appointment-request'),
    path('reschedule-history/', views.RescheduleHistoryListView.as_view(), name='reschedule-history-list'),
    # path('password-reset/request/', views.request_password_reset, name='request-password-reset'),
    # path('password-reset/verify/', views.verify_password_reset_token, name='verify-password-reset-token'),
    # path('password-reset/reset/', views.reset_password, name='reset-password'),

    # otp 
    # path("auth/send-otp/", views.SendOTPView.as_view()),
    # path("auth/verify-otp/", views.VerifyOTPView.as_view()),
    path('auth/send-otp/', views.SendOTPView.as_view(), name='send_otp'),
    path('auth/verify-otp/', views.VerifyOTPView.as_view(), name='verify_otp'),
    path('auth/logout/', views.logout, name='logout'),
    path('auth/profile/', views.user_profile, name='user_profile'),
    path('auth/profile/update/', views.update_profile, name='update_profile'),

    
    path("test-whatsapp/", views.TestWhatsAppView.as_view(), name="test-whatsapp"),
    
    # Placeholder images
    path('placeholder/<int:width>/<int:height>/', views.placeholder_image, name='placeholder-image'),
    
    # Services page
    path('services/', views.services_view, name='services'),
    
    # Service Categories API
    path('service-categories/', views.service_categories_api, name='service-categories-api'),
    
    # Testimonials API
    path('testimonials/', views.testimonials_api, name='testimonials-api'),
    
    # Contact Info API
    path('contact-info/', views.contact_info_api, name='contact-info-api'),
    path('contact/', views.contact_api, name='contact-api'),
    
    # Offers API
    path('offers/', views.offers_api, name='offers-api'),
    path('offers/<int:offer_id>/', views.offer_detail_api, name='offer-detail-api'),
    
    # Privacy Policy page
    path('privacy/', views.privacy_policy_view, name='privacy-policy'),
    
    # Export endpoints (Excel only - PDF removed)
    path('export/bookings/excel/', export_views.export_bookings_excel, name='export-bookings-excel'),
    path('export/customers/excel/', export_views.export_customers_excel, name='export-customers-excel'),
    path('export/services/excel/', export_views.export_services_excel, name='export-services-excel'),
    path('export/revenue/excel/', export_views.export_revenue_report_excel, name='export-revenue-excel'),
    path('export/dashboard-data/', export_views.export_dashboard_data, name='export-dashboard-data'),
    
    # Blog API endpoints
    path('blog/categories/', views.BlogCategoryListView.as_view(), name='blog-category-list'),
    path('blog/posts/', views.BlogPostListView.as_view(), name='blog-post-list'),
    path('blog/posts/<slug:slug>/', views.BlogPostDetailView.as_view(), name='blog-post-detail'),
    path('blog/posts/featured/', views.BlogPostFeaturedView.as_view(), name='blog-post-featured'),
    path('blog/posts/trending/', views.BlogPostTrendingView.as_view(), name='blog-post-trending'),
    path('blog/posts/<int:post_id>/comments/', views.BlogCommentListView.as_view(), name='blog-comment-list'),
    path('blog/posts/<int:post_id>/comments/create/', views.BlogCommentCreateView.as_view(), name='blog-comment-create'),
    path('blog/posts/<int:post_id>/like/', views.blog_post_like, name='blog-post-like'),
    path('blog/newsletter/subscribe/', views.NewsletterSubscribeView.as_view(), name='newsletter-subscribe'),
    path('blog/stats/', views.blog_stats, name='blog-stats'),
    
    # Admin notification API endpoints
    path('admin/notifications/', notification_views.admin_notifications_api, name='admin-notifications-api'),
    path('admin/notifications/<int:notification_id>/mark-read/', notification_views.mark_notification_read_api, name='mark-notification-read-api'),
    path('admin/notifications/mark-all-read/', notification_views.mark_all_notifications_read_api, name='mark-all-notifications-read-api'),
    path('admin/notifications/count/', notification_views.notification_count_api, name='notification-count-api'),
    
    # test
    #  path("test-whatsapp/", WhatsAppTestView.as_view()),

    # Admin Slot Availability Management
    # path('admin-slots/', admin_slot_views.AdminSlotAvailabilityListView.as_view(), name='admin-slots-list'),
    # path('admin-slots/<int:pk>/', admin_slot_views.AdminSlotAvailabilityDetailView.as_view(), name='admin-slots-detail'),
    # path('admin-slots/available/', admin_slot_views.get_available_slots_for_booking, name='admin-slots-available'),
    # path('admin-slots/book/', admin_slot_views.book_admin_slot, name='admin-slots-book'),
    # path('admin-slots/cancel/', admin_slot_views.cancel_admin_slot_booking, name='admin-slots-cancel'),
    
    
    
]
