"""
Utility views - Helper functions and miscellaneous views
"""
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from django.shortcuts import render
from django.http import HttpResponse
from PIL import Image, ImageDraw, ImageFont
import io

from ..models import (
    Coupon, ServiceCategory, ServiceItem, Testimonial, ContactInfo, Contact, Offer
)
# from ..serializers import CouponValidationSerializer


@api_view(['POST'])
@permission_classes([AllowAny])
def validate_coupon(request):
    """Validate coupon code and calculate discount"""
    from ..serializers import CouponValidationSerializer
    serializer = CouponValidationSerializer(data=request.data)
    
    if serializer.is_valid():
        coupon_data = serializer.validated_data
        return Response({
            'valid': True,
            'coupon': {
                'id': coupon_data['coupon'].id,
                'code': coupon_data['coupon'].code,
                'name': coupon_data['coupon'].name,
                'discount_type': coupon_data['coupon'].discount_type,
                'discount_value': coupon_data['coupon'].discount_value,
            },
            'discount_amount': coupon_data['discount_amount'],
            'final_amount': coupon_data['final_amount']
        })
    
    return Response({
        'valid': False,
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([AllowAny])
def placeholder_image(request, width, height):
    """Generate a placeholder image"""
    try:
        # Parse dimensions
        width = int(width)
        height = int(height)
        
        # Create image
        img = Image.new('RGB', (width, height), color='#f3e5d1')
        draw = ImageDraw.Draw(img)
        
        # Try to use a default font, fallback to basic if not available
        try:
            font = ImageFont.truetype("arial.ttf", min(width, height) // 8)
        except:
            font = ImageFont.load_default()
        
        # Add text
        text = "خدمة جميلة"
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        
        x = (width - text_width) // 2
        y = (height - text_height) // 2
        
        draw.text((x, y), text, fill='#8a724c', font=font)
        
        # Convert to bytes
        img_io = io.BytesIO()
        img.save(img_io, format='PNG')
        img_io.seek(0)
        
        response = HttpResponse(img_io.getvalue(), content_type='image/png')
        response['Cache-Control'] = 'public, max-age=3600'  # Cache for 1 hour
        return response
        
    except Exception as e:
        # Fallback: return a simple colored rectangle
        img = Image.new('RGB', (width, height), color='#f3e5d1')
        img_io = io.BytesIO()
        img.save(img_io, format='PNG')
        img_io.seek(0)
        
        response = HttpResponse(img_io.getvalue(), content_type='image/png')
        response['Cache-Control'] = 'public, max-age=3600'
        return response


def services_view(request):
    """Display services page with categories and items"""
    categories = ServiceCategory.objects.filter(is_active=True).prefetch_related('items').order_by('order', 'name')
    
    context = {
        'categories': categories,
    }
    
    return render(request, 'salon/services.html', context)


def privacy_policy_view(request):
    """Display privacy policy page"""
    return render(request, 'salon/privacy_policy.html')


@api_view(['GET'])
@permission_classes([AllowAny])
def service_categories_api(request):
    """API endpoint to get all active service categories with their items"""
    try:
        categories = ServiceCategory.objects.filter(is_active=True).prefetch_related('items').order_by('order', 'name')
        
        categories_data = []
        for category in categories:
            category_data = {
                'id': category.id,
                'name': category.name,
                'icon': category.icon,
                'order': category.order,
                'items': []
            }
            
            for item in category.items.all().order_by('order', 'title'):
                category_data['items'].append({
                    'id': item.id,
                    'title': item.title,
                    'order': item.order
                })
            
            categories_data.append(category_data)
        
        return Response({
            'success': True,
            'categories': categories_data
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def testimonials_api(request):
    """API endpoint to get all active testimonials"""
    try:
        testimonials = Testimonial.objects.filter(is_active=True).order_by('order', '-created_at')
        
        testimonials_data = []
        for testimonial in testimonials:
            testimonial_data = {
                'id': testimonial.id,
                'customer_name': testimonial.customer_name,
                'customer_name_en': testimonial.customer_name_en,
                'testimonial_text': testimonial.testimonial_text,
                'testimonial_text_en': testimonial.testimonial_text_en,
                'rating': testimonial.rating,
                'rating_display': testimonial.get_rating_display(),
                'customer_image': testimonial.customer_image.url if testimonial.customer_image else None,
                'service_used': testimonial.service_used,
                'is_featured': testimonial.is_featured,
                'order': testimonial.order,
                'created_at': testimonial.created_at.isoformat()
            }
            testimonials_data.append(testimonial_data)
        
        return Response({
            'success': True,
            'testimonials': testimonials_data
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def contact_info_api(request):
    """API endpoint to get active contact information"""
    try:
        contact_info = ContactInfo.objects.filter(is_active=True).first()
        
        if not contact_info:
            # Return default values if no contact info exists
            contact_data = {
                'phone_number': '+966 55 123 4567',
                'phone_number_en': '+966 55 123 4567',
                'location': 'الرياض، المملكة العربية السعودية',
                'location_en': 'Riyadh, Kingdom of Saudi Arabia',
                'working_hours': 'الأحد - الخميس: 10ص - 8م',
                'working_hours_en': 'Sunday - Thursday: 10 AM - 8 PM',
                'is_active': True,
                'created_at': None,
                'updated_at': None
            }
        else:
            contact_data = {
                'phone_number': contact_info.phone_number,
                'phone_number_en': contact_info.phone_number_en or contact_info.phone_number,
                'location': contact_info.location,
                'location_en': contact_info.location_en or contact_info.location,
                'working_hours': contact_info.working_hours,
                'working_hours_en': contact_info.working_hours_en or contact_info.working_hours,
                'is_active': contact_info.is_active,
                'created_at': contact_info.created_at.isoformat() if contact_info.created_at else None,
                'updated_at': contact_info.updated_at.isoformat() if contact_info.updated_at else None
            }
        
        return Response({
            'success': True,
            'contact_info': contact_data
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def contact_api(request):
    """API endpoint to submit contact form"""
    try:
        # Validate required fields
        required_fields = ['name', 'email', 'message']
        for field in required_fields:
            if not request.data.get(field):
                return Response({
                    'success': False,
                    'error': f'حقل {field} مطلوب'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create contact submission
        contact = Contact.objects.create(
            name=request.data.get('name'),
            email=request.data.get('email'),
            phone=request.data.get('phone', ''),
            subject=request.data.get('subject', ''),
            message=request.data.get('message')
        )
        
        return Response({
            'success': True,
            'message': 'تم إرسال رسالتك بنجاح',
            'contact_id': contact.id
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# create random number for otp phone
import random

def generate_otp():
    return str(random.randint(100000, 999999))
