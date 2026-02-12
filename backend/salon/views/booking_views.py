"""
Booking related views
"""
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.shortcuts import get_object_or_404
from django.utils import timezone as dj_timezone
import datetime
from zoneinfo import ZoneInfo

from ..models import Booking, BookingRescheduleHistory
from ..serializers import BookingSerializer, BookingCreateSerializer
from ..email_service import EmailNotificationService


class BookingListCreateView(generics.ListCreateAPIView):
    """List bookings or create new booking"""
    permission_classes = [AllowAny]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return BookingCreateSerializer
        return BookingSerializer
    
    def get_queryset(self):
        queryset = Booking.objects.all()
        customer_id = self.request.query_params.get('customer')
        status_filter = self.request.query_params.get('status')
        booking_date = self.request.query_params.get('booking_date')

        # If authenticated and no customer filter provided, map to the user's customer
        if not customer_id and self.request.user and self.request.user.is_authenticated:
            try:
                from ..models import Customer
                customer = Customer.objects.get(user=self.request.user)
                customer_id = customer.id
            except Customer.DoesNotExist:
                pass

        if customer_id:
            queryset = queryset.filter(customer_id=customer_id)

        if status_filter:
            queryset = queryset.filter(status=status_filter)
            
        if booking_date:
            queryset = queryset.filter(booking_date=booking_date)

        return queryset.order_by('-booking_date', '-booking_time')
    
    def create(self, request, *args, **kwargs):
        """Override create to handle payment verification flow"""
        print("=" * 60)
        print("📝 Creating new booking...")
        
        # Extract cart_items from request data
        cart_items = request.data.get('cart_items', None)
        print(f"🛒 Cart items: {cart_items}")
        
        # Remove cart_items from request data before serialization
        request_data = request.data.copy()
        if 'cart_items' in request_data:
            del request_data['cart_items']
        
        # Create a new request object with modified data
        from django.http import QueryDict
        if isinstance(request_data, QueryDict):
            request._full_data = request_data
        else:
            request._full_data = request_data
        
        # Call parent create method
        print(f"💾 Saving booking to database...")
        response = super().create(request, *args, **kwargs)
        print(f"✅ Booking saved with status code: {response.status_code}")
        
        # If booking was created successfully, send confirmation email
        if response.status_code == 201:
            try:
                booking_id = response.data.get('id')
                if booking_id:
                    booking = Booking.objects.get(id=booking_id)
                    email_service = EmailNotificationService()
                    email_service.send_booking_confirmation(booking, cart_items)
                    print(f"✅ Booking confirmation email sent to {booking.customer.email} for booking #{booking_id}")
            except Exception as e:
                print(f"❌ Warning: Failed to send booking confirmation email: {e}")
                import traceback
                traceback.print_exc()
        
        return response
    


class BookingDetailView(generics.RetrieveUpdateAPIView):
    """Get or update booking details"""
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [AllowAny]


