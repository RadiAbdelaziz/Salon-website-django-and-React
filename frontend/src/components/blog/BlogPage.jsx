import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  Calendar,
  User,
  Clock,
  Tag,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
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
  Mail,
  ArrowRight,
  Sparkles,
  Crown,
  Award,
  Loader2
} from 'lucide-react';
import { blogAPI, transformers } from '../../services/api';

const BlogPage = ({ onBack, onBookingClick }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [bookmarkedPosts, setBookmarkedPosts] = useState(new Set());
  const [newsletterEmail, setNewsletterEmail] = useState('');

  // API state
  const [blogPosts, setBlogPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load blog data from API
  useEffect(() => {
    const loadBlogData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Load blog posts and categories in parallel
        const [postsData, categoriesData] = await Promise.all([
          blogAPI.getAllPosts(),
          blogAPI.getCategories()
        ]);
        
        // Transform the data
        const transformedPosts = transformers.transformBlogPosts(postsData);
        const transformedCategories = categoriesData.map(cat => ({
          id: cat.id,
          name: cat.name,
          name_en: cat.name_en || cat.name,
          color: cat.color || '#B89F67'
        }));
        
        setBlogPosts(transformedPosts);
        setCategories(['all', ...transformedCategories.map(cat => cat.name)]);
        
      } catch (err) {
        console.error('Error loading blog data:', err);
        setError('فشل في تحميل بيانات المدونة. يرجى المحاولة مرة أخرى.');
      } finally {
        setLoading(false);
      }
    };

    loadBlogData();
  }, []);

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredPosts = blogPosts.filter(post => post.featured);
  const trendingPosts = blogPosts.filter(post => post.trending);
  const regularPosts = blogPosts.filter(post => !post.featured);

  const handleLike = (postId) => {
    setLikedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const handleBookmark = (postId) => {
    setBookmarkedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (newsletterEmail) {
      try {
        await blogAPI.subscribeNewsletter({ email: newsletterEmail });
      alert('شكراً لك! تم الاشتراك في النشرة الإخبارية بنجاح');
      setNewsletterEmail('');
      } catch (err) {
        console.error('Error subscribing to newsletter:', err);
        alert('حدث خطأ في الاشتراك. يرجى المحاولة مرة أخرى.');
      }
    }
  };

  const handlePostClick = (post) => {
    navigate(`/blog/${post.slug}`);
  };

  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8e9d5] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#212121] mx-auto mb-4" />
          <p className="text-[#212121] text-lg">جاري تحميل المدونة...</p>
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
            onClick={() => window.location.reload()}
            className="bg-[#B89F67] hover:bg-[#A68B5B] text-white"
          >
            إعادة المحاولة
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8e9d5]">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-r from-[#B89F67] via-[#A68B5B] to-[#8B7355] text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#B89F67]/90 to-[#8B7355]/90"></div>
        
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#8B7355]/20 to-transparent rounded-full -translate-y-48 translate-x-48"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-[#A68B5B]/20 to-transparent rounded-full translate-y-32 -translate-x-32"></div>
        
        <div className="relative container mx-auto px-4 py-16">
          <div className="flex items-center justify-between mb-8">
            <Button
              onClick={onBack}
              variant="outline"
              className="flex items-center space-x-2 space-x-reverse bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>العودة للرئيسية</span>
            </Button>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Crown className="w-8 h-8 text-[#F5E6D3] mr-2" />
                <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-white to-[#F5E6D3] bg-clip-text text-transparent">
              مدونة الجمال
            </h1>
                <Sparkles className="w-8 h-8 text-[#F5E6D3] ml-2" />
              </div>
              <p className="text-[#F5E6D3] text-lg">اكتشفي أسرار الجمال والعناية مع خبرائنا</p>
            </div>
            
            <div className="w-24"></div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-8 max-w-4xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#B89F67]" />
              <input
                type="text"
                placeholder="ابحث في المقالات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-12 pl-4 py-4 border-0 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#B89F67]/50 bg-white/95 backdrop-blur-sm text-[#212121] placeholder-[#666666] shadow-lg"
              />
            </div>
            
            <div className="relative">
              <Filter className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#B89F67]" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pr-12 pl-4 py-4 border-0 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#B89F67]/50 appearance-none bg-white/95 backdrop-blur-sm text-[#212121] shadow-lg min-w-[200px]"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'جميع الفئات' : category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Main Content Area */}
          <div className="lg:col-span-3">
            
            {/* Featured Article */}
            {featuredPosts.length > 0 && (
              <div className="mb-12">
                <div className="flex items-center mb-6">
                  <Award className="w-6 h-6 text-[#B89F67] mr-2" />
                  <h2 className="text-2xl font-bold text-[#212121]">المقال المميز</h2>
                </div>
                
                <Card 
                  className="overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-500 group bg-white cursor-pointer"
                  onClick={() => handlePostClick(featuredPosts[0])}
                >
                  <div className="relative">
                    <img
                      src={featuredPosts[0].image}
                      alt={featuredPosts[0].title}
                      className="w-full h-96 object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    
                    <div className="absolute top-6 right-6 flex gap-2">
                      <Badge className="bg-[#B89F67] text-white px-4 py-2 text-sm font-semibold">
                        {featuredPosts[0].category}
                      </Badge>
                      {featuredPosts[0].trending && (
                        <Badge className="bg-red-500 text-white px-4 py-2 text-sm font-semibold flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" />
                          ترند
                        </Badge>
                      )}
                    </div>
                    
                    <div className="absolute bottom-6 left-6 right-6 text-white">
                      <h3 className="text-3xl font-bold mb-3 leading-tight">
                        {featuredPosts[0].title}
                      </h3>
                      <p className="text-lg mb-4 opacity-90 line-clamp-2">
                        {featuredPosts[0].excerpt}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <img
                              src={featuredPosts[0].authorImage}
                              alt={featuredPosts[0].author?.name || featuredPosts[0].author?.full_name || 'فريق Glammy'}
                              className="w-10 h-10 rounded-full border-2 border-white/30"
                            />
                            <div>
                              <p className="font-semibold">{featuredPosts[0].author?.name || featuredPosts[0].author?.full_name || 'فريق Glammy'}</p>
                              <p className="text-sm opacity-75">{new Date(featuredPosts[0].date).toLocaleDateString('ar-SA')}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1 text-sm">
                            <Eye className="w-4 h-4" />
                            <span>{formatNumber(featuredPosts[0].views)}</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            <Heart className="w-4 h-4" />
                            <span>{formatNumber(featuredPosts[0].likes)}</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            <MessageCircle className="w-4 h-4" />
                            <span>{featuredPosts[0].comments}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Trending Articles */}
            {trendingPosts.length > 0 && (
              <div className="mb-12">
                <div className="flex items-center mb-6">
                  <TrendingUp className="w-6 h-6 text-red-500 mr-2" />
                  <h2 className="text-2xl font-bold text-[#212121]">المقالات الرائجة</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {trendingPosts.slice(0, 4).map((post) => (
                    <Card 
                      key={post.id} 
                      className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group bg-white cursor-pointer"
                      onClick={() => handlePostClick(post)}
                    >
              <div className="relative">
                <img
                  src={post.image}
                  alt={post.title}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-4 right-4">
                          <Badge className="bg-red-500 text-white px-3 py-1 text-xs font-semibold flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            ترند
                          </Badge>
                        </div>
                      </div>
                      
                      <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-3">
                          <Badge className="bg-[#F5E6D3] text-[#212121] px-2 py-1 text-xs">
                            {post.category}
                          </Badge>
                          <span className="text-xs text-[#666666]">{post.readTime}</span>
                        </div>
                        
                        <h3 className="text-lg font-bold mb-3 text-[#212121] line-clamp-2">
                          {post.title}
                        </h3>
                        
                        <p className="text-[#666666] mb-4 line-clamp-2 text-sm">
                          {post.excerpt}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <img
                              src={post.authorImage}
                              alt={post.author?.name || post.author?.full_name || 'فريق Glammy'}
                              className="w-8 h-8 rounded-full"
                            />
                            <div>
                              <p className="text-sm font-semibold text-[#212121]">{post.author?.name || post.author?.full_name || 'فريق Glammy'}</p>
                              <p className="text-xs text-[#666666]">{new Date(post.date).toLocaleDateString('ar-SA')}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleLike(post.id);
                              }}
                              className={`flex items-center gap-1 text-sm transition-colors ${
                                likedPosts.has(post.id) ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
                              }`}
                            >
                              <Heart className={`w-4 h-4 ${likedPosts.has(post.id) ? 'fill-current' : ''}`} />
                              <span>{formatNumber(post.likes)}</span>
                            </button>
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleBookmark(post.id);
                              }}
                              className={`transition-colors ${
                                bookmarkedPosts.has(post.id) ? 'text-[#B89F67]' : 'text-[#666666] hover:text-[#B89F67]'
                              }`}
                            >
                              <Bookmark className={`w-4 h-4 ${bookmarkedPosts.has(post.id) ? 'fill-current' : ''}`} />
                            </button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Regular Articles */}
            <div className="mb-12">
              <div className="flex items-center mb-6">
                <Star className="w-6 h-6 text-[#B89F67] mr-2" />
                <h2 className="text-2xl font-bold text-[#212121]">جميع المقالات</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPosts.filter(post => !post.featured).map((post) => (
                  <Card 
                    key={post.id} 
                    className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group bg-white cursor-pointer"
                    onClick={() => handlePostClick(post)}
                  >
                    <div className="relative">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-[#B89F67] text-white px-3 py-1 text-xs font-semibold">
                          {post.category}
                        </Badge>
                      </div>
                    </div>
                    
                    <CardContent className="p-6">
                      <h3 className="text-lg font-bold mb-3 text-[#212121] line-clamp-2">
                        {post.title}
                      </h3>
                      
                      <p className="text-[#666666] mb-4 line-clamp-3 text-sm">
                        {post.excerpt}
                      </p>
                      
                      <div className="flex flex-wrap gap-1 mb-4">
                        {post.tags.slice(0, 2).map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 text-xs rounded-full bg-[#F5E6D3] text-[#212121]"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img
                            src={post.authorImage}
                            alt={post.author?.name || post.author?.full_name || 'فريق Glammy'}
                            className="w-8 h-8 rounded-full"
                          />
                          <div>
                            <p className="text-sm font-semibold text-[#212121]">{post.author?.name || post.author?.full_name || 'فريق Glammy'}</p>
                            <p className="text-xs text-[#666666]">{new Date(post.date).toLocaleDateString('ar-SA')}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-[#666666] flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {post.readTime}
                          </span>
                        </div>
                      </div>
              </CardContent>
            </Card>
          ))}
              </div>
        </div>

            {filteredPosts.length === 0 && (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-[#F5E6D3] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-12 h-12 text-[#666666]" />
                </div>
                <h3 className="text-xl font-semibold text-[#212121] mb-2">لم يتم العثور على مقالات</h3>
                <p className="text-[#666666]">جربي البحث بكلمات مختلفة أو اختر فئة أخرى</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-8">
              
              {/* Newsletter Subscription */}
              <Card className="p-6 bg-white border border-[#E5D5C8] shadow-lg rounded-xl">
                <div className="text-center">
                  <Mail className="w-12 h-12 text-[#B89F67] mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-[#212121] mb-2">اشترك في النشرة الإخبارية</h3>
                  <p className="text-sm text-[#666666] mb-4">احصلي على أحدث نصائح الجمال والعناية</p>
                  
                  <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                    <input
                      type="email"
                      placeholder="بريدك الإلكتروني"
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      className="w-full px-4 py-3 border border-[#E5D5C8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B89F67] text-sm text-[#212121] placeholder-[#666666]"
                      required
                    />
                    <Button
                      type="submit"
                      className="w-full bg-[#B89F67] hover:bg-[#A68B5B] text-white py-3 rounded-lg font-semibold"
                    >
                      اشتراك
                    </Button>
                  </form>
                </div>
              </Card>

              {/* Popular Categories */}
              <Card className="p-6 bg-white shadow-lg rounded-xl">
                <h3 className="text-lg font-bold text-[#212121] mb-4 flex items-center">
                  <Tag className="w-5 h-5 text-[#B89F67] mr-2" />
                  الفئات الشائعة
                </h3>
                <div className="space-y-2">
                  {categories.slice(1).map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`w-full text-right px-4 py-3 rounded-lg transition-colors ${
                        selectedCategory === category
                          ? 'bg-[#F5E6D3] text-[#212121] font-semibold'
                          : 'text-[#666666] hover:bg-[#F5E6D3]'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </Card>

              {/* Social Media */}
              <Card className="p-6 bg-white shadow-lg rounded-xl">
                <h3 className="text-lg font-bold text-[#212121] mb-4">تابعونا</h3>
                <div className="flex gap-3">
                  <a
                    href="#"
                    className="flex-1 bg-gradient-to-r from-pink-500 to-pink-600 text-white p-3 rounded-lg text-center hover:from-pink-600 hover:to-pink-700 transition-all"
                  >
                    <Instagram className="w-5 h-5 mx-auto" />
                  </a>
                  <a
                    href="#"
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-3 rounded-lg text-center hover:from-blue-700 hover:to-blue-800 transition-all"
                  >
                    <Facebook className="w-5 h-5 mx-auto" />
                  </a>
                  <a
                    href="#"
                    className="flex-1 bg-gradient-to-r from-sky-500 to-sky-600 text-white p-3 rounded-lg text-center hover:from-sky-600 hover:to-sky-700 transition-all"
                  >
                    <Twitter className="w-5 h-5 mx-auto" />
                  </a>
                </div>
              </Card>

              {/* Popular Tags */}
              <Card className="p-6 bg-white shadow-lg rounded-xl">
                <h3 className="text-lg font-bold text-[#212121] mb-4">العلامات الشائعة</h3>
                <div className="flex flex-wrap gap-2">
                  {['جمال', 'عناية', 'مكياج', 'شعر', 'بشرة', 'طبيعي', 'صيف', 'روتين'].map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-[#F5E6D3] text-[#212121] rounded-full text-sm hover:bg-[#B89F67] hover:text-white cursor-pointer transition-colors"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Pagination */}
      <div className="container mx-auto px-4 pb-12">
        <div className="flex justify-center items-center space-x-4 space-x-reverse">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center space-x-2 space-x-reverse border-[#E5D5C8] text-[#212121] hover:bg-[#F5E6D3]"
          >
            <ChevronRight className="w-4 h-4" />
            <span>السابق</span>
          </Button>
          
          <div className="flex space-x-2 space-x-reverse">
            {[1, 2, 3].map(page => (
              <Button
                key={page}
                variant={page === 1 ? "default" : "outline"}
                size="sm"
                className={`w-10 h-10 ${
                  page === 1 
                    ? 'bg-[#B89F67] hover:bg-[#A68B5B] text-white' 
                    : 'border-[#E5D5C8] text-[#212121] hover:bg-[#F5E6D3]'
                }`}
              >
                {page}
              </Button>
            ))}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            className="flex items-center space-x-2 space-x-reverse border-[#E5D5C8] text-[#212121] hover:bg-[#F5E6D3]"
          >
            <span>التالي</span>
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BlogPage;
