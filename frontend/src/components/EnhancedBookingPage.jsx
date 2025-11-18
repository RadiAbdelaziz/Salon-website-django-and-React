import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import DynamicButton from './ui/DynamicButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SimpleSuccessModal from './ui/SimpleSuccessModal';
import Toast from './ui/Toast';
import { motion } from "framer-motion";
import FavoritesPage from './FavoritesPage';

import { 
  CalendarIcon, 
  Clock, 
  MapPin, 
  CreditCard, 
  Check, 
  Star,
  ArrowLeft,
  ArrowRight,
  Edit,
  X,
  Plus,
  Navigation,
  User,
  Phone,
  Mail,
  Lock,
  Trash2,
  Loader2
} from 'lucide-react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import dayjs from 'dayjs';
import 'dayjs/locale/ar';
import { getAllServices, getServiceCategories } from '../data/services';
import { availabilityAPI } from '../services/api';
import LocationPicker from './LocationPicker';
import { useCart } from '../contexts/CartContext';
import { API_ENDPOINTS, apiRequestWithRetry } from '../config/api';
import SectionCard from './booking/SectionCard';
import LoadingCard, { LoadingGrid } from './booking/LoadingCard';
import ProgressIndicator, { getBookingProgress } from './booking/ProgressIndicator';
import './EnhancedBooking.css';
import { useLocation } from 'react-router-dom';
import ServicesSection from './ServicesSection';

