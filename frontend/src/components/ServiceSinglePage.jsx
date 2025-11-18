import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  ArrowRight, 
  Clock, 
  Star, 
  Share2,
  Heart,
  Gift,
  CheckCircle,
  Award,
  Sparkles
} from 'lucide-react';
import { getServiceById } from '../data/services';
import { useCart } from '../contexts/CartContext';

const ServiceSinglePage = ({ onBack, onBookingClick }) => {
  const [service, setService] = useState(null);
  const [favorite, setFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const { addToCart, isInCart } = useCart();

  useEffect(() => {
  const favs = JSON.parse(localStorage.getItem("favorites")) || [];
  const isFav = favs.some(f => f.id === serviceId);
  setFavorite(isFav);
}, [serviceId]);



  useEffect(() => {
    const loadService = async () => {
      try {
        setLoading(true);
        const serviceData = await getServiceById(serviceId);
        setService(serviceData);
      } catch (error) {
        console.error('Failed to load service:', error);
        navigate('/services');
      } finally {
        setLoading(false);
      }
    };

    if (serviceId) {
      loadService();
    }
  }, [serviceId, navigate]);

    // const [favorite, setFavorite] = useState(false);

// عند تحميل الخدمة، تحقق من إذا هي موجودة في المفضلة
useEffect(() => {
  if (!service) return;
  const favs = JSON.parse(localStorage.getItem("favorites")) || [];
  const isFav = favs.some(f => f.id === service.id);
  setFavorite(isFav);
}, [service]);

const toggleFavorite = () => {
  if (!service) return;

  let favs = JSON.parse(localStorage.getItem("favorites")) || [];
  const exists = favs.some(f => f.id === service.id);

  if (exists) {
    favs = favs.filter(f => f.id !== service.id);
  } else {
    favs.push(service);
  }

  localStorage.setItem("favorites", JSON.stringify(favs));
  setFavorite(!exists);
};

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: service?.name,
        text: service?.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('تم نسخ الرابط');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-salon-cream text-auto">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: 'var(--glamour-gold)' }}></div>
          <p className="mt-4" style={{ color: 'var(--warm-brown)' }}>جاري تحميل تفاصيل الخدمة...</p>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-salon-cream text-auto">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--warm-brown)' }}>الخدمة غير موجودة</h2>
          <Button onClick={() => navigate('/services')} style={{ background: 'var(--glamour-gold)', color: 'white' }}>
            العودة للخدمات
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-salon-cream text-warm-brown py-8 px-4 lg:px-0">
  <div className="max-w-6xl mx-auto space-y-8">

    {/* Navigation */}
    <div className="flex items-center justify-between">
      <Button
        onClick={() => navigate(-1)}
        variant="ghost"
        className="flex items-center space-x-2 space-x-reverse text-sm font-medium text-warm-brown hover:opacity-80"
      >
        <ArrowRight className="w-4 h-4 rotate-180" />
        <span>رجوع</span>
      </Button>
      <div className="flex items-center space-x-2 space-x-reverse">
         <Button variant="outline" className="rounded-full p-2" onClick={toggleFavorite}>
             <Heart className={favorite ? "fill-red-500 text-red-500" : "text-gray-500"} />
          </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleShare}
          className="p-2"
        >
          <Share2 className="w-5 h-5 text-gray-500" />
        </Button>
      </div>
    </div>

    {/* Main Content */}
    <div className="grid lg:grid-cols-2 gap-12">

      {/* Left Column - Image + Features */}
      <div className="space-y-6">
        <img
          src={service.image || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&h=400&fit=crop&auto=format&q=80'}
          alt={service.name}
          className="w-full h-96 object-cover rounded-3xl shadow-2xl"
        />
        {service.is_featured && (
          <Badge 
            className="px-3 py-1 text-white font-semibold"
            style={{ backgroundColor: 'var(--glamour-gold)' }}
          >
            <Award className="w-4 h-4 ml-1" />
            خدمة مميزة
          </Badge>
        )}

        {/* Service Features */}
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center" style={{ color: 'var(--warm-brown)' }}>
              <Sparkles className="w-5 h-5 ml-2" style={{ color: 'var(--glamour-gold)' }} />
              مميزات الخدمة
            </h3>
            <div className="space-y-3">
              {['خدمة في المنزل', 'أدوات معقمة', 'خبيرات محترفات', 'ضمان الجودة'].map((feature) => (
                <div key={feature} className="flex items-center space-x-3 space-x-reverse">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm" style={{ color: 'var(--warm-brown)' }}>{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column - Details */}
      <div className="space-y-8">
        <Badge style={{ backgroundColor: 'var(--champagne-veil)', color: 'var(--glamour-gold)' }}>
          {service.category_name}
        </Badge>

        <h1 className="text-4xl lg:text-5xl font-bold" style={{ color: 'var(--warm-brown)' }}>
          {service.name}
        </h1>

        <p className="text-lg leading-relaxed" style={{ color: 'var(--warm-brown)' }}>
          {service.description}
        </p>

        {/* Service Details Grid */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-white/60 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <Clock className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--glamour-gold)' }} />
              <p className="text-sm font-medium">المدة</p>
              <p className="text-lg font-bold" style={{ color: 'var(--glamour-gold)' }}>{service.duration}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/60 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <Star className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--glamour-gold)' }} />
              <p className="text-sm font-medium">التقييم</p>
              <p className="text-lg font-bold" style={{ color: 'var(--glamour-gold)' }}>4.9/5</p>
            </CardContent>
          </Card>
        </div>

        {/* Price Section */}
        <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-2" style={{ borderColor: 'var(--glamour-gold)' }}>
          <CardContent className="p-6 text-center">
            <p className="text-sm font-medium mb-2">سعر الخدمة</p>
            <div className="text-4xl font-bold sar-symbol" style={{ color: 'var(--glamour-gold)' }}>
              {service.price_display || service.price_min}
            </div>
            {service.price_max && service.price_max !== service.price_min && (
              <p className="text-sm mt-2">يختلف السعر حسب طول الشعر ونوع العلاج</p>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Button
            onClick={() => onBookingClick(service)}
            className="w-full py-4 text-lg font-bold rounded-2xl text-white"
            style={{
              background: 'linear-gradient(135deg, var(--glamour-gold), var(--glamour-gold-dark))'
            }}
          >
            <Gift className="w-6 h-6 ml-2" /> احجزي الآن
          </Button>

          <Button
            className="w-full py-3 text-base font-bold rounded-xl bg-black text-white"
            onClick={() => { addToCart(service, 1); navigate('/checkout'); }}
          >
            {isInCart(service.id) ? 'في السلة - اذهب إلى السلة' : 'إضافة إلى السلة'}
          </Button>

          <Button
            variant="outline"
            className="w-full py-3 text-base font-bold rounded-xl border-black text-black bg-white"
            onClick={() => navigate('/services')}
          >
            مواصلة التسوق
          </Button>
        </div>
      </div>
    </div>

    {/* Related Services */}
    <div className="mt-16 text-center">
      <h3 className="text-2xl font-bold mb-8">خدمات مشابهة</h3>
      <Button
        onClick={() => navigate('/services')}
        variant="outline"
        className="px-8 py-3 rounded-full font-semibold border-glamour-gold text-glamour-gold"
      >
        عرض جميع الخدمات
      </Button>
    </div>

  </div>
</div>

  );
};

export default ServiceSinglePage;