import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  CreditCard, 
  Wallet, 
  Gift,
  Plus,
  Minus,
  Trash2,
  Calendar,
  Clock,
  ArrowLeft,
  Check,
  ShoppingCart,
  User,
  ChevronDown
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import LocationPicker from '../components/LocationPicker';
import { apiRequestWithRetry, API_ENDPOINTS } from '../config/api';
import './CheckoutPage.css';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems, clearCart, updateQuantity, removeFromCart, getBookingData, updateBookingData, clearAll } = useCart();
  const { isAuthenticated, user, customer } = useAuth();
  
  // State for checkout
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [useWallet, setUseWallet] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [giftNote, setGiftNote] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [loading, setLoading] = useState(true);
  
  
  // Booking data states
  const [selectedService, setSelectedService] = useState(null);
  const [bookingDate, setBookingDate] = useState(null);
  const [bookingTime, setBookingTime] = useState(null);
  
  // Pricing state - Dynamic
  const [subtotal, setSubtotal] = useState(0);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [total, setTotal] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  

  // Check authentication first
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/sign-in');
      return;
    }
  }, [isAuthenticated, navigate]);

  // Load user addresses from backend
  useEffect(() => {
    const loadAddresses = async () => {
      if (!customer?.id) return;
      
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:8000/api/addresses/?customer=${customer.id}`, {
          headers: {
            'Authorization': `Token ${localStorage.getItem('authToken')}`
          }
        });
        
        if (response.ok) {
          const addressesData = await response.json();
          // Ensure addressesData is an array
          const addressesArray = Array.isArray(addressesData) ? addressesData : [];
          setAddresses(addressesArray);
          
          // Set default address if available
          const defaultAddress = addressesArray.find(addr => addr.is_default);
          if (defaultAddress) {
            setSelectedAddress(defaultAddress);
          } else if (addressesArray.length > 0) {
            setSelectedAddress(addressesArray[0]);
          }
        }
      } catch (error) {
        console.error('Error loading addresses:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAddresses();
  }, [customer?.id]);


  // Load booking data from CartContext
  useEffect(() => {
    console.log('CheckoutPage: Loading data from CartContext');
    
    const bookingData = getBookingData();
    
    if (bookingData) {
      console.log('CheckoutPage: Loaded booking data:', bookingData);
      
      // Set all booking data
      if (bookingData.selectedAddress) {
        setSelectedAddress(bookingData.selectedAddress);
      }
      if (bookingData.selectedService) {
        setSelectedService(bookingData.selectedService);
      }
      if (bookingData.selectedDate) {
        setBookingDate(bookingData.selectedDate);
      }
      if (bookingData.selectedTime) {
        setBookingTime(bookingData.selectedTime);
      }
    }
    
    // Fallback to location.state if no booking data
    if (!bookingData && location.state?.bookingData) {
      console.log('CheckoutPage: Using location.state as fallback');
      const { selectedAddress: address, selectedService: service, selectedDate: date, selectedTime: time } = location.state.bookingData;
      setSelectedAddress(address);
      setSelectedService(service);
      setBookingDate(date);
      setBookingTime(time);
    }
  }, [getBookingData, location.state]);

  // Calculate pricing dynamically
  useEffect(() => {
    let currentSubtotal = 0;
    
    // Calculate from cart items
    if (cartItems.length > 0) {
      currentSubtotal = cartItems.reduce((sum, item) => {
        const price = parseFloat(item.price) || 0;
        const quantity = parseInt(item.quantity) || 0;
        return sum + (price * quantity);
      }, 0);
    } else if (selectedService) {
      // Fallback to selected service if no cart items
      currentSubtotal = parseFloat(selectedService.price || selectedService.basePrice || 0);
    }
    
    let currentDeliveryFee = 0; // Can be dynamic based on address
    let currentDiscount = parseFloat(discount) || 0;
    
    let currentTotal = currentSubtotal + currentDeliveryFee - currentDiscount;
    
    // Ensure all values are numbers
    setSubtotal(Number(currentSubtotal) || 0);
    setDeliveryFee(Number(currentDeliveryFee) || 0);
    setTotal(Number(currentTotal) || 0);
  }, [cartItems, selectedService, discount]);

  // Save address changes to CartContext
  useEffect(() => {
    if (selectedAddress) {
      const bookingData = getBookingData();
      if (bookingData) {
        try {
          bookingData.selectedAddress = selectedAddress;
          updateBookingData(bookingData);
        } catch (error) {
          console.error('Error updating address in CartContext:', error);
        }
      }
    }
  }, [selectedAddress, getBookingData, updateBookingData]);

  // Check if items were just added to cart
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('added') === 'true') {
      setShowSuccessMessage(true);
      // Remove the parameter from URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    updateQuantity(itemId, newQuantity);
  };

  const handleRemoveItem = (itemId) => {
    removeFromCart(itemId);
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      alert('يرجى إدخال كود الخصم');
      return;
    }
    
    setIsValidatingCoupon(true);
    
    try {
      const response = await apiRequestWithRetry(API_ENDPOINTS.validateCoupon, {
        method: 'POST',
        body: JSON.stringify({
          code: couponCode,
          amount: subtotal
        })
      });
      
      if (response.valid) {
        const discountAmount = response.discount_amount || 0;
        setDiscount(discountAmount);
        setCouponApplied(true);
        alert(`تم تطبيق كود الخصم بنجاح! خصم: ${discountAmount.toFixed(2)} ر.س`);
      } else {
        alert(response.errors?.code?.[0] || 'كود الخصم غير صحيح أو منتهي الصلاحية');
        setDiscount(0);
        setCouponApplied(false);
      }
    } catch (error) {
      console.error('Coupon validation error:', error);
      alert('حدث خطأ في التحقق من كود الخصم. يرجى المحاولة مرة أخرى.');
      setDiscount(0);
      setCouponApplied(false);
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleLocationConfirm = (locationData) => {
    setSelectedAddress({
      title: locationData.title,
      address: locationData.address
    });
    setShowLocationPicker(false);
  };

  const handleSubmitOrder = async () => {
    if (!agreeTerms) {
      alert('يرجى الموافقة على الشروط والأحكام');
      return;
    }

    if (cartItems.length === 0 && !selectedService) {
      alert('يرجى اختيار خدمة على الأقل');
      return;
    }

    if (!selectedAddress) {
      alert('يرجى اختيار عنوان للتوصيل');
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('Submitting order to Django backend...');
      
      // Get booking data from CartContext
      const bookingData = getBookingData();
      
      // Prepare booking payload for Django
      const bookingPayload = {
        customer: parseInt(customer.id),
        service: cartItems.length > 0 ? parseInt(cartItems[0].id) : parseInt(selectedService.id),
        staff: null, // Can be added later if needed
        address: parseInt(selectedAddress.id),
        booking_date: bookingData?.selectedDate ? 
          new Date(bookingData.selectedDate).toISOString().split('T')[0] : 
          new Date().toISOString().split('T')[0],
        booking_time: bookingData?.selectedTime || '10:00:00',
        payment_method: paymentMethod, // Use selected payment method
        special_requests: giftNote || '',
        price: total,
        final_price: total, // Add final_price field
        coupon: null, // Can be added later if needed
        // Send cart items to Django
        cart_items: cartItems.length > 0 ? cartItems.map(item => ({
          service_id: parseInt(item.id),
          quantity: item.quantity,
          price: item.price
        })) : null
      };

      console.log('Booking payload:', bookingPayload);

      // Send to Django backend
      const response = await fetch('http://localhost:8000/api/bookings/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(bookingPayload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.detail || 'فشل في حفظ الحجز');
      }

      const booking = await response.json();
      console.log('✅ Booking created successfully:', booking);
      
      // Handle different payment methods
      if (paymentMethod === 'cash') {
        // Cash payment - confirm immediately
        clearAll();
        navigate('/order-success');
      }
    } catch (error) {
      console.error('Order submission failed:', error);
      alert(`فشل إكمال الطلب: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading or redirect if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحقق من تسجيل الدخول...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Success Message */}
      {showSuccessMessage && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="mr-3">
                <p className="text-sm text-green-700 font-semibold">
                  تمت الإضافة بنجاح! تم إضافة الخدمة إلى السلة.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowSuccessMessage(false)}
              className="text-green-400 hover:text-green-600"
            >
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Invoice Details */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-lg font-bold mb-6 text-gray-800">تفاصيل الفاتورة</h2>
              
              {/* Wallet Payment Section */}
              <div className="mb-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Wallet className="w-5 h-5 text-gray-600" />
                    <div>
                      <div className="font-semibold text-gray-800">الدفع باستخدام المحفظة</div>
                      <div className="text-sm text-gray-600">
                        إجمالي رصيد المحفظة <span className="font-bold">0 ر.س</span>
                      </div>
                      <div className="text-xs text-gray-500">0 مستخدم</div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useWallet}
                      onChange={(e) => setUseWallet(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
{/* 
              {/* Coupon Section */}
              <div className="mb-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <Gift className="w-5 h-5 text-gray-600" />
                    <div>
                      <div className="font-semibold text-gray-800">إضافة كوبون التخفيض</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="أدخل كود الخصم"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1"
                      disabled={isValidatingCoupon}
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleApplyCoupon}
                      disabled={!couponCode.trim() || isValidatingCoupon}
                      className="text-xs px-3 py-1"
                    >
                      {isValidatingCoupon ? 'جاري التحقق...' : 'إضافة الكود'}
                    </Button>
                  </div>
                  {couponApplied && (
                    <div className="mt-2 text-sm text-green-600">
                      تم تطبيق كود الخصم! خصم: {(discount || 0).toFixed(2)} ر.س
                    </div>
                  )}
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="mb-6">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-1 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div className="text-sm text-gray-700">
                    <div className="mb-2">
                      <span>الخدمات مقدمة للنساء فقط، يُرجى مراجعة </span>
                      <a href="/terms" className="text-blue-600 underline">الشروط والأحكام</a>
                    </div>
                    <div className="text-xs text-gray-500">
                      *الحد الأدنى هو: <span className="font-bold">194 ر.س</span>
                    </div>
                  </div>
                </label>
              </div>

              {/* Payment Methods */}
              <div className="mb-6">
                <h4 className="text-sm font-bold mb-3 text-gray-800">دفع بواسطة</h4>
                <div className="space-y-3">
                  {/* Cash Payment */}
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="payment"
                      value="cash"
                      checked={paymentMethod === 'cash'}
                      onChange={(e) => {
                        setPaymentMethod(e.target.value);
                        setShowPaymentWidget(false);
                      }}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div className="flex items-center justify-between w-full p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-green-600" />
                        </div>
                        <span className="font-semibold text-gray-800">نقدي عند الاستلام</span>
                      </div>
                      <div className="text-sm text-gray-500">آمن ومضمون</div>
                    </div>
                  </label>


                </div>
              </div>

              {/* Totals */}
              <div className="border-t pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>المجموع</span>
                    <span>{(subtotal || 0).toFixed(2)} ر.س</span>
                  </div>
                  {(deliveryFee || 0) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>رسوم التوصيل</span>
                      <span>{(deliveryFee || 0).toFixed(2)} ر.س</span>
                    </div>
                  )}
                  {(discount || 0) > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>الخصم</span>
                      <span>-{(discount || 0).toFixed(2)} ر.س</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>المجموع الكلي</span>
                    <span>{(total || 0).toFixed(2)} ر.س</span>
                  </div>
                </div>
              </div>


              {/* Submit Button */}
              <Button
                onClick={handleSubmitOrder}
                disabled={!agreeTerms || isSubmitting || (cartItems.length === 0 && !selectedService)}
                className="w-full mt-6 bg-black text-white hover:bg-gray-800 py-3 text-lg font-semibold"
              >
                {isSubmitting ? 'جاري المعالجة...' : 'اكمل الدفع'}
              </Button>
            </div>
          </div>

          {/* Right Column - Address and Services */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              
              {/* Address Section */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
                    <span className="mr-3 text-gray-600">جاري تحميل العناوين...</span>
                  </div>
                ) : selectedAddress ? (
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-gray-600" />
                      <div>
                        <div className="font-bold text-gray-800">{selectedAddress.title}</div>
                        <div className="text-sm text-gray-600">
                          {selectedAddress.address}
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs"
                      onClick={() => setShowLocationPicker(true)}
                    >
                      تعديل
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500 mb-4">لا يوجد عنوان محدد</p>
                    <Button 
                      onClick={() => setShowLocationPicker(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      إضافة عنوان
                    </Button>
                  </div>
                )}
                
                <Textarea
                  placeholder="ملاحظات"
                  value={giftNote}
                  onChange={(e) => setGiftNote(e.target.value)}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm"
                />
              </div>

              {/* Services Section */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-bold mb-4 text-gray-800">الخدمات</h3>
                
                <div className="space-y-4">
                  {/* Show selected service if no cart items */}
                  {cartItems.length === 0 && selectedService && (
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50">
                      <div className="flex items-center gap-4">
                        <img 
                          src={selectedService.image || '/api/placeholder/60/60'} 
                          alt={selectedService.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div>
                          <h4 className="font-semibold text-gray-800">{selectedService.name}</h4>
                          <div className="text-sm text-gray-600">
                            <span>{selectedService.duration || 90} دقيقة</span>
                            <span className="mx-2">•</span>
                            <span>
                              {bookingDate ? new Date(bookingDate).toLocaleDateString('ar-SA', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              }) : 'تاريخ غير محدد'}
                              {' '}
                              {bookingTime || 'وقت غير محدد'}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500">صالونات أخرى</div>
                        </div>
                      </div>
                      <div className="text-lg font-bold text-gray-800">
                        {selectedService.price || selectedService.basePrice || 0} ر.س
                      </div>
                    </div>
                  )}
                  
                  {/* Show cart items */}
                  {cartItems.length > 0 && cartItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-4">
                        <img 
                          src={item.image || '/api/placeholder/60/60'} 
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div>
                          <h4 className="font-semibold text-gray-800">{item.name}</h4>
                          <div className="text-sm text-gray-600">
                            <span>{item.duration || 90} دقيقة</span>
                            <span className="mx-2">•</span>
                            <span>
                              {bookingDate ? new Date(bookingDate).toLocaleDateString('ar-SA', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              }) : 'تاريخ غير محدد'}
                              {' '}
                              {bookingTime || 'وقت غير محدد'}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500">صالونات أخرى</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 border border-gray-300 rounded-lg">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            className="p-2"
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="px-3 py-1 font-semibold">{item.quantity}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            className="p-2"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        
                        <Button variant="outline" size="sm" className="text-xs">
                          تعديل
                        </Button>
                        
                        <div className="text-lg font-bold text-gray-800">
                          {item.price * item.quantity} ر.س
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Show empty state if no services */}
                  {cartItems.length === 0 && !selectedService && (
                    <div className="text-center py-8 text-gray-500">
                      <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p className="mb-4">لا توجد خدمات في السلة</p>
                      <Button 
                        onClick={() => navigate('/services')}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        تصفح الخدمات
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      {cartItems.length > 0 && (
        <div className="container mx-auto px-4 py-6">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => navigate('/services')}
                variant="outline"
                className="flex items-center gap-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-6 py-3"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                مواصلة التسوق
              </Button>
              
              <Button
                onClick={() => navigate('/book')}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                حجز خدمة أخرى
              </Button>
            </div>
          </div>
        </div>
      )}


      {/* Location Picker Modal */}
      {showLocationPicker && (
        <LocationPicker
          isOpen={showLocationPicker}
          onClose={() => setShowLocationPicker(false)}
          onLocationConfirm={handleLocationConfirm}
          currentAddress={selectedAddress}
        />
      )}
    </div>
  );

};

export default CheckoutPage;

//  <div className="min-h-screen bg-gray-50" dir="rtl">
//       {/* Success Message */}
//       {showSuccessMessage && (
//         <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center">
//               <div className="flex-shrink-0">
//                 <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
//                   <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
//                 </svg>
//               </div>
//               <div className="mr-3">
//                 <p className="text-sm text-green-700 font-semibold">
//                   تمت الإضافة بنجاح! تم إضافة الخدمة إلى السلة.
//                 </p>
//               </div>
//             </div>
//             <button
//               onClick={() => setShowSuccessMessage(false)}
//               className="text-green-400 hover:text-green-600"
//             >
//               <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
//                 <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
//               </svg>
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Main Content */}
//       <div className="container mx-auto px-4 py-8">
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
//           {/* Left Column - Invoice Details */}
//           <div className="lg:col-span-1">
//             <div className="bg-white rounded-lg p-6 shadow-sm">
//               <h2 className="text-lg font-bold mb-6 text-gray-800">تفاصيل الفاتورة</h2>
              
//               {/* Wallet Payment Section */}
//               <div className="mb-6">
//                 <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
//                   <div className="flex items-center gap-3">
//                     <Wallet className="w-5 h-5 text-gray-600" />
//                     <div>
//                       <div className="font-semibold text-gray-800">الدفع باستخدام المحفظة</div>
//                       <div className="text-sm text-gray-600">
//                         إجمالي رصيد المحفظة <span className="font-bold">0 ر.س</span>
//                       </div>
//                       <div className="text-xs text-gray-500">0 مستخدم</div>
//                     </div>
//                   </div>
//                   <label className="relative inline-flex items-center cursor-pointer">
//                     <input
//                       type="checkbox"
//                       checked={useWallet}
//                       onChange={(e) => setUseWallet(e.target.checked)}
//                       className="sr-only peer"
//                     />
//                     <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
//                   </label>
//                 </div>
//               </div>
// {/* 
//               {/* Coupon Section */}
//               <div className="mb-6">
//                 <div className="p-4 bg-gray-50 rounded-lg">
//                   <div className="flex items-center gap-3 mb-3">
//                     <Gift className="w-5 h-5 text-gray-600" />
//                     <div>
//                       <div className="font-semibold text-gray-800">إضافة كوبون التخفيض</div>
//                     </div>
//                   </div>
//                   <div className="flex gap-2">
//                     <Input
//                       placeholder="أدخل كود الخصم"
//                       value={couponCode}
//                       onChange={(e) => setCouponCode(e.target.value)}
//                       className="flex-1"
//                       disabled={isValidatingCoupon}
//                     />
//                     <Button 
//                       variant="outline" 
//                       size="sm"
//                       onClick={handleApplyCoupon}
//                       disabled={!couponCode.trim() || isValidatingCoupon}
//                       className="text-xs px-3 py-1"
//                     >
//                       {isValidatingCoupon ? 'جاري التحقق...' : 'إضافة الكود'}
//                     </Button>
//                   </div>
//                   {couponApplied && (
//                     <div className="mt-2 text-sm text-green-600">
//                       تم تطبيق كود الخصم! خصم: {(discount || 0).toFixed(2)} ر.س
//                     </div>
//                   )}
//                 </div>
//               </div>

//               {/* Terms and Conditions */}
//               <div className="mb-6">
//                 <label className="flex items-start gap-3 cursor-pointer">
//                   <input
//                     type="checkbox"
//                     checked={agreeTerms}
//                     onChange={(e) => setAgreeTerms(e.target.checked)}
//                     className="mt-1 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
//                   />
//                   <div className="text-sm text-gray-700">
//                     <div className="mb-2">
//                       <span>الخدمات مقدمة للنساء فقط، يُرجى مراجعة </span>
//                       <a href="/terms" className="text-blue-600 underline">الشروط والأحكام</a>
//                     </div>
//                     <div className="text-xs text-gray-500">
//                       *الحد الأدنى هو: <span className="font-bold">194 ر.س</span>
//                     </div>
//                   </div>
//                 </label>
//               </div>

//               {/* Payment Methods */}
//               <div className="mb-6">
//                 <h4 className="text-sm font-bold mb-3 text-gray-800">دفع بواسطة</h4>
//                 <div className="space-y-3">
//                   {/* Cash Payment */}
//                   <label className="flex items-center gap-3 cursor-pointer">
//                     <input
//                       type="radio"
//                       name="payment"
//                       value="cash"
//                       checked={paymentMethod === 'cash'}
//                       onChange={(e) => {
//                         setPaymentMethod(e.target.value);
//                         setShowPaymentWidget(false);
//                       }}
//                       className="w-4 h-4 text-blue-600"
//                     />
//                     <div className="flex items-center justify-between w-full p-3 border border-gray-200 rounded-lg">
//                       <div className="flex items-center gap-3">
//                         <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
//                           <Check className="w-4 h-4 text-green-600" />
//                         </div>
//                         <span className="font-semibold text-gray-800">نقدي عند الاستلام</span>
//                       </div>
//                       <div className="text-sm text-gray-500">آمن ومضمون</div>
//                     </div>
//                   </label>


//                 </div>
//               </div>

//               {/* Totals */}
//               <div className="border-t pt-4">
//                 <div className="space-y-2">
//                   <div className="flex justify-between text-sm">
//                     <span>المجموع</span>
//                     <span>{(subtotal || 0).toFixed(2)} ر.س</span>
//                   </div>
//                   {(deliveryFee || 0) > 0 && (
//                     <div className="flex justify-between text-sm">
//                       <span>رسوم التوصيل</span>
//                       <span>{(deliveryFee || 0).toFixed(2)} ر.س</span>
//                     </div>
//                   )}
//                   {(discount || 0) > 0 && (
//                     <div className="flex justify-between text-sm text-green-600">
//                       <span>الخصم</span>
//                       <span>-{(discount || 0).toFixed(2)} ر.س</span>
//                     </div>
//                   )}
//                   <div className="flex justify-between text-lg font-bold border-t pt-2">
//                     <span>المجموع الكلي</span>
//                     <span>{(total || 0).toFixed(2)} ر.س</span>
//                   </div>
//                 </div>
//               </div>


//               {/* Submit Button */}
//               <Button
//                 onClick={handleSubmitOrder}
//                 disabled={!agreeTerms || isSubmitting || (cartItems.length === 0 && !selectedService)}
//                 className="w-full mt-6 bg-black text-white hover:bg-gray-800 py-3 text-lg font-semibold"
//               >
//                 {isSubmitting ? 'جاري المعالجة...' : 'اكمل الدفع'}
//               </Button>
//             </div>
//           </div>

//           {/* Right Column - Address and Services */}
//           <div className="lg:col-span-2">
//             <div className="space-y-6">
              
//               {/* Address Section */}
//               <div className="bg-white rounded-lg p-6 shadow-sm">
//                 {loading ? (
//                   <div className="flex items-center justify-center py-8">
//                     <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
//                     <span className="mr-3 text-gray-600">جاري تحميل العناوين...</span>
//                   </div>
//                 ) : selectedAddress ? (
//                   <div className="flex items-center justify-between mb-4">
//                     <div className="flex items-center gap-3">
//                       <MapPin className="w-5 h-5 text-gray-600" />
//                       <div>
//                         <div className="font-bold text-gray-800">{selectedAddress.title}</div>
//                         <div className="text-sm text-gray-600">
//                           {selectedAddress.address}
//                         </div>
//                       </div>
//                     </div>
//                     <Button 
//                       variant="outline" 
//                       size="sm" 
//                       className="text-xs"
//                       onClick={() => setShowLocationPicker(true)}
//                     >
//                       تعديل
//                     </Button>
//                   </div>
//                 ) : (
//                   <div className="text-center py-8">
//                     <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
//                     <p className="text-gray-500 mb-4">لا يوجد عنوان محدد</p>
//                     <Button 
//                       onClick={() => setShowLocationPicker(true)}
//                       className="bg-blue-600 hover:bg-blue-700 text-white"
//                     >
//                       إضافة عنوان
//                     </Button>
//                   </div>
//                 )}
                
//                 <Textarea
//                   placeholder="ملاحظات"
//                   value={giftNote}
//                   onChange={(e) => setGiftNote(e.target.value)}
//                   rows={4}
//                   className="w-full border border-gray-300 rounded-lg p-3 text-sm"
//                 />
//               </div>

//               {/* Services Section */}
//               <div className="bg-white rounded-lg p-6 shadow-sm">
//                 <h3 className="text-lg font-bold mb-4 text-gray-800">الخدمات</h3>
                
//                 <div className="space-y-4">
//                   {/* Show selected service if no cart items */}
//                   {cartItems.length === 0 && selectedService && (
//                     <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50">
//                       <div className="flex items-center gap-4">
//                         <img 
//                           src={selectedService.image || '/api/placeholder/60/60'} 
//                           alt={selectedService.name}
//                           className="w-16 h-16 object-cover rounded-lg"
//                         />
//                         <div>
//                           <h4 className="font-semibold text-gray-800">{selectedService.name}</h4>
//                           <div className="text-sm text-gray-600">
//                             <span>{selectedService.duration || 90} دقيقة</span>
//                             <span className="mx-2">•</span>
//                             <span>
//                               {bookingDate ? new Date(bookingDate).toLocaleDateString('ar-SA', { 
//                                 weekday: 'long', 
//                                 year: 'numeric', 
//                                 month: 'long', 
//                                 day: 'numeric' 
//                               }) : 'تاريخ غير محدد'}
//                               {' '}
//                               {bookingTime || 'وقت غير محدد'}
//                             </span>
//                           </div>
//                           <div className="text-sm text-gray-500">صالونات أخرى</div>
//                         </div>
//                       </div>
//                       <div className="text-lg font-bold text-gray-800">
//                         {selectedService.price || selectedService.basePrice || 0} ر.س
//                       </div>
//                     </div>
//                   )}
                  
//                   {/* Show cart items */}
//                   {cartItems.length > 0 && cartItems.map((item) => (
//                     <div key={item.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
//                       <div className="flex items-center gap-4">
//                         <img 
//                           src={item.image || '/api/placeholder/60/60'} 
//                           alt={item.name}
//                           className="w-16 h-16 object-cover rounded-lg"
//                         />
//                         <div>
//                           <h4 className="font-semibold text-gray-800">{item.name}</h4>
//                           <div className="text-sm text-gray-600">
//                             <span>{item.duration || 90} دقيقة</span>
//                             <span className="mx-2">•</span>
//                             <span>
//                               {bookingDate ? new Date(bookingDate).toLocaleDateString('ar-SA', { 
//                                 weekday: 'long', 
//                                 year: 'numeric', 
//                                 month: 'long', 
//                                 day: 'numeric' 
//                               }) : 'تاريخ غير محدد'}
//                               {' '}
//                               {bookingTime || 'وقت غير محدد'}
//                             </span>
//                           </div>
//                           <div className="text-sm text-gray-500">صالونات أخرى</div>
//                         </div>
//                       </div>
                      
//                       <div className="flex items-center gap-4">
//                         <div className="flex items-center gap-2 border border-gray-300 rounded-lg">
//                           <Button
//                             variant="ghost"
//                             size="sm"
//                             onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
//                             className="p-2"
//                           >
//                             <Minus className="w-4 h-4" />
//                           </Button>
//                           <span className="px-3 py-1 font-semibold">{item.quantity}</span>
//                           <Button
//                             variant="ghost"
//                             size="sm"
//                             onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
//                             className="p-2"
//                           >
//                             <Plus className="w-4 h-4" />
//                           </Button>
//                         </div>
                        
//                         <Button
//                           variant="ghost"
//                           size="sm"
//                           onClick={() => handleRemoveItem(item.id)}
//                           className="text-red-500 hover:text-red-700"
//                         >
//                           <Trash2 className="w-4 h-4" />
//                         </Button>
                        
//                         <Button variant="outline" size="sm" className="text-xs">
//                           تعديل
//                         </Button>
                        
//                         <div className="text-lg font-bold text-gray-800">
//                           {item.price * item.quantity} ر.س
//                         </div>
//                       </div>
//                     </div>
//                   ))}
                  
//                   {/* Show empty state if no services */}
//                   {cartItems.length === 0 && !selectedService && (
//                     <div className="text-center py-8 text-gray-500">
//                       <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
//                       <p className="mb-4">لا توجد خدمات في السلة</p>
//                       <Button 
//                         onClick={() => navigate('/services')}
//                         className="bg-blue-600 hover:bg-blue-700 text-white"
//                       >
//                         تصفح الخدمات
//                       </Button>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Navigation Buttons */}
//       {cartItems.length > 0 && (
//         <div className="container mx-auto px-4 py-6">
//           <div className="bg-white rounded-lg p-6 shadow-sm">
//             <div className="flex flex-col sm:flex-row gap-4 justify-center">
//               <Button
//                 onClick={() => navigate('/services')}
//                 variant="outline"
//                 className="flex items-center gap-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-6 py-3"
//               >
//                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
//                 </svg>
//                 مواصلة التسوق
//               </Button>
              
//               <Button
//                 onClick={() => navigate('/book')}
//                 className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3"
//               >
//                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
//                 </svg>
//                 حجز خدمة أخرى
//               </Button>
//             </div>
//           </div>
//         </div>
//       )}


//       {/* Location Picker Modal */}
//       {showLocationPicker && (
//         <LocationPicker
//           isOpen={showLocationPicker}
//           onClose={() => setShowLocationPicker(false)}
//           onLocationConfirm={handleLocationConfirm}
//           currentAddress={selectedAddress}
//         />
//       )}
//     </div>