const EnhancedBookingPage = ({ onClose, selectedService = null, isAuthenticated, user, customer }) => {
  const navigate = useNavigate();
  const { cartItems, clearCart, addToCart, updateBookingData } = useCart();
  const [showFavorites, setShowFavorites] = useState(false);
    const location = useLocation();

  
  // Debug auth state
  useEffect(() => {
    // Auth state monitoring removed for production
  }, [isAuthenticated, user, customer]);

  // Main booking state
  const [bookingState, setBookingState] = useState({
    selectedService: selectedService,
    selectedDate: null,
    selectedTime: null,
    selectedStaff: null,
    selectedAddress: null,
    customerInfo: {
      name: user?.first_name || '',
      email: user?.email || '',
      phone: customer?.phone || '',
    },
    specialRequests: '',
    paymentMethod: null,
    couponCode: '',
    // Add offer-specific state
    isOfferBooking: selectedService?.isOfferBooking || false,
    offerData: selectedService?.offerData || (selectedService?.isOfferBooking ? selectedService : null),
    couponData: null,
    totalPrice: 0
  });

  // UI State
  const [currentSection, setCurrentSection] = useState('services');
  const [expandedSections, setExpandedSections] = useState(['services']);
  const [services, setServices] = useState([]);
  const [servicesToShow, setServicesToShow] = useState([]); // filtered list when preselected
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);
  const [availableDates, setAvailableDates] = useState([]);
  const [couponError, setCouponError] = useState('');
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  
  // Success Modal and Toast States
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastConfig, setToastConfig] = useState({ type: 'success', title: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);


  // Load addresses from database for the logged-in customer
  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);

  // Load customer addresses from database with retry logic
  const loadCustomerAddresses = useCallback(async () => {
    if (!customer?.id) {
      setAddresses([]);
      return;
    }

    setLoadingAddresses(true);
    try {
      const data = await apiRequestWithRetry(
        `${API_ENDPOINTS.addresses}?customer=${customer.id}`
      );
      
      // Handle different response formats
      let addressList = [];
      if (Array.isArray(data)) {
        addressList = data;
      } else if (data.results && Array.isArray(data.results)) {
        addressList = data.results;
      } else if (data.addresses && Array.isArray(data.addresses)) {
        addressList = data.addresses;
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
      setToastConfig({
        type: 'error',
        title: 'فشل في تحميل العناوين',
        message: error.message || 'حدث خطأ في تحميل العناوين'
      });
      setShowToast(true);
      setAddresses([]);
    } finally {
      setLoadingAddresses(false);
    }
  }, [customer?.id, bookingState.selectedAddress]);

  useEffect(() => {
    loadCustomerAddresses();
  }, [loadCustomerAddresses]);

  const availableStaff = [
    { id: 'sarah', name: 'سارة أحمد', specialization: 'الشعر والمكياج', rating: 4.9, image: 'http://localhost:8000/api/placeholder/60/60/' },
    { id: 'maria', name: 'مريم السعد', specialization: 'العناية بالبشرة والمساج', rating: 4.8, image: 'http://localhost:8000/api/placeholder/60/60/' },
    { id: 'aisha', name: 'عائشة محمد', specialization: 'العناية بالأظافر', rating: 4.9, image: 'http://localhost:8000/api/placeholder/60/60/' },
    { id: 'emma', name: 'إيما ويلسون', specialization: 'خدمات شاملة', rating: 5.0, image: 'http://localhost:8000/api/placeholder/60/60/' }
  ];

  const paymentMethods = [
    { id: 'cash', name: 'نقدي', icon: '💰', description: 'دفع نقدي عند الوصول' }
  ];
  

  // Consolidated cart and navigation handling
  useEffect(() => {
    const locationState = window.history.state;
    
    if (cartItems.length > 0) {
      const totalPrice = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
      
      setBookingState(prev => ({
        ...prev,
        selectedService: cartItems[0],
        totalPrice: totalPrice
      }));
      
      // Handle UI updates after state is set
      const timer = setTimeout(() => {
        setCurrentSection('cart');
        setExpandedSections(['cart']);
        
        // Auto-expand datetime section after cart section
        setTimeout(() => {
          setCurrentSection('datetime');
          setExpandedSections(['cart', 'datetime']);
        }, 500);
      }, 200);
      
      return () => clearTimeout(timer);
    }
  }, [cartItems]);

  // Auto-expand datetime section for offer bookings
  useEffect(() => {
    if (bookingState.selectedService?.isOfferService && bookingState.selectedService) {
      setExpandedSections(['offer', 'datetime']);
      setCurrentSection('offer');
    }
  }, [bookingState.selectedService?.isOfferService]);

  // Function to expand cart section
  const expandCartSection = () => {
    setCurrentSection('cart');
    setExpandedSections(['cart']);
    // Auto-expand datetime section after cart section
    setTimeout(() => {
      setCurrentSection('datetime');
      setExpandedSections(['cart', 'datetime']);
    }, 500);
  };

  // Load services on component mount
  useEffect(() => {
    const loadServices = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [allServices, categoriesData] = await Promise.all([
          getAllServices(),
          getServiceCategories()
        ]);
        // Services and categories loaded successfully
        
        // Convert categories object to array for dynamic colors
        const categoriesArray = Object.values(categoriesData);
        setCategories(categoriesArray);
        
        if (allServices && allServices.length > 0) {
          setServices(allServices);
        } else {
          // No services loaded from API, using fallback services
          // Fallback services if API fails
          setServices([
            {
              id: 1,
              name: 'خدمة تجميل',
              description: 'خدمة تجميل احترافية',
              basePrice: 500,
              image: 'http://localhost:8000/api/placeholder/300/200/',
              duration: 60
            },
            {
              id: 2,
              name: 'العناية بالشعر',
              description: 'خدمات العناية بالشعر المتقدمة',
              basePrice: 300,
              image: 'http://localhost:8000/api/placeholder/300/200/',
              duration: 90
            },
            {
              id: 3,
              name: 'المكياج',
              description: 'فن المكياج الاحترافي',
              basePrice: 400,
              image: 'http://localhost:8000/api/placeholder/300/200/',
              duration: 120
            }
          ]);
        }
        
        // Determine preselected service from prop or query param
        let preselected = selectedService;
        try {
          const params = new URLSearchParams(window.location.search);
          const qsId = params.get('serviceId');
          const qsName = params.get('serviceName');
          if (!preselected && (qsId || qsName)) {
            const byId = allServices?.find((s) => String(s.id) === String(qsId));
            const byName = allServices?.find((s) => s.name?.toLowerCase() === String(qsName || '').toLowerCase());
            preselected = byId || byName || null;
          }
        } catch (e) {
          // ignore URL parsing errors
        }

        // If a service is pre-selected, set it in state and filter list
        if (preselected) {
          const matched = allServices?.find((s) => String(s.id) === String(preselected.id)) || preselected;
          setBookingState((prev) => ({ ...prev, selectedService: matched }));
          setServicesToShow(matched ? [matched] : allServices || []);
          setExpandedSections(['services', 'datetime']);
          setCurrentSection('datetime');
        } else {
          setServicesToShow(allServices || []);
        }
      } catch (error) {
        console.error('Failed to load services:', error);
        setError('فشل في تحميل الخدمات. يرجى المحاولة مرة أخرى.');
        // Set fallback services
        setServices([
          {
            id: 1,
            name: 'خدمة تجميل',
            description: 'خدمة تجميل احترافية',
            basePrice: 500,
            image: '/api/placeholder/300/200',
            duration: 60
          }
        ]);
        // When using fallback, also respect preselected service if provided
        try {
          let fallbackList = [
            {
              id: 1,
              name: 'خدمة تجميل',
              description: 'خدمة تجميل احترافية',
              basePrice: 500,
              image: 'http://localhost:8000/api/placeholder/300/200/',
              duration: 60
            }
          ];
          setServicesToShow(selectedService ? fallbackList.filter(s => String(s.id) === String(selectedService.id) || s.name === selectedService.name) : fallbackList);
        } catch (e) {}
      } finally {
        setLoading(false);
      }
    };

    loadServices();
  }, [selectedService]);

  // Calculate total price
  useEffect(() => {
    if (bookingState.selectedService) {
      let basePrice = 0;
      let discount = 0;
      
      // Handle offer services differently
      if (bookingState.selectedService.isOfferService) {
        basePrice = bookingState.selectedService.price || bookingState.selectedService.basePrice || 800;
      } else {
        const service = services.find(s => s.id === bookingState.selectedService.id);
        if (service) {
          basePrice = service.basePrice || service.price_min || service.price || 800;
        }
      }
      
      if (bookingState.couponData) {
        discount = bookingState.couponData.discount_amount || 0;
      }
      
      setBookingState(prev => ({
        ...prev,
        totalPrice: Math.max(0, basePrice - discount)
      }));
    }
  }, [bookingState.selectedService, bookingState.couponData, services]);

  // Handle service selection with smooth scrolling
  const handleServiceSelect = (service) => {
    setBookingState(prev => ({ ...prev, selectedService: service }));
    expandSection('datetime');
    
    // Smooth scroll to next section
    setTimeout(() => {
      const datetimeSection = document.querySelector('[data-section="datetime"]');
      if (datetimeSection) {
        datetimeSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 300);
  };


  // Handle date selection
  const handleDateSelect = (date) => {
    setBookingState(prev => ({ ...prev, selectedDate: date }));
    // Generate time slots for selected date
    generateTimeSlots(date);
    expandSection('location');
  };

  // Handle time selection
  const handleTimeSelect = (time) => {
    setBookingState(prev => ({ ...prev, selectedTime: time }));
    expandSection('location');
  };

  // Handle address selection with optimistic UI updates
  const handleAddressSelect = async (address) => {
    // Update UI immediately
    setBookingState(prev => ({ ...prev, selectedAddress: address }));
    
    // Show success message
    setToastConfig({
      type: 'success',
      title: 'تم اختيار العنوان',
      message: `تم اختيار العنوان "${address.title}" بنجاح!`
    });
    setShowToast(true);
  };

  // Handle address deletion with better error handling
  const handleAddressDelete = async (addressId, event) => {
    event.stopPropagation();
    
    if (!confirm('هل أنت متأكد من حذف هذا العنوان؟')) {
      return;
    }

    try {
      await apiRequestWithRetry(
        `${API_ENDPOINTS.addresses}${addressId}/`,
        { method: 'DELETE' }
      );
      
      // Remove from local state
      setAddresses(prev => prev.filter(addr => addr.id !== addressId));
      
      // If deleted address was selected, clear selection
      if (bookingState.selectedAddress?.id === addressId) {
        setBookingState(prev => ({ ...prev, selectedAddress: null }));
      }
      
      setToastConfig({
        type: 'success',
        title: 'تم حذف العنوان',
        message: 'تم حذف العنوان بنجاح'
      });
      setShowToast(true);
      
    } catch (error) {
      console.error('Error deleting address:', error);
      setToastConfig({
        type: 'error',
        title: 'فشل في حذف العنوان',
        message: error.message || 'حدث خطأ في حذف العنوان'
      });
      setShowToast(true);
    }
  };

  // Handle payment method selection
  const handlePaymentSelect = (method) => {
    setBookingState(prev => ({ ...prev, paymentMethod: method }));
    expandSection('confirmation');
  };

  // Expand section and update current section
  const expandSection = (section) => {
    setExpandedSections(prev => [...new Set([...prev, section])]);
    setCurrentSection(section);
  };

  // Generate mock time slots
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

  // Handle coupon validation with retry logic
  const handleCouponValidation = async () => {
    if (!bookingState.couponCode.trim()) return;
    
    setIsValidatingCoupon(true);
    setCouponError('');
    
    try {
      const data = await apiRequestWithRetry(API_ENDPOINTS.validateCoupon, {
        method: 'POST',
        body: JSON.stringify({
          code: bookingState.couponCode,
          amount: bookingState.totalPrice || bookingState.selectedService?.basePrice || 0
        })
      });
      
      if (data.valid) {
        setBookingState(prev => ({
          ...prev,
          couponData: {
            id: data.coupon.id,
            code: data.coupon.code,
            name: data.coupon.name,
            discount_type: data.coupon.discount_type,
            discount_value: data.coupon.discount_value,
            discount_amount: data.discount_amount
          }
        }));
      } else {
        setCouponError(data.errors?.code?.[0] || 'كود الكوبون غير صحيح أو منتهي الصلاحية');
      }
    } catch (error) {
      console.error('Coupon validation error:', error);
      setCouponError(error.message || 'حدث خطأ في التحقق من الكوبون');
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  // Handle location picker
  const handleLocationConfirm = async (locationData) => {
    // Location data received and processed
    
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
      
      // Saving address to database with retry logic
      const savedAddress = await apiRequestWithRetry(API_ENDPOINTS.addresses, {
        method: 'POST',
        body: JSON.stringify(addressPayload)
      });
      // Address saved successfully
      
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
      
      // New address created
      
      // Add the new address to the addresses list
      setAddresses(prev => {
        const updatedAddresses = [...prev, newAddress];
        // Updated addresses list
        return updatedAddresses;
      });
      
      // Set the new address as selected
      setBookingState(prev => {
        const updatedState = { ...prev, selectedAddress: newAddress };
        // Updated booking state
        return updatedState;
      });
      
      // Close the location picker and move to next section
      setShowLocationPicker(false);
      expandSection('payment');
      
      // Show success message
      setToastConfig({
        type: 'success',
        title: 'تم إضافة العنوان',
        message: `تم إضافة العنوان "${newAddress.title}" بنجاح!`
      });
      setShowToast(true);
      
    } catch (error) {
      console.error('Error saving address:', error);
      setToastConfig({
        type: 'error',
        title: 'فشل في حفظ العنوان',
        message: error.message || 'حدث خطأ في حفظ العنوان'
      });
      setShowToast(true);
    }
  };

  // Comprehensive form validation
  const validateBooking = useCallback(() => {
    const errors = [];
    
    if (!bookingState.selectedService && cartItems.length === 0) {
      errors.push('يرجى اختيار خدمة');
    }
    
    if (!bookingState.selectedDate) {
      errors.push('يرجى اختيار التاريخ');
    }
    
    if (!bookingState.selectedTime) {
      errors.push('يرجى اختيار الوقت');
    }
    
    // Validate date is not in the past
    if (bookingState.selectedDate && dayjs(bookingState.selectedDate).isBefore(dayjs(), 'day')) {
      errors.push('لا يمكن الحجز في تاريخ سابق');
    }
    
    if (!bookingState.selectedAddress) {
      errors.push('يرجى اختيار العنوان');
    }
    
    if (!bookingState.paymentMethod) {
      errors.push('يرجى اختيار طريقة الدفع');
    }
    
    if (!customer?.id) {
      errors.push('يجب تسجيل الدخول أولاً');
    }
    
    return errors;
  }, [bookingState, cartItems, customer]);

  // Handle booking submission with comprehensive validation
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    const validationErrors = validateBooking();
    if (validationErrors.length > 0) {
      setToastConfig({
        type: 'error',
        title: 'بيانات غير مكتملة',
        message: validationErrors.join('\\n')
      });
      setShowToast(true);
      return;
    }
    
    setIsSubmitting(true);
    
    try {

      // Create booking payload
      const totalPrice = cartItems.length > 0 
        ? cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)
        : bookingState.totalPrice;

      // Use first cart item as selected service if coming from cart
      const selectedService = cartItems.length > 0 ? cartItems[0] : bookingState.selectedService;
      
      // Service and cart validation

      const bookingPayload = {
        customer: parseInt(customer.id),
        service: parseInt(selectedService.id),
        staff: bookingState.selectedStaff?.id ? parseInt(bookingState.selectedStaff.id) : null,
        address: parseInt(bookingState.selectedAddress.id),
        booking_date: dayjs(bookingState.selectedDate).format('YYYY-MM-DD'),
        booking_time: bookingState.selectedTime,
        payment_method: typeof bookingState.paymentMethod === 'object' ? bookingState.paymentMethod?.id : bookingState.paymentMethod || 'cash',
        special_requests: bookingState.specialRequests || '',
        price: totalPrice,
        coupon: bookingState.couponData?.id ? parseInt(bookingState.couponData.id) : null,
        // Add cart items if coming from cart
        cart_items: cartItems.length > 0 ? cartItems.map(item => ({
          service_id: parseInt(item.id),
          quantity: item.quantity,
          price: item.price
        })) : null
      };

      // Debug logging
      console.log('🔍 Debug - bookingState.paymentMethod:', bookingState.paymentMethod);
      console.log('🔍 Debug - payment_method value:', bookingState.paymentMethod?.id || 'cash');
      console.log('🔍 Debug - Full bookingPayload:', bookingPayload);
      console.log('🔍 Debug - authToken:', localStorage.getItem('authToken'));

      // Submitting booking

      // Submit booking to Django backend with retry logic
      const savedBooking = await apiRequestWithRetry(API_ENDPOINTS.bookings, {
        method: 'POST',
        body: JSON.stringify(bookingPayload)
      });
      // Booking saved successfully
      
      // For cash payment method only
      console.log('✅ Booking confirmed - payment on arrival');
      
      // Clear cart after successful booking
      clearCart();
      
      // Show success modal
      setShowSuccessModal(true);
      
      // Close the booking page after modal auto-closes
      setTimeout(() => {
        onClose();
      }, 7000); // Give extra time for modal to show
      
    } catch (error) {
      console.error('Booking error:', error);
      
      // Show error toast
      setToastConfig({
        type: 'error',
        title: 'فشل في الحجز',
        message: error.message || 'حدث خطأ في الحجز. يرجى المحاولة مرة أخرى.'
      });
      setShowToast(true);
      
      // Reset submitting state on error
      setIsSubmitting(false);
    }
  };


  // Section components



const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // مدة الفاصل بين كل عنصر
      delayChildren: 0.2, // تأخير بسيط قبل البدء
    },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

