# Views package initialization
# Import all views from their respective modules

# Base views
from .base_views import (
    CategoryListView, CategoryBySlugView, ServiceListView, ServiceDetailView,
    StaffListView, HeroImageListView, CustomerCreateView, CustomerDetailView,
    AddressListCreateView, AddressDetailView, dashboard_stats,
    config_view, WorkingHoursListCreateView, WorkingHoursDetailView,
    DayOffListCreateView, DayOffDetailView, AppointmentRequestListCreateView,
    AppointmentRequestDetailView, reschedule_appointment_request,
    RescheduleHistoryListView
)

# Booking views
from .booking_views import (
    BookingListCreateView, BookingDetailView, booking_time_slots,
    availability, send_booking_emails_api, reschedule_booking,
    get_booking_reschedule_history , TestWhatsAppView
)

# Blog views
from .blog_views import (
    BlogCategoryListView, BlogPostListView, BlogPostDetailView,
    BlogPostFeaturedView, BlogPostTrendingView, BlogCommentListView,
    BlogCommentCreateView, NewsletterSubscribeView, blog_post_like, blog_stats
)

# Auth views
from .auth_views import (
    # register, login, logout, user_profile, update_profile,
    # request_password_reset, verify_password_reset_token, reset_password , VerifyOTPView , SendOTPView
 logout, user_profile, update_profile , SendOTPView , VerifyOTPView

)

# Utility views
from .utility_views import (
    validate_coupon, placeholder_image, services_view, privacy_policy_view,
    service_categories_api, testimonials_api, contact_info_api, contact_api
)

# Offers views
from .offers_views import (
    offers_api, offer_detail_api
)


# Import other existing views
from .. import export_views
from .. import notification_views
# from .. import admin_slot_views
