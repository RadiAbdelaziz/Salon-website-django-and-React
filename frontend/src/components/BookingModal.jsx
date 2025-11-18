import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LocationPicker from './LocationPicker';
import { getAllServices, getServiceById, getServiceByName } from '../data/services';
import dayjs from 'dayjs';
import { 
  CalendarIcon, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  X, 
  Check, 
  Plus,
  Edit,
  Trash2,
  CreditCard,
  Lock,
  Star,
  ArrowLeft,
  ArrowRight,
  Navigation
} from 'lucide-react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { getDistanceMatrix, isInRiyadh } from '../services/maps';
import { availabilityAPI, adminSlotsAPI } from '../services/api';
import 'dayjs/locale/ar';

const BookingModal = ({ isOpen, onClose, selectedService = null, isAuthenticated, user, customer }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoggedIn, setIsLoggedIn] = useState(isAuthenticated);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [couponData, setCouponData] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [allServices, setAllServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  
  const [bookingData, setBookingData] = useState({
    service: selectedService ? (selectedService.id || selectedService) : '',
    date: null,
    time: '',
    staff: '',
    address: null,
    customerInfo: {
      name: '',
      email: '',
      phone: '',
      password: ''
    },
    specialRequests: '',
    paymentMethod: ''
  });

  const [addresses, setAddresses] = useState([
    {
      id: 1,
      title: 'المنزل',
      address: 'شارع الملك فهد، حي النخيل، الرياض 12345',
      isDefault: true
    },
    {
      id: 2,
      title: 'العمل',
      address: 'برج المملكة، حي العليا، الرياض 12345',
      isDefault: false
    }
  ]);


  const availableStaff = [
    { id: 'sarah', name: 'سارة أحمد', specialization: 'الشعر والمكياج', rating: 4.9, image: 'http://localhost:8000/api/placeholder/60/60/' },
    { id: 'maria', name: 'مريم السعد', specialization: 'العناية بالبشرة والمساج', rating: 4.8, image: 'http://localhost:8000/api/placeholder/60/60/' },
    { id: 'aisha', name: 'عائشة محمد', specialization: 'العناية بالأظافر', rating: 4.9, image: 'http://localhost:8000/api/placeholder/60/60/' },
    { id: 'emma', name: 'إيما ويلسون', specialization: 'خدمات شاملة', rating: 5.0, image: 'http://localhost:8000/api/placeholder/60/60/' }
  ];

  const [timeSlots, setTimeSlots] = useState([]);

  const paymentMethods = [
    { id: 'cash', name: 'نقدي', icon: '💰', description: 'دفع نقدي عند الوصول' }
  ];

  const handleNext = () => {
    // Check if user needs to login before proceeding
    if (!isAuthenticated) {
      setShowLoginForm(true);
      return;
    }
    
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    setShowLoginForm(false);
  };

  const handleRegister = () => {
    setIsLoggedIn(true);
    setShowLoginForm(false);
  };

  const handleAddAddress = (newAddress) => {
    const address = {
      id: addresses.length + 1,
      title: newAddress.title,
      address: newAddress.address,
      isDefault: false
    };
    setAddresses([...addresses, address]);
    setSelectedAddress(address);
    setShowAddressForm(false);
  };

  const handleLocationConfirm = (locationData) => {
    const address = {
      id: addresses.length + 1,
      title: locationData.title,
      address: locationData.address,
      coordinates: locationData.coordinates,
      isDefault: false
    };
    
    // إضافة العنوان الجديد للقائمة
    setAddresses(prev => [...prev, address]);
    
    // تحديد العنوان الجديد كعنوان مختار
    setSelectedAddress(address);
    setBookingData(prev => ({ ...prev, address: address }));
    
    // إغلاق نافذة تحديد الموقع
    setShowLocationPicker(false);
    
    // احسب المسافة والمدة من وسط الرياض إلى العنوان المختار
    try {
      const origin = 'Riyadh, Saudi Arabia';
      const destination = locationData.address || `${locationData.coordinates?.lat},${locationData.coordinates?.lng}`;
      getDistanceMatrix({ origins: origin, destinations: destination, units: 'metric' })
        .then(dm => {
          const element = dm?.rows?.[0]?.elements?.[0];
          const distanceText = element?.distance?.text;
          const durationText = element?.duration?.text;

          // تحقّق نطاق الخدمة: مدينة الرياض فقط
          const inRiyadh = isInRiyadh(dm?.destination_addresses?.[0] || destination);
          if (!inRiyadh) {
            alert('منطقتك غير متاحة الآن');
          } else {
            alert(`✅ تم حفظ العنوان. المسافة: ${distanceText}, الزمن: ${durationText}`);
          }
        })
        .catch(() => {
          // تجاهل الخطأ بصمت كي لا نمنع المستخدم
        });
    } catch (_) {
      // تجاهل
    }
  };

  // Load availability when date changes and address/service exist
  React.useEffect(() => {
    const fetchAvailability = async () => {
      if (!bookingData.service || !selectedAddress || !bookingData.date) return;
      const dateStr = dayjs(bookingData.date).format('YYYY-MM-DD');
      try {
        // Use admin-controlled slots instead of the old availability system
        const res = await adminSlotsAPI.getAvailableSlots(bookingData.service, dateStr);
        setTimeSlots(Array.isArray(res.available_slots) ? res.available_slots : []);
      } catch (e) {
        console.error('Error fetching admin slots:', e);
        setTimeSlots([]);
      }
    };
    fetchAvailability();
  }, [bookingData.service, selectedAddress, bookingData.date]);

  const handleSelectAddress = (address) => {
    setSelectedAddress(address);
    setBookingData(prev => ({ ...prev, address: address }));
  };

  const validateCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('يرجى إدخال كود الكوبون');
      return;
    }

    setIsValidatingCoupon(true);
    setCouponError('');

    try {
      // Get service price for validation
      const servicePrice = selectedServiceData?.price_min || selectedServiceData?.price || 0;
      const priceNumber = typeof servicePrice === 'string' 
        ? parseFloat(servicePrice.replace(/[^\d.]/g, '')) 
        : servicePrice;

      const response = await fetch('http://localhost:8000/api/validate-coupon/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: couponCode.trim(),
          amount: priceNumber
        })
      });

      const data = await response.json();

      if (data.valid) {
        setCouponData(data);
        setCouponError('');
        alert(`✅ تم تطبيق الكوبون بنجاح! خصم ${data.discount_amount} ريال`);
      } else {
        setCouponError(data.errors?.non_field_errors?.[0] || 'كود الكوبون غير صحيح');
        setCouponData(null);
      }
    } catch (error) {
      console.error('Error validating coupon:', error);
      setCouponError('حدث خطأ في التحقق من الكوبون');
      setCouponData(null);
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setCouponCode('');
    setCouponData(null);
    setCouponError('');
  };

  const handleSubmit = async () => {
    try {
      // Get the selected service data
      const selectedServiceData = allServices.find(s => s.id === bookingData.service);
      
      // Ensure we have a valid price
      let servicePrice = 800; // Default price
      if (selectedServiceData) {
        if (selectedServiceData.basePrice) {
          servicePrice = parseFloat(selectedServiceData.basePrice);
        } else if (selectedServiceData.price_min) {
          servicePrice = parseFloat(selectedServiceData.price_min);
        } else if (selectedServiceData.price) {
          servicePrice = parseFloat(selectedServiceData.price);
        }
      }
      
      // Validate required data
      if (!customer?.id) {
        throw new Error('معلومات العميل غير مكتملة. يرجى تسجيل الدخول مرة أخرى.');
      }
      
      if (!bookingData.service) {
        throw new Error('يرجى اختيار خدمة.');
      }
      
      if (!bookingData.date || !bookingData.time) {
        throw new Error('يرجى اختيار التاريخ والوقت.');
      }
      
      if (!paymentMethod) {
        throw new Error('يرجى اختيار طريقة الدفع.');
      }

      // Create address if not selected
      let addressId = selectedAddress?.id;
      if (!addressId && selectedAddress) {
        // Create address from selected location
        const addressResponse = await fetch('http://localhost:8000/api/addresses/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${localStorage.getItem('authToken')}`
          },
          body: JSON.stringify({
            customer: customer.id,
            title: selectedAddress.title || 'العنوان المحدد',
            address: selectedAddress.address,
            latitude: selectedAddress.coordinates?.lat,
            longitude: selectedAddress.coordinates?.lng,
            is_default: true
          })
        });
        
        if (addressResponse.ok) {
          const newAddress = await addressResponse.json();
          addressId = newAddress.id;
        } else {
          // Use default address ID 1 if creation fails
          addressId = 1;
        }
      } else if (!addressId) {
        // Use default address ID 1
        addressId = 1;
      }

      // Prepare booking data for API
      const bookingPayload = {
        customer: parseInt(customer.id), // Ensure customer ID is integer
        service: parseInt(bookingData.service), // Ensure service ID is integer
        staff: bookingData.staff ? parseInt(bookingData.staff) : null, // Optional staff selection
        address: parseInt(addressId), // Ensure address ID is integer
        booking_date: dayjs(bookingData.date).format('YYYY-MM-DD'),
        booking_time: bookingData.time,
        payment_method: paymentMethod,
        special_requests: bookingData.specialRequests || '',
        price: servicePrice, // Use calculated service price
        coupon: couponData?.id ? parseInt(couponData.id) : null // Coupon ID if applied
      };

      console.log('=== BOOKING DEBUG INFO ===');
      console.log('Sending booking to server:', bookingPayload);
      console.log('Customer data:', customer);
      console.log('User data:', user);
      console.log('Selected service data:', selectedServiceData);
      console.log('Service basePrice:', selectedServiceData?.basePrice);
      console.log('Service price_min:', selectedServiceData?.price_min);
      console.log('Service price:', selectedServiceData?.price);
      console.log('Calculated price:', servicePrice);
      console.log('Auth token:', localStorage.getItem('authToken'));
      console.log('Booking data:', bookingData);
      console.log('Payment method:', paymentMethod);
      console.log('Selected address:', selectedAddress);
      console.log('========================');

      // Send booking to Django backend
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
        console.error('Server error response:', errorData);
        console.error('Request payload:', bookingPayload);
        throw new Error(errorData.error || errorData.detail || 'فشل في حفظ الحجز');
      }

      const savedBooking = await response.json();
      console.log('Booking saved successfully:', savedBooking);
      console.log('Saved booking ID:', savedBooking.id);
      console.log('Saved booking type:', typeof savedBooking.id);
      
      // Book the admin slot if we have a selected slot
      const selectedSlot = timeSlots.find(slot => slot.time === bookingData.time);
      if (selectedSlot && selectedSlot.id) {
        try {
          await adminSlotsAPI.bookSlot(selectedSlot.id);
          console.log('Admin slot booked successfully');
        } catch (slotError) {
          console.error('Error booking admin slot:', slotError);
          // Don't fail the entire booking if slot booking fails
        }
      }
      
      // Send email notifications
      try {
        // Check if booking ID exists
        if (!savedBooking.id) {
          console.error('❌ No booking ID found in response:', savedBooking);
          throw new Error('No booking ID received from server');
        }
        
        console.log('📧 Sending email notification for booking ID:', savedBooking.id);
        const emailResponse = await fetch('http://localhost:8000/api/send-booking-emails/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${localStorage.getItem('authToken')}`
          },
          body: JSON.stringify({ booking_id: savedBooking.id })
        });
        
        if (emailResponse.ok) {
          const emailResult = await emailResponse.json();
          console.log('✅ Email notifications sent successfully:', emailResult);
        } else {
          const errorData = await emailResponse.json();
          console.warn('⚠️ Failed to send email notifications:', errorData);
        }
      } catch (emailError) {
        console.warn('⚠️ Failed to send email notifications:', emailError);
      }
      
                  // Show enhanced success message
                  const successMessage = `
تم تأكيد الحجز بنجاح! 🎉

📧 ستصلك رسالة تأكيد فورية على: ${user?.email}
📱 تذكير تلقائي قبل 24 ساعة من موعدك
🔄 يمكنك إعادة الجدولة من لوحة التحكم (حتى مرتين)
💳 تتبع حالة الدفع متاح في لوحة التحكم

رقم الحجز: #${savedBooking.id}
                  `;
                  
                  alert(successMessage);
    onClose();
      
    // Reset all form data
    setCurrentStep(1);
    setIsLoggedIn(false);
    setSelectedAddress(null);
    setPaymentMethod('');
    setBookingData({
      service: '',
      date: null,
      time: '',
      staff: '',
      address: null,
      customerInfo: {
        name: '',
        email: '',
        phone: '',
        password: ''
      },
      specialRequests: '',
      paymentMethod: ''
    });
      
    } catch (error) {
      console.error('Error saving booking:', error);
      alert(`خطأ في حفظ الحجز: ${error.message}`);
    }
  };

  const updateBookingData = (field, value) => {
    setBookingData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // تحديث الخدمة المحددة عند تغيير selectedService
  React.useEffect(() => {
    if (selectedService && isOpen) {
      let serviceId = selectedService.id || selectedService;
      let foundService = null;
      
      // إذا كان selectedService object، ابحث عن الخدمة بطرق مختلفة
      if (typeof selectedService === 'object') {
        // البحث بالـ ID أولاً
        if (selectedService.id) {
          foundService = getServiceById(selectedService.id);
        }
        
        // إذا لم توجد، ابحث بالاسم أو العنوان
        if (!foundService && (selectedService.name || selectedService.title)) {
          const searchName = selectedService.name || selectedService.title;
          foundService = getServiceByName(searchName);
        }
        
        serviceId = foundService ? foundService.id : null;
      } else {
        // إذا كان selectedService مجرد string (ID)
        foundService = getServiceById(serviceId);
      }
      
      if (serviceId && foundService) {
        setBookingData(prev => ({
          ...prev,
          service: serviceId
        }));
      }
    }
  }, [selectedService, isOpen]);

  // Load services when modal opens
  React.useEffect(() => {
    const loadServices = async () => {
      if (isOpen && allServices.length === 0) {
        try {
          setServicesLoading(true);
          const services = await getAllServices();
          setAllServices(services);
        } catch (error) {
          console.error('Failed to load services:', error);
        } finally {
          setServicesLoading(false);
        }
      }
    };

    loadServices();
  }, [isOpen, allServices.length]);

  // إعادة تعيين البيانات عند إغلاق النافذة
  React.useEffect(() => {
    if (!isOpen) {
      // Reset form when modal closes
      setCurrentStep(1);
      setIsLoggedIn(false);
      setSelectedAddress(null);
      setPaymentMethod('');
      setCouponCode('');
      setCouponData(null);
      setCouponError('');
      setIsValidatingCoupon(false);
      setShowLoginForm(false);
      setShowAddressForm(false);
      setShowLocationPicker(false);
    }
  }, [isOpen]);

  const updateCustomerInfo = (field, value) => {
    setBookingData(prev => ({
      ...prev,
      customerInfo: {
        ...prev.customerInfo,
        [field]: value
      }
    }));
  };

  // البحث عن الخدمة المحددة
  const selectedServiceData = allServices.find(service => service.id === bookingData.service || service.id === bookingData.service.toString());
  const selectedStaffData = availableStaff.find(s => s.id === bookingData.staff);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-5xl max-h-[95vh] overflow-y-auto rounded-2xl border-0 shadow-2xl bg-salon-cream text-auto" 
        style={{
          border: '2px solid var(--silken-dune)'
        }}
      >
        <DialogHeader className="pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center space-x-3 space-x-reverse" style={{ color: 'var(--warm-brown)' }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--champagne-veil)' }}>
                <CalendarIcon className="w-5 h-5" style={{ color: 'var(--glamour-gold)' }} />
              </div>
              <div>
                <h2 className="text-2xl font-bold">احجزي موعدك</h2>
                <DialogDescription className="text-sm font-normal" style={{ color: 'var(--warm-brown)' }}>
                  احصلي على أفضل خدمات التجميل في منزلك
                </DialogDescription>
              </div>
          </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="w-8 h-8 p-0 rounded-full hover:bg-gray-100"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between relative">
            {/* Progress Line */}
            <div className="absolute top-4 left-0 right-0 h-0.5" style={{ backgroundColor: 'var(--champagne-veil)' }}>
              <div 
                className="h-full transition-all duration-500 ease-out"
                style={{ 
                  width: `${((currentStep - 1) / 4) * 100}%`,
                  backgroundColor: 'var(--glamour-gold)'
                }}
              />
            </div>
            
            {[
              { step: 1, title: 'الخدمة', icon: '🎯' },
              { step: 2, title: 'العنوان', icon: '📍' },
              { step: 3, title: 'التاريخ والوقت', icon: '📅' },
              { step: 4, title: 'الدفع', icon: '💳' },
              { step: 5, title: 'التأكيد', icon: '✅' }
            ].map(({ step, title, icon }) => (
              <div key={step} className="flex flex-col items-center relative z-10">
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                step <= currentStep 
                      ? 'text-white shadow-lg scale-110' 
                      : 'text-gray-500'
                  }`} 
                  style={{ 
                    backgroundColor: step <= currentStep ? 'var(--glamour-gold)' : 'var(--champagne-veil)',
                    border: step === currentStep ? '3px solid var(--glamour-gold-dark)' : 'none'
                  }}
                >
                  {step < currentStep ? <Check className="w-5 h-5" /> : step}
                </div>
                <span 
                  className={`text-xs font-medium mt-2 text-center ${
                    step <= currentStep ? 'font-bold' : ''
                  }`}
                  style={{ 
                    color: step <= currentStep ? 'var(--warm-brown)' : 'var(--medium-beige)',
                    fontSize: '11px'
                  }}
                >
                  {title}
                </span>
              </div>
            ))}
            </div>
        </div>

        {/* عرض الخدمة المحددة في الأعلى - مثل سلة التسوق */}
        {selectedService && selectedServiceData && (
          <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl p-4 mb-6 shadow-lg" style={{ border: '2px solid var(--glamour-gold)' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-md" style={{ backgroundColor: 'var(--glamour-gold)' }}>
                  <Check className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--warm-brown)' }}>
                    الخدمة المحددة:
                  </p>
                  <p className="text-xl font-bold" style={{ color: 'var(--glamour-gold)' }}>
                    {selectedServiceData.name}
                  </p>
                </div>
              </div>
              <div className="text-left">
                <p className="text-sm font-medium" style={{ color: 'var(--warm-brown)' }}>
                  {selectedServiceData.duration}
                </p>
                <p className="text-xl font-bold sar-symbol" style={{ color: 'var(--glamour-gold)' }}>
                  {selectedServiceData.price}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step Content */}
        <div className="space-y-6">
          {/* Step 1: Service Selection */}
          {currentStep === 1 && (
            <div className="space-y-6">
              {/* Login Required Alert */}
              {!isAuthenticated && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center">
                    <svg className="w-6 h-6 text-red-600 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <div>
                      <h4 className="text-sm font-semibold text-red-800">تسجيل الدخول مطلوب</h4>
                      <p className="text-xs text-red-600 mt-1">
                        يجب تسجيل الدخول أو إنشاء حساب جديد للمتابعة في عملية الحجز
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="text-center">
                <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--warm-brown)' }}>
                  {selectedService && selectedServiceData ? 'تأكيد الخدمة المحددة' : 'اختيار الخدمة'}
                </h3>
                <p className="text-sm" style={{ color: 'var(--medium-beige)' }}>
                  {selectedService && selectedServiceData 
                    ? 'تم اختيار الخدمة التالية، يمكنك المتابعة للخطوة التالية' 
                    : 'اختاري الخدمة التي تريدينها'
                  }
                </p>
              </div>

              {/* إذا كانت هناك خدمة محددة مسبقاً، اعرضها فقط */}
              {selectedService && selectedServiceData ? (
                <div className="max-w-2xl mx-auto">
                  <div className="bg-gradient-to-br from-white via-yellow-50 to-yellow-100 rounded-3xl p-8 shadow-2xl border-2" style={{ borderColor: 'var(--glamour-gold)' }}>
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg" style={{ backgroundColor: 'var(--glamour-gold)' }}>
                        <Check className="w-8 h-8 text-white" />
                      </div>
                      <h4 className="text-2xl font-bold mb-2" style={{ color: 'var(--warm-brown)' }}>
                        الخدمة المحددة
                      </h4>
                      <p className="text-sm" style={{ color: 'var(--warm-brown)', opacity: 0.8 }}>
                        جاهزة للحجز
                      </p>
                    </div>
                    
                    <div className="bg-white rounded-2xl p-6 shadow-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex-1">
                          <h5 className="text-2xl font-bold mb-2" style={{ color: 'var(--glamour-gold)' }}>
                            {selectedServiceData.name}
                          </h5>
                          <div className="flex items-center space-x-4 space-x-reverse text-sm">
                            <span className="flex items-center bg-gray-100 px-3 py-2 rounded-full">
                              <Clock className="w-4 h-4 ml-1" style={{ color: 'var(--glamour-gold)' }} />
                              <span style={{ color: 'var(--warm-brown)' }}>{selectedServiceData.duration}</span>
                            </span>
                          </div>
                        </div>
                        <div className="text-left">
                          <div className="text-3xl font-bold px-4 py-2 rounded-full sar-symbol" style={{ 
                            backgroundColor: 'var(--champagne-veil)', 
                            color: 'var(--glamour-gold)' 
                          }}>
                            {selectedServiceData.price}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-center pt-4 border-t border-gray-200">
                        <p className="text-sm" style={{ color: 'var(--warm-brown)', opacity: 0.8 }}>
                          هذه هي الخدمة التي اخترتها. يمكنك المتابعة لإكمال الحجز أو العودة لاختيار خدمة أخرى.
                        </p>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setBookingData(prev => ({ ...prev, service: '' }));
                          }}
                          className="mt-3 px-4 py-2 rounded-full font-medium text-sm transition-all duration-300"
                          style={{
                            border: '1px solid var(--glamour-gold)',
                            color: 'var(--glamour-gold)',
                            backgroundColor: 'transparent'
                          }}
                        >
                          اختيار خدمة أخرى
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* إذا لم تكن هناك خدمة محددة، اعرض جميع الخدمات */
                <div className="grid md:grid-cols-2 gap-4">
                  {servicesLoading ? (
                    <div className="col-span-2 text-center py-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: 'var(--glamour-gold)' }}></div>
                      <p className="mt-4" style={{ color: 'var(--warm-brown)' }}>جاري تحميل الخدمات...</p>
                    </div>
                  ) : (
                    allServices
                    .sort((a, b) => {
                      // وضع الخدمة المحددة مسبقاً في المقدمة
                      if (selectedService) {
                        const selectedId = selectedService.id || selectedService;
                        if (a.id === selectedId) return -1;
                        if (b.id === selectedId) return 1;
                      }
                      return 0;
                    })
                    .map((service) => {
                    const isSelected = bookingData.service === service.id;
                    const isPreSelected = selectedService && (
                      (selectedService.id && selectedService.id === service.id) || 
                      ((selectedService.name || selectedService.title) && (selectedService.name || selectedService.title) === service.name) ||
                      selectedService === service.id
                    );
                    
                    return (
                      <Card 
                        key={service.id}
                        className={`cursor-pointer transition-all duration-300 hover:scale-105 ${
                          isSelected 
                            ? 'ring-2 shadow-xl' 
                            : 'hover:shadow-lg'
                        }`}
                        style={{
                          ringColor: isSelected ? 'var(--glamour-gold)' : 'transparent',
                          backgroundColor: isSelected ? 'var(--champagne-veil)' : 'white',
                          borderColor: isPreSelected ? 'var(--glamour-gold)' : 'var(--silken-dune)',
                          borderWidth: isPreSelected ? '2px' : '1px'
                        }}
                        onClick={() => updateBookingData('service', service.id)}
                      >
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-bold text-lg mb-2" style={{ color: 'var(--warm-brown)' }}>{service.name}</h4>
                              <div className="flex items-center space-x-4 space-x-reverse text-sm mb-3" style={{ color: 'var(--warm-brown)' }}>
                                <span className="flex items-center bg-gray-100 px-2 py-1 rounded-full">
                                  <Clock className="w-4 h-4 ml-1" style={{ color: 'var(--glamour-gold)' }} />
                                  {service.duration}
                                </span>
                              </div>
                              <div className="text-right">
                                <span className="text-2xl font-bold sar-symbol" style={{ color: 'var(--glamour-gold)' }}>
                                  {service.price}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              {isSelected ? (
                                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--glamour-gold)' }}>
                                  <Check className="w-5 h-5 text-white" />
                                </div>
                              ) : isPreSelected ? (
                                <div className="w-8 h-8 rounded-full flex items-center justify-center border-2" style={{ borderColor: 'var(--glamour-gold)', backgroundColor: 'var(--champagne-veil)' }}>
                                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--glamour-gold)' }}></div>
                                </div>
                              ) : (
                                <div className="w-8 h-8 rounded-full border-2 border-gray-300"></div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Login removed (auth enforced globally) */}
          {currentStep === 999 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold" style={{ color: 'var(--warm-brown)' }}>تسجيل الدخول أو إنشاء حساب</h3>
              
              {!isLoggedIn ? (
                <Tabs defaultValue="login" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">تسجيل الدخول</TabsTrigger>
                    <TabsTrigger value="register">إنشاء حساب</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="login" className="space-y-4">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="login-email" style={{ color: 'var(--warm-brown)' }}>البريد الإلكتروني</Label>
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="أدخلي بريدك الإلكتروني"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="login-password" style={{ color: 'var(--warm-brown)' }}>كلمة المرور</Label>
                        <Input
                          id="login-password"
                          type="password"
                          placeholder="أدخلي كلمة المرور"
                          className="mt-1"
                        />
                      </div>
                      <Button 
                        onClick={handleLogin}
                        className="w-full"
                        style={{ 
                          background: 'linear-gradient(135deg, var(--glamour-gold), var(--glamour-gold-dark))', 
                          color: 'white' 
                        }}
                      >
                        تسجيل الدخول
                      </Button>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="register" className="space-y-4">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="reg-name" style={{ color: 'var(--warm-brown)' }}>الاسم الكامل</Label>
                        <Input
                          id="reg-name"
                          placeholder="أدخلي اسمك الكامل"
                          className="mt-1"
                          value={bookingData.customerInfo.name}
                          onChange={(e) => updateCustomerInfo('name', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="reg-email" style={{ color: 'var(--warm-brown)' }}>البريد الإلكتروني</Label>
                        <Input
                          id="reg-email"
                          type="email"
                          placeholder="أدخلي بريدك الإلكتروني"
                          className="mt-1"
                          value={bookingData.customerInfo.email}
                          onChange={(e) => updateCustomerInfo('email', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="reg-phone" style={{ color: 'var(--warm-brown)' }}>رقم الهاتف</Label>
                        <Input
                          id="reg-phone"
                          placeholder="أدخلي رقم هاتفك"
                          className="mt-1"
                          value={bookingData.customerInfo.phone}
                          onChange={(e) => updateCustomerInfo('phone', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="reg-password" style={{ color: 'var(--warm-brown)' }}>كلمة المرور</Label>
                        <Input
                          id="reg-password"
                          type="password"
                          placeholder="أدخلي كلمة مرور قوية"
                          className="mt-1"
                          value={bookingData.customerInfo.password}
                          onChange={(e) => updateCustomerInfo('password', e.target.value)}
                        />
                      </div>
                      <Button 
                        onClick={handleRegister}
                        className="w-full"
                        style={{ 
                          background: 'linear-gradient(135deg, var(--glamour-gold), var(--glamour-gold-dark))', 
                          color: 'white' 
                        }}
                      >
                        إنشاء حساب
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="text-center py-8">
                  <Check className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--glamour-gold)' }} />
                  <h4 className="text-lg font-semibold mb-2" style={{ color: 'var(--warm-brown)' }}>مرحباً بك!</h4>
                  <p style={{ color: 'var(--warm-brown)' }}>تم تسجيل الدخول بنجاح</p>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Address Selection */}
          {currentStep === 2 && (
            <div className="space-y-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold" style={{ color: 'var(--warm-brown)' }}>اختيار العنوان</h3>
                    <div className="flex space-x-2 space-x-reverse">
                      <Button
                        onClick={() => setShowLocationPicker(true)}
                        size="sm"
                        style={{ 
                          background: 'linear-gradient(135deg, var(--glamour-gold), var(--glamour-gold-dark))', 
                          color: 'white' 
                        }}
                      >
                        <Navigation className="w-4 h-4 ml-2" />
                        تحديد على الخريطة
                      </Button>
                      <Button
                        onClick={() => setShowAddressForm(true)}
                        size="sm"
                        variant="outline"
                        style={{ 
                          borderColor: 'var(--glamour-gold)',
                          color: 'var(--glamour-gold)'
                        }}
                      >
                        <Plus className="w-4 h-4 ml-2" />
                        إضافة يدوياً
                      </Button>
                    </div>
                  </div>
                  
                  {/* نصيحة للمستخدم */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-700 flex items-center">
                      <MapPin className="w-4 h-4 ml-2 text-blue-500" />
                      يمكنك تحديد موقعك على الخريطة للحصول على عنوان دقيق تلقائياً
                    </p>
                  </div>
                </div>
              
              <div className="grid gap-3">
                {addresses.map((address) => (
                  <Card 
                    key={address.id}
                    className={`cursor-pointer transition-all ${
                      selectedAddress?.id === address.id 
                        ? 'ring-2' 
                        : 'hover:shadow-md'
                    }`}
                    style={{
                      ringColor: selectedAddress?.id === address.id ? 'var(--glamour-gold)' : 'transparent',
                      backgroundColor: selectedAddress?.id === address.id ? 'var(--champagne-veil)' : 'white'
                    }}
                    onClick={() => handleSelectAddress(address)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-start space-x-3 space-x-reverse">
                          <MapPin className="w-5 h-5 mt-1" style={{ color: 'var(--glamour-gold)' }} />
                          <div>
                            <div className="flex items-center space-x-2 space-x-reverse">
                              <h4 className="font-medium" style={{ color: 'var(--warm-brown)' }}>{address.title}</h4>
                              {address.coordinates && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                  <Navigation className="w-3 h-3 ml-1" />
                                  محدد على الخريطة
                                </span>
                              )}
                            </div>
                            <p className="text-sm mt-1" style={{ color: 'var(--warm-brown)' }}>{address.address}</p>
                            <div className="flex items-center space-x-2 space-x-reverse mt-2">
                              {address.isDefault && (
                                <Badge style={{ backgroundColor: 'var(--glamour-gold)', color: 'white' }}>
                                  العنوان الافتراضي
                                </Badge>
                              )}
                              {address.coordinates && (
                                <span className="text-xs text-gray-500">
                                  {typeof address.coordinates.lat !== 'undefined' 
                                    ? `${address.coordinates.lat.toFixed(4)}, ${address.coordinates.lng.toFixed(4)}`
                                    : `${address.coordinates[0].toFixed(4)}, ${address.coordinates[1].toFixed(4)}`
                                  }
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        {selectedAddress?.id === address.id && (
                          <Check className="w-5 h-5" style={{ color: 'var(--glamour-gold)' }} />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Add Address Modal */}
              {showAddressForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <Card className="w-full max-w-md mx-4">
                    <CardHeader>
                      <CardTitle style={{ color: 'var(--warm-brown)' }}>إضافة عنوان جديد</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label style={{ color: 'var(--warm-brown)' }}>عنوان العنوان (مثل: المنزل، العمل)</Label>
                        <Input placeholder="أدخلي عنوان العنوان" />
                      </div>
                <div>
                        <Label style={{ color: 'var(--warm-brown)' }}>العنوان التفصيلي</Label>
                        <Textarea placeholder="أدخلي العنوان التفصيلي" rows={3} />
                      </div>
                      <div className="flex space-x-2 space-x-reverse">
                        <Button 
                          onClick={() => setShowAddressForm(false)}
                          variant="outline"
                          className="flex-1"
                        >
                          إلغاء
                        </Button>
                        <Button 
                          onClick={() => handleAddAddress({ title: 'عنوان جديد', address: 'العنوان التفصيلي' })}
                          className="flex-1"
                          style={{ 
                            background: 'linear-gradient(135deg, var(--glamour-gold), var(--glamour-gold-dark))', 
                            color: 'white' 
                          }}
                        >
                          إضافة
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Date & Time Selection */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--warm-brown)' }}>اختيار التاريخ والوقت</h3>
                <p className="text-sm" style={{ color: 'var(--medium-beige)' }}>اختاري التاريخ والوقت المناسب لك</p>
              </div>
              
              <div className="max-w-2xl mx-auto">
                {/* Calendar Container */}
                <div className="bg-white rounded-2xl p-6 shadow-xl" style={{ border: '2px solid var(--silken-dune)' }}>
                  <LocalizationProvider 
                    dateAdapter={AdapterDayjs} 
                    adapterLocale="ar"
                  >
                    <DateCalendar
                      value={bookingData.date ? dayjs(bookingData.date) : null}
                      onChange={(newValue) => updateBookingData('date', newValue ? newValue.toDate() : null)}
                      minDate={dayjs()}
                      sx={{
                        width: '100%',
                        direction: 'rtl',
                        '& .MuiPickersCalendarHeader-root': {
                          paddingLeft: 0,
                          paddingRight: 0,
                          marginBottom: 3,
                          justifyContent: 'center',
                        },
                        '& .MuiPickersCalendarHeader-labelContainer': {
                          order: 2,
                        },
                        '& .MuiPickersCalendarHeader-switchViewButton': {
                          order: 1,
                          display: 'none',
                        },
                        '& .MuiPickersArrowSwitcher-root': {
                          order: 3,
                          position: 'absolute',
                          right: 0,
                          left: 0,
                          display: 'flex',
                          justifyContent: 'space-between',
                        },
                        '& .MuiPickersCalendarHeader-label': {
                          fontSize: '1.5rem',
                          fontWeight: 'bold',
                          color: 'var(--warm-brown)',
                          textAlign: 'center',
                        },
                        '& .MuiDayCalendar-weekContainer': {
                          marginBottom: '8px',
                          display: 'flex',
                          justifyContent: 'center',
                        },
                        '& .MuiPickersDay-root': {
                          width: '36px',
                          height: '36px',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          borderRadius: '50%',
                          margin: '2px',
                          '&:hover': {
                            backgroundColor: 'rgba(0, 0, 0, 0.04)',
                          },
                          '&.Mui-selected': {
                            backgroundColor: 'var(--glamour-gold)',
                            color: 'white',
                            fontWeight: 'bold',
                            border: '2px solid var(--glamour-gold-dark)',
                            '&:hover': {
                              backgroundColor: 'var(--glamour-gold-dark)',
                            },
                          },
                          '&.MuiPickersDay-today': {
                            backgroundColor: 'rgba(0, 0, 0, 0.08)',
                            fontWeight: 'bold',
                            color: 'var(--warm-brown)',
                          },
                        },
                        '& .MuiDayCalendar-weekDayLabel': {
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          color: 'var(--warm-brown)',
                          width: '40px',
                          textAlign: 'center',
                        },
                        '& .MuiPickersArrowSwitcher-button': {
                          color: 'var(--glamour-gold)',
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          '&:hover': {
                            backgroundColor: 'rgba(0, 0, 0, 0.04)',
                          },
                        },
                        '& .MuiDayCalendar-root': {
                          width: '100%',
                        },
                      }}
                    />
                  </LocalizationProvider>
                </div>

                {/* Time Selection Dropdown */}
                <div className="mt-6">
                  <Label className="text-lg font-semibold block mb-4 text-center" style={{ color: 'var(--warm-brown)' }}>
                    🕐 اختيار الوقت
                  </Label>
                  <div className="bg-white rounded-2xl p-4 shadow-lg" style={{ border: '2px solid var(--silken-dune)' }}>
                    <Select value={bookingData.time} onValueChange={(value) => updateBookingData('time', value)}>
                      <SelectTrigger className="w-full h-12 text-lg font-medium" style={{ 
                        borderColor: 'var(--silken-dune)',
                        color: 'var(--warm-brown)'
                      }}>
                        <SelectValue placeholder="اختاري الوقت المناسب" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((slot) => (
                          <SelectItem 
                            key={slot.id || slot.time} 
                            value={slot.time}
                            className="text-lg font-medium"
                            style={{ color: 'var(--warm-brown)' }}
                          >
                            {slot.time} {slot.staff ? `- ${slot.staff.name}` : ''} {slot.available_spots > 1 ? `(${slot.available_spots} متاح)` : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Selected Date & Time Summary */}
                {(bookingData.date || bookingData.time) && (
                  <div className="mt-6 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-2xl p-6" style={{ border: '2px solid var(--champagne-veil)' }}>
                    <div className="flex items-center justify-center space-x-6 space-x-reverse">
                      <div className="text-center">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: 'var(--glamour-gold)' }}>
                          <CalendarIcon className="w-6 h-6 text-white" />
                        </div>
                        <p className="text-sm font-medium" style={{ color: 'var(--warm-brown)' }}>التاريخ المحدد</p>
                        <p className="font-bold text-lg" style={{ color: 'var(--glamour-gold)' }}>
                          {bookingData.date ? dayjs(bookingData.date).format('DD/MM/YYYY') : 'لم يتم الاختيار'}
                        </p>
                      </div>
                      <div className="w-px h-12" style={{ backgroundColor: 'var(--silken-dune)' }}></div>
                      <div className="text-center">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: 'var(--glamour-gold)' }}>
                          <Clock className="w-6 h-6 text-white" />
                        </div>
                        <p className="text-sm font-medium" style={{ color: 'var(--warm-brown)' }}>الوقت المحدد</p>
                        <p className="font-bold text-lg" style={{ color: 'var(--glamour-gold)' }}>
                          {bookingData.time || 'لم يتم الاختيار'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Payment Method */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--warm-brown)' }}>اختيار طريقة الدفع</h3>
                <p className="text-sm" style={{ color: 'var(--medium-beige)' }}>اختاري طريقة الدفع المناسبة لك</p>
                    </div>
                
              <div className="grid md:grid-cols-2 gap-4">
                {paymentMethods.map((method) => (
                  <Card 
                    key={method.id}
                    className={`cursor-pointer transition-all duration-300 hover:scale-105 ${
                      paymentMethod === method.id 
                        ? 'ring-2 shadow-xl' 
                        : 'hover:shadow-lg'
                    }`}
                    style={{
                      ringColor: paymentMethod === method.id ? 'var(--glamour-gold)' : 'transparent',
                      backgroundColor: paymentMethod === method.id ? 'var(--champagne-veil)' : 'white',
                      borderColor: 'var(--silken-dune)'
                    }}
                    onClick={() => setPaymentMethod(method.id)}
                  >
                    <CardContent className="p-6">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4 space-x-reverse">
                          <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl" style={{ backgroundColor: 'var(--champagne-veil)' }}>
                            {method.icon}
                          </div>
                        <div>
                            <h4 className="font-bold text-lg" style={{ color: 'var(--warm-brown)' }}>{method.name}</h4>
                            <p className="text-sm" style={{ color: 'var(--medium-beige)' }}>طريقة دفع آمنة</p>
                          </div>
                        </div>
                        {paymentMethod === method.id && (
                          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--glamour-gold)' }}>
                            <Check className="w-5 h-5 text-white" />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Coupon Code Section */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold" style={{ color: 'var(--warm-brown)' }}>كود الخصم (اختياري)</h4>
                
                {!couponData ? (
                  <div className="flex space-x-2 space-x-reverse">
                    <Input
                      placeholder="أدخل كود الكوبون"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1"
                      style={{ borderColor: couponError ? '#ef4444' : 'var(--silken-dune)' }}
                    />
                    <Button
                      onClick={validateCoupon}
                      disabled={isValidatingCoupon || !couponCode.trim()}
                      className="px-6"
                      style={{ 
                        background: 'linear-gradient(135deg, var(--glamour-gold), var(--glamour-gold-dark))', 
                        color: 'white' 
                      }}
                    >
                      {isValidatingCoupon ? 'جاري التحقق...' : 'تطبيق'}
                    </Button>
                  </div>
                ) : (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-green-500">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-green-800">{couponData.coupon.name}</p>
                          <p className="text-sm text-green-600">خصم {couponData.discount_amount} ريال</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={removeCoupon}
                        className="text-red-600 hover:text-red-800 hover:bg-red-50"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
                
                {couponError && (
                  <p className="text-sm text-red-600 flex items-center">
                    <X className="w-4 h-4 ml-1" />
                    {couponError}
                  </p>
                )}
              </div>

              {/* Payment Security */}
              <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-2xl p-4" style={{ border: '2px solid var(--champagne-veil)' }}>
                <div className="flex items-center justify-center space-x-3 space-x-reverse">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--glamour-gold)' }}>
                    <Lock className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold" style={{ color: 'var(--warm-brown)' }}>جميع المعاملات محمية ومشفرة</p>
                    <p className="text-sm" style={{ color: 'var(--medium-beige)' }}>بياناتك الشخصية آمنة معنا</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Confirmation */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold" style={{ color: 'var(--warm-brown)' }}>تأكيد الحجز</h3>
              
              {/* Booking Summary */}
              <Card style={{ backgroundColor: 'var(--champagne-veil)', borderColor: 'var(--silken-dune)' }}>
                <CardHeader>
                  <CardTitle className="text-sm" style={{ color: 'var(--warm-brown)' }}>ملخص الحجز</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--warm-brown)' }}>الخدمة:</span>
                    <span className="font-medium" style={{ color: 'var(--warm-brown)' }}>{selectedServiceData?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--warm-brown)' }}>التاريخ:</span>
                    <span className="font-medium" style={{ color: 'var(--warm-brown)' }}>
                      {bookingData.date ? dayjs(bookingData.date).format('dddd، DD MMMM YYYY') : 'لم يتم الاختيار'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--warm-brown)' }}>الوقت:</span>
                    <span className="font-medium" style={{ color: 'var(--warm-brown)' }}>{bookingData.time || 'لم يتم الاختيار'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--warm-brown)' }}>العنوان:</span>
                    <span className="font-medium" style={{ color: 'var(--warm-brown)' }}>
                      {selectedAddress?.title || 'لم يتم الاختيار'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--warm-brown)' }}>طريقة الدفع:</span>
                    <span className="font-medium" style={{ color: 'var(--warm-brown)' }}>
                      {paymentMethods.find(p => p.id === paymentMethod)?.name || 'لم يتم الاختيار'}
                    </span>
                  </div>
                  
                  {/* Price breakdown */}
                  <div className="border-t pt-2 space-y-2">
                    <div className="flex justify-between">
                      <span style={{ color: 'var(--warm-brown)' }}>سعر الخدمة:</span>
                      <span className="font-medium sar-symbol" style={{ color: 'var(--warm-brown)' }}>
                        {selectedServiceData?.price}
                      </span>
                    </div>
                    
                    {couponData && (
                      <div className="flex justify-between text-green-600">
                        <span>خصم الكوبون ({couponData.coupon.code}):</span>
                        <span className="font-medium sar-symbol">-{couponData.discount_amount}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between border-t pt-2 font-bold text-lg">
                      <span style={{ color: 'var(--warm-brown)' }}>المجموع النهائي:</span>
                      <span className="sar-symbol" style={{ color: 'var(--glamour-gold)' }}>
                        {couponData ? couponData.final_amount : selectedServiceData?.price}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Special Requests */}
              <div>
                <Label htmlFor="requests" style={{ color: 'var(--warm-brown)' }}>طلبات خاصة (اختياري)</Label>
                <Textarea
                  id="requests"
                  value={bookingData.specialRequests}
                  onChange={(e) => updateBookingData('specialRequests', e.target.value)}
                  placeholder="أي طلبات خاصة أو متطلبات..."
                  rows={3}
                  className="mt-1"
                />
              </div>

              {/* Email Notification Info */}
              <Card style={{ backgroundColor: 'var(--champagne-veil)', borderColor: 'var(--silken-dune)' }}>
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-3 space-x-reverse">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold" style={{ color: 'var(--warm-brown)' }}>
                        إشعارات البريد الإلكتروني
                      </h4>
                      <p className="text-xs mt-1" style={{ color: 'var(--medium-beige)' }}>
                        ستصلك رسالة تأكيد فورية بعد الحجز، وتذكير قبل 24 ساعة من موعدك
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Rescheduling Info */}
              <Card style={{ backgroundColor: 'var(--champagne-veil)', borderColor: 'var(--silken-dune)' }}>
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-3 space-x-reverse">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold" style={{ color: 'var(--warm-brown)' }}>
                        إعادة الجدولة
                      </h4>
                      <p className="text-xs mt-1" style={{ color: 'var(--medium-beige)' }}>
                        يمكنك إعادة جدولة موعدك حتى مرتين من لوحة التحكم
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-8" style={{ borderTop: '2px solid var(--silken-dune)' }}>
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="flex items-center px-6 py-3 rounded-full font-semibold transition-all duration-300 hover:scale-105"
            style={{ 
              borderColor: 'var(--silken-dune)',
              color: 'var(--warm-brown)',
              backgroundColor: currentStep === 1 ? 'var(--champagne-veil)' : 'white'
            }}
          >
            <ArrowLeft className="w-4 h-4 ml-2" />
            السابق
          </Button>
          
          {currentStep < 5 ? (
            <Button
              onClick={handleNext}
              disabled={
                (currentStep === 1 && !bookingData.service) ||
                (currentStep === 2 && !selectedAddress) ||
                (currentStep === 3 && (!bookingData.date || !bookingData.time)) ||
                (currentStep === 4 && !paymentMethod)
              }
              className="flex items-center px-8 py-3 rounded-full font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
              style={{ 
                background: !isAuthenticated 
                  ? 'linear-gradient(135deg, #ef4444, #dc2626)' 
                  : 'linear-gradient(135deg, var(--glamour-gold), var(--glamour-gold-dark))', 
                color: 'white',
                opacity: (
                  (currentStep === 1 && !bookingData.service) ||
                  (currentStep === 2 && !selectedAddress) ||
                  (currentStep === 3 && (!bookingData.date || !bookingData.time)) ||
                  (currentStep === 4 && !paymentMethod)
                ) ? 0.5 : 1
              }}
            >
              {!isAuthenticated ? (
                <>
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  تسجيل الدخول أولاً
                </>
              ) : (
                <>
              التالي
              <ArrowRight className="w-4 h-4 mr-2" />
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={false}
              className="flex items-center px-8 py-3 rounded-full font-semibold transition-all duration-300 hover:scale-105 shadow-xl"
              style={{ 
                background: 'linear-gradient(135deg, var(--glamour-gold), var(--glamour-gold-dark))', 
                color: 'white'
              }}
            >
              <Check className="w-4 h-4 ml-2" />
              تأكيد الحجز
            </Button>
          )}
        </div>
      </DialogContent>
      
      {/* Login Modal */}
      {showLoginForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="w-full max-w-md mx-4">
            <div className="bg-white rounded-2xl p-8 shadow-2xl">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--warm-brown)' }}>
                  تسجيل الدخول مطلوب
                </h3>
                <p className="text-sm" style={{ color: 'var(--medium-beige)' }}>
                  يجب تسجيل الدخول أو إنشاء حساب جديد للمتابعة في عملية الحجز
                </p>
              </div>
              
              <div className="space-y-4">
                <Button
                  onClick={() => {
                    setShowLoginForm(false);
                    // Navigate to login page or show login form
                    window.location.href = '/sign-in';
                  }}
                  className="w-full py-4 text-lg font-semibold"
                  style={{ 
                    background: 'linear-gradient(135deg, var(--glamour-gold), var(--glamour-gold-dark))', 
                    color: 'white' 
                  }}
                >
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  تسجيل الدخول
                </Button>
                
                <Button
                  onClick={() => {
                    setShowLoginForm(false);
                    // Navigate to signup page or show signup form
                    window.location.href = '/sign-up';
                  }}
                  variant="outline"
                  className="w-full py-4 text-lg font-semibold"
                  style={{ 
                    borderColor: 'var(--glamour-gold)',
                    color: 'var(--glamour-gold)',
                    borderWidth: '2px'
                  }}
                >
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  إنشاء حساب جديد
                </Button>
                
                <Button
                  onClick={() => {
                    setShowLoginForm(false);
                    onClose();
                  }}
                  variant="ghost"
                  className="w-full py-3 text-sm"
                  style={{ color: 'var(--medium-beige)' }}
                >
                  إلغاء والعودة للصفحة الرئيسية
                </Button>
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-blue-600 ml-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-blue-900">لماذا نحتاج تسجيل الدخول؟</p>
                    <p className="text-xs text-blue-700 mt-1">
                      لتتمكن من إدارة حجوزاتك، إعادة الجدولة، وتلقي إشعارات البريد الإلكتروني
                    </p>
                  </div>
                </div>
              </div>
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
        />
      )}
    </Dialog>
  );
};

export default BookingModal;