// const ServiceSelectionSection = () => (
//   <motion.div
//     variants={containerVariants}
//     initial="hidden"
//     animate="visible"
//     className="space-y-8"
//   >
//     {/* العنوان */}
//     <motion.div variants={fadeUp} className="text-center">
//       <h3
//         className="text-2xl font-bold mb-2"
//         style={{ color: "var(--warm-brown)" }}
//       >
//         اختيار الخدمة
//       </h3>
//       <p className="text-sm" style={{ color: "var(--medium-beige)" }}>
//         اختاري الخدمة التي تريدينها
//       </p>
//       <div
//         className="w-16 h-1 mx-auto mt-3 rounded-full"
//         style={{ background: "var(--glamour-gold)" }}
//       ></div>
//     </motion.div>

//     {/* حالة التحميل */}
//     {loading ? (
//       <motion.div variants={fadeUp} className="space-y-4 text-center py-6">
//         <div
//           className="animate-spin rounded-full h-10 w-10 border-b-2 mx-auto"
//           style={{ borderColor: "var(--glamour-gold)" }}
//         ></div>
//         <p className="mt-3 text-sm" style={{ color: "var(--warm-brown)" }}>
//           جاري تحميل الخدمات...
//         </p>
//         <LoadingGrid count={3} />
//       </motion.div>
//     ) : error ? (
//       <motion.div variants={fadeUp} className="text-center py-8">
//         <div className="text-red-500 mb-4">
//           <p className="text-lg font-semibold">حدث خطأ في تحميل الخدمات</p>
//           <p className="text-sm mt-2">{error}</p>
//         </div>
//         <motion.div whileHover={{ scale: 1.05 }}>
//           <Button
//             onClick={() => window.location.reload()}
//             style={{ background: "var(--glamour-gold)", color: "white" }}
//           >
//             إعادة المحاولة
//           </Button>
//         </motion.div>
//       </motion.div>
//     ) : (
//       <>
//         {/* العناصر الموجودة في السلة */}
//         {cartItems.length > 0 && (
//           <motion.div variants={fadeUp} className="mb-8">
//             <h3
//               className="text-xl font-semibold mb-4 text-center sm:text-right"
//               style={{ color: "var(--warm-brown)" }}
//             >
//               الخدمات المختارة من السلة
//             </h3>

