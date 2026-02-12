# """
# Authentication related views
# """

# from rest_framework import status
# from rest_framework.response import Response
# from rest_framework.decorators import api_view, permission_classes
# from rest_framework.permissions import AllowAny, IsAuthenticated
# from rest_framework.authtoken.models import Token
# from django.contrib.auth import authenticate, get_user_model

# from ..models import Customer, PhoneOTP
# from ..serializers import UserSerializer, SendOTPSerializer, VerifyOTPSerializer
# from .utility_views import generate_otp
# from .services import send_whatsapp_message
# from datetime import timedelta
# from django.utils import timezone
# import random

# User = get_user_model()

# # ============================
# # REGISTER NEW USER
# # ============================
# @api_view(['POST'])
# @permission_classes([AllowAny])
# def register(request):
#     """
#     تسجيل مستخدم جديد + إنشاء ملف العميل + إرسال رمز التحقق عبر WhatsApp
#     """
#     try:
#         username = request.data.get('username')
#         email = request.data.get('email')
#         password = request.data.get('password')
#         first_name = request.data.get('first_name', '')
#         last_name = request.data.get('last_name', '')
#         phone = request.data.get('phone', '')

#         # التحقق من الحقول المطلوبة
#         if not all([username, email, password, phone]):
#             return Response(
#                 {'error': 'الحقول (username, email, password, phone) مطلوبة'},
#                 status=status.HTTP_400_BAD_REQUEST
#             )

#         # التحقق من عدم تكرار المستخدم
#         if User.objects.filter(username=username).exists():
#             return Response({'error': 'اسم المستخدم موجود مسبقًا'}, status=status.HTTP_400_BAD_REQUEST)
#         if User.objects.filter(email=email).exists():
#             return Response({'error': 'البريد الإلكتروني مستخدم مسبقًا'}, status=status.HTTP_400_BAD_REQUEST)

#         # إنشاء المستخدم
#         user = User.objects.create_user(
#             username=username,
#             email=email,
#             password=password,
#             first_name=first_name,
#             last_name=last_name,
#         )

#         # إنشاء ملف العميل المرتبط بالمستخدم
#         customer = Customer.objects.create(
#             user=user,
#             name=f"{first_name} {last_name}".strip() or username,
#             email=email,
#             phone=phone
#         )

#         # إنشاء رمز التحقق (OTP) وربطه بالعميل
#         otp_code = generate_otp()
#         PhoneOTP.objects.create(
#             phone_number=phone,
#             otp_code=otp_code
#         )

#         # إرسال كود التحقق عبر WhatsApp
#         send_whatsapp_message(phone, otp_code)

#         return Response({
#             'message': 'تم إنشاء الحساب وإرسال كود التحقق عبر WhatsApp',
#             'user': {
#                 'id': user.id,
#                 'username': user.username,
#                 'email': user.email,
#                 'first_name': user.first_name,
#                 'last_name': user.last_name
#             },
#             'customer': {
#                 'id': customer.id,
#                 'name': customer.name,
#                 'email': customer.email,
#                 'phone': customer.phone
#             }
#         }, status=status.HTTP_201_CREATED)

#     except Exception as e:
#         return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# # ============================
# # SEND OTP
# # ============================
# from rest_framework.views import APIView

# class SendOTPView(APIView):
#     permission_classes = [AllowAny]

#     def post(self, request):
#         serializer = SendOTPSerializer(data=request.data)
#         serializer.is_valid(raise_exception=True)

#         phone = serializer.validated_data["phone_number"]
#         code = generate_otp()

#         PhoneOTP.objects.create(
#             phone_number=phone,
#             otp_code=code
#         )

#         send_whatsapp_message(phone, code)

#         return Response({"message": "OTP sent"}, status=200)


# # ============================
# # VERIFY OTP
# # ============================
# class VerifyOTPView(APIView):
#     permission_classes = [AllowAny]

#     def post(self, request):
#         serializer = VerifyOTPSerializer(data=request.data)
#         serializer.is_valid(raise_exception=True)

