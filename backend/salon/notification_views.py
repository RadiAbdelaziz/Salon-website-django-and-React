from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import Notification


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_notifications_api(request):
    """Get notifications for admin panel"""
    try:
        # Get latest 5 notifications
        notifications = Notification.get_recent_notifications()[:5]
        
        # Get unread count
        unread_count = Notification.get_unread_count()
        
        notifications_data = []
        for notification in notifications:
            notifications_data.append({
                'id': notification.id,
                'title': notification.title,
                'message': notification.message,
                'is_read': notification.is_read,
                'created_at': notification.created_at.strftime('%Y-%m-%d %H:%M'),
                'notification_type': notification.notification_type,
                'priority': notification.priority,
            })
        
        return Response({
            'notifications': notifications_data,
            'unread_count': unread_count,
            'success': True
        })
        
    except Exception as e:
        return Response({
            'error': str(e),
            'success': False
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_notification_read_api(request, notification_id):
    """Mark a notification as read"""
    try:
        notification = get_object_or_404(Notification, id=notification_id)
        notification.mark_as_read()
        
        return Response({
            'success': True,
            'message': 'Notification marked as read'
        })
        
    except Exception as e:
        return Response({
            'error': str(e),
            'success': False
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_all_notifications_read_api(request):
    """Mark all notifications as read"""
    try:
        Notification.objects.filter(is_read=False).update(is_read=True)
        
        return Response({
            'success': True,
            'message': 'All notifications marked as read'
        })
        
    except Exception as e:
        return Response({
            'error': str(e),
            'success': False
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def notification_count_api(request):
    """Get unread notification count"""
    try:
        unread_count = Notification.get_unread_count()
        
        return Response({
            'unread_count': unread_count,
            'success': True
        })
        
    except Exception as e:
        return Response({
            'error': str(e),
            'success': False
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)