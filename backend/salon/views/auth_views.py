"""
Authentication related views
"""
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.contrib.auth import get_user_model
from django.contrib.auth.models import User

from ..models import Customer , CustomerOTP
from ..serializers import UserSerializer
from .utility_views import generate_otp
from .services import send_whatsapp_message
import random



User = get_user_model()

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """
    تسجيل مستخدم جديد + إنشاء ملف العميل + إرسال رمز التحقق عبر WhatsApp
    """
    try:
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        first_name = request.data.get('first_name', '')
        last_name = request.data.get('last_name', '')
        phone = request.data.get('phone', '')

        # التحقق من الحقول المطلوبة
        if not all([username, email, password, phone]):
            return Response(
                {'error': 'الحقول (username, email, password, phone) مطلوبة'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # التحقق من عدم تكرار المستخدم
        if User.objects.filter(username=username).exists():
            return Response({'error': 'اسم المستخدم موجود مسبقًا'}, status=status.HTTP_400_BAD_REQUEST)
        if User.objects.filter(email=email).exists():
            return Response({'error': 'البريد الإلكتروني مستخدم مسبقًا'}, status=status.HTTP_400_BAD_REQUEST)

        # إنشاء المستخدم
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
        )

        # إنشاء ملف العميل المرتبط بالمستخدم
        customer = Customer.objects.create(
            user=user,
            name=f"{first_name} {last_name}".strip() or username,
            email=email,
            phone=phone
        )

        # إنشاء رمز التحقق (OTP) وربطه بالعميل
        otp_code = generate_otp()
        CustomerOTP.objects.create(customer=customer, code=otp_code)

        # إرسال كود التحقق عبر WhatsApp
        send_whatsapp_message(phone, otp_code)

        return Response({
            'message': 'تم إنشاء الحساب وإرسال كود التحقق عبر WhatsApp',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name
            },
            'customer': {
                'id': customer.id,
                'name': customer.name,
                'email': customer.email,
                'phone': customer.phone
            }
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
# OTP verify 
# @api_view(['POST'])
# @permission_classes([AllowAny])
# def verify_otp(request):
#     """
#     التحقق من رمز OTP المرسل عبر WhatsApp
#     """
#     phone = request.data.get('phone')
#     otp_code = request.data.get('otp')

#     if not all([phone, otp_code]):
#         return Response({'error': 'رقم الجوال و الرمز مطلوبة'}, status=400)

#     user = User.objects.filter(customer__phone=phone).first()
#     if not user:
#         return Response({'error': 'المستخدم غير موجود'}, status=404)

#     otp = CustomerOTP.objects.filter(user=user, code=otp_code).last()
#     if not otp or not otp.is_valid():
#         return Response({'error': 'رمز غير صحيح أو منتهي الصلاحية'}, status=400)

#     #  تحديث حالة المستخدم
#     user.is_phone_verified = True
#     user.save()

#     # إنشاء توكن
#     token, _ = Token.objects.get_or_create(user=user)

#     return Response({
#         'message': 'تم التحقق من رقم الجوال بنجاح ',
#         'token': token.key,
#         'user': {
#             'id': user.id,
#             'username': user.username,
#             'email': user.email,
#             'first_name': user.first_name,
#             'last_name': user.last_name
#         }
#     }, status=200)

# @api_view(['POST'])
# def send_otp(request):
#     phone = request.data.get('phone')
#     if not phone:
#         return Response({"error": "رقم الهاتف مطلوب"}, status=400)

#     customer, created = Customer.objects.get_or_create(phone=phone)
#     customer.otp = str(random.randint(1000, 9999))
#     customer.save()

#     # هنا يمكنك إضافة إرسال OTP عبر WhatsApp أو SMS
#     print("OTP:", customer.otp)  # للتجربة فقط
#     return Response({"message": "تم إرسال رمز التحقق"})

# بسيمنبسينكبنسي
from django.utils import timezone
from datetime import timedelta
# إرسال كود التحقق

@api_view(['POST'])
@permission_classes([AllowAny])
def send_otp(request):
    """
    إرسال رمز التحقق (OTP) إلى رقم الجوال
    """
    phone = request.data.get('phone')
    if not phone:
        return Response({"error": "رقم الهاتف مطلوب"}, status=400)

    # جلب العميل حسب رقم الهاتف
    customer = Customer.objects.filter(phone=phone).first()
    if not customer:
        return Response({"error": "العميل غير موجود"}, status=404)

    # إنشاء كود OTP جديد
    otp_code = str(random.randint(1000, 9999))

    CustomerOTP.objects.create(
        customer=customer,
        code=otp_code
    )

    # لاحقاً هنا نرسل الكود عبر Twilio WhatsApp
    print("🔹 OTP:", otp_code)

    return Response({"message": "تم إرسال رمز التحقق بنجاح"}, status=200)



@api_view(['POST'])
@permission_classes([AllowAny])
def verify_otp(request):
    """
    التحقق من رمز OTP المرسل عبر WhatsApp
    """
    phone = request.data.get('phone')
    otp_code = request.data.get('otp')

    if not all([phone, otp_code]):
        return Response({'error': 'رقم الجوال و الرمز مطلوبة'}, status=400)

    customer = Customer.objects.filter(phone=phone).first()
    if not customer:
        return Response({'error': 'العميل غير موجود'}, status=404)

    otp = CustomerOTP.objects.filter(customer=customer, code=otp_code).last()
    if not otp or not otp.is_valid():
        return Response({'error': 'رمز غير صحيح أو منتهي الصلاحية'}, status=400)

    # تحديث حالة التحقق
    customer.is_phone_verified = True
    customer.save()

    # إنشاء أو جلب المستخدم المرتبط (إن لم يكن موجودًا)
    if not customer.user:
        user = User.objects.create(username=phone)
        customer.user = user
        customer.save()
    else:
        user = customer.user

    token, _ = Token.objects.get_or_create(user=user)

    return Response({
        'message': 'تم التحقق من رقم الجوال بنجاح',
        'token': token.key,
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name
        }
    }, status=200)


# بستينمتب end
@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """Login user and return token"""
    try:
        username = request.data.get('username')
        password = request.data.get('password')
        
        if not username or not password:
            return Response({
                'error': 'Username and password are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Try to authenticate with username first, then with email
        user = authenticate(username=username, password=password)
        
        # If username authentication fails, try with email
        if user is None:
            try:
                # Get the first user with this email (in case of duplicates)
                user_obj = User.objects.filter(email=username).first()
                if user_obj:
                    user = authenticate(username=user_obj.username, password=password)
            except User.DoesNotExist:
                pass
        
        if user is None:
            return Response({
                'error': 'Invalid credentials'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        # Get or create token
        token, created = Token.objects.get_or_create(user=user)
        
        # Get customer profile
        try:
            customer = Customer.objects.get(user=user)
            customer_data = {
                'id': customer.id,
                'name': customer.name,
                'email': customer.email,
                'phone': customer.phone
            }
        except Customer.DoesNotExist:
            customer_data = None
        
        return Response({
            'message': 'Login successful',
            'token': token.key,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name
            },
            'customer': customer_data
        })
        
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    """Logout user by deleting token"""
    try:
        request.user.auth_token.delete()
        return Response({
            'message': 'Logout successful'
        })
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    """Get current user profile"""
    try:
        user = request.user
        try:
            customer = Customer.objects.get(user=user)
            customer_data = {
                'id': customer.id,
                'name': customer.name,
                'email': customer.email,
                'phone': customer.phone,
                'date_of_birth': customer.date_of_birth
            }
        except Customer.DoesNotExist:
            customer_data = None
        
        return Response({
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name
            },
            'customer': customer_data
        })
        
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    """Update user and customer profile"""
    try:
        user = request.user
        
        # Update user data
        if 'first_name' in request.data:
            user.first_name = request.data['first_name']
        if 'last_name' in request.data:
            user.last_name = request.data['last_name']
        if 'email' in request.data:
            user.email = request.data['email']
        user.save()
        
        # Update or create customer profile
        try:
            customer = Customer.objects.get(user=user)
            created = False
        except Customer.DoesNotExist:
            customer = Customer.objects.create(
                user=user,
                name=f"{user.first_name} {user.last_name}".strip() or user.username,
                email=user.email,
                phone=request.data.get('phone', '')
            )
            created = True
        
        if not created:
            if 'name' in request.data:
                customer.name = request.data['name']
            if 'email' in request.data:
                customer.email = request.data['email']
            if 'phone' in request.data:
                customer.phone = request.data['phone']
            if 'date_of_birth' in request.data:
                customer.date_of_birth = request.data['date_of_birth']
            customer.save()
        
        return Response({
            'message': 'Profile updated successfully',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name
            },
            'customer': {
                'id': customer.id,
                'name': customer.name,
                'email': customer.email,
                'phone': customer.phone,
                'date_of_birth': customer.date_of_birth
            }
        })
        
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def request_password_reset(request):
    """Request password reset token"""
    try:
        from ..models import PasswordResetToken
        email = request.data.get('email')
        if not email:
            return Response({
                'error': 'Email is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(email=email)
            token = PasswordResetToken.create_token(user)
            
            return Response({
                'message': 'Password reset token created successfully',
                'token': str(token.token)  # Remove this in production
            })
            
        except User.DoesNotExist:
            return Response({
                'error': 'User with this email does not exist'
            }, status=status.HTTP_404_NOT_FOUND)
            
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_password_reset_token(request):
    """Verify password reset token"""
    try:
        from ..models import PasswordResetToken
        token = request.data.get('token')
        if not token:
            return Response({
                'error': 'Token is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            reset_token = PasswordResetToken.objects.get(token=token)
            if reset_token.is_expired:
                return Response({
                    'error': 'Token has expired'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if not reset_token.is_active:
                return Response({
                    'error': 'Token is no longer active'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            return Response({
                'message': 'Token is valid',
                'user_id': reset_token.user.id,
                'expires_at': reset_token.expires_at
            })
            
        except PasswordResetToken.DoesNotExist:
            return Response({
                'error': 'Invalid token'
            }, status=status.HTTP_404_NOT_FOUND)
            
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password(request):
    """Reset password using token"""
    try:
        from ..models import PasswordResetToken
        token = request.data.get('token')
        new_password = request.data.get('new_password')
        
        if not all([token, new_password]):
            return Response({
                'error': 'Token and new_password are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            reset_token = PasswordResetToken.objects.get(token=token)
            if reset_token.is_expired or not reset_token.is_active:
                return Response({
                    'error': 'Token is invalid or expired'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            user = reset_token.user
            user.set_password(new_password)
            user.save()
            
            reset_token.mark_as_verified()
            
            return Response({
                'message': 'Password reset successfully'
            })
            
        except PasswordResetToken.DoesNotExist:
            return Response({
                'error': 'Invalid token'
            }, status=status.HTTP_404_NOT_FOUND)
            
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
