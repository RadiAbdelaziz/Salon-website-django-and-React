import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  Calendar, 
  Clock, 
  Star, 
  Gift, 
  Percent, 
  DollarSign, 
  Package,
  CheckCircle,
  ArrowRight,
  Share2,
  Heart
} from 'lucide-react';

const OfferDetailModal = ({ 
  offer, 
  isOpen, 
  onClose, 
  onBookNow,
  onAddToCart 
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [offerDetails, setOfferDetails] = useState(null);

  // Fetch detailed offer data when modal opens
  useEffect(() => {
    if (isOpen && offer?.id) {
      fetchOfferDetails(offer.id);
    }
  }, [isOpen, offer?.id]);

  const fetchOfferDetails = async (offerId) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8000/api/offers/${offerId}/`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch offer details');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setOfferDetails(data.offer);
      } else {
        throw new Error(data.error || 'Failed to fetch offer details');
      }
    } catch (error) {
      console.error('Error fetching offer details:', error);
      // Use the basic offer data if API fails
      setOfferDetails(offer);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: offer?.title || offerDetails?.title,
        text: offer?.short_description || offerDetails?.short_description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('تم نسخ الرابط');
    }
  };

  const handleBookNow = () => {
    if (onBookNow) {
      // Create a service object from the offer that will be passed as selectedService
      const currentOffer = offerDetails || offer;
      const offerService = {
        id: `offer-${currentOffer.id}`,
        name: currentOffer.title,
        description: currentOffer.description || currentOffer.short_description,
        price: currentOffer.offer_price || currentOffer.original_price,
        basePrice: currentOffer.offer_price || currentOffer.original_price,
        duration: '60', // Default duration for offers
        image: currentOffer.image 
          ? (currentOffer.image.startsWith('http') ? currentOffer.image : `http://localhost:8000${currentOffer.image}`)
          : currentOffer.thumbnail 
            ? (currentOffer.thumbnail.startsWith('http') ? currentOffer.thumbnail : `http://localhost:8000${currentOffer.thumbnail}`)
            : 'http://localhost:8000/api/placeholder/60/60/',
        category_id: currentOffer.categories?.[0]?.id || 1,
        // Mark as offer service
        isOfferService: true,
        isOfferBooking: true,
        offerId: currentOffer.id,
        originalPrice: currentOffer.original_price,
        discountValue: currentOffer.discount_value,
        discountDisplay: currentOffer.discount_display,
        // Include full offer data
        offerData: currentOffer
      };
      console.log('🎯 Passing offer service to booking (modal):', offerService);
      onBookNow(offerService);
    }
  };

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(offerDetails || offer);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 2
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getOfferTypeIcon = (offerType) => {
    switch (offerType) {
      case 'percentage':
        return <Percent className="w-5 h-5" />;
      case 'fixed_amount':
        return <DollarSign className="w-5 h-5" />;
      case 'package':
        return <Package className="w-5 h-5" />;
      case 'free':
        return <Gift className="w-5 h-5" />;
      default:
        return <Star className="w-5 h-5" />;
    }
  };

  const getOfferTypeText = (offerType) => {
    switch (offerType) {
      case 'percentage':
        return 'خصم نسبة مئوية';
      case 'fixed_amount':
        return 'خصم مبلغ ثابت';
      case 'package':
        return 'باقة خدمات';
      case 'free':
        return 'خدمة مجانية';
      default:
        return 'عرض خاص';
    }
  };

  if (!isOpen) return null;

  const currentOffer = offerDetails || offer;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getOfferTypeIcon(currentOffer?.offer_type)}
              <h2 className="text-2xl font-bold" style={{ color: 'var(--warm-brown)' }}>
                {currentOffer?.title}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsLiked(!isLiked)}
                className="p-2"
              >
                <Heart 
                  className={`w-5 h-5 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} 
                />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="p-2"
              >
                <Share2 className="w-5 h-5 text-gray-400" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="p-2"
              >
                <X className="w-5 h-5 text-gray-400" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto" style={{ borderColor: 'var(--glamour-gold)' }}></div>
              <p className="mt-2 text-sm" style={{ color: 'var(--warm-brown)' }}>جاري تحميل العرض...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Image Section */}
              <div className="space-y-4">
                <div className="relative">
                  <img
                    src={currentOffer?.image || currentOffer?.thumbnail || 'http://localhost:8000/api/placeholder/400/300/'}
                    alt={currentOffer?.title}
                    className="w-full h-80 object-cover rounded-xl"
                    onError={(e) => {
                      e.target.src = 'http://localhost:8000/api/placeholder/400/300/';
                    }}
                    onLoad={() => console.log('✅ Offer detail image loaded:', currentOffer?.image || currentOffer?.thumbnail)}
                  />
                  <div className="absolute top-4 right-4 flex flex-col gap-2">
                    {currentOffer?.is_featured && (
                      <Badge className="bg-yellow-500 text-white">
                        <Star className="w-3 h-3 mr-1" />
                        مميز
                      </Badge>
                    )}
                    {currentOffer?.is_new && (
                      <Badge className="bg-green-500 text-white">
                        جديد
                      </Badge>
                    )}
                    <Badge 
                      className="text-white font-bold text-lg px-3 py-2"
                      style={{ background: 'var(--glamour-gold)' }}
                    >
                      {currentOffer?.discount_display || `${currentOffer?.discount_value}%`}
                    </Badge>
                  </div>
                </div>

                {/* Offer Type */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      {getOfferTypeIcon(currentOffer?.offer_type)}
                      <span className="font-semibold" style={{ color: 'var(--warm-brown)' }}>
                        {getOfferTypeText(currentOffer?.offer_type)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {currentOffer?.short_description}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Details Section */}
              <div className="space-y-6">
                {/* Price Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5" style={{ color: 'var(--glamour-gold)' }} />
                      معلومات الأسعار
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {currentOffer?.original_price && currentOffer?.offer_price && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">السعر الأصلي:</span>
                        <span className="text-lg font-semibold line-through text-gray-400">
                          {formatPrice(currentOffer.original_price)}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">السعر بعد الخصم:</span>
                      <span className="text-2xl font-bold" style={{ color: 'var(--glamour-gold)' }}>
                        {formatPrice(currentOffer?.offer_price || currentOffer?.original_price)}
                      </span>
                    </div>
                    {currentOffer?.savings_amount && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">المبلغ الموفّر:</span>
                        <span className="text-lg font-semibold text-green-600">
                          {formatPrice(currentOffer.savings_amount)}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Validity Period */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" style={{ color: 'var(--glamour-gold)' }} />
                      فترة الصلاحية
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">من:</span>
                      <span className="font-semibold">
                        {formatDate(currentOffer?.valid_from)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">إلى:</span>
                      <span className="font-semibold">
                        {formatDate(currentOffer?.valid_until)}
                      </span>
                    </div>
                    <div className="mt-3 p-3 rounded-lg" style={{ background: 'var(--champagne-veil)' }}>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-semibold text-green-600">
                          {currentOffer?.is_valid ? 'العرض صالح الآن' : 'العرض منتهي الصلاحية'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Services Included */}
                {currentOffer?.services && currentOffer.services.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Package className="w-5 h-5" style={{ color: 'var(--glamour-gold)' }} />
                        الخدمات المشمولة
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {currentOffer.services.map((service) => (
                          <div key={service.id} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'var(--champagne-veil)' }}>
                            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                            <div className="flex-1">
                              <h4 className="font-semibold" style={{ color: 'var(--warm-brown)' }}>
                                {service.name}
                              </h4>
                              {service.description && (
                                <p className="text-sm text-gray-600 mt-1">
                                  {service.description}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-semibold" style={{ color: 'var(--glamour-gold)' }}>
                                {formatPrice(service.price)}
                              </div>
                              {service.duration && (
                                <div className="text-xs text-gray-500 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {service.duration} دقيقة
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Terms and Conditions */}
                {currentOffer?.terms_conditions && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5" style={{ color: 'var(--glamour-gold)' }} />
                        الشروط والأحكام
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-gray-600 whitespace-pre-line">
                        {currentOffer.terms_conditions}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button
                    onClick={handleBookNow}
                    className="flex-1 bg-glamour-gold hover:bg-glamour-gold-dark text-white font-semibold py-3"
                    disabled={!currentOffer?.is_valid}
                  >
                    احجز الآن
                    <ArrowRight className="w-4 h-4 mr-2" />
                  </Button>
                  <Button
                    onClick={handleAddToCart}
                    variant="outline"
                    className="flex-1 border-glamour-gold text-glamour-gold hover:bg-glamour-gold hover:text-white font-semibold py-3"
                    disabled={!currentOffer?.is_valid}
                  >
                    أضف للسلة
                  </Button>
                </div>

                {!currentOffer?.is_valid && (
                  <div className="text-center p-4 rounded-lg bg-red-50 border border-red-200">
                    <p className="text-red-600 font-semibold">
                      هذا العرض منتهي الصلاحية
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OfferDetailModal;
