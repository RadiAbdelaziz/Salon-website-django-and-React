import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import OfferDetailModal from './OfferDetailModal';
import { useNavigate } from "react-router-dom";

import { 
  Calendar, 
  Clock, 
  Tag, 
  Star, 
  ArrowRight, 
  Filter,
  Sparkles,
  Gift,
  Percent,
  DollarSign,
  Package,
  Zap,
  Eye
} from 'lucide-react';
const OffersPage = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredOffers, setFilteredOffers] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Fetch offers from API
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        setLoading(true);
         const response = await fetch('http://localhost:8000/api/offers/');
        
        if (!response.ok) {
          throw new Error('Failed to fetch offers');
        }
        
        const data = await response.json();
        
         if (data.success) {
           console.log('✅ API Data received:', data.offers);
           setOffers(data.offers);
           setFilteredOffers(data.offers);
         } else {
           throw new Error(data.error || 'Failed to fetch offers');
         }
      } catch (error) {
        console.error('Error fetching offers:', error);
        setError(error.message);
        // Set fallback offers for demo
        setOffers(getFallbackOffers());
        setFilteredOffers(getFallbackOffers());
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, []);

  // Handler functions
  // const handleOfferClick = (offer) => {
  //   console.log("clicked radi" , offer)
  //   setSelectedOffer(offer);
  //   setIsDetailModalOpen(true);
  // };
  const navigate = useNavigate();

