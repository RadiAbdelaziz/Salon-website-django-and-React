"""
Offers views - Handle all offer-related functionality
"""

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404


@api_view(['GET'])
@permission_classes([AllowAny])
def offers_api(request):
    """API endpoint to get all active offers"""
    try:
        from ..models import Offer
        # Get query parameters
        featured = request.query_params.get('featured', None)
        new_only = request.query_params.get('new', None)
        offer_type = request.query_params.get('type', None)
        limit = request.query_params.get('limit', None)
        
        # Base queryset - only active offers
        queryset = Offer.objects.filter(is_active=True)
        
        # Apply filters
        if featured == 'true':
            queryset = queryset.filter(is_featured=True)
        
        if new_only == 'true':
            queryset = queryset.filter(is_new=True)
        
        if offer_type:
            queryset = queryset.filter(offer_type=offer_type)
        
        # Order by featured first, then by order, then by creation date
        queryset = queryset.order_by('-is_featured', 'order', '-created_at')
        
        # Apply limit if specified
        if limit:
            try:
                limit_int = int(limit)
                queryset = queryset[:limit_int]
            except ValueError:
                pass
        
        offers_data = []
        for offer in queryset:
            # Get related services and categories
            services_data = []
            for service in offer.services.all():
                services_data.append({
                    'id': service.id,
                    'name': service.name,
                    'name_en': service.name_en,
                    'price': float(service.price),
                    'duration': service.duration
                })
            
            categories_data = []
            for category in offer.categories.all():
                categories_data.append({
                    'id': category.id,
                    'name': category.name,
                    'name_en': category.name_en
                })
            
            offer_data = {
                'id': offer.id,
                'title': offer.title,
                'title_en': offer.title_en,
                'description': offer.description,
                'description_en': offer.description_en,
                'short_description': offer.short_description,
                'short_description_en': offer.short_description_en,
                'offer_type': offer.offer_type,
                'discount_value': float(offer.discount_value) if offer.discount_value else None,
                'original_price': float(offer.original_price) if offer.original_price else None,
                'offer_price': float(offer.offer_price) if offer.offer_price else None,
                'discount_display': offer.get_discount_display(),
                'savings_amount': float(offer.get_savings_amount()) if offer.get_savings_amount() else None,
                'savings_percentage': offer.get_savings_percentage(),
                'image': offer.image.url if offer.image else None,
                'thumbnail': offer.thumbnail.url if offer.thumbnail else None,
                'valid_from': offer.valid_from.isoformat(),
                'valid_until': offer.valid_until.isoformat(),
                'is_valid': offer.is_valid(),
                'is_featured': offer.is_featured,
                'is_new': offer.is_new,
                'services': services_data,
                'categories': categories_data,
                'terms_conditions': offer.terms_conditions,
                'terms_conditions_en': offer.terms_conditions_en,
                'usage_limit': offer.usage_limit,
                'used_count': offer.used_count,
                'order': offer.order,
                'card_color': offer.card_color,
                'text_color': offer.text_color,
                'created_at': offer.created_at.isoformat(),
                'updated_at': offer.updated_at.isoformat()
            }
            offers_data.append(offer_data)
        
        return Response({
            'success': True,
            'offers': offers_data,
            'count': len(offers_data)
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def offer_detail_api(request, offer_id):
    """API endpoint to get a specific offer by ID"""
    try:
        from ..models import Offer
        offer = get_object_or_404(Offer, id=offer_id, is_active=True)
        
        # Get related services and categories
        services_data = []
        for service in offer.services.all():
            services_data.append({
                'id': service.id,
                'name': service.name,
                'name_en': service.name_en,
                'price': float(service.price),
                'duration': service.duration,
                'description': service.description,
                'description_en': service.description_en,
                'image': service.image.url if service.image else None
            })
        
        categories_data = []
        for category in offer.categories.all():
            categories_data.append({
                'id': category.id,
                'name': category.name,
                'name_en': category.name_en,
                'description': category.description,
                'description_en': category.description_en,
                'icon': category.icon,
                'image': category.image.url if category.image else None
            })
        
        offer_data = {
            'id': offer.id,
            'title': offer.title,
            'title_en': offer.title_en,
            'description': offer.description,
            'description_en': offer.description_en,
            'short_description': offer.short_description,
            'short_description_en': offer.short_description_en,
            'offer_type': offer.offer_type,
            'discount_value': float(offer.discount_value) if offer.discount_value else None,
            'original_price': float(offer.original_price) if offer.original_price else None,
            'offer_price': float(offer.offer_price) if offer.offer_price else None,
            'discount_display': offer.get_discount_display(),
            'savings_amount': float(offer.get_savings_amount()) if offer.get_savings_amount() else None,
            'savings_percentage': offer.get_savings_percentage(),
            'image': offer.image.url if offer.image else None,
            'thumbnail': offer.thumbnail.url if offer.thumbnail else None,
            'valid_from': offer.valid_from.isoformat(),
            'valid_until': offer.valid_until.isoformat(),
            'is_valid': offer.is_valid(),
            'is_featured': offer.is_featured,
            'is_new': offer.is_new,
            'services': services_data,
            'categories': categories_data,
            'terms_conditions': offer.terms_conditions,
            'terms_conditions_en': offer.terms_conditions_en,
            'usage_limit': offer.usage_limit,
            'used_count': offer.used_count,
            'order': offer.order,
            'card_color': offer.card_color,
            'text_color': offer.text_color,
            'created_at': offer.created_at.isoformat(),
            'updated_at': offer.updated_at.isoformat()
        }
        
        return Response({
            'success': True,
            'offer': offer_data
        })

    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
