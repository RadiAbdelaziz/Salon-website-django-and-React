import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import PremiumServiceCard from './ui/PremiumServiceCard';
import MobileServiceCard from './ui/MobileServiceCard';
import { useCart } from '../contexts/CartContext';
import { 
  ArrowLeft,
  Clock,
  Star,
  Heart,
  Bookmark,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Sparkles,
  Crown,
  Award,
  Loader2
} from 'lucide-react';
import { serviceCategoriesAPI, servicesAPI } from '../services/api';
import '../styles/premium-cards.css';

const SITE_MAIN_COLOR = '#9A8861';
const SITE_MAIN_COLOR_LIGHT = '#F5E6D3'; // يمكنك تعديل الفاتح إذا أحببت
const SITE_TEXT_COLOR = '#212121';
const SITE_CARD_COLOR = '#ffffff';
const SITE_BUTTON_HOVER = '#81724F'; // درجة أغمق قليلًا عند المرور

const CATEGORY_THEMES = {
  skincare: {
    background: '#f8e9d5',
    text: SITE_TEXT_COLOR,
    card: SITE_CARD_COLOR,
    accent: SITE_MAIN_COLOR,
    accentLight: SITE_MAIN_COLOR_LIGHT,
    button: SITE_MAIN_COLOR,
    buttonHover: SITE_BUTTON_HOVER,
  },
  makeup: {
    background: '#fff0f5',
    text: SITE_TEXT_COLOR,
    card: SITE_CARD_COLOR,
    accent: SITE_MAIN_COLOR,
    accentLight: SITE_MAIN_COLOR_LIGHT,
    button: SITE_MAIN_COLOR,
    buttonHover: SITE_BUTTON_HOVER,
  },
  'hair-care': {
    background: '#f0f8ff',
    text: SITE_TEXT_COLOR,
    card: SITE_CARD_COLOR,
    accent: SITE_MAIN_COLOR,
    accentLight: SITE_MAIN_COLOR_LIGHT,
    button: SITE_MAIN_COLOR,
    buttonHover: SITE_BUTTON_HOVER,
  },
  'hair-dyeing': {
    background: '#f5f5dc',
    text: SITE_TEXT_COLOR,
    card: SITE_CARD_COLOR,
    accent: SITE_MAIN_COLOR,
    accentLight: SITE_MAIN_COLOR_LIGHT,
    button: SITE_MAIN_COLOR,
    buttonHover: SITE_BUTTON_HOVER,
  },
  'hair-treatment': {
    background: '#e6f3ff',
    text: SITE_TEXT_COLOR,
    card: SITE_CARD_COLOR,
    accent: SITE_MAIN_COLOR,
    accentLight: SITE_MAIN_COLOR_LIGHT,
    button: SITE_MAIN_COLOR,
    buttonHover: SITE_BUTTON_HOVER,
  },
  'hair-styling': {
    background: '#f9f9f9',
    text: SITE_TEXT_COLOR,
    card: SITE_CARD_COLOR,
    accent: SITE_MAIN_COLOR,
    accentLight: SITE_MAIN_COLOR_LIGHT,
    button: SITE_MAIN_COLOR,
    buttonHover: SITE_BUTTON_HOVER,
  },
  massage: {
    background: '#f0e6ff',
    text: SITE_TEXT_COLOR,
    card: SITE_CARD_COLOR,
    accent: SITE_MAIN_COLOR,
    accentLight: SITE_MAIN_COLOR_LIGHT,
    button: SITE_MAIN_COLOR,
    buttonHover: SITE_BUTTON_HOVER,
  },
  'nail-care': {
    background: '#fff8e1',
    text: SITE_TEXT_COLOR,
    card: SITE_CARD_COLOR,
    accent: SITE_MAIN_COLOR,
    accentLight: SITE_MAIN_COLOR_LIGHT,
    button: SITE_MAIN_COLOR,
    buttonHover: SITE_BUTTON_HOVER,
  },
  default: {
    background: '#f8e9d5',
    text: SITE_TEXT_COLOR,
    card: SITE_CARD_COLOR,
    accent: SITE_MAIN_COLOR,
    accentLight: SITE_MAIN_COLOR_LIGHT,
    button: SITE_MAIN_COLOR,
    buttonHover: SITE_BUTTON_HOVER,
  }
};


