"""
Blog related views - Clean and organized
"""
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from django.shortcuts import get_object_or_404
from django.db.models import Q

from ..models import (
    BlogAuthor, BlogCategory, BlogPost, BlogComment, NewsletterSubscriber
)
from ..serializers import (
    BlogAuthorSerializer, BlogCategorySerializer, BlogPostListSerializer, 
    BlogPostDetailSerializer, BlogCommentSerializer, BlogCommentCreateSerializer,
    NewsletterSubscriberSerializer, NewsletterSubscriberCreateSerializer
)


class BlogCategoryListView(generics.ListAPIView):
    """List all active blog categories"""
    serializer_class = BlogCategorySerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        return BlogCategory.objects.filter(is_active=True).order_by('order', 'name')


class BlogPostListView(generics.ListAPIView):
    """List all published blog posts with filtering"""
    serializer_class = BlogPostListSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        queryset = BlogPost.objects.filter(status='published').select_related('author', 'category')
        
        # Filter by category
        category_id = self.request.query_params.get('category', None)
        if category_id and category_id != 'undefined' and category_id != 'null':
            try:
                category_id_int = int(category_id)
                queryset = queryset.filter(categories__id=category_id_int)
            except (ValueError, TypeError):
                pass
        
        # Filter by author
        author_id = self.request.query_params.get('author', None)
        if author_id:
            queryset = queryset.filter(author_id=author_id)
        
        # Filter by featured
        is_featured = self.request.query_params.get('featured', None)
        if is_featured and is_featured.lower() == 'true':
            queryset = queryset.filter(is_featured=True)
        
        # Filter by trending
        is_trending = self.request.query_params.get('trending', None)
        if is_trending and is_trending.lower() == 'true':
            queryset = queryset.filter(is_trending=True)
        
        # Search
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | 
                Q(excerpt__icontains=search) | 
                Q(content__icontains=search) |
                Q(tags__icontains=search)
            )
        
        return queryset.order_by('-published_at', '-created_at')


class BlogPostDetailView(generics.RetrieveAPIView):
    """Get a single blog post by slug"""
    serializer_class = BlogPostDetailSerializer
    permission_classes = [AllowAny]
    lookup_field = 'slug'
    
    def get_queryset(self):
        return BlogPost.objects.filter(status='published').select_related('author', 'category')
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        # Increment view count
        instance.increment_views()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class BlogPostFeaturedView(generics.ListAPIView):
    """Get featured blog posts"""
    serializer_class = BlogPostListSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        return BlogPost.objects.filter(
            status='published', 
            is_featured=True
        ).select_related('author', 'category').order_by('-published_at')[:5]


class BlogPostTrendingView(generics.ListAPIView):
    """Get trending blog posts"""
    serializer_class = BlogPostListSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        return BlogPost.objects.filter(
            status='published', 
            is_trending=True
        ).select_related('author', 'category').order_by('-views', '-likes')[:5]


class BlogCommentListView(generics.ListAPIView):
    """List approved comments for a blog post"""
    serializer_class = BlogCommentSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        post_id = self.kwargs.get('post_id')
        return BlogComment.objects.filter(
            post_id=post_id, 
            is_approved=True
        ).order_by('-created_at')


class BlogCommentCreateView(generics.CreateAPIView):
    """Create a new blog comment"""
    serializer_class = BlogCommentCreateSerializer
    permission_classes = [AllowAny]
    
    def perform_create(self, serializer):
        post_id = self.kwargs.get('post_id')
        post = get_object_or_404(BlogPost, id=post_id, status='published')
        serializer.save(post=post)


class NewsletterSubscribeView(generics.CreateAPIView):
    """Subscribe to newsletter"""
    serializer_class = NewsletterSubscriberCreateSerializer
    permission_classes = [AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            # Check if email already exists
            email = serializer.validated_data['email']
            subscriber, created = NewsletterSubscriber.objects.get_or_create(
                email=email,
                defaults={
                    'name': serializer.validated_data.get('name', ''),
                    'is_active': True
                }
            )
            
            if not created:
                # Reactivate if previously unsubscribed
                if not subscriber.is_active:
                    subscriber.is_active = True
                    subscriber.unsubscribed_at = None
                    subscriber.save()
                    message = 'تم إعادة تفعيل الاشتراك بنجاح!'
                else:
                    message = 'أنت مشترك بالفعل في النشرة الإخبارية!'
            else:
                message = 'تم الاشتراك في النشرة الإخبارية بنجاح!'
            
            return Response({
                'message': message,
                'subscriber': NewsletterSubscriberSerializer(subscriber).data
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def blog_post_like(request, post_id):
    """Like/unlike a blog post"""
    try:
        post = get_object_or_404(BlogPost, id=post_id, status='published')
        
        # For now, just increment likes (in a real app, you'd track user likes)
        post.likes += 1
        post.save(update_fields=['likes'])
        
        return Response({
            'message': 'تم تسجيل الإعجاب بنجاح!',
            'likes': post.likes
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def blog_stats(request):
    """Get blog statistics"""
    try:
        total_posts = BlogPost.objects.filter(status='published').count()
        total_categories = BlogCategory.objects.filter(is_active=True).count()
        total_comments = BlogComment.objects.filter(is_approved=True).count()
        total_subscribers = NewsletterSubscriber.objects.filter(is_active=True).count()
        
        return Response({
            'total_posts': total_posts,
            'total_categories': total_categories,
            'total_comments': total_comments,
            'total_subscribers': total_subscribers
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
