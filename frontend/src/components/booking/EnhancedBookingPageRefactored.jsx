/**
 * Refactored Enhanced Booking Page
 * Broken down into smaller, focused components with proper separation of concerns
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, X } from 'lucide-react';
import dayjs from 'dayjs';

// Import sub-components
import ServiceSelection from './ServiceSelection';
import DateTimeSelection from './DateTimeSelection';
import LocationSelection from './LocationSelection';
import PaymentSelection from './PaymentSelection';
import BookingConfirmation from './BookingConfirmation';

// Import hooks and utilities
import { useServices, useServiceCategories, useCouponValidation } from '../../hooks/useApi';
import { useCart } from '../../contexts/CartContext';
import { handleError } from '../../utils/errorHandler';
import { validationSchemas } from '../../utils/validation';

const EnhancedBookingPageRefactored = ({ 
  onClose, 
  selectedService = null, 
  isAuthenticated, 
  user, 
  customer 
}) => {
  const navigate = useNavigate();
  const { cartItems, clearCart, clearAll } = useCart();
  

  // Load customer addresses from database
  useEffect(() => {
    const loadCustomerAddresses = async () => {
      if (!customer?.id) {
        setAddresses([]);
        return;
      }

      setLoadingAddresses(true);
      try {
        
        const response = await fetch(`http://localhost:8000/api/addresses/?customer=${customer.id}`, {
          headers: {
            'Authorization': `Token ${localStorage.getItem('authToken')}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to load addresses');
        }

        const data = await response.json();
        
        // Handle different response formats
        let addressList = [];
        if (Array.isArray(data)) {
          addressList = data;
        } else if (data.results && Array.isArray(data.results)) {
          // DRF pagination format
          addressList = data.results;
        } else if (data.addresses && Array.isArray(data.addresses)) {
          // Custom format
          addressList = data.addresses;
        } else {
          addressList = [];
        }
        
        
        // Transform addresses to match our format
        const transformedAddresses = addressList.map(addr => ({
          id: addr.id,
          title: addr.title,
          address: addr.address,
          coordinates: {
            lat: addr.latitude,
            lng: addr.longitude
          },
          isDefault: addr.is_default
        }));
        
        setAddresses(transformedAddresses);
        
        // Auto-select default address if available
        const defaultAddress = transformedAddresses.find(addr => addr.isDefault);
        if (defaultAddress && !bookingState.selectedAddress) {
          setBookingState(prev => ({ ...prev, selectedAddress: defaultAddress }));
        }
        
      } catch (error) {
        console.error('Error loading addresses:', error);
        setAddresses([]);
      } finally {
        setLoadingAddresses(false);
      }
    };

    loadCustomerAddresses();
  }, [customer?.id]);

  // API hooks
  const { data: services, loading: servicesLoading, error: servicesError } = useServices();
  const { data: categories } = useServiceCategories();
  const { validateCoupon, loading: couponLoading } = useCouponValidation();

  // Booking state
  const [bookingState, setBookingState] = useState({
    selectedService: selectedService,
    selectedDate: null,
    selectedTime: null,
    selectedAddress: null,
    customerInfo: {
      name: user?.first_name || '',
      email: user?.email || '',
      phone: customer?.phone || '',
    },
    specialRequests: '',
    paymentMethod: null,
    couponCode: '',
    couponData: null,
    totalPrice: 0
  });

  // UI state
  const [currentSection, setCurrentSection] = useState('services');
  const [expandedSections, setExpandedSections] = useState(['services']);
  const [timeSlots, setTimeSlots] = useState([]);
  const [couponError, setCouponError] = useState('');
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  // Load addresses from database for the logged-in customer
  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);

  const paymentMethods = [
    { id: 'cash', name: 'نقدي', icon: '💰', description: 'دفع نقدي عند الوصول' }
  ];

  // Handle cart items when coming from cart
  useEffect(() => {
    if (cartItems.length > 0) {
      const totalPrice = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
      setBookingState(prev => ({
        ...prev,
        selectedService: cartItems[0],
        totalPrice: totalPrice
      }));
      setCurrentSection('cart');
      setExpandedSections(['cart']);
    }
  }, [cartItems]);

  // Calculate total price
  useEffect(() => {
    if (bookingState.selectedService) {
      const service = services?.find(s => s.id === bookingState.selectedService.id);
      if (service) {
        let basePrice = service.basePrice || service.price_min || service.price || 800;
        let discount = 0;
        
        if (bookingState.couponData) {
          discount = bookingState.couponData.discount_amount || 0;
        }
        
        setBookingState(prev => ({
          ...prev,
          totalPrice: Math.max(0, basePrice - discount)
        }));
      }
    }
  }, [bookingState.selectedService, bookingState.couponData, services]);

  // Event handlers
  const handleServiceSelect = (service) => {
    setBookingState(prev => ({ ...prev, selectedService: service }));
    expandSection('datetime');
  };

  const handleDateSelect = (date) => {
    setBookingState(prev => ({ ...prev, selectedDate: date }));
    generateTimeSlots(date);
    expandSection('location');
  };

  const handleTimeSelect = (time) => {
    setBookingState(prev => ({ ...prev, selectedTime: time }));
    expandSection('location');
  };

  const handleAddressSelect = (address) => {
    setBookingState(prev => ({ ...prev, selectedAddress: address }));
    expandSection('payment');
  };

  // Handle address deletion
  const handleAddressDelete = async (addressId, event) => {
    event.stopPropagation(); // Prevent card click
    
    if (!confirm('هل أنت متأكد من حذف هذا العنوان؟')) {
      return;
    }

    try {
      console.log(`🗑️ Deleting address ID: ${addressId}`);
      
      const response = await fetch(`http://localhost:8000/api/addresses/${addressId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Token ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete address');
      }

      console.log('✅ Address deleted successfully');
      
      // Remove from local state
      setAddresses(prev => prev.filter(addr => addr.id !== addressId));
      
      // If deleted address was selected, clear selection
      if (bookingState.selectedAddress?.id === addressId) {
        setBookingState(prev => ({ ...prev, selectedAddress: null }));
      }
      
      alert('✅ تم حذف العنوان بنجاح');
      
    } catch (error) {
      console.error('Error deleting address:', error);
      alert('❌ فشل في حذف العنوان');
    }
  };

  const handlePaymentSelect = (method) => {
    setBookingState(prev => ({ ...prev, paymentMethod: method }));
    expandSection('confirmation');
  };

  const handleCouponCodeChange = (code) => {
    setBookingState(prev => ({ ...prev, couponCode: code }));
    setCouponError('');
  };

  const handleCouponValidation = async () => {
    if (!bookingState.couponCode.trim()) return;
    
    setCouponError('');
    
    try {
      const response = await validateCoupon(bookingState.couponCode, bookingState.totalPrice);
      
      if (response.valid) {
        setBookingState(prev => ({
          ...prev,
          couponData: {
            id: response.coupon.id,
            code: response.coupon.code,
            name: response.coupon.name,
            discount_type: response.coupon.discount_type,
            discount_value: response.coupon.discount_value,
            discount_amount: response.discount_amount
          }
        }));
      } else {
        setCouponError(response.errors?.code?.[0] || 'كود الكوبون غير صحيح أو منتهي الصلاحية');
      }
    } catch (error) {
      setCouponError('حدث خطأ في التحقق من الكوبون');
    }
  };

  const handleLocationConfirm = async (locationData) => {
    console.log('📍 Location data received:', locationData);
    console.log('📍 Customer object:', customer);
    console.log('📍 isAuthenticated:', isAuthenticated);
    console.log('📍 user:', user);
    
    try {
      // Validate customer exists
      if (!customer?.id) {
        alert('⚠️ يجب تسجيل الدخول أولاً لإضافة عنوان جديد');
        navigate('/sign-in');
        return;
      }
      
      // First, save the address to the database
      // Round lat/lng to 7 decimal places (database constraint: max_digits=10, decimal_places=7)
      const latitude = locationData.coordinates?.lat 
        ? parseFloat(locationData.coordinates.lat.toFixed(7))
        : null;
      const longitude = locationData.coordinates?.lng 
        ? parseFloat(locationData.coordinates.lng.toFixed(7))
        : null;
      
      const addressPayload = {
        customer: parseInt(customer.id),
        title: locationData.title || 'العنوان المحدد',
        address: locationData.address,
        latitude: latitude,
        longitude: longitude,
        is_default: false
      };
      
      console.log('📍 Saving address to database:', addressPayload);
      console.log('📍 Customer ID:', customer?.id);
      console.log('📍 Auth token:', localStorage.getItem('authToken') ? 'Present' : 'Missing');
      
      const addressResponse = await fetch('http://localhost:8000/api/addresses/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(addressPayload)
      });
      
      console.log('📍 Response status:', addressResponse.status);
      console.log('📍 Response headers:', Object.fromEntries(addressResponse.headers.entries()));
      
      if (!addressResponse.ok) {
        const errorData = await addressResponse.json();
        console.error('Address creation error:', errorData);
        console.error('Address payload sent:', addressPayload);
        
        // Show detailed error message
        let errorMessage = 'فشل في حفظ العنوان';
        if (errorData.detail) {
          errorMessage += `: ${errorData.detail}`;
        } else if (typeof errorData === 'object') {
          // Handle field validation errors
          const fieldErrors = Object.entries(errorData).map(([field, errors]) => {
            const errorList = Array.isArray(errors) ? errors.join(', ') : errors;
            return `${field}: ${errorList}`;
          }).join('; ');
          errorMessage += `: ${fieldErrors}`;
        }
        
        throw new Error(errorMessage);
      }
      
      const savedAddress = await addressResponse.json();
      console.log('📍 Address saved successfully:', savedAddress);
      
      // Create the address object for local state
      const newAddress = {
        id: savedAddress.id, // Use the ID from the database
        title: savedAddress.title,
        address: savedAddress.address,
        coordinates: {
          lat: savedAddress.latitude,
          lng: savedAddress.longitude
        },
        isDefault: savedAddress.is_default
      };
      
      console.log('📍 New address created:', newAddress);
      
      // Add the new address to the addresses list
      setAddresses(prev => {
        const updatedAddresses = [...prev, newAddress];
        console.log('📍 Updated addresses list:', updatedAddresses);
        return updatedAddresses;
      });
      
      // Set the new address as selected
      setBookingState(prev => {
        const updatedState = { ...prev, selectedAddress: newAddress };
        console.log('📍 Updated booking state:', updatedState);
        return updatedState;
      });
      
      // Close the location picker and move to next section
      setShowLocationPicker(false);
      expandSection('payment');
      
      // Show success message
      alert(`✅ تم إضافة العنوان "${newAddress.title}" بنجاح!`);
      
    } catch (error) {
      console.error('Error saving address:', error);
      alert(`❌ فشل في حفظ العنوان: ${error.message}`);
    }
  };

  const handleBookingSubmit = async () => {
    try {
      // Validate required fields
      const errors = validationSchemas.booking(bookingState);
      if (Object.keys(errors).length > 0) {
        throw new Error(Object.values(errors)[0]);
      }

      // Validate customer authentication
      if (!customer?.id) {
        alert('يرجى تسجيل الدخول لإكمال الحجز');
        navigate('/sign-in');
        return;
      }

      // Create booking payload
      const totalPrice = cartItems.length > 0 
        ? cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)
        : bookingState.totalPrice;

      const selectedService = cartItems.length > 0 ? cartItems[0] : bookingState.selectedService;
      
      const bookingPayload = {
        customer: parseInt(customer.id),
        service: parseInt(selectedService.id),
        staff: bookingState.selectedStaff?.id ? parseInt(bookingState.selectedStaff.id) : null,
        address: parseInt(bookingState.selectedAddress.id),
        booking_date: dayjs(bookingState.selectedDate).format('YYYY-MM-DD'),
        booking_time: bookingState.selectedTime,
        payment_method: bookingState.paymentMethod.id,
        special_requests: bookingState.specialRequests || '',
        price: totalPrice,
        coupon: bookingState.couponData?.id ? parseInt(bookingState.couponData.id) : null,
        cart_items: cartItems.length > 0 ? cartItems.map(item => ({
          service_id: parseInt(item.id),
          quantity: item.quantity,
          price: item.price
        })) : null
      };

      // Submit booking
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
      console.log('✅ Booking created:', booking.id);

      // Process booking with cash payment only
      console.log('✅ Processing booking with cash payment...');
      
      // Clear cart and booking data and show success
      clearAll();
      alert('تم تأكيد حجزك بنجاح! ستصلك رسالة تأكيد قريباً.');
      onClose();
      
    } catch (error) {
      handleError(error, 'Booking Submission');
    }
  };

  // Helper functions
  const expandSection = (section) => {
    setExpandedSections(prev => [...new Set([...prev, section])]);
    setCurrentSection(section);
  };

  const generateTimeSlots = (date) => {
    const slots = [];
    const startHour = 9;
    const endHour = 18;
    
    for (let hour = startHour; hour < endHour; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    
    setTimeSlots(slots);
  };

  const expandCartSection = () => {
    setCurrentSection('cart');
    setExpandedSections(['cart']);
    setTimeout(() => {
      setCurrentSection('datetime');
      setExpandedSections(['cart', 'datetime']);
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-salon-cream text-auto">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:py-8">
        {/* Header with prominent back button */}
        <div className="flex items-center justify-between mb-6 sm:mb-8 bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex items-center gap-2"
              style={{ borderColor: 'var(--glamour-gold)', color: 'var(--warm-brown)' }}
            >
              <ArrowRight className="w-4 h-4" />
              رجوع
            </Button>
            <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--warm-brown)' }}>
              حجز موعد
            </h1>
          </div>
          <Button
            variant="ghost"
            onClick={onClose}
            className="p-2 hover:bg-red-50"
            aria-label="إغلاق صفحة الحجز"
            style={{ color: 'var(--warm-brown)' }}
          >
            <X className="w-6 h-6" />
          </Button>
        </div>
        
        {/* Auth Warning - Show if not logged in */}
        {!isAuthenticated && (
          <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="mr-3">
                <p className="text-sm text-yellow-700">
                  ⚠️ يجب تسجيل الدخول أولاً لإكمال الحجز.
                  <Button
                    variant="link"
                    onClick={() => navigate('/sign-in')}
                    className="text-yellow-800 underline mr-2 font-bold"
                  >
                    تسجيل الدخول الآن
                  </Button>
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <div className="space-y-6 lg:space-y-8">
              {/* Service Selection - Hide if coming from cart */}
              {cartItems.length === 0 && (
                <Card className="overflow-hidden">
                  <CardHeader 
                    className="cursor-pointer"
                    onClick={() => setCurrentSection('services')}
                    style={{ background: 'var(--champagne-veil)' }}
                  >
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center">
                        <span className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ml-3"
                              style={{ background: 'var(--glamour-gold)' }}>
                          1
                        </span>
                        اختيار الخدمة
                      </CardTitle>
                      <ArrowRight className={`w-5 h-5 transition-transform ${currentSection === 'services' ? 'rotate-90' : ''}`} />
                    </div>
                  </CardHeader>
                  {expandedSections.includes('services') && (
                    <CardContent className="p-6">
                      <ServiceSelection
                        services={services || []}
                        selectedService={bookingState.selectedService}
                        onServiceSelect={handleServiceSelect}
                        loading={servicesLoading}
                        error={servicesError}
                        categories={categories || []}
                      />
                    </CardContent>
                  )}
                </Card>
              )}

              {/* Cart Items Section - Show if coming from cart */}
              {cartItems.length > 0 && (
                <Card className="overflow-hidden border-2" style={{ borderColor: 'var(--glamour-gold)' }}>
                  <CardHeader 
                    className="cursor-pointer"
                    onClick={expandCartSection}
                    style={{ background: 'var(--champagne-veil)' }}
                  >
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center">
                        <span className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ml-3"
                              style={{ background: 'var(--glamour-gold)' }}>
                          1
                        </span>
                        الخدمات المختارة ({cartItems.length})
                      </CardTitle>
                      <ArrowRight className={`w-5 h-5 transition-transform ${currentSection === 'cart' ? 'rotate-90' : ''}`} />
                    </div>
                  </CardHeader>
                  {expandedSections.includes('cart') && (
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {cartItems.map((item) => (
                          <div key={item.id} className="flex items-center space-x-4 space-x-reverse p-4 bg-gray-50 rounded-lg">
                            <img
                              src={item.image || '/api/placeholder/60/60'}
                              alt={item.name}
                              className="w-12 h-12 object-cover rounded-lg"
                            />
                            <div className="flex-1">
                              <h4 className="font-semibold" style={{ color: 'var(--warm-brown)' }}>
                                {item.name}
                              </h4>
                              <p className="text-sm text-gray-600">
                                الكمية: {item.quantity} × {item.price} ر.س
                              </p>
                            </div>
                            <span className="font-bold" style={{ color: 'var(--glamour-gold)' }}>
                              {item.price * item.quantity} ر.س
                            </span>
                          </div>
                        ))}
                        <div className="text-center">
                          <Button
                            onClick={() => navigate('/cart')}
                            variant="outline"
                            className="px-6 py-2"
                            style={{
                              borderColor: 'var(--glamour-gold)',
                              color: 'var(--glamour-gold)'
                            }}
                          >
                            تعديل السلة
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              )}

              {/* Date & Time */}
              <Card className="overflow-hidden">
                <CardHeader 
                  className="cursor-pointer"
                  onClick={() => (bookingState.selectedService || cartItems.length > 0) && setCurrentSection('datetime')}
                  style={{ 
                    background: (bookingState.selectedService || cartItems.length > 0) ? 'var(--champagne-veil)' : '#f5f5f5',
                    opacity: (bookingState.selectedService || cartItems.length > 0) ? 1 : 0.5
                  }}
                >
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <span className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ml-3"
                            style={{ background: (bookingState.selectedService || cartItems.length > 0) ? 'var(--glamour-gold)' : '#ccc' }}>
                        {cartItems.length > 0 ? '2' : '2'}
                      </span>
                      التاريخ والوقت
                    </CardTitle>
                    <ArrowRight className={`w-5 h-5 transition-transform ${currentSection === 'datetime' ? 'rotate-90' : ''}`} />
                  </div>
                </CardHeader>
                {expandedSections.includes('datetime') && (bookingState.selectedService || cartItems.length > 0) && (
                  <CardContent className="p-6">
                    <DateTimeSelection
                      selectedDate={bookingState.selectedDate}
                      selectedTime={bookingState.selectedTime}
                      timeSlots={timeSlots}
                      onDateSelect={handleDateSelect}
                      onTimeSelect={handleTimeSelect}
                    />
                  </CardContent>
                )}
              </Card>

              {/* Location */}
              <Card className="overflow-hidden">
                <CardHeader 
                  className="cursor-pointer"
                  onClick={() => bookingState.selectedDate && bookingState.selectedTime && setCurrentSection('location')}
                  style={{ 
                    background: (bookingState.selectedDate && bookingState.selectedTime) ? 'var(--champagne-veil)' : '#f5f5f5',
                    opacity: (bookingState.selectedDate && bookingState.selectedTime) ? 1 : 0.5
                  }}
                >
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <span className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ml-3"
                            style={{ background: (bookingState.selectedDate && bookingState.selectedTime) ? 'var(--glamour-gold)' : '#ccc' }}>
                        3
                      </span>
                      العنوان
                    </CardTitle>
                    <ArrowRight className={`w-5 h-5 transition-transform ${currentSection === 'location' ? 'rotate-90' : ''}`} />
                  </div>
                </CardHeader>
                {expandedSections.includes('location') && bookingState.selectedDate && bookingState.selectedTime && (
                  <CardContent className="p-6">
                    <LocationSelection
                      addresses={addresses}
                      selectedAddress={bookingState.selectedAddress}
                      onAddressSelect={handleAddressSelect}
                      onAddressDelete={handleAddressDelete}
                      onLocationPickerOpen={() => setShowLocationPicker(true)}
                      showLocationPicker={showLocationPicker}
                      onLocationPickerClose={() => setShowLocationPicker(false)}
                      onLocationConfirm={handleLocationConfirm}
                    />
                  </CardContent>
                )}
              </Card>

              {/* Payment */}
              <Card className="overflow-hidden">
                <CardHeader 
                  className="cursor-pointer"
                  onClick={() => bookingState.selectedAddress && setCurrentSection('payment')}
                  style={{ 
                    background: bookingState.selectedAddress ? 'var(--champagne-veil)' : '#f5f5f5',
                    opacity: bookingState.selectedAddress ? 1 : 0.5
                  }}
                >
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <span className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ml-3"
                            style={{ background: bookingState.selectedAddress ? 'var(--glamour-gold)' : '#ccc' }}>
                        4
                      </span>
                      طريقة الدفع
                    </CardTitle>
                    <ArrowRight className={`w-5 h-5 transition-transform ${currentSection === 'payment' ? 'rotate-90' : ''}`} />
                  </div>
                </CardHeader>
                {expandedSections.includes('payment') && bookingState.selectedAddress && (
                  <CardContent className="p-6">
                    <PaymentSelection
                      paymentMethods={paymentMethods}
                      selectedPaymentMethod={bookingState.paymentMethod}
                      onPaymentSelect={handlePaymentSelect}
                      couponCode={bookingState.couponCode}
                      onCouponCodeChange={handleCouponCodeChange}
                      onCouponValidation={handleCouponValidation}
                      couponError={couponError}
                      isValidatingCoupon={couponLoading}
                      couponData={bookingState.couponData}
                      totalPrice={bookingState.totalPrice}
                      cartItems={cartItems}
                    />
                  </CardContent>
                )}
              </Card>

              {/* Confirmation */}
              <Card className="overflow-hidden">
                <CardHeader 
                  className="cursor-pointer"
                  onClick={() => bookingState.paymentMethod && setCurrentSection('confirmation')}
                  style={{ 
                    background: bookingState.paymentMethod ? 'var(--champagne-veil)' : '#f5f5f5',
                    opacity: bookingState.paymentMethod ? 1 : 0.5
                  }}
                >
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <span className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ml-3"
                            style={{ background: bookingState.paymentMethod ? 'var(--glamour-gold)' : '#ccc' }}>
                        5
                      </span>
                      التأكيد
                    </CardTitle>
                    <ArrowRight className={`w-5 h-5 transition-transform ${currentSection === 'confirmation' ? 'rotate-90' : ''}`} />
                  </div>
                </CardHeader>
                {expandedSections.includes('confirmation') && bookingState.paymentMethod && (
                  <CardContent className="p-6">
                    <BookingConfirmation
                      bookingState={bookingState}
                      onSubmit={handleBookingSubmit}
                      categories={categories || []}
                      cartItems={cartItems}
                    />
                  </CardContent>
                )}
              </Card>
            </div>
          </div>

          {/* Sidebar - Booking Summary */}
          <div className="lg:col-span-1 order-1 lg:order-2">
            <div className="sticky top-4 lg:top-8">
              <Card className="p-6">
                <h3 className="font-bold text-lg mb-4" style={{ color: 'var(--warm-brown)' }}>
                  ملخص الحجز
                </h3>
                
                <div className="space-y-4">
                  {/* Cart Items Summary */}
                  {cartItems.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2" style={{ color: 'var(--warm-brown)' }}>
                        الخدمات المختارة ({cartItems.length})
                      </h4>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {cartItems.map((item) => (
                          <div key={item.id} className="flex items-center space-x-3 space-x-reverse p-2 bg-gray-50 rounded-lg">
                            <img 
                              src={item.image || '/api/placeholder/40/40'} 
                              alt={item.name}
                              className="w-8 h-8 rounded object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate" style={{ color: 'var(--warm-brown)' }}>
                                {item.name}
                              </p>
                              <p className="text-xs" style={{ color: 'var(--glamour-gold)' }}>
                                {item.quantity} × {item.price} ر.س
                              </p>
                            </div>
                            <span className="text-sm font-bold" style={{ color: 'var(--glamour-gold)' }}>
                              {item.price * item.quantity} ر.س
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Single Service Selection - Show if no cart items */}
                  {bookingState.selectedService && cartItems.length === 0 && (
                    <div>
                      <h4 className="font-semibold mb-2" style={{ color: 'var(--warm-brown)' }}>
                        الخدمة المختارة
                      </h4>
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <img 
                          src={bookingState.selectedService.image || 'http://localhost:8000/api/placeholder/60/60/'} 
                          alt={bookingState.selectedService.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div>
                          <p className="font-medium" style={{ color: 'var(--warm-brown)' }}>
                            {bookingState.selectedService.name}
                          </p>
                          <p className="text-sm" style={{ color: 'var(--glamour-gold)' }}>
                            {bookingState.selectedService.basePrice || bookingState.selectedService.price_min || 800} ر.س
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Show message if no services selected */}
                  {cartItems.length === 0 && !bookingState.selectedService && (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-500">
                        لم يتم اختيار أي خدمات بعد
                      </p>
                    </div>
                  )}

                  {bookingState.selectedDate && bookingState.selectedTime && (
                    <div>
                      <h4 className="font-semibold mb-2" style={{ color: 'var(--warm-brown)' }}>
                        التاريخ والوقت
                      </h4>
                      <p className="text-sm" style={{ color: 'var(--medium-beige)' }}>
                        {dayjs(bookingState.selectedDate).format('YYYY/MM/DD')} في {bookingState.selectedTime}
                      </p>
                    </div>
                  )}

                  {bookingState.selectedAddress && (
                    <div>
                      <h4 className="font-semibold mb-2" style={{ color: 'var(--warm-brown)' }}>
                        العنوان
                      </h4>
                      <p className="text-sm" style={{ color: 'var(--medium-beige)' }}>
                        {bookingState.selectedAddress.title}
                      </p>
                    </div>
                  )}

                  {bookingState.paymentMethod && (
                    <div>
                      <h4 className="font-semibold mb-2" style={{ color: 'var(--warm-brown)' }}>
                        طريقة الدفع
                      </h4>
                      <p className="text-sm" style={{ color: 'var(--medium-beige)' }}>
                        {bookingState.paymentMethod.name}
                      </p>
                    </div>
                  )}

                  {(bookingState.totalPrice > 0 || cartItems.length > 0) && (
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center">
                        <span className="font-bold" style={{ color: 'var(--warm-brown)' }}>
                          المجموع:
                        </span>
                        <span className="text-xl font-bold" style={{ color: 'var(--glamour-gold)' }}>
                          {cartItems.length > 0 
                            ? cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)
                            : bookingState.totalPrice
}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedBookingPageRefactored;