const CategoryServices = ({ onBack, onBookingClick }) => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart, toggleCart, isInCart } = useCart();
  const [category, setCategory] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [likedServices, setLikedServices] = useState(new Set());
  const [bookmarkedServices, setBookmarkedServices] = useState(new Set());

  // Get theme colors for the current category - use dynamic colors from category data
  const getThemeFromCategory = (categoryData) => {
    if (!categoryData) return CATEGORY_THEMES.default;
    
    const primaryColor = categoryData.primary_color || '#B89F67';
    const hoverColor = categoryData.primary_color ? 
      `${categoryData.primary_color}CC` : '#A68B5B';
    
    return {
      background: '#f8e9d5',
      text: '#212121',
      card: '#ffffff',
      accent: primaryColor,
      accentLight: `${primaryColor}1A`,
      button: primaryColor,
      buttonHover: hoverColor
    };
  };
  
  const theme = category ? getThemeFromCategory(category) : CATEGORY_THEMES.default;

  useEffect(() => {
    const loadCategoryData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load category data by slug
        try {
          const categoryData = await serviceCategoriesAPI.getBySlug(slug);

          if (!categoryData) {
            setError('الفئة غير موجودة');
            return;
          }

          setCategory(categoryData);
          setServices(categoryData.services || []);
        } catch (apiError) {
          console.error('API Error:', apiError);
          // Try alternative slug formats
          const alternativeSlugs = [
            slug.toLowerCase(),
            slug.replace(/\s+/g, '-'),
            slug.replace(/\s+/g, '_'),
            // Map Arabic names to English slugs
            slug === 'العناية-بالبشرة' ? 'skincare' : null,
            slug === 'المكياج' ? 'makeup' : null,
            slug === 'صبغ-الشعر' ? 'hair-coloring' : null,
            slug === 'علاج-الشعر' ? 'hair-treatment' : null,
            slug === 'تصفيف-الشعر' ? 'muaz' : null,
          ].filter(Boolean);
          
          for (const altSlug of alternativeSlugs) {
            if (altSlug !== slug) {
              try {
                const categoryData = await serviceCategoriesAPI.getBySlug(altSlug);
                if (categoryData) {
                  setCategory(categoryData);
                  setServices(categoryData.services || []);
                  return;
                }
              } catch (e) {
                continue;
              }
            }
          }
          
          throw apiError; // Re-throw if no alternative worked
        }

      } catch (err) {
        console.error('Error loading category data:', err);
        setError('فشل في تحميل بيانات الفئة. يرجى المحاولة مرة أخرى.');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      loadCategoryData();
    }
  }, [slug]);

  const handleLike = (serviceId) => {
    setLikedServices(prev => {
      const newSet = new Set(prev);
      if (newSet.has(serviceId)) {
        newSet.delete(serviceId);
      } else {
        newSet.add(serviceId);
      }
      return newSet;
    });
  };

  const handleBookmark = (serviceId) => {
    setBookmarkedServices(prev => {
      const newSet = new Set(prev);
      if (newSet.has(serviceId)) {
        newSet.delete(serviceId);
      } else {
        newSet.add(serviceId);
      }
      return newSet;
    });
  };

  // Event handlers for premium cards
  const handleBookNow = (service) => {
    onBookingClick(service);
  };

  const handleViewDetails = (service) => {
    navigate(`/service/${service.id}`);
  };

  const handleAddToCart = (service) => {
    toggleCart(service);
  };

  const handleToggleFavorite = (service) => {
    handleLike(service.id);
  };

  const checkIsInCart = (serviceId) => {
    return isInCart(serviceId);
  };

  const isFavorite = (serviceId) => {
    return likedServices.has(serviceId);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 2
    }).format(price);
  };

  const formatDuration = (duration) => {
    console.log('formatDuration called with:', duration);
    if (typeof duration === 'string') {
      return duration;
    }
    return `${duration}`; // Duration without دقيقة
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.background }}>
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: theme.accent }} />
          <p className="text-lg" style={{ color: theme.text }}>جاري تحميل الخدمات...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.background }}>
        <div className="text-center">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-500 text-4xl">⚠️</span>
          </div>
          <h3 className="text-xl font-semibold mb-2" style={{ color: theme.text }}>حدث خطأ</h3>
          <p className="mb-4" style={{ color: theme.text }}>{error}</p>
          <Button
            onClick={() => navigate('/home')}
            style={{ 
              backgroundColor: theme.button,
              color: 'white'
            }}
            className="hover:opacity-90"
          >
            العودة للرئيسية
          </Button>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.background }}>
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-2" style={{ color: theme.text }}>الفئة غير موجودة</h3>
          <p className="mb-4" style={{ color: theme.text }}>الفئة المطلوبة غير موجودة أو تم حذفها</p>
          <Button
            onClick={() => navigate('/home')}
            style={{ 
              backgroundColor: theme.button,
              color: 'white'
            }}
            className="hover:opacity-90"
          >
            العودة للرئيسية
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100" data-refresh={Date.now()}>
      {/* Header */}
      <div className="relative overflow-hidden" style={{ 
        background: `linear-gradient(135deg, ${theme.accent}, ${theme.buttonHover})`,
        color: 'white'
      }}>
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0" style={{ 
          background: `linear-gradient(135deg, ${theme.accent}/90, ${theme.buttonHover}/90)`
        }}></div>
        
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full -translate-y-48 translate-x-48 opacity-20" 
             style={{ background: `radial-gradient(circle, ${theme.accentLight}, transparent)` }}></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full translate-y-32 -translate-x-32 opacity-20"
             style={{ background: `radial-gradient(circle, ${theme.accentLight}, transparent)` }}></div>
        
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
                <Crown className="w-8 h-8 mr-2" style={{ color: theme.accentLight }} />
                <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-white to-transparent bg-clip-text text-transparent">
                  {category.name}
                </h1>
                <Sparkles className="w-8 h-8 ml-2" style={{ color: theme.accentLight }} />
              </div>
              <p className="text-lg opacity-90" style={{ color: theme.accentLight }}>
                {category.description || `اكتشفي أفضل خدمات ${category.name} مع خبرائنا`}
              </p>
            </div>
            
            <div className="w-24"></div>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="container mx-auto px-4 py-12 bg-white">
        {services.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center" 
                 style={{ backgroundColor: theme.accentLight }}>
              <Award className="w-12 h-12" style={{ color: theme.accent }} />
            </div>
            <h3 className="text-2xl font-bold mb-4" style={{ color: theme.text }}>
              لا توجد خدمات متاحة حالياً
            </h3>
            <p className="mb-8" style={{ color: theme.text }}>
              نعمل على إضافة المزيد من الخدمات لهذه الفئة قريباً
            </p>
            <Button
              onClick={() => navigate('/home')}
              style={{ 
                backgroundColor: theme.button,
                color: 'white'
              }}
              className="hover:opacity-90"
            >
              العودة للرئيسية
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center mb-8">
              <Star className="w-6 h-6 mr-2" style={{ color: '#B89F67' }} />
              <h2 className="text-2xl font-bold" style={{ color: '#2D2D2D' }}>
                خدمات {category.name}
              </h2>
            </div>
            
            {/* Desktop/Tablet View */}
            <div className="hidden sm:block">
              <div className="grid grid-cols-1  lg:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-4 gap-8 justify-items-center">
                {services.map((service) => (
                  <PremiumServiceCard
                    key={`${service.id}-${Date.now()}`}
                    service={service}
                    onBookNow={handleBookNow}
                    onViewDetails={handleViewDetails}
                    onAddToCart={handleAddToCart}
                    onToggleFavorite={handleToggleFavorite}
                    isInCart={checkIsInCart(service.id)}
                    isFavorite={isFavorite(service.id)}
                    category={category}
                  />
                ))}
              </div>
            </div>

            {/* Mobile View */}
            <div className="block sm:hidden">
              <div className="grid grid-cols-1 gap-6">
                {services.map((service) => (
                  <MobileServiceCard
                    key={`${service.id}-${Date.now()}`}
                    service={service}
                    onBookNow={handleBookNow}
                    onViewDetails={handleViewDetails}
                    onAddToCart={handleAddToCart}
                    onToggleFavorite={handleToggleFavorite}
                    isInCart={checkIsInCart(service.id)}
                    isFavorite={isFavorite(service.id)}
                    category={category}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Contact Section */}
      <div className="py-16" style={{ backgroundColor: theme.accentLight }}>
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold mb-4" style={{ color: theme.text }}>
            هل لديك أسئلة حول خدماتنا؟
          </h3>
          <p className="mb-8" style={{ color: theme.text, opacity: 0.8 }}>
            فريقنا متاح لمساعدتك في اختيار الخدمة المناسبة لك
          </p>
          
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Button
              variant="outline"
              className="flex items-center gap-2"
              style={{ 
                borderColor: theme.accent,
                color: theme.accent
              }}
            >
              <Phone className="w-4 h-4" />
              <span>اتصل بنا</span>
            </Button>
            
            <Button
              className="flex items-center gap-2"
              style={{ 
                backgroundColor: theme.button,
                color: 'white'
              }}
              onClick={() => navigate('/contact')}
            >
              <Mail className="w-4 h-4" />
              <span>تواصل معنا</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryServices;