//             <motion.div
//               variants={containerVariants}
//               initial="hidden"
//               animate="visible"
//               className="space-y-4"
//             >
//               {cartItems.map((item) => (
//                 <motion.div
//                   key={item.id}
//                   variants={fadeUp}
//                   whileHover={{ scale: 1.02, y: -3 }}
//                   transition={{ type: "spring", stiffness: 150 }}
//                 >
//                   <Card
//                     className="border-2 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 bg-white"
//                     style={{ borderColor: "var(--glamour-gold)" }}
//                   >
//                     <CardContent className="p-4 flex items-center space-x-4 space-x-reverse">
//                       <motion.img
//                         src={item.image || "/api/placeholder/80/80"}
//                         alt={item.name}
//                         className="w-16 h-16 object-cover rounded-lg"
//                         whileHover={{ scale: 1.05 }}
//                       />
//                       <div className="flex-1">
//                         <h4 className="font-semibold" style={{ color: "var(--warm-brown)" }}>
//                           {item.name}
//                         </h4>
//                         <p className="text-sm text-gray-600 mb-2">{item.description}</p>
//                         <div className="flex items-center justify-between">
//                           <span className="text-sm text-gray-500">
//                             الكمية: {item.quantity} × {item.price}
//                           </span>
//                           <span className="font-bold" style={{ color: "var(--glamour-gold)" }}>
//                             {item.price * item.quantity}
//                           </span>
//                         </div>
//                       </div>
//                     </CardContent>
//                   </Card>
//                 </motion.div>
//               ))}

//               <motion.div
//                 whileHover={{ scale: 1.04 }}
//                 className="text-center mt-6"
//               >
//                 <Button
//                   onClick={() => navigate("/cart")}
//                   variant="outline"
//                   className="px-6 py-2 rounded-full font-semibold"
//                   style={{
//                     borderColor: "var(--glamour-gold)",
//                     color: "var(--glamour-gold)",
//                   }}
//                 >
//                   تعديل السلة
//                 </Button>
//               </motion.div>
//             </motion.div>
//           </motion.div>
//         )}

//         {/* اختيار الخدمات */}
//         <motion.div
//           variants={containerVariants}
//           initial="hidden"
//           animate="visible"
//           className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
//         >
//           {(servicesToShow.length ? servicesToShow : services).map((service) => (
//             <motion.div
//               key={service.id}
//               variants={fadeUp}
//               whileHover={{ scale: 1.03, y: -5 }}
//               transition={{ type: "spring", stiffness: 120 }}
//             >
//               <Card
//                 className={`cursor-pointer overflow-hidden rounded-xl shadow-sm hover:shadow-2xl transition-all duration-300 ${
//                   bookingState.selectedService?.id === service.id
//                     ? "ring-2 ring-yellow-400"
//                     : ""
//                 }`}
//                 onClick={() => handleServiceSelect(service)}
//                 role="button"
//                 tabIndex={0}
//                 aria-label={`اختيار خدمة ${service.name}`}
//                 aria-pressed={bookingState.selectedService?.id === service.id}
//                 onKeyDown={(e) => {
//                   if (e.key === "Enter" || e.key === " ") {
//                     e.preventDefault();
//                     handleServiceSelect(service);
//                   }
//                 }}
//               >
//                 <div className="relative">
//                   <motion.img
//                     src={
//                       service.image ||
//                       "http://localhost:8000/api/placeholder/300/200/"
//                     }
//                     alt={`صورة خدمة ${service.name}`}
//                     className="w-full h-48 object-cover rounded-t-lg"
//                     loading="lazy"
//                     whileHover={{ scale: 1.05 }}
//                     transition={{ duration: 0.4 }}
//                   />
//                   <Badge
//                     className="absolute top-3 right-3 shadow-md"
//                     style={{
//                       background: "var(--glamour-gold)",
//                       color: "white",
//                     }}
//                   >
//                     {service.basePrice ||
//                       service.price_min ||
//                       service.price ||
//                       800}
//                   </Badge>
//                 </div>

//                 <CardContent className="p-4 space-y-2">
//                   <h4 className="font-bold text-lg" style={{ color: "var(--warm-brown)" }}>
//                     {service.name}
//                   </h4>
//                   <p
//                     className="text-sm mb-3 opacity-80 line-clamp-2"
//                     style={{ color: "var(--warm-brown)" }}
//                   >
//                     {service.description}
//                   </p>
//                   <div className="flex items-center justify-between">
//                     <span className="text-sm" style={{ color: "var(--medium-beige)" }}>
//                       {service.duration || "60"} دقيقة
//                     </span>
//                     <motion.div whileHover={{ scale: 1.05 }}>
//                       <DynamicButton
//                         size="sm"
//                         categoryId={service.category_id}
//                         categories={categories}
//                         className="px-4 py-2 rounded-full font-semibold shadow-md hover:shadow-lg transition-all duration-300"
//                         aria-label={`احجز خدمة ${service.name}`}
//                         onClick={() => handleServiceSelect(service)}
//                       >
//                         احجز الآن
//                       </DynamicButton>
//                     </motion.div>
//                   </div>
//                 </CardContent>
//               </Card>
//             </motion.div>
//           ))}
//         </motion.div>
//       </>
//     )}
//   </motion.div>
// );

