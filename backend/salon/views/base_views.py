"""
Base views for salon app - Core functionality
"""
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.utils import timezone
from datetime import timedelta
from payments.models import Payment
from payments.serializers import PaymentSerializer



from ..models import (
    Category, Service, Staff, Customer, Address, Coupon, Booking, HeroImage,
    Config, WorkingHours, DayOff, AppointmentRequest, AppointmentRescheduleHistory,
    ServiceCategory, ServiceItem, Testimonial, ContactInfo, Contact, Offer
)
from ..serializers import (
    CategorySerializer, ServiceSerializer, ServiceDetailSerializer,
    StaffSerializer, CustomerSerializer, AddressSerializer,
    CouponSerializer, BookingSerializer, BookingCreateSerializer,
    HeroImageSerializer, CouponValidationSerializer, UserSerializer,
    ConfigSerializer, WorkingHoursSerializer, DayOffSerializer,
    AppointmentRequestSerializer, AppointmentRescheduleHistorySerializer
)
from ..email_service import send_booking_emails, EmailNotificationService


class CategoryListView(generics.ListAPIView):
    """List all active categories"""
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        return Category.objects.filter(is_active=True).distinct()


class CategoryBySlugView(generics.RetrieveAPIView):
    """Get a single category by slug with its services"""
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        return Category.objects.filter(is_active=True)
    
    def get_object(self):
        """Handle both English and Arabic slugs with flexible matching"""
        slug = self.kwargs.get('slug_en')
        
        # Try to find by slug_en first (exact match)
        try:
            return Category.objects.get(slug_en=slug, is_active=True)
        except Category.DoesNotExist:
            pass
        
        # Special handling for common slug variations
        # Convert "hairtreatment" to "hair-treatment"
        if slug == 'hairtreatment':
            try:
                return Category.objects.get(slug_en='hair-treatment', is_active=True)
            except Category.DoesNotExist:
                pass
        
        # Try to find by slug_en with hyphen conversion (hairtreatment -> hair-treatment)
        try:
            # Convert underscore-based slugs to hyphen-based
            hyphen_slug = slug.replace('_', '-')
            return Category.objects.get(slug_en=hyphen_slug, is_active=True)
        except Category.DoesNotExist:
            pass
        
        # Try to find by slug_en with underscore conversion (hair-treatment -> hair_treatment)
        try:
            # Convert hyphen-based slugs to underscore-based
            underscore_slug = slug.replace('-', '_')
            return Category.objects.get(slug_en=underscore_slug, is_active=True)
        except Category.DoesNotExist:
            pass
        
        # Try to find by name_en (case insensitive)
        try:
            return Category.objects.get(name_en__iexact=slug, is_active=True)
        except Category.DoesNotExist:
            pass
        
        # Try to find by name (case insensitive)
        try:
            return Category.objects.get(name__iexact=slug, is_active=True)
        except Category.DoesNotExist:
            pass
        
        # Try to find by name with space conversion (hair treatment -> hair-treatment)
        try:
            readable_name = slug.replace('-', ' ').replace('_', ' ').title()
            return Category.objects.get(name__iexact=readable_name, is_active=True)
        except Category.DoesNotExist:
            pass
        
        # Try to find by name_en with space conversion
        try:
            readable_name_en = slug.replace('-', ' ').replace('_', ' ').title()
            return Category.objects.get(name_en__iexact=readable_name_en, is_active=True)
        except Category.DoesNotExist:
            pass
        
        # If nothing found, raise 404
        from django.http import Http404
        raise Http404("Category not found")
    
    def get_serializer_context(self):
        """Add services to the context"""
        context = super().get_serializer_context()
        category = self.get_object()
        context['services'] = category.services.filter(is_active=True)
        return context


class ServiceListView(generics.ListAPIView):
    """List all active services with optional category filtering"""
    serializer_class = ServiceSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        queryset = Service.objects.filter(is_active=True).distinct()
        category_id = self.request.query_params.get('category', None)
        featured = self.request.query_params.get('featured', None)
        search = self.request.query_params.get('search', None)
        
        if category_id:
            try:
                category_id_int = int(category_id)
                queryset = queryset.filter(categories__id=category_id_int)
            except ValueError:
                queryset = queryset.filter(categories__name=category_id)
        
        if featured == 'true':
            queryset = queryset.filter(is_featured=True)
        
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | 
                Q(name_en__icontains=search) |
                Q(description__icontains=search)
            )
        
        return queryset


class ServiceDetailView(generics.RetrieveAPIView):
    """Get service details"""
    queryset = Service.objects.filter(is_active=True)
    serializer_class = ServiceDetailSerializer
    permission_classes = [AllowAny]


class StaffListView(generics.ListAPIView):
    """List all active staff members"""
    serializer_class = StaffSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        queryset = Staff.objects.filter(is_active=True)
        service_id = self.request.query_params.get('service', None)
        
        if service_id:
            queryset = queryset.filter(services__id=service_id)
        
        return queryset.distinct()


class HeroImageListView(generics.ListAPIView):
    """List all active hero images"""
    serializer_class = HeroImageSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        return HeroImage.objects.filter(is_active=True)


class CustomerCreateView(generics.CreateAPIView):
    """Create a new customer"""
    serializer_class = CustomerSerializer
    permission_classes = [AllowAny]


class CustomerDetailView(generics.RetrieveUpdateAPIView):
    """Get or update customer details"""
    serializer_class = CustomerSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        customer_id = self.kwargs.get('pk')
        if customer_id:
            return get_object_or_404(Customer, pk=customer_id)
        # If no ID provided, try to get customer by email from request data
        email = self.request.data.get('email')
        if email:
            customer, created = Customer.objects.get_or_create(
                email=email,
                defaults=self.request.data
            )
            return customer
        return None


