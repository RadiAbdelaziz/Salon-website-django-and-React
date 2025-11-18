from django.contrib import admin
from django.utils.html import format_html
from django.utils import timezone
from ..models import (
    BlogAuthor, BlogCategory, BlogPost, BlogComment, NewsletterSubscriber
)


@admin.register(BlogAuthor)
class BlogAuthorAdmin(admin.ModelAdmin):
    list_display = ['full_name', 'email', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['user__first_name', 'user__last_name', 'user__username', 'user__email']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('معلومات الكاتب', {
            'fields': ('user', 'bio', 'bio_en', 'profile_image', 'is_active')
        }),
        ('روابط التواصل الاجتماعي', {
            'fields': ('social_instagram', 'social_facebook', 'social_twitter'),
            'classes': ('collapse',)
        }),
        ('معلومات إضافية', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(BlogCategory)
class BlogCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'name_en', 'color_display', 'is_active', 'order', 'posts_count', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'name_en']
    list_editable = ['order', 'is_active']
    readonly_fields = ['created_at', 'updated_at']
    
    def color_display(self, obj):
        return format_html(
            '<span style="background-color: {}; color: white; padding: 2px 8px; border-radius: 4px;">{}</span>',
            obj.color, obj.color
        )
    color_display.short_description = 'اللون'
    
    def posts_count(self, obj):
        return obj.posts.count()
    posts_count.short_description = 'عدد المقالات'
    
    def changelist_view(self, request, extra_context=None):
        # Add blog category colors to context for JavaScript
        extra_context = extra_context or {}
        category_colors = {}
        for category in BlogCategory.objects.all():
            category_colors[category.name] = category.color
        extra_context['category_colors'] = category_colors
        return super().changelist_view(request, extra_context)


@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    list_display = ['title', 'author', 'category', 'status', 'is_featured', 'is_trending', 'views', 'likes', 'published_at']
    list_filter = ['status', 'is_featured', 'is_trending', 'category', 'author', 'published_at', 'created_at']
    search_fields = ['title', 'title_en', 'excerpt', 'content', 'tags']
    list_editable = ['status', 'is_featured', 'is_trending']
    readonly_fields = ['views', 'likes', 'comments_count', 'created_at', 'updated_at', 'published_at']
    date_hierarchy = 'published_at'
    ordering = ['-published_at', '-created_at']
    list_per_page = 20
    
    fieldsets = (
        ('معلومات المقال الأساسية', {
            'fields': ('title', 'title_en', 'slug', 'excerpt', 'excerpt_en', 'content', 'content_en')
        }),
        ('التصنيف والمؤلف', {
            'fields': ('author', 'category')
        }),
        ('الصورة والوسوم', {
            'fields': ('featured_image', 'featured_image_alt', 'tags')
        }),
        ('إعدادات النشر', {
            'fields': ('status', 'is_featured', 'is_trending', 'read_time', 'published_at')
        }),
        ('إحصائيات', {
            'fields': ('views', 'likes', 'comments_count'),
            'classes': ('collapse',)
        }),
        ('SEO', {
            'fields': ('meta_description', 'meta_keywords'),
            'classes': ('collapse',)
        }),
        ('معلومات إضافية', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['mark_as_published', 'mark_as_draft', 'mark_as_featured', 'mark_as_trending']
    
    def mark_as_published(self, request, queryset):
        updated = queryset.update(status='published')
        self.message_user(request, f'تم نشر {updated} مقال بنجاح.')
    mark_as_published.short_description = 'نشر المقالات المحددة'
    
    def mark_as_draft(self, request, queryset):
        updated = queryset.update(status='draft')
        self.message_user(request, f'تم تحويل {updated} مقال إلى مسودة.')
    mark_as_draft.short_description = 'تحويل إلى مسودة'
    
    def mark_as_featured(self, request, queryset):
        updated = queryset.update(is_featured=True)
        self.message_user(request, f'تم تمييز {updated} مقال.')
    mark_as_featured.short_description = 'تمييز المقالات'
    
    def mark_as_trending(self, request, queryset):
        updated = queryset.update(is_trending=True)
        self.message_user(request, f'تم وضع {updated} مقال في القائمة الرائجة.')
    mark_as_trending.short_description = 'وضع في القائمة الرائجة'


@admin.register(BlogComment)
class BlogCommentAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'post', 'is_approved', 'created_at']
    list_filter = ['is_approved', 'created_at', 'post__category']
    search_fields = ['name', 'email', 'content', 'post__title']
    list_editable = ['is_approved']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'created_at'
    ordering = ['-created_at']
    list_per_page = 20
    
    actions = ['approve_comments', 'disapprove_comments']
    
    def approve_comments(self, request, queryset):
        updated = queryset.update(is_approved=True)
        self.message_user(request, f'تم الموافقة على {updated} تعليق.')
    approve_comments.short_description = 'الموافقة على التعليقات المحددة'
    
    def disapprove_comments(self, request, queryset):
        updated = queryset.update(is_approved=False)
        self.message_user(request, f'تم رفض {updated} تعليق.')
    disapprove_comments.short_description = 'رفض التعليقات المحددة'


@admin.register(NewsletterSubscriber)
class NewsletterSubscriberAdmin(admin.ModelAdmin):
    list_display = ['email', 'name', 'is_active', 'subscribed_at']
    list_filter = ['is_active', 'subscribed_at']
    search_fields = ['email', 'name']
    list_editable = ['is_active']
    readonly_fields = ['subscribed_at', 'unsubscribed_at']
    date_hierarchy = 'subscribed_at'
    ordering = ['-subscribed_at']
    list_per_page = 50
    
    actions = ['activate_subscribers', 'deactivate_subscribers']
    
    def activate_subscribers(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, f'تم تفعيل {updated} مشترك.')
    activate_subscribers.short_description = 'تفعيل المشتركين المحددين'
    
    def deactivate_subscribers(self, request, queryset):
        updated = queryset.update(is_active=False, unsubscribed_at=timezone.now())
        self.message_user(request, f'تم إلغاء تفعيل {updated} مشترك.')
    deactivate_subscribers.short_description = 'إلغاء تفعيل المشتركين المحددين'