@api_view(['POST'])
@permission_classes([AllowAny])
def confirm_booking(request, booking_id):
    """Confirm a booking - only allowed if payment is completed"""
    try:
        booking = get_object_or_404(Booking, id=booking_id)
        
        # Validate that payment is completed
        if booking.payment_status != 'paid':
            return Response({
                'error': 'Payment not completed',
                'message': 'Cannot confirm booking without completed payment'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Only allow confirmation if status is pending_payment
        if booking.status != 'pending_payment':
            return Response({
                'error': 'Invalid booking status',
                'message': f'Cannot confirm booking with status: {booking.status}'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Confirm the booking
        booking.status = 'confirmed'
        booking.save()
        
        return Response({
            'booking_id': booking.id,
            'status': booking.status,
            'message': 'Booking confirmed successfully'
        })
        
    except Exception as e:
        return Response({
            'error': 'Failed to confirm booking',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def verify_payment(request, booking_id):
    """Verify payment status for a booking"""
    try:
        booking = get_object_or_404(Booking, id=booking_id)
        
        return Response({
            'booking_id': booking.id,
            'reference': booking.reference,
            'status': booking.status,
            'payment_status': booking.payment_status,
            'payment_method': booking.payment_method,
            'is_confirmed': booking.status == 'confirmed',
            'requires_payment': booking.status == 'pending_payment'
        })
    except Exception as e:
        return Response({
            'error': 'Failed to verify payment',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def booking_time_slots(request):
    """Get available time slots for a specific date"""
    date = request.query_params.get('date')
    service_id = request.query_params.get('service')
    
    if not date:
        return Response({'error': 'Date parameter is required'}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
    # Default time slots
    time_slots = [
        '09:00', '10:00', '11:00', '12:00', '13:00', 
        '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'
    ]
    
    # Get booked slots for the date
    booked_times = Booking.objects.filter(
        booking_date=date,
        status__in=['pending', 'confirmed', 'in_progress']
    ).values_list('booking_time', flat=True)
    
    # Remove booked slots
    available_slots = []
    for slot in time_slots:
        slot_time = slot + ':00'  # Convert to HH:MM:SS format
        if slot_time not in [str(time) for time in booked_times]:
            available_slots.append(slot)
    
    return Response({'available_slots': available_slots})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def availability(request):
    """Return available time slots for a given date/service"""
    try:
        date_str = request.data.get('date')
        service_id = request.data.get('service_id')
        if not date_str:
            return Response({'error': 'date is required (YYYY-MM-DD)'}, status=status.HTTP_400_BAD_REQUEST)

        # Parse date in Asia/Riyadh using stdlib ZoneInfo
        tz = ZoneInfo('Asia/Riyadh')
        target_date = datetime.datetime.strptime(date_str, '%Y-%m-%d').date()

        # Build default slot list 10:00..22:00 each 60 min
        start_dt = datetime.datetime.combine(target_date, datetime.time(hour=10, minute=0), tzinfo=tz)
        end_dt = datetime.datetime.combine(target_date, datetime.time(hour=22, minute=0), tzinfo=tz)
        slot_minutes = 60

        slots = []
        cur = start_dt
        while cur < end_dt:
            slots.append(cur)
            cur = cur + datetime.timedelta(minutes=slot_minutes)

        # Remove booked/blocked: use Booking model on same date
        booked = Booking.objects.filter(
            booking_date=target_date,
            status__in=['pending', 'confirmed', 'in_progress']
        ).values_list('booking_time', flat=True)
        booked_times = set(str(t) for t in booked)  # HH:MM:SS

        available = []
        now_riyadh = dj_timezone.now().astimezone(tz)
        for s in slots:
            # Skip past times today
            if target_date == now_riyadh.date() and s <= now_riyadh:
                continue
            hhmmss = s.strftime('%H:%M:%S')
            if hhmmss not in booked_times:
                available.append(s.strftime('%H:%M'))

        return Response({'available_slots': available})
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_booking_emails_api(request):
    """Send email notifications for a booking"""
    try:
        booking_id = request.data.get('booking_id')
        
        if not booking_id:
            return Response({
                'error': 'booking_id is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get the booking
        try:
            booking = Booking.objects.get(id=booking_id)
        except Booking.DoesNotExist:
            return Response({
                'error': f'Booking with id {booking_id} not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Send emails
        try:
            from ..email_service import send_booking_emails
            send_booking_emails(booking)
            return Response({
                'message': 'Email notifications sent successfully',
                'booking_id': booking_id
            })
        except Exception as email_error:
            return Response({
                'error': f'Failed to send emails: {str(email_error)}',
                'booking_id': booking_id
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    except Exception as e:
        return Response({
            'error': f'Unexpected error: {str(e)}',
            'request_data': request.data
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reschedule_booking(request):
    """Reschedule an existing booking"""
    try:
        booking_id = request.data.get('booking_id')
        new_date = request.data.get('new_date')
        new_time = request.data.get('new_time')
        reason = request.data.get('reason', '')
        
        if not all([booking_id, new_date, new_time]):
            return Response({
                'error': 'booking_id, new_date, and new_time are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get the booking
        try:
            booking = Booking.objects.get(id=booking_id)
        except Booking.DoesNotExist:
            return Response({
                'error': 'Booking not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Check if booking can be rescheduled
        if not booking.can_reschedule:
            return Response({
                'error': 'This booking cannot be rescheduled'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if booking.reschedule_count >= booking.max_reschedules:
            return Response({
                'error': f'Maximum reschedule limit reached ({booking.max_reschedules})'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Store old values for history
        old_date = booking.booking_date
        old_time = booking.booking_time
        
        # Update booking
        booking.booking_date = new_date
        booking.booking_time = new_time
        booking.reschedule_count += 1
        booking.save()
        
        # Create reschedule history
        BookingRescheduleHistory.objects.create(
            booking=booking,
            old_date=old_date,
            old_time=old_time,
            new_date=new_date,
            new_time=new_time,
            reason=reason,
            rescheduled_by='customer'
        )
        
        # Send reschedule notification email
        try:
            email_service = EmailNotificationService()
            email_service.send_reschedule_notification(booking, old_date, old_time)
        except Exception as email_error:
            print(f"Warning: Failed to send reschedule email: {email_error}")
        
        return Response({
            'message': 'Booking rescheduled successfully',
            'booking': {
                'id': booking.id,
                'new_date': booking.booking_date,
                'new_time': booking.booking_time,
                'reschedule_count': booking.reschedule_count,
                'remaining_reschedules': booking.max_reschedules - booking.reschedule_count
            }
        })
        
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_booking_reschedule_history(request, booking_id):
    """Get reschedule history for a booking"""
    try:
        booking = get_object_or_404(Booking, id=booking_id)
        history = booking.reschedule_history.all()
        
        history_data = []
        for record in history:
            history_data.append({
                'id': record.id,
                'old_date': record.old_date,
                'old_time': record.old_time,
                'new_date': record.new_date,
                'new_time': record.new_time,
                'reason': record.reason,
                'rescheduled_by': record.rescheduled_by,
                'created_at': record.created_at
            })
        
        return Response({
            'booking_id': booking_id,
            'current_reschedule_count': booking.reschedule_count,
            'max_reschedules': booking.max_reschedules,
            'can_reschedule': booking.can_reschedule and booking.reschedule_count < booking.max_reschedules,
            'history': history_data
        })
        
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


from rest_framework.views import APIView
from rest_framework.response import Response
# from . import send_whatsapp_message

class TestWhatsAppView(APIView):
    permission_classes = []  # لأي شخص يمكنه التجربة

    def post(self, request):
        phone = request.data.get("phone_number")
        if not phone:
            return Response({"error": "يرجى إدخال رقم الهاتف"}, status=400)

        # نرسل رسالة WhatsApp
        send_whatsapp_message(phone, "هذه رسالة اختبار من Django + Twilio ✅")

        return Response({"message": "تم إرسال الرسالة بنجاح"})