class AddressListCreateView(generics.ListCreateAPIView):
    """List customer addresses or create new one"""
    serializer_class = AddressSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        customer_id = self.request.query_params.get('customer')
        if customer_id:
            return Address.objects.filter(customer_id=customer_id)
        return Address.objects.none()


class AddressDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Get, update, or delete an address"""
    queryset = Address.objects.all()
    serializer_class = AddressSerializer
    permission_classes = [AllowAny]


@api_view(['GET'])
@permission_classes([AllowAny])
def dashboard_stats(request):
    """Get dashboard statistics"""
    today = timezone.now().date()
    week_ago = today - timedelta(days=7)
    month_ago = today - timedelta(days=30)
    
    stats = {
        'total_bookings': Booking.objects.count(),
        'pending_bookings': Booking.objects.filter(status='pending').count(),
        'today_bookings': Booking.objects.filter(booking_date=today).count(),
        'week_bookings': Booking.objects.filter(booking_date__gte=week_ago).count(),
        'month_bookings': Booking.objects.filter(booking_date__gte=month_ago).count(),
        'total_customers': Customer.objects.count(),
        'active_services': Service.objects.filter(is_active=True).count(),
        'active_staff': Staff.objects.filter(is_active=True).count(),
        'active_coupons': Coupon.objects.filter(is_active=True).count(),
    }

    latest_payments = Payment.objects.order_by('-created_at')[:5]
    payments_data = PaymentSerializer(latest_payments, many=True).data
    return Response({
    'stats': stats,
    'latest_payments': payments_data
    })



# Additional views for enhanced features
@api_view(['GET', 'PATCH'])
@permission_classes([AllowAny])
def config_view(request):
    """Get or update system configuration"""
    try:
        config = Config.get_instance()
        
        if request.method == 'GET':
            serializer = ConfigSerializer(config)
            return Response(serializer.data)
        
        elif request.method == 'PATCH':
            serializer = ConfigSerializer(config, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class WorkingHoursListCreateView(generics.ListCreateAPIView):
    """List or create working hours"""
    serializer_class = WorkingHoursSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        staff_id = self.request.query_params.get('staff')
        if staff_id:
            return WorkingHours.objects.filter(staff_id=staff_id)
        return WorkingHours.objects.all()


class WorkingHoursDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Get, update, or delete working hours"""
    queryset = WorkingHours.objects.all()
    serializer_class = WorkingHoursSerializer
    permission_classes = [AllowAny]


class DayOffListCreateView(generics.ListCreateAPIView):
    """List or create days off"""
    serializer_class = DayOffSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        staff_id = self.request.query_params.get('staff')
        if staff_id:
            return DayOff.objects.filter(staff_id=staff_id)
        return DayOff.objects.all()


class DayOffDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Get, update, or delete day off"""
    queryset = DayOff.objects.all()
    serializer_class = DayOffSerializer
    permission_classes = [AllowAny]


class AppointmentRequestListCreateView(generics.ListCreateAPIView):
    """List or create appointment requests"""
    serializer_class = AppointmentRequestSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        queryset = AppointmentRequest.objects.all()
        staff_id = self.request.query_params.get('staff')
        customer_id = self.request.query_params.get('customer')
        date = self.request.query_params.get('date')
        
        if staff_id:
            queryset = queryset.filter(staff_id=staff_id)
        if customer_id:
            queryset = queryset.filter(customer_id=customer_id)
        if date:
            queryset = queryset.filter(date=date)
            
        return queryset.order_by('-created_at')


class AppointmentRequestDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Get, update, or delete appointment request"""
    queryset = AppointmentRequest.objects.all()
    serializer_class = AppointmentRequestSerializer
    permission_classes = [AllowAny]


@api_view(['POST'])
@permission_classes([AllowAny])
def reschedule_appointment_request(request, pk):
    """Reschedule an appointment request"""
    try:
        appointment_request = get_object_or_404(AppointmentRequest, pk=pk)
        
        new_date = request.data.get('new_date')
        new_time = request.data.get('new_time')
        new_staff_id = request.data.get('new_staff_id')
        reason = request.data.get('reason', '')
        
        if not all([new_date, new_time]):
            return Response({
                'error': 'new_date and new_time are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Store old values for history
        old_date = appointment_request.date
        old_time = appointment_request.start_time
        old_staff = appointment_request.staff
        
        # Update appointment request
        appointment_request.date = new_date
        appointment_request.start_time = new_time
        if new_staff_id:
            appointment_request.staff_id = new_staff_id
        appointment_request.reschedule_attempts += 1
        appointment_request.save()
        
        # Create reschedule history
        AppointmentRescheduleHistory.objects.create(
            appointment_request=appointment_request,
            date=old_date,
            start_time=old_time,
            end_time=appointment_request.end_time,
            staff=old_staff,
            reason_for_rescheduling=reason,
            reschedule_status='confirmed'
        )
        
        return Response({
            'message': 'Appointment rescheduled successfully',
            'appointment_request': AppointmentRequestSerializer(appointment_request).data
        })
        
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class RescheduleHistoryListView(generics.ListAPIView):
    """List reschedule history"""
    serializer_class = AppointmentRescheduleHistorySerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        queryset = AppointmentRescheduleHistory.objects.all()
        appointment_id = self.request.query_params.get('appointment_request')
        if appointment_id:
            queryset = queryset.filter(appointment_request_id=appointment_id)
        return queryset.order_by('-created_at')