const handleOfferClick = (offerId) => {
  navigate(`/offers/${offerId}`);
};

  const handleCloseModal = () => {
    setIsDetailModalOpen(false);
    setSelectedOffer(null);
  };

  const handleBookFromModal = (offer) => {
    handleCloseModal();
    if (onBookingClick) {
      // Create a service object from the offer that will be passed as selectedService
      const offerService = {
        id: `offer-${offer.id}`,
        name: offer.title,
        description: offer.description || offer.short_description,
        price: offer.offer_price || offer.original_price,
        basePrice: offer.offer_price || offer.original_price,
        duration: '60', // Default duration for offers
        image: offer.image 
          ? (offer.image.startsWith('http') ? offer.image : `http://localhost:8000${offer.image}`)
          : offer.thumbnail 
            ? (offer.thumbnail.startsWith('http') ? offer.thumbnail : `http://localhost:8000${offer.thumbnail}`)
            : 'http://localhost:8000/api/placeholder/60/60/',
        category_id: offer.categories?.[0]?.id || 1,
        // Mark as offer service
        isOfferService: true,
        isOfferBooking: true,
        offerId: offer.id,
        originalPrice: offer.original_price,
        discountValue: offer.discount_value,
        discountDisplay: offer.discount_display,
        // Include full offer data
        offerData: offer
      };
      console.log('🎯 Passing offer service to booking:', offerService);
      onBookingClick(offerService);
    }
  };

  const handleAddToCartFromModal = (offer) => {
    // Add to cart functionality can be implemented here
    console.log('Adding offer to cart:', offer);
    // You can integrate with your cart context here
  };

  // Filter offers based on active filter
  useEffect(() => {
    let filtered = offers;
    
    switch (activeFilter) {
      case 'featured':
        filtered = offers.filter(offer => offer.is_featured);
        break;
      case 'new':
        filtered = offers.filter(offer => offer.is_new);
        break;
      case 'percentage':
        filtered = offers.filter(offer => offer.offer_type === 'percentage');
        break;
      case 'fixed':
        filtered = offers.filter(offer => offer.offer_type === 'fixed');
        break;
      case 'package':
        filtered = offers.filter(offer => offer.offer_type === 'package');
        break;
      case 'free':
        filtered = offers.filter(offer => offer.offer_type === 'free_service');
        break;
      default:
        filtered = offers;
    }
    
    setFilteredOffers(filtered);
  }, [offers, activeFilter]);

   // Fallback offers for demo purposes
   const getFallbackOffers = () => [
     {
       id: 1,
       title: 'عرض العروس الكامل',
       short_description: 'بكج شامل للعروس مع خصم 30% على جميع الخدمات',
       offer_type: 'percentage',
       discount_value: 30,
       original_price: 1500,
       offer_price: 1050,
       image: 'http://localhost:8000/Artboard 1.png',
       valid_from: new Date().toISOString(),
       valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
       is_featured: true,
       is_new: true,
       is_valid: true,
       card_color: '#B89F67',
       text_color: '#8B4513'
     },
     {
       id: 2,
       title: 'خصم 50 ريال على المكياج',
       short_description: 'خصم فوري على جميع خدمات المكياج والتجميل',
       offer_type: 'fixed',
       discount_value: 50,
       original_price: 200,
       offer_price: 150,
       image: 'http://localhost:8000/Artboard 2.png',
       valid_from: new Date().toISOString(),
       valid_until: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
       is_featured: false,
       is_new: true,
       is_valid: true,
       card_color: '#B89F67',
       text_color: '#8B4513'
     },
     {
       id: 3,
       title: 'بكج العناية الشاملة',
       short_description: 'خدمات متكاملة للعناية بالبشرة والشعر والأظافر',
       offer_type: 'package',
       discount_value: null,
       original_price: 800,
       offer_price: 600,
       image: 'http://localhost:8000/Artboard 3.png',
       valid_from: new Date().toISOString(),
       valid_until: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
       is_featured: true,
       is_new: false,
       is_valid: true,
       card_color: '#B89F67',
       text_color: '#8B4513'
     }
   ];

  const getOfferIcon = (offerType) => {
    switch (offerType) {
      case 'percentage':
        return <Percent className="w-5 h-5" />;
      case 'fixed':
        return <DollarSign className="w-5 h-5" />;
      case 'package':
        return <Package className="w-5 h-5" />;
      case 'free_service':
        return <Gift className="w-5 h-5" />;
      default:
        return <Tag className="w-5 h-5" />;
    }
  };
  const getOfferBadgeColor = (offerType) => {
    switch (offerType) {
      case 'percentage':
        return 'bg-red-500 hover:bg-red-600';
      case 'fixed':
        return 'bg-green-500 hover:bg-green-600';
      case 'package':
        return 'bg-purple-500 hover:bg-purple-600';
      case 'free_service':
        return 'bg-orange-500 hover:bg-orange-600';
      default:
        return 'bg-blue-500 hover:bg-blue-600';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDaysRemaining = (validUntil) => {
    const now = new Date();
    const endDate = new Date(validUntil);
    const diffTime = endDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const filters = [
    { key: 'all', label: 'جميع العروض', icon: <Tag className="w-4 h-4" /> },
    { key: 'featured', label: 'مميزة', icon: <Star className="w-4 h-4" /> },
    { key: 'new', label: 'جديدة', icon: <Sparkles className="w-4 h-4" /> },
    { key: 'percentage', label: 'نسبة مئوية', icon: <Percent className="w-4 h-4" /> },
    { key: 'fixed', label: 'مبلغ ثابت', icon: <DollarSign className="w-4 h-4" /> },
    { key: 'package', label: 'بكجات', icon: <Package className="w-4 h-4" /> },
    { key: 'free', label: 'مجانية', icon: <Gift className="w-4 h-4" /> }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-salon-cream to-white py-12">
        <div className="container mx-auto px-4">
          {/* Header Skeleton */}
          <div className="text-center mb-12">
            <Skeleton className="h-12 w-96 mx-auto mb-4" />
            <Skeleton className="h-6 w-64 mx-auto" />
          </div>
          
          {/* Filters Skeleton */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-10 w-24" />
            ))}
          </div>
        </div>
      </div>
    );
  }
    
  return (
    <div>
   
{isDetailModalOpen && (
  <OfferDetailModal
    offer={{ title: "Test" }}
    onClose={() => setIsDetailModalOpen(false)}
  />
)}

        <div className="bg-gradient-to-br from-salon-cream to-white py-12">
   
                <div className="container mx-auto px-4">
                    {/* Header Section */}
                    <div className="text-center mb-12">
                        <div className="flex items-center justify-center mb-4">
                            <Sparkles className="w-8 h-8 text-glamour-gold mr-3" />
                            {/* Main Title */}
                            <h1 className="text-4xl lg:text-5xl md:text-3xl sm:text-1xl font-bold text-warm-brown">
                            العروض والترقيات
                            </h1>
                            <Sparkles className="w-8 h-8 text-glamour-gold ml-3" />
                        </div>    
                    </div>
                    <p className=" text-gray-600 max-w-2xl mx-auto md:text-2xl text-center ">
                    اكتشفي أحدث العروض والترقيات الحصرية في صالون Glammy. استفيدي من أفضل الأسعار والخدمات المميزة
                    </p>
                </div>
        </div> 

         {/* Offers Grid */}
        {filteredOffers.length > 0 ? (
          <div className="flex flex-wrap justify-center gap-8">
            {filteredOffers.map((offer) => {
              const daysRemaining = getDaysRemaining(offer.valid_until);
              const savingsAmount = offer.original_price && offer.offer_price 
                ? offer.original_price - offer.offer_price 
                : null;
              const savingsPercentage = offer.original_price && offer.offer_price
                ? Math.round(((offer.original_price - offer.offer_price) / offer.original_price) * 100)
                : null;

              // Get gradient colors based on offer type or custom colors
              const getGradientColors = (offerType, cardColor) => {
                if (cardColor && cardColor !== '#B89F67') {
                  // Use custom color from admin
                  return `linear-gradient(135deg, ${cardColor} 0%, ${adjustColorBrightness(cardColor, -20)} 100%)`;
                }
                
                // Fallback to default colors based on offer type
                switch (offerType) {
                  case 'percentage':
                    return 'linear-gradient(135deg, rgb(255, 99, 99) 0%, rgb(255, 159, 64) 100%)';
                  case 'fixed':
                    return 'linear-gradient(135deg, rgb(34, 197, 94) 0%, rgb(16, 185, 129) 100%)';
                  case 'package':
                    return 'linear-gradient(135deg, rgb(168, 85, 247) 0%, rgb(147, 51, 234) 100%)';
                  case 'free_service':
                    return 'linear-gradient(135deg, rgb(251, 191, 36) 0%, rgb(245, 158, 11) 100%)';
                  default:
                    return 'linear-gradient(135deg, rgb(59, 130, 246) 0%, rgb(37, 99, 235) 100%)';
                }
              };

              const getTextColor = (offerType, textColor) => {
                if (textColor && textColor !== '#8B4513') {
                  // Use custom text color from admin
                  return textColor;
                }
                
                // Fallback to default colors based on offer type
                switch (offerType) {
                  case 'percentage':
                    return '#dc2626';
                  case 'fixed':
                    return '#059669';
                  case 'package':
                    return '#7c3aed';
                  case 'free_service':
                    return '#d97706';
                  default:
                    return '#2563eb';
                }
              };

              // Helper function to adjust color brightness
            //   const adjustColorBrightness = (hex, percent) => {
            //     const num = parseInt(hex.replace("#", ""), 16);
            //     const amt = Math.round(2.55 * percent);
            //     const R = (num >> 16) + amt;
            //     const G = (num >> 8 & 0x00FF) + amt;
            //     const B = (num & 0x0000FF) + amt;
            //     return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            //       (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            //       (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
            //   };

               return (
               <div
               style={{margin : '0 10px 10px'}}
                key={offer.id}
                onClick={() => handleOfferClick(offer.id)}
                className="w-[760px] h-[260px] relative rounded-xl overflow-hidden shadow-lg cursor-pointer"
>

  {/* الشارة الحمراء (عرض لفترة محدودة) */}
  {/* <div className="absolute top-3 right-3 bg-red-600 text-white px-4 py-1 rounded-md text-sm font-bold z-20">
    عرض لفترة محدودة
  </div> */}

  {/* الصورة */}
  <img
    src={
      offer.image
        ? (offer.image.startsWith("http")
            ? offer.image
            : `http://localhost:8000${offer.image}`)
        : "http://localhost:8000/api/placeholder/240/160/"
    }
    alt={offer.title}
    className="absolute inset-0 w-full h-full object-cover"
  />

  {/* التدرج الداكن فوق الصورة */}
  <div className="absolute inset-0 bg-gradient-to-l from-black/70 via-black/40 to-transparent pointer-events-none"></div>

  {/* المحتوى النصي */}
  <div className="absolute right-0 top-0 h-full flex flex-col justify-center px-8 text-white z-20 text-right pointer-events-none">

    <h2 className="text-3xl font-bold mb-2 leading-snug">
      {offer.title}
    </h2>

    <p className="text-lg opacity-90 mb-4">
      {offer.short_description}
    </p>

    <div className="flex items-center gap-4 text-4xl font-bold">
      <span className="text-[#f5e4c3]">{offer.offer_price} ر.س</span>
      {offer.original_price && (
        <span className="text-red-300 line-through text-xl">
          {offer.original_price}
        </span>
      )}
    </div>

    {offer.discount_value && (
      <span className="mt-3 bg-yellow-500 text-black px-3 py-1 rounded-md w-fit font-bold">
        خصم {offer.discount_value}
        {offer.offer_type === "percentage" ? "%" : " ر.س"}
      </span>
    )}
  </div>

</div>


      
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎁</div>
            <h3 className="text-2xl font-bold text-warm-brown mb-2">
              لا توجد عروض متاحة حالياً
            </h3>
            <p className="text-gray-600 mb-6">
              تحققي من العروض الجديدة قريباً أو تصفحي خدماتنا المميزة
            </p>
            <Button 
              onClick={() => onNavigate('services')}
              className="bg-glamour-gold hover:bg-glamour-gold-dark text-white"
            >
              تصفح الخدمات
            </Button>
          </div>
        )}
        
{isDetailModalOpen && selectedOffer && (
  <OfferDetailModal
    offer={selectedOffer}
    onClose={handleCloseModal}
    onBook={handleBookFromModal}
    onAddToCart={handleAddToCartFromModal}
  />
)}

    </div>
  )
}

export default OffersPage