// Date and time section

const DateTimeSection = () => (
  <motion.div
    variants={containerVariants}
    initial="hidden"
    animate="visible"
    className="space-y-8"
  >
    {/* العنوان */}
    <motion.div variants={fadeUp} className="text-center">
      <h3
        className="text-2xl font-bold mb-2"
        style={{ color: "var(--warm-brown)" }}
      >
        اختيار التاريخ والوقت
      </h3>
      <p className="text-sm" style={{ color: "var(--medium-beige)" }}>
        اختاري التاريخ والوقت المناسب لك
      </p>
      <div
        className="w-16 h-1 mx-auto mt-3 rounded-full"
        style={{ background: "var(--glamour-gold)" }}
      ></div>
    </motion.div>

    <motion.div
      variants={containerVariants}
      className="grid grid-cols-1 lg:grid-cols-2 gap-8"
    >
      {/* التقويم */}
      <motion.div variants={fadeUp}>
        <h4
          className="font-semibold mb-4"
          style={{ color: "var(--warm-brown)" }}
        >
          اختر التاريخ
        </h4>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-xl shadow-sm p-2 bg-white"
        >
          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ar">
            <DateCalendar
              value={bookingState.selectedDate}
              onChange={handleDateSelect}
              minDate={dayjs()}
              maxDate={dayjs().add(30, "day")}
              sx={{
                "& .MuiPickersCalendarHeader-root": {
                  color: "var(--warm-brown)",
                },
                "& .MuiDayCalendar-weekDayLabel": {
                  color: "var(--medium-beige)",
                },
                "& .MuiPickersDay-root": {
                  color: "var(--warm-brown)",
                  borderRadius: "8px",
                },
                "& .MuiPickersDay-root:hover": {
                  backgroundColor: "var(--silken-dune)",
                },
                "& .MuiPickersDay-root.Mui-selected": {
                  backgroundColor: "var(--glamour-gold)",
                  color: "white",
                },
              }}
            />
          </LocalizationProvider>
        </motion.div>
      </motion.div>

      {/* الأوقات */}
      {bookingState.selectedDate && (
        <motion.div variants={fadeUp}>
          <h4
            className="font-semibold mb-4"
            style={{ color: "var(--warm-brown)" }}
          >
            اختر الوقت
          </h4>
          <motion.div
            variants={containerVariants}
            className="grid grid-cols-3 gap-3 max-h-64 overflow-y-auto"
          >
            {timeSlots.map((time, i) => (
              <motion.div
                key={time}
                variants={fadeUp}
                whileHover={{
                  scale: 1.05,
                  y: -3,
                }}
                transition={{
                  type: "spring",
                  stiffness: 150,
                  delay: i * 0.03,
                }}
              >
                <Button
                  variant={
                    bookingState.selectedTime === time ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => handleTimeSelect(time)}
                  className="py-2 rounded-full shadow-sm hover:shadow-md transition-all duration-300"
                  style={{
                    background:
                      bookingState.selectedTime === time
                        ? "var(--glamour-gold)"
                        : "transparent",
                    color:
                      bookingState.selectedTime === time
                        ? "white"
                        : "var(--warm-brown)",
                    borderColor: "var(--silken-dune)",
                  }}
                >
                  {time}
                </Button>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  </motion.div>
);



const LocationSection = () => (
  <motion.div
    variants={containerVariants}
    initial="hidden"
    animate="visible"
    className="space-y-8"
  >
    {/* العنوان */}
    <motion.div variants={fadeUp} className="text-center">
      <h3
        className="text-2xl font-bold mb-2"
        style={{ color: "var(--warm-brown)" }}
      >
        اختيار العنوان
      </h3>
      <p className="text-sm" style={{ color: "var(--medium-beige)" }}>
        اختاري العنوان أو أضيفي عنوان جديد
      </p>
      <div
        className="w-16 h-1 mx-auto mt-3 rounded-full"
        style={{ background: "var(--glamour-gold)" }}
      ></div>
    </motion.div>

    <motion.div variants={containerVariants} className="space-y-4">
      {/* حالة التحميل */}
      {loadingAddresses && (
        <motion.div variants={fadeUp} className="text-center py-8">
          <div
            className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto"
            style={{ borderColor: "var(--glamour-gold)" }}
          ></div>
          <p className="mt-2 text-sm" style={{ color: "var(--warm-brown)" }}>
            جاري تحميل العناوين...
          </p>
        </motion.div>
      )}

      {/* لا توجد عناوين */}
      {!loadingAddresses && addresses.length === 0 && (
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="text-center py-8 bg-yellow-50 rounded-lg border border-yellow-200 shadow-sm"
        >
          <motion.div
            className="text-5xl mb-3"
            animate={{ y: [0, -4, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          >
            📍
          </motion.div>
          <p
            className="text-sm font-semibold mb-2"
            style={{ color: "var(--warm-brown)" }}
          >
            لا توجد عناوين محفوظة
          </p>
          <p className="text-xs text-gray-600 mb-4">
            أضيفي عنوان جديد لإكمال الحجز
          </p>
        </motion.div>
      )}

      {/* قائمة العناوين */}
      {!loadingAddresses &&
        addresses.map((address, i) => (
          <motion.div
            key={address.id}
            variants={fadeUp}
            whileHover={{ scale: 1.02, y: -3 }}
            transition={{ type: "spring", stiffness: 120, delay: i * 0.05 }}
          >
            <Card
              className={`cursor-pointer overflow-hidden transition-all duration-300 rounded-xl shadow-sm hover:shadow-md ${
                bookingState.selectedAddress?.id === address.id
                  ? "ring-2 ring-yellow-400"
                  : ""
              }`}
              onClick={() => handleAddressSelect(address)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 space-x-reverse flex-1">
                    <motion.div
                      whileHover={{ rotate: -15 }}
                      transition={{ type: "spring", stiffness: 200 }}
                    >
                      <MapPin
                        className="w-5 h-5"
                        style={{ color: "var(--glamour-gold)" }}
                      />
                    </motion.div>
                    <div className="flex-1">
                      <h4
                        className="font-semibold"
                        style={{ color: "var(--warm-brown)" }}
                      >
                        {address.title}
                      </h4>
                      <p
                        className="text-sm opacity-80"
                        style={{ color: "var(--warm-brown)" }}
                      >
                        {address.address}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {address.isDefault && (
                      <Badge
                        style={{
                          background: "var(--glamour-gold)",
                          color: "white",
                        }}
                      >
                        افتراضي
                      </Badge>
                    )}
                    <motion.div whileHover={{ scale: 1.1 }}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleAddressDelete(address.id, e)}
                        className="p-2 hover:bg-red-50"
                        aria-label="حذف العنوان"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}

      {/* زر إضافة عنوان */}
      <motion.div variants={fadeUp} whileHover={{ scale: 1.04 }}>
        <Button
          variant="outline"
          onClick={() => setShowLocationPicker(true)}
          className="w-full py-3 rounded-full font-semibold shadow-sm hover:shadow-md transition-all duration-300"
          style={{
            borderColor: "var(--glamour-gold)",
            color: "var(--glamour-gold)",
          }}
        >
          <Plus className="w-4 h-4 ml-2" />
          إضافة عنوان جديد
        </Button>
      </motion.div>
    </motion.div>

    {/* مكون اختيار الموقع */}
    {showLocationPicker && (
      <LocationPicker
        isOpen={showLocationPicker}
        onClose={() => setShowLocationPicker(false)}
        onLocationConfirm={handleLocationConfirm}
      />
    )}
  </motion.div>
);


  const PaymentSection = () => (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--warm-brown)' }}>
            طريقة الدفع
          </h3>
          <p className="text-sm" style={{ color: 'var(--medium-beige)' }}>
            اختاري طريقة الدفع المناسبة لك
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {paymentMethods.map((method) => (
          <Card 
            key={method.id}
            className={`cursor-pointer transition-all duration-300 hover:scale-105 ${
              bookingState.paymentMethod?.id === method.id ? 'ring-2 ring-yellow-400' : ''
            }`}
            onClick={() => handlePaymentSelect(method)}
          >
            <CardContent className="p-4 text-center">
              <div className="text-3xl mb-2">{method.icon}</div>
              <h4 className="font-semibold mb-1" style={{ color: 'var(--warm-brown)' }}>
                {method.name}
              </h4>
              <p className="text-xs opacity-80" style={{ color: 'var(--warm-brown)' }}>
                {method.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>


      {/* Price Summary */}
      <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg p-6 border" style={{ borderColor: 'var(--glamour-gold)' }}>
        <h4 className="font-semibold mb-4 text-center" style={{ color: 'var(--warm-brown)' }}>
          ملخص الطلب
        </h4>
        
        {/* Cart Items Summary */}
        {cartItems.length > 0 && (
          <div className="space-y-2 mb-4">
            <h5 className="font-medium text-sm" style={{ color: 'var(--warm-brown)' }}>
              الخدمات المختارة:
            </h5>
            {cartItems.map((item) => (
              <div key={item.id} className="flex justify-between items-center text-sm">
                <span className="truncate flex-1">{item.name}</span>
                <div className="flex items-center space-x-2 space-x-reverse text-xs text-gray-500">
                  <span>x{item.quantity}</span>
<span>{item.price * item.quantity}</span>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Total Price */}
        <div className="border-t pt-4" style={{ borderColor: 'var(--silken-dune)' }}>
          <div className="flex justify-between items-center text-lg font-bold">
            <span style={{ color: 'var(--warm-brown)' }}>المجموع الكلي:</span>
            <span className="text-2xl" style={{ color: 'var(--glamour-gold)' }}>
              {cartItems.length > 0 
                ? cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)
                : bookingState.totalPrice
              }
            </span>
          </div>
        </div>
      </div>

      {/* Coupon Section */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold mb-3" style={{ color: 'var(--warm-brown)' }}>
          كود الخصم
        </h4>
        <div className="flex gap-2">
          <Input
            placeholder="أدخل كود الخصم"
            value={bookingState.couponCode}
            onChange={(e) => setBookingState(prev => ({ ...prev, couponCode: e.target.value }))}
            className="flex-1"
          />
          <Button
            onClick={handleCouponValidation}
            disabled={isValidatingCoupon || !bookingState.couponCode.trim()}
            style={{ background: 'var(--glamour-gold)', color: 'white' }}
          >
            {isValidatingCoupon ? 'جاري التحقق...' : 'تطبيق'}
          </Button>
        </div>
        {couponError && (
          <p className="text-red-500 text-sm mt-2">{couponError}</p>
        )}
        {bookingState.couponData && (
          <div className="flex items-center mt-2 text-green-600">
            <Check className="w-4 h-4 ml-1" />
            <span className="text-sm">تم تطبيق الخصم: {bookingState.couponData.discount_amount} ر.س</span>
          </div>
        )}
      </div>

    </div>
  );

  const ConfirmationSection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--warm-brown)' }}>
          تأكيد الحجز
        </h3>
        <p className="text-sm" style={{ color: 'var(--medium-beige)' }}>
          راجعي تفاصيل حجزك قبل التأكيد
        </p>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h4 className="font-semibold mb-4" style={{ color: 'var(--warm-brown)' }}>
          ملخص الحجز
        </h4>
        
        <div className="space-y-3">
          {/* Show offer information if it's an offer booking */}
          {bookingState.selectedService?.isOfferService && bookingState.selectedService?.offerData && (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg border border-yellow-200 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-5 h-5 text-yellow-600" />
                <span className="font-semibold text-yellow-800">عرض خاص</span>
              </div>
              <div className="text-sm text-yellow-700">
                <div className="font-semibold">{bookingState.selectedService.offerData.title}</div>
                {bookingState.selectedService.offerData.originalPrice && bookingState.selectedService.offerData.offer_price && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="line-through text-gray-500">
                      {bookingState.selectedService.offerData.originalPrice} ر.س
                    </span>
                    <span className="font-bold text-green-600">
                      {bookingState.selectedService.offerData.offer_price} ر.س
                    </span>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      وفرت {bookingState.selectedService.offerData.originalPrice - bookingState.selectedService.offerData.offer_price} ر.س
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className="flex justify-between">
            <span style={{ color: 'var(--medium-beige)' }}>الخدمة:</span>
            <span style={{ color: 'var(--warm-brown)' }}>{bookingState.selectedService?.name}</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: 'var(--medium-beige)' }}>التاريخ:</span>
            <span style={{ color: 'var(--warm-brown)' }}>
              {dayjs(bookingState.selectedDate).format('YYYY/MM/DD')}
            </span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: 'var(--medium-beige)' }}>الوقت:</span>
            <span style={{ color: 'var(--warm-brown)' }}>{bookingState.selectedTime}</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: 'var(--medium-beige)' }}>العنوان:</span>
            <span style={{ color: 'var(--warm-brown)' }}>{bookingState.selectedAddress?.title}</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: 'var(--medium-beige)' }}>طريقة الدفع:</span>
            <span style={{ color: 'var(--warm-brown)' }}>{bookingState.paymentMethod?.name}</span>
          </div>
          {bookingState.couponData && (
            <div className="flex justify-between text-green-600">
              <span>الخصم:</span>
              <span>-{bookingState.couponData.discount_amount} ر.س</span>
            </div>
          )}
          <div className="border-t pt-3 flex justify-between font-bold text-lg">
            <span style={{ color: 'var(--warm-brown)' }}>المجموع:</span>
            <span style={{ color: 'var(--glamour-gold)' }}>{bookingState.totalPrice} ر.س</span>
          </div>
        </div>
      </div>

      <DynamicButton
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleBookingSubmit(e);
        }}
        categoryId={bookingState.selectedService?.category_id}
        categories={categories}
        className="booking-button-ripple w-full py-4 text-lg font-semibold"
        size="lg"
        disabled={isSubmitting}
        style={{
          opacity: isSubmitting ? 0.6 : 1,
          cursor: isSubmitting ? 'not-allowed' : 'pointer',
          pointerEvents: isSubmitting ? 'none' : 'auto'
        }}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin ml-2" />
            جارٍ المعالجة...
          </>
        ) : (
          'تأكيد الحجز'
        )}
      </DynamicButton>
    </div>
  );

  // Main component return
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-salon-cream text-auto">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:py-8">
        {/* Header with prominent back button */}
        <div className="booking-header flex items-center justify-between mb-6 sm:mb-8 bg-white rounded-lg shadow-sm p-4">
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

        {/* Progress Indicator */}
        <ProgressIndicator 
          progress={getBookingProgress(bookingState, cartItems)} 
          className="mb-6"
        />
        
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
              {/* Service Selection - Hide if coming from cart or offer booking */}
              {cartItems.length === 0 && !bookingState.selectedService?.isOfferService && (
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
                      <ServiceSelectionSection />
                    </CardContent>
                  )}
                </Card>
              )}

              {/* Offer Information Section - Show if coming from offer */}
              {bookingState.selectedService?.isOfferService && bookingState.selectedService?.offerData && (
                <Card className="overflow-hidden border-2" style={{ borderColor: 'var(--glamour-gold)' }}>
                  <CardHeader 
                    className="cursor-pointer"
                    onClick={() => setCurrentSection('offer')}
                    style={{ background: 'var(--champagne-veil)' }}
                  >
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center">
                        <span className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ml-3"
                              style={{ background: 'var(--glamour-gold)' }}>
                          <Star className="w-4 h-4" />
                        </span>
                        العرض المختار
                      </CardTitle>
                      <ArrowRight className={`w-5 h-5 transition-transform ${currentSection === 'offer' ? 'rotate-90' : ''}`} />
                    </div>
                    
                    {/* Show offer preview when collapsed */}
                    {!expandedSections.includes('offer') && (
                      <div className="mt-4 flex items-center space-x-3 space-x-reverse">
                        <img 
                          src={
                            bookingState.selectedService.offerData.image
                              ? (bookingState.selectedService.offerData.image.startsWith('http') 
                                  ? bookingState.selectedService.offerData.image 
                                  : `http://localhost:8000${bookingState.selectedService.offerData.image}`)
                              : bookingState.selectedService.offerData.thumbnail
                                ? (bookingState.selectedService.offerData.thumbnail.startsWith('http') 
                                    ? bookingState.selectedService.offerData.thumbnail 
                                    : `http://localhost:8000${bookingState.selectedService.offerData.thumbnail}`)
                                : 'http://localhost:8000/api/placeholder/60/60/'
                          } 
                          alt={bookingState.selectedService.offerData.title}
                          className="w-12 h-12 rounded-lg object-cover"
                          onError={(e) => {
                            e.target.src = 'http://localhost:8000/api/placeholder/60/60/';
                          }}
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm" style={{ color: 'var(--warm-brown)' }}>
                            {bookingState.selectedService.offerData.title}
                          </h4>
                          {bookingState.selectedService.offerData.originalPrice && bookingState.selectedService.offerData.offer_price && (
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs line-through text-gray-500">
                                {bookingState.selectedService.offerData.originalPrice} ر.س
                              </span>
                              <span className="text-sm font-bold text-green-600">
                                {bookingState.selectedService.offerData.offer_price} ر.س
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardHeader>
                  {expandedSections.includes('offer') && (
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4 space-x-reverse">
                        <img 
                          src={
                            bookingState.selectedService.offerData.image
                              ? (bookingState.selectedService.offerData.image.startsWith('http') 
                                  ? bookingState.selectedService.offerData.image 
                                  : `http://localhost:8000${bookingState.selectedService.offerData.image}`)
                              : bookingState.selectedService.offerData.thumbnail
                                ? (bookingState.selectedService.offerData.thumbnail.startsWith('http') 
                                    ? bookingState.selectedService.offerData.thumbnail 
                                    : `http://localhost:8000${bookingState.selectedService.offerData.thumbnail}`)
                                : 'http://localhost:8000/api/placeholder/120/120/'
                          } 
                          alt={bookingState.selectedService.offerData.title}
                          className="w-24 h-24 rounded-lg object-cover"
                          onError={(e) => {
                            console.log('❌ Offer image failed to load:', e.target.src);
                            e.target.src = 'http://localhost:8000/api/placeholder/120/120/';
                          }}
                          onLoad={() => console.log('✅ Offer image loaded:', bookingState.selectedService.offerData.image)}
                        />
                        <div className="flex-1">
                          <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--warm-brown)' }}>
                            {bookingState.selectedService.offerData.title}
                          </h3>
                          <p className="text-sm mb-3" style={{ color: 'var(--medium-beige)' }}>
                            {bookingState.selectedService.offerData.description || bookingState.selectedService.offerData.short_description}
                          </p>
                          {bookingState.selectedService.offerData.originalPrice && bookingState.selectedService.offerData.offer_price && (
                            <div className="flex items-center gap-3">
                              <span className="text-lg line-through text-gray-500">
                                {bookingState.selectedService.offerData.originalPrice} ر.س
                              </span>
                              <span className="text-2xl font-bold text-green-600">
                                {bookingState.selectedService.offerData.offer_price} ر.س
                              </span>
                              <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                                وفرت {bookingState.selectedService.offerData.originalPrice - bookingState.selectedService.offerData.offer_price} ر.س
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
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
  الكمية: {item.quantity} × {item.price}
                              </p>
                            </div>
                            <span className="font-bold" style={{ color: 'var(--glamour-gold)' }}>
{item.price * item.quantity}
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
              <Card className="overflow-hidden" data-section="datetime">
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
                    <DateTimeSection />
                  </CardContent>
                )}
              </Card>

              {/* Location - Only show if no address is selected OR if user wants to change address */}
              {(!bookingState.selectedAddress || currentSection === 'location') && (
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
                      <LocationSection />
                    </CardContent>
                  )}
                </Card>
              )}

              {/* Checkout Button - Navigate to separate checkout page */}
              {bookingState.selectedAddress && (
                <Card className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--warm-brown)' }}>
                        جاهز لإكمال الطلب
                      </h3>
                      <p className="text-sm mb-6" style={{ color: 'var(--medium-beige)' }}>
                        تم اختيار جميع التفاصيل المطلوبة. انقري على الزر أدناه لإضافة الخدمة إلى السلة
                      </p>
                      <Button
                        onClick={() => {
                          // Add service to cart
                          if (bookingState.selectedService) {
                            addToCart(bookingState.selectedService, 1);
                            
                            // Store booking data in localStorage via CartContext
                            const bookingData = {
                              selectedService: bookingState.selectedService,
                              selectedDate: bookingState.selectedDate,
                              selectedTime: bookingState.selectedTime,
                              selectedAddress: bookingState.selectedAddress,
                              customerInfo: bookingState.customerInfo,
                              specialRequests: bookingState.specialRequests
                            };
                            
                            updateBookingData(bookingData);
                            
                            // Navigate to checkout page with success parameter
                            window.location.href = '/checkout?added=true';
                          }
                        }}
                        className="w-full py-4 text-lg font-semibold"
                        style={{ 
                          background: 'var(--glamour-gold)', 
                          color: 'white',
                          borderRadius: '0.5rem'
                        }}
                      >
                        أضف إلى السلة
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

            </div>
          </div>

          {/* Sidebar - Booking Summary */}
          <div className="lg:col-span-1 order-1 lg:order-2">
            <div className="booking-sidebar sticky top-4 lg:top-8">
              <Card className="p-6">
                <h3 className="font-bold text-lg mb-4" style={{ color: 'var(--warm-brown)' }}>
                  ملخص الحجز
                </h3>
                
                <div className="space-y-4">
                  {/* Offer Information */}
                  {bookingState.selectedService?.isOfferService && bookingState.selectedService?.offerData && (
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg border border-yellow-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="w-4 h-4 text-yellow-600" />
                        <span className="font-semibold text-yellow-800 text-sm">عرض خاص</span>
                      </div>
                      <div className="text-xs text-yellow-700">
                        <div className="font-semibold">{bookingState.selectedService.offerData.title}</div>
                        {bookingState.selectedService.offerData.originalPrice && bookingState.selectedService.offerData.offer_price && (
                          <div className="flex items-center gap-1 mt-1">
                            <span className="line-through text-gray-500">
                              {bookingState.selectedService.offerData.originalPrice} ر.س
                            </span>
                            <span className="font-bold text-green-600">
                              {bookingState.selectedService.offerData.offer_price} ر.س
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
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
{item.quantity} × {item.price}
                              </p>
                            </div>
                            <span className="text-sm font-bold" style={{ color: 'var(--glamour-gold)' }}>
{item.price * item.quantity}
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
                          src={
                            bookingState.selectedService.isOfferService && bookingState.selectedService.offerData?.image
                              ? (bookingState.selectedService.offerData.image.startsWith('http') 
                                  ? bookingState.selectedService.offerData.image 
                                  : `http://localhost:8000${bookingState.selectedService.offerData.image}`)
                              : bookingState.selectedService.image || 'http://localhost:8000/api/placeholder/60/60/'
                          } 
                          alt={bookingState.selectedService.name}
                          className="w-12 h-12 rounded-lg object-cover"
                          onError={(e) => {
                            console.log('❌ Image failed to load in booking summary:', e.target.src);
                            e.target.src = 'http://localhost:8000/api/placeholder/60/60/';
                          }}
                          onLoad={() => console.log('✅ Image loaded in booking summary:', bookingState.selectedService.isOfferService ? bookingState.selectedService.offerData?.image : bookingState.selectedService.image)}
                        />
                        <div className="flex-1">
                          <p className="font-medium" style={{ color: 'var(--warm-brown)' }}>
                            {bookingState.selectedService.name}
                          </p>
                          {bookingState.selectedService.isOfferService && bookingState.selectedService.originalPrice ? (
                            <div className="flex items-center gap-2">
                              <span className="text-sm line-through text-gray-500">
                                {bookingState.selectedService.originalPrice} ر.س
                              </span>
                              <span className="text-sm font-bold text-green-600">
                                {bookingState.selectedService.price} ر.س
                              </span>
                            </div>
                          ) : (
                            <p className="text-sm" style={{ color: 'var(--glamour-gold)' }}>
                              {bookingState.selectedService.basePrice || bookingState.selectedService.price_min || bookingState.selectedService.price || 800} ر.س
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Show message if no services selected */}
                  {cartItems.length === 0 && !bookingState.selectedService && (
                    <div className="text-center py-8 px-4">
                      <div className="text-6xl mb-4">📋</div>
                      <p className="text-sm font-semibold mb-2" style={{ color: 'var(--warm-brown)' }}>
                        لم يتم اختيار أي خدمات بعد
                      </p>
                      <p className="text-xs text-gray-500 mb-4">
                        اختاري خدمة من القائمة أعلاه لبدء الحجز
                      </p>
                      <div className="flex items-center justify-center gap-2 text-xs" style={{ color: 'var(--medium-beige)' }}>
                        <span className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs" style={{ background: 'var(--glamour-gold)' }}>1</span>
                        <span>اختيار الخدمة</span>
                        <span>→</span>
                        <span className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs" style={{ background: '#ccc' }}>2</span>
                        <span>التاريخ</span>
                        <span>→</span>
                        <span className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs" style={{ background: '#ccc' }}>3</span>
                        <span>العنوان</span>
                      </div>
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
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold" style={{ color: 'var(--warm-brown)' }}>
                          العنوان
                        </h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setCurrentSection('location');
                            setExpandedSections(prev => [...prev, 'location']);
                          }}
                          className="text-xs px-2 py-1"
                          style={{ color: 'var(--glamour-gold)' }}
                        >
                          تغيير
                        </Button>
                      </div>
                      <p className="text-sm" style={{ color: 'var(--medium-beige)' }}>
                        {bookingState.selectedAddress.title}
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
                          } ر.س
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

      {/* Success Modal */}
      <SimpleSuccessModal
        isOpen={showSuccessModal}
        onClose={() => {
          // Success modal closed
          setShowSuccessModal(false);
          // Reset submitting state when modal closes
          setIsSubmitting(false);
        }}
        title="تم تأكيد حجزك بنجاح ✅"
        message="Your booking has been confirmed successfully. ستصلك رسالة تأكيد قريباً."
        autoClose={true}
        autoCloseDelay={6000}
      />


      {/* Toast Notifications */}
      <Toast
        isOpen={showToast}
        onClose={() => setShowToast(false)}
        type={toastConfig.type}
        title={toastConfig.title}
        message={toastConfig.message}
        autoClose={true}
        autoCloseDelay={4000}
      />

    </div>
  );
};

export default EnhancedBookingPage;