#         phone = serializer.validated_data["phone_number"]
#         code = serializer.validated_data["otp_code"]

#         try:
#             otp = PhoneOTP.objects.filter(
#                 phone_number=phone,
#                 is_used=False
#             ).latest("created_at")
#         except PhoneOTP.DoesNotExist:
#             return Response({"error": "OTP not found"}, status=400)

#         if otp.is_expired():
#             return Response({"error": "OTP expired"}, status=400)

#         if otp.attempts >= 3:
#             return Response({"error": "Too many attempts"}, status=400)

#         if otp.otp_code != code:
#             otp.attempts += 1
#             otp.save()
#             return Response({"error": "Invalid code"}, status=400)

#         otp.is_used = True
#         otp.save()

#         # Create or get user based on phone number
#         user, _ = User.objects.get_or_create(username=phone)
#         token, _ = Token.objects.get_or_create(user=user)

#         return Response({
#             "token": token.key,
#             "user_id": user.id
#         })


# # ============================
# # LOGOUT
# # ============================
# @api_view(['POST'])
# @permission_classes([IsAuthenticated])
# def logout(request):
#     """Logout user by deleting token"""
#     try:
#         request.user.auth_token.delete()
#         return Response({
#             'message': 'Logout successful'
#         })
#     except Exception as e:
#         return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# # ============================
# # USER PROFILE
# # ============================
# @api_view(['GET'])
# @permission_classes([IsAuthenticated])
# def user_profile(request):
#     """Get current user profile"""
#     try:
#         user = request.user
#         try:
#             customer = Customer.objects.get(user=user)
#             customer_data = {
#                 'id': customer.id,
#                 'name': customer.name,
#                 'email': customer.email,
#                 'phone': customer.phone,
#                 'date_of_birth': customer.date_of_birth
#             }
#         except Customer.DoesNotExist:
#             customer_data = None

#         return Response({
#             'user': {
#                 'id': user.id,
#                 'username': user.username,
#                 'email': user.email,
#                 'first_name': user.first_name,
#                 'last_name': user.last_name
#             },
#             'customer': customer_data
#         })

#     except Exception as e:
#         return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# # ============================
# # UPDATE PROFILE
# # ============================
# @api_view(['PUT'])
# @permission_classes([IsAuthenticated])
# def update_profile(request):
#     """Update user and customer profile"""
#     try:
#         user = request.user

#         # Update user
#         for field in ['first_name', 'last_name', 'email']:
#             if field in request.data:
#                 setattr(user, field, request.data[field])
#         user.save()

#         # Update or create customer
#         customer, created = Customer.objects.get_or_create(
#             user=user,
#             defaults={
#                 'name': f"{user.first_name} {user.last_name}".strip() or user.username,
#                 'email': user.email,
#                 'phone': request.data.get('phone', '')
#             }
#         )

#         if not created:
#             for field in ['name', 'email', 'phone', 'date_of_birth']:
#                 if field in request.data:
#                     setattr(customer, field, request.data[field])
#             customer.save()

#         return Response({
#             'message': 'Profile updated successfully',
#             'user': {
#                 'id': user.id,
#                 'username': user.username,
#                 'email': user.email,
#                 'first_name': user.first_name,
#                 'last_name': user.last_name
#             },
#             'customer': {
#                 'id': customer.id,
#                 'name': customer.name,
#                 'email': customer.email,
#                 'phone': customer.phone,
#                 'date_of_birth': customer.date_of_birth
#             }
#         })

#     except Exception as e:
#         return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# # ============================
# # PASSWORD RESET LOGIC
# # ============================
# @api_view(['POST'])
# @permission_classes([AllowAny])
# def request_password_reset(request):
#     """Request password reset token"""
#     try:
#         from ..models import PasswordResetToken
#         email = request.data.get('email')
#         if not email:
#             return Response({'error': 'Email is required'}, status=400)

