import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  Calendar,
  User,
  Clock,
  Tag,
  Heart,
  Share2,
  Bookmark,
  TrendingUp,
  Star,
  Eye,
  MessageCircle,
  Instagram,
  Facebook,
  Twitter,
  Loader2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { blogAPI, transformers } from '../../services/api';

const BlogPostDetail = ({ onBack, onBookingClick }) => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    const loadBlogPost = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Load the specific blog post
        const postData = await blogAPI.getPostBySlug(slug);
        const transformedPost = transformers.transformBlogPosts([postData])[0];
        setPost(transformedPost);
        
        // Load related posts from the same category
        if (transformedPost.category && transformedPost.category.id) {
          try {
            const relatedData = await blogAPI.getAllPosts({ category: transformedPost.category.id });
            const transformedRelated = transformers.transformBlogPosts(relatedData);
            // Filter out the current post and limit to 3
            const filteredRelated = transformedRelated
              .filter(p => p.id !== transformedPost.id)
              .slice(0, 3);
            setRelatedPosts(filteredRelated);
          } catch (err) {
            console.warn('Could not load related posts:', err);
            setRelatedPosts([]);
          }
        } else {
          // If no category, load recent posts instead
          try {
            const recentData = await blogAPI.getAllPosts();
            const transformedRecent = transformers.transformBlogPosts(recentData);
            // Filter out the current post and limit to 3
            const filteredRecent = transformedRecent
              .filter(p => p.id !== transformedPost.id)
              .slice(0, 3);
            setRelatedPosts(filteredRecent);
          } catch (err) {
            console.warn('Could not load recent posts:', err);
            setRelatedPosts([]);
          }
        }
        
      } catch (err) {
        console.error('Error loading blog post:', err);
        setError('فشل في تحميل المقال. يرجى المحاولة مرة أخرى.');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      loadBlogPost();
    }
  }, [slug]);

  const handleLike = async () => {
    if (post) {
      try {
        await blogAPI.likePost(post.id);
        setLiked(!liked);
        // Update the post's like count
        setPost(prev => ({
          ...prev,
          likes: liked ? prev.likes - 1 : prev.likes + 1
        }));
      } catch (err) {
        console.error('Error liking post:', err);
      }
    }
  };

  const handleBookmark = () => {
    setBookmarked(!bookmarked);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.excerpt,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('تم نسخ الرابط إلى الحافظة');
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8e9d5] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#212121] mx-auto mb-4" />
          <p className="text-[#212121] text-lg">جاري تحميل المقال...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#f8e9d5] flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-500 text-4xl">⚠️</span>
          </div>
          <h3 className="text-xl font-semibold text-[#212121] mb-2">حدث خطأ</h3>
          <p className="text-[#212121] mb-4">{error}</p>
          <Button
            onClick={() => navigate('/blog')}
            className="bg-[#B89F67] hover:bg-[#A68B5B] text-white"
          >
            العودة للمدونة
          </Button>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[#f8e9d5] flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-[#212121] mb-2">المقال غير موجود</h3>
          <p className="text-[#212121] mb-4">المقال المطلوب غير موجود أو تم حذفه</p>
          <Button
            onClick={() => navigate('/blog')}
            className="bg-[#B89F67] hover:bg-[#A68B5B] text-white"
          >
            العودة للمدونة
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8e9d5]">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-[#B89F67] via-[#A68B5B] to-[#8B7355] text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#B89F67]/90 to-[#8B7355]/90"></div>
        
        <div className="relative container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <Button
              onClick={() => navigate('/blog')}
              variant="outline"
              className="flex items-center space-x-2 space-x-reverse bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>العودة للمدونة</span>
            </Button>
            
            <div className="flex items-center gap-4">
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  liked ? 'bg-red-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
                <span>{formatNumber(post.likes)}</span>
              </button>
              
              <button
                onClick={handleBookmark}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  bookmarked ? 'bg-[#B89F67] text-white' : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-current' : ''}`} />
              </button>
              
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                <span>مشاركة</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Main Article Content */}
          <div className="lg:col-span-3">
            <Card className="bg-white shadow-lg rounded-xl overflow-hidden">
              {/* Featured Image */}
              {post.featured_image && (
                <div className="relative">
                  <img
                    src={post.featured_image}
                    alt={post.featured_image_alt || post.title}
                    className="w-full h-96 object-cover"
                  />
                  <div className="absolute top-6 right-6 flex gap-2">
                    <Badge className="bg-[#B89F67] text-white px-4 py-2 text-sm font-semibold">
                      {post.category?.name}
                    </Badge>
                    {post.is_trending && (
                      <Badge className="bg-red-500 text-white px-4 py-2 text-sm font-semibold flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" />
                        ترند
                      </Badge>
                    )}
                    {post.is_featured && (
                      <Badge className="bg-[#8B7355] text-white px-4 py-2 text-sm font-semibold flex items-center gap-1">
                        <Star className="w-4 h-4" />
                        مميز
                      </Badge>
                    )}
                  </div>
                </div>
              )}
              
              <CardContent className="p-8">
                {/* Article Meta */}
                <div className="flex items-center gap-4 mb-6 text-[#666666] text-sm">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>{post.author?.name || post.author?.full_name || 'فريق Glammy'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(post.published_at || post.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{post.read_time} دقائق</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    <span>{formatNumber(post.views)} مشاهدة</span>
                  </div>
                </div>
                
                {/* Article Title */}
                <h1 className="text-4xl font-bold text-[#212121] mb-6 leading-tight">
                  {post.title}
                </h1>
                
                {/* Article Excerpt */}
                <div className="text-xl text-[#666666] mb-8 leading-relaxed border-r-4 border-[#B89F67] pr-6">
                  {post.excerpt}
                </div>
                
                {/* Article Content */}
                <div className="prose prose-lg max-w-none text-[#212121] leading-relaxed">
                  {post.content.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-6">
                      {paragraph}
                    </p>
                  ))}
                </div>
                
                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="mt-8 pt-8 border-t border-[#E5D5C8]">
                    <div className="flex items-center gap-2 mb-4">
                      <Tag className="w-5 h-5 text-[#B89F67]" />
                      <span className="font-semibold text-[#212121]">العلامات:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-[#F5E6D3] text-[#212121] rounded-full text-sm hover:bg-[#B89F67] hover:text-white cursor-pointer transition-colors"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <div className="mt-12">
                <h2 className="text-2xl font-bold text-[#212121] mb-6">مقالات ذات صلة</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {relatedPosts.map((relatedPost) => (
                    <Card 
                      key={relatedPost.id} 
                      className="bg-white shadow-lg rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer"
                      onClick={() => navigate(`/blog/${relatedPost.slug}`)}
                    >
                      <div className="relative">
                        <img
                          src={relatedPost.featured_image || relatedPost.image}
                          alt={relatedPost.title}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-4 right-4">
                          <Badge className="bg-[#B89F67] text-white px-3 py-1 text-xs font-semibold">
                            {relatedPost.category?.name}
                          </Badge>
                        </div>
                      </div>
                      
                      <CardContent className="p-6">
                        <h3 className="text-lg font-bold mb-3 text-[#212121] line-clamp-2">
                          {relatedPost.title}
                        </h3>
                        
                        <p className="text-[#666666] mb-4 line-clamp-3 text-sm">
                          {relatedPost.excerpt}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <img
                              src={relatedPost.author?.profile_image || relatedPost.authorImage}
                              alt={relatedPost.author?.name || relatedPost.author?.full_name}
                              className="w-8 h-8 rounded-full"
                            />
                            <div>
                              <p className="text-sm font-semibold text-[#212121]">
                                {relatedPost.author?.name || relatedPost.author?.full_name || 'فريق Glammy'}
                              </p>
                              <p className="text-xs text-[#666666]">
                                {formatDate(relatedPost.published_at || relatedPost.created_at)}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-[#666666] flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {relatedPost.read_time} دقائق
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-8">
              
              {/* Author Info */}
              <Card className="p-6 bg-white shadow-lg rounded-xl">
                <div className="text-center">
                  <img
                    src={post.author?.profile_image || 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&auto=format&q=80'}
                    alt={post.author?.name || post.author?.full_name}
                    className="w-20 h-20 rounded-full mx-auto mb-4 border-4 border-[#F5E6D3]"
                  />
                  <h3 className="text-lg font-bold text-[#212121] mb-2">
                    {post.author?.name || post.author?.full_name || 'فريق Glammy'}
                  </h3>
                  <p className="text-sm text-[#666666] mb-4">
                    {post.author?.bio || 'فريق متخصص في الجمال والعناية الشخصية'}
                  </p>
                  
                  {/* Social Links */}
                  <div className="flex gap-3 justify-center">
                    {post.author?.social_instagram && (
                      <a
                        href={post.author.social_instagram}
                        className="w-10 h-10 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-full flex items-center justify-center hover:from-pink-600 hover:to-pink-700 transition-all"
                      >
                        <Instagram className="w-5 h-5" />
                      </a>
                    )}
                    {post.author?.social_facebook && (
                      <a
                        href={post.author.social_facebook}
                        className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full flex items-center justify-center hover:from-blue-700 hover:to-blue-800 transition-all"
                      >
                        <Facebook className="w-5 h-5" />
                      </a>
                    )}
                    {post.author?.social_twitter && (
                      <a
                        href={post.author.social_twitter}
                        className="w-10 h-10 bg-gradient-to-r from-sky-500 to-sky-600 text-white rounded-full flex items-center justify-center hover:from-sky-600 hover:to-sky-700 transition-all"
                      >
                        <Twitter className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                </div>
              </Card>

              {/* Article Stats */}
              <Card className="p-6 bg-white shadow-lg rounded-xl">
                <h3 className="text-lg font-bold text-[#212121] mb-4">إحصائيات المقال</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[#666666]">المشاهدات</span>
                    <span className="font-semibold text-[#212121]">{formatNumber(post.views)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#666666]">الإعجابات</span>
                    <span className="font-semibold text-[#212121]">{formatNumber(post.likes)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#666666]">التعليقات</span>
                    <span className="font-semibold text-[#212121]">{post.comments_count}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#666666]">وقت القراءة</span>
                    <span className="font-semibold text-[#212121]">{post.read_time} دقائق</span>
                  </div>
                </div>
              </Card>

              {/* Call to Action */}
              <Card className="p-6 bg-gradient-to-br from-[#B89F67] to-[#A68B5B] text-white shadow-lg rounded-xl">
                <div className="text-center">
                  <h3 className="text-lg font-bold mb-2">احجزي موعدك الآن</h3>
                  <p className="text-sm mb-4 opacity-90">احصلي على أفضل خدمات الجمال والعناية</p>
                  <Button
                    onClick={onBookingClick}
                    className="w-full bg-white text-[#B89F67] hover:bg-[#F5E6D3] font-semibold"
                  >
                    احجز موعد
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPostDetail;