#         try:
#             user = User.objects.get(email=email)
#             token = PasswordResetToken.create_token(user)
#             return Response({
#                 'message': 'Password reset token created successfully',
#                 'token': str(token.token)  # Remove in production
#             })
#         except User.DoesNotExist:
#             return Response({'error': 'User with this email does not exist'}, status=404)

#     except Exception as e:
#         return Response({'error': str(e)}, status=500)


# @api_view(['POST'])
# @permission_classes([AllowAny])
# def verify_password_reset_token(request):
#     """Verify password reset token"""
#     try:
#         from ..models import PasswordResetToken
#         token = request.data.get('token')
#         if not token:
#             return Response({'error': 'Token is required'}, status=400)

#         try:
#             reset_token = PasswordResetToken.objects.get(token=token)
#             if reset_token.is_expired or not reset_token.is_active:
#                 return Response({'error': 'Token invalid or expired'}, status=400)

#             return Response({
#                 'message': 'Token is valid',
#                 'user_id': reset_token.user.id,
#                 'expires_at': reset_token.expires_at
#             })

#         except PasswordResetToken.DoesNotExist:
#             return Response({'error': 'Invalid token'}, status=404)

#     except Exception as e:
#         return Response({'error': str(e)}, status=500)


# @api_view(['POST'])
# @permission_classes([AllowAny])
# def reset_password(request):
#     """Reset password using token"""
#     try:
#         from ..models import PasswordResetToken
#         token = request.data.get('token')
#         new_password = request.data.get('new_password')

#         if not all([token, new_password]):
#             return Response({'error': 'Token and new_password are required'}, status=400)

#         try:
#             reset_token = PasswordResetToken.objects.get(token=token)
#             if reset_token.is_expired or not reset_token.is_active:
#                 return Response({'error': 'Token invalid or expired'}, status=400)

#             user = reset_token.user
#             user.set_password(new_password)
#             user.save()

#             reset_token.mark_as_verified()

#             return Response({'message': 'Password reset successfully'})

#         except PasswordResetToken.DoesNotExist:
#             return Response({'error': 'Invalid token'}, status=404)

#     except Exception as e:
#         return Response({'error': str(e)}, status=500)


# @api_view(['POST'])
# @permission_classes([AllowAny])
# def login(request):
#     """
#     تسجيل الدخول باستخدام username أو email مع كلمة المرور
#     """
#     try:
#         username_or_email = request.data.get('username')
#         password = request.data.get('password')

#         if not username_or_email or not password:
#             return Response(
#                 {'error': 'Username/email و password مطلوبة'},
#                 status=status.HTTP_400_BAD_REQUEST
#             )

#         # محاولة المصادقة بالـ username
#         user = authenticate(username=username_or_email, password=password)

#         # إذا فشلت المصادقة بالـ username، جرب البريد الإلكتروني
#         if user is None:
#             user_obj = User.objects.filter(email=username_or_email).first()
#             if user_obj:
#                 user = authenticate(username=user_obj.username, password=password)

#         if user is None:
#             return Response(
#                 {'error': 'بيانات الدخول غير صحيحة'},
#                 status=status.HTTP_401_UNAUTHORIZED
#             )

#         # إنشاء أو جلب التوكن
#         token, _ = Token.objects.get_or_create(user=user)

#         # الحصول على بيانات العميل المرتبطة (إن وجدت)
#         try:
#             customer = Customer.objects.get(user=user)
#             customer_data = {
#                 'id': customer.id,
#                 'name': customer.name,
#                 'email': customer.email,
#                 'phone': customer.phone
#             }
#         except Customer.DoesNotExist:
#             customer_data = None

#         return Response({
#             'message': 'تم تسجيل الدخول بنجاح',
#             'token': token.key,
#             'user': {
#                 'id': user.id,
#                 'username': user.username,
#                 'email': user.email,
#                 'first_name': user.first_name,
#                 'last_name': user.last_name
#             },
#             'customer': customer_data
#         })

#     except Exception as e:
#         return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

"""
Authentication views (Phone OTP only)
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
import random
from ..models import Customer, PhoneOTP

from ..serializers import SendOTPSerializer, VerifyOTPSerializer
from .utility_views import generate_otp
# from .services import send_whatsapp_message  # Twilio مؤقتاً معلق

User = get_user_model()


# ----------------------------
# OTP Logic
# ----------------------------
# accounts/auth_view.py

from twilio.rest import Client
from django.conf import settings

def send_sms(phone_number, message):
    client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
    try:
        client.messages.create(
            body=message,
            from_=settings.TWILIO_PHONE_NUMBER,
            to=phone_number
        )
        return True
    except Exception as e:
        print("Twilio SMS Error:", e)
        return False




import random
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from random import randint
from django.conf import settings
from twilio.rest import Client
from ..models import Customer, PhoneOTP


# ----------------------------
# إرسال OTP عبر Twilio
# ----------------------------from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from random import randint

from ..models import PhoneOTP
from ..utils import send_whatsapp_message
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from random import randint

from ..models import PhoneOTP
from ..utils import send_whatsapp_message


class SendOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        phone = request.data.get("phone_number")
        if not phone:
            return Response({"error": "رقم الهاتف مطلوب"}, status=400)

        otp_code = str(randint(100000, 999999))

        PhoneOTP.objects.create(
            phone_number=phone,
            otp_code=otp_code
        )

        try:
            sid = send_whatsapp_message(phone, f"رمز التحقق الخاص بك: {otp_code}")
        except Exception as e:
            # رجّع سبب الخطأ الحقيقي للفرونت (وقت التطوير)
            return Response({
                "error": "فشل إرسال رسالة WhatsApp",
                "details": str(e),
            }, status=500)

        return Response({"message": "تم إرسال رمز التحقق بنجاح", "sid": sid})

# ----------------------------
class VerifyOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        phone = request.data.get("phone_number")
        code = request.data.get("otp_code")

        if not phone or not code:
            return Response({"error": "رقم الهاتف والرمز مطلوبان"}, status=400)

        otp = PhoneOTP.objects.filter(
            phone_number=phone,
            is_used=False
        ).order_by('-created_at').first()

        if not otp:
            return Response({"error": "OTP غير موجود"}, status=400)

        if otp.is_expired():
            return Response({"error": "OTP منتهي الصلاحية"}, status=400)

        if otp.attempts >= 3:
            return Response({"error": "تم تجاوز الحد الأقصى للمحاولات"}, status=400)

        if otp.otp_code != code:
            otp.attempts += 1
            otp.save()
            return Response({"error": "الرمز غير صحيح"}, status=400)

        otp.is_used = True
        otp.save()

        # يمكن هنا إنشاء Token أو تسجيل دخول
        return Response({"message": "تم التحقق من رقم الهاتف بنجاح"})

# ----------------------------
# Logout
# ----------------------------
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    try:
        request.user.auth_token.delete()
        return Response({"message": "تم تسجيل الخروج بنجاح"})
    except Exception as e:
        return Response({"error": str(e)}, status=500)


# ----------------------------
# Profile & Update Profile
# ----------------------------
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    user = request.user
    try:
        customer = Customer.objects.get(user=user)
        customer_data = {
            'id': customer.id,
            'phone': customer.phone,
            'name': customer.name,
            'date_of_birth': getattr(customer, 'date_of_birth', None)
        }
    except Customer.DoesNotExist:
        customer_data = None

    return Response({
        'user': {'id': user.id, 'username': user.username},
        'customer': customer_data
    })


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    user = request.user
    customer, _ = Customer.objects.get_or_create(user=user)

    if 'name' in request.data:
        customer.name = request.data['name']
    if 'phone' in request.data:
        customer.phone = request.data['phone']
    if 'date_of_birth' in request.data:
        customer.date_of_birth = request.data['date_of_birth']
    customer.save()

    return Response({
        'message': 'تم تحديث البيانات بنجاح',
        'customer': {
            'id': customer.id,
            'phone': customer.phone,
            'name': customer.name,
            'date_of_birth': getattr(customer, 'date_of_birth', None)
        }
    })
