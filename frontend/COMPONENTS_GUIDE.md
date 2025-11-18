# دليل المكونات - Frontend

## 📋 نظرة عامة

هذا الدليل يوضح جميع المكونات في مشروع صالون الجمال، منظمة حسب الوظيفة والاستخدام.

## 🏗️ هيكل المكونات

```
src/components/
├── ui/                    # مكونات واجهة المستخدم الأساسية
├── booking/              # مكونات نظام الحجز
├── blog/                 # مكونات المدونة
├── payment/              # مكونات الدفع
├── Header.jsx            # رأس الصفحة
├── Footer.jsx            # تذييل الصفحة
├── HomePage.jsx          # الصفحة الرئيسية
├── ServicesPage.jsx      # صفحة الخدمات
├── OffersPage.jsx        # صفحة العروض
├── ContactPage.jsx       # صفحة التواصل
└── ...                   # مكونات أخرى
```

## 🎨 مكونات واجهة المستخدم (`ui/`)

### 1. مكونات أساسية

#### Button.jsx
```jsx
// أزرار مخصصة بأنماط مختلفة
<Button variant="primary" size="lg" onClick={handleClick}>
  نص الزر
</Button>

// الأنماط المتاحة
- primary: أزرار أساسية
- secondary: أزرار ثانوية
- outline: أزرار محاطة
- ghost: أزرار شفافة
- danger: أزرار خطرة
```

#### Card.jsx
```jsx
// بطاقات محتوى قابلة للتخصيص
<Card className="p-6 shadow-lg">
  <CardHeader>
    <CardTitle>عنوان البطاقة</CardTitle>
  </CardHeader>
  <CardContent>
    محتوى البطاقة
  </CardContent>
</Card>
```

#### Modal.jsx
```jsx
// نوافذ منبثقة تفاعلية
<Modal isOpen={isOpen} onClose={onClose}>
  <ModalHeader>عنوان النافذة</ModalHeader>
  <ModalBody>
    محتوى النافذة
  </ModalBody>
  <ModalFooter>
    <Button onClick={onClose}>إغلاق</Button>
  </ModalFooter>
</Modal>
```

### 2. مكونات الإدخال

#### Input.jsx
```jsx
// حقول إدخال مخصصة
<Input
  type="text"
  placeholder="أدخل النص"
  value={value}
  onChange={onChange}
  error={error}
  required
/>
```

#### Select.jsx
```jsx
// قوائم اختيار متقدمة
<Select
  options={options}
  value={selectedValue}
  onChange={onChange}
  placeholder="اختر خيار"
  searchable
/>
```

#### DatePicker.jsx
```jsx
// منتقي التاريخ
<DatePicker
  selected={selectedDate}
  onChange={onDateChange}
  minDate={new Date()}
  maxDate={maxDate}
  locale="ar"
/>
```

#### TimePicker.jsx
```jsx
// منتقي الوقت
<TimePicker
  value={selectedTime}
  onChange={onTimeChange}
  format="24h"
  step={30}
/>
```

### 3. مكونات العرض

#### LoadingSpinner.jsx
```jsx
// مؤشر التحميل
<LoadingSpinner size="lg" color="primary" />
```

#### ProgressBar.jsx
```jsx
// شريط التقدم
<ProgressBar
  progress={75}
  total={100}
  showPercentage
  color="success"
/>
```

#### Toast.jsx
```jsx
// إشعارات سريعة
<Toast
  type="success"
  message="تم الحفظ بنجاح"
  duration={3000}
  position="top-right"
/>
```

#### Carousel.jsx
```jsx
// عرض شرائح
<Carousel
  items={items}
  autoplay
  interval={3000}
  showDots
  showArrows
/>
```

## 🏥 مكونات نظام الحجز (`booking/`)

### 1. الصفحة الرئيسية للحجز

#### EnhancedBookingPage.jsx
```jsx
// الصفحة الرئيسية للحجز
const EnhancedBookingPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingData, setBookingData] = useState({});
  
  const steps = [
    { id: 1, title: 'اختيار الخدمة', component: ServiceSelection },
    { id: 2, title: 'التاريخ والوقت', component: DateTimeSelection },
    { id: 3, title: 'الموقع', component: LocationSelection },
    { id: 4, title: 'التأكيد', component: BookingConfirmation }
  ];
  
  return (
    <div className="booking-container">
      <ProgressIndicator steps={steps} currentStep={currentStep} />
      {renderCurrentStep()}
    </div>
  );
};
```

### 2. اختيار الخدمة

#### ServiceSelection.jsx
```jsx
// اختيار الخدمة والموظف
const ServiceSelection = ({ onNext, bookingData, setBookingData }) => {
  const [selectedService, setSelectedService] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);
  
  const handleServiceSelect = (service) => {
    setSelectedService(service);
    setBookingData({ ...bookingData, service });
  };
  
  const handleStaffSelect = (staff) => {
    setSelectedStaff(staff);
    setBookingData({ ...bookingData, staff });
  };
  
  return (
    <div className="service-selection">
      <ServiceGrid 
        services={services}
        selectedService={selectedService}
        onSelect={handleServiceSelect}
      />
      <StaffList
        staff={staff}
        selectedStaff={selectedStaff}
        onSelect={handleStaffSelect}
      />
    </div>
  );
};
```

### 3. اختيار التاريخ والوقت

#### DateTimeSelection.jsx
```jsx
// اختيار التاريخ والوقت
const DateTimeSelection = ({ onNext, bookingData, setBookingData }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  
  const handleDateSelect = async (date) => {
    setSelectedDate(date);
    const slots = await fetchAvailableSlots(date, bookingData.staff);
    setAvailableSlots(slots);
  };
  
  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    setBookingData({ ...bookingData, date: selectedDate, time });
  };
  
  return (
    <div className="datetime-selection">
      <DatePicker
        selected={selectedDate}
        onChange={handleDateSelect}
        minDate={new Date()}
        maxDate={maxDate}
      />
      <TimeSlotGrid
        slots={availableSlots}
        selectedTime={selectedTime}
        onSelect={handleTimeSelect}
      />
    </div>
  );
};
```

### 4. اختيار الموقع

#### LocationSelection.jsx
```jsx
// اختيار الموقع
const LocationSelection = ({ onNext, bookingData, setBookingData }) => {
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showMap, setShowMap] = useState(false);
  
  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
    setBookingData({ ...bookingData, address });
  };
  
  const handleNewAddress = (newAddress) => {
    // إضافة عنوان جديد
    addNewAddress(newAddress);
    setSelectedAddress(newAddress);
  };
  
  return (
    <div className="location-selection">
      <AddressList
        addresses={addresses}
        selectedAddress={selectedAddress}
        onSelect={handleAddressSelect}
      />
      <MapPicker
        isVisible={showMap}
        onSelect={handleNewAddress}
        onClose={() => setShowMap(false)}
      />
    </div>
  );
};
```

### 5. تأكيد الحجز

#### BookingConfirmation.jsx
```jsx
// تأكيد الحجز
const BookingConfirmation = ({ onComplete, bookingData }) => {
  const [specialRequests, setSpecialRequests] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const booking = {
        ...bookingData,
        specialRequests,
        status: 'pending'
      };
      
      const response = await createBooking(booking);
      onComplete(response);
    } catch (error) {
      console.error('Booking error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="booking-confirmation">
      <BookingSummary data={bookingData} />
      <SpecialRequestsInput
        value={specialRequests}
        onChange={setSpecialRequests}
      />
      <SubmitButton
        onClick={handleSubmit}
        loading={isSubmitting}
        disabled={!isValid}
      />
    </div>
  );
};
```

### 6. مكونات مساعدة للحجز

#### ProgressIndicator.jsx
```jsx
// مؤشر التقدم
const ProgressIndicator = ({ steps, currentStep }) => {
  return (
    <div className="progress-indicator">
      {steps.map((step, index) => (
        <div
          key={step.id}
          className={`step ${index < currentStep ? 'completed' : ''} ${
            index === currentStep - 1 ? 'active' : ''
          }`}
        >
          <div className="step-number">{index + 1}</div>
          <div className="step-title">{step.title}</div>
        </div>
      ))}
    </div>
  );
};
```

#### LoadingCard.jsx
```jsx
// بطاقة التحميل
const LoadingCard = ({ message = 'جاري التحميل...' }) => {
  return (
    <div className="loading-card">
      <LoadingSpinner size="lg" />
      <p className="loading-message">{message}</p>
    </div>
  );
};
```

## 📝 مكونات المدونة (`blog/`)

### 1. صفحة المدونة

#### BlogPage.jsx
```jsx
// صفحة المدونة الرئيسية
const BlogPage = () => {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  return (
    <div className="blog-page">
      <BlogHeader />
      <BlogCategories
        categories={categories}
        selectedCategory={selectedCategory}
        onSelect={setSelectedCategory}
      />
      <BlogPostGrid
        posts={posts}
        category={selectedCategory}
      />
    </div>
  );
};
```

### 2. تفاصيل المقال

#### BlogPostDetail.jsx
```jsx
// تفاصيل مقال واحد
const BlogPostDetail = ({ postId }) => {
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  
  return (
    <div className="blog-post-detail">
      <BlogPostHeader post={post} />
      <BlogPostContent content={post?.content} />
      <BlogPostTags tags={post?.tags} />
      <RelatedPosts posts={relatedPosts} />
      <BlogComments postId={postId} />
    </div>
  );
};
```

## 💳 مكونات الدفع (`payment/`)

### 1. صفحة الدفع

#### PaymentPage.jsx
```jsx
// صفحة الدفع
const PaymentPage = ({ bookingData, onSuccess }) => {
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handlePayment = async (paymentData) => {
    setIsProcessing(true);
    try {
      const result = await processPayment({
        ...paymentData,
        bookingId: bookingData.id,
        amount: bookingData.total
      });
      onSuccess(result);
    } catch (error) {
      console.error('Payment error:', error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <div className="payment-page">
      <PaymentMethodSelector
        selectedMethod={paymentMethod}
        onSelect={setPaymentMethod}
      />
      <PaymentForm
        method={paymentMethod}
        onSubmit={handlePayment}
        loading={isProcessing}
      />
    </div>
  );
};
```

## 🏠 مكونات الصفحات الرئيسية

### 1. الصفحة الرئيسية

#### HomePage.jsx
```jsx
// الصفحة الرئيسية
const HomePage = () => {
  return (
    <div className="home-page">
      <HeroSection />
      <ServicesSection />
      <OffersSection />
      <TestimonialsSection />
      <ContactSection />
    </div>
  );
};
```

### 2. صفحة الخدمات

#### ServicesPage.jsx
```jsx
// صفحة الخدمات
const ServicesPage = () => {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  return (
    <div className="services-page">
      <ServicesHeader />
      <CategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onSelect={setSelectedCategory}
      />
      <ServicesGrid
        services={services}
        category={selectedCategory}
      />
    </div>
  );
};
```

### 3. صفحة العروض

#### OffersPage.jsx
```jsx
// صفحة العروض
const OffersPage = () => {
  const [offers, setOffers] = useState([]);
  const [selectedOffer, setSelectedOffer] = useState(null);
  
  return (
    <div className="offers-page">
      <OffersHeader />
      <OffersGrid
        offers={offers}
        onSelect={setSelectedOffer}
      />
      {selectedOffer && (
        <OfferDetailModal
          offer={selectedOffer}
          onClose={() => setSelectedOffer(null)}
        />
      )}
    </div>
  );
};
```

## 🔧 مكونات مساعدة

### 1. Header.jsx
```jsx
// رأس الصفحة
const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  return (
    <header className="header">
      <Logo />
      <Navigation
        isOpen={isMenuOpen}
        onToggle={() => setIsMenuOpen(!isMenuOpen)}
      />
      <UserMenu />
    </header>
  );
};
```

### 2. Footer.jsx
```jsx
// تذييل الصفحة
const Footer = () => {
  return (
    <footer className="footer">
      <FooterContent />
      <FooterLinks />
      <FooterSocial />
      <FooterCopyright />
    </footer>
  );
};
```

### 3. ErrorBoundary.jsx
```jsx
// معالج الأخطاء
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    
    return this.props.children;
  }
}
```

## 🎨 أنماط المكونات

### 1. أنماط CSS مخصصة
```css
/* أنماط البطاقات المميزة */
.premium-card {
  @apply bg-white rounded-lg shadow-lg p-6;
  @apply hover:shadow-xl transition-shadow duration-300;
  @apply border border-gray-200;
}

/* أنماط الأزرار */
.btn-primary {
  @apply bg-pink-500 text-white px-6 py-3 rounded-lg;
  @apply hover:bg-pink-600 transition-colors duration-200;
  @apply focus:outline-none focus:ring-2 focus:ring-pink-500;
}
```

### 2. أنماط متجاوبة
```css
/* تخطيط متجاوب */
.responsive-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6;
}

/* صور متجاوبة */
.responsive-image {
  @apply w-full h-auto object-cover rounded-lg;
}
```

## 🔧 استخدام المكونات

### 1. استيراد المكونات
```jsx
// استيراد مكونات UI
import { Button, Card, Modal } from '@/components/ui';

// استيراد مكونات الحجز
import { ServiceSelection, DateTimeSelection } from '@/components/booking';

// استيراد مكونات المدونة
import { BlogPage, BlogPostDetail } from '@/components/blog';
```

### 2. استخدام المكونات
```jsx
// مثال على استخدام المكونات
const MyPage = () => {
  return (
    <div>
      <Header />
      <Card className="p-6">
        <Button onClick={handleClick}>
          انقر هنا
        </Button>
      </Card>
      <Footer />
    </div>
  );
};
```

## 📝 نصائح للمطور

### 1. إنشاء مكون جديد
```jsx
// إنشاء مكون جديد
const MyComponent = ({ prop1, prop2, onAction }) => {
  const [state, setState] = useState(initialState);
  
  const handleAction = () => {
    onAction?.(data);
  };
  
  return (
    <div className="my-component">
      {/* محتوى المكون */}
    </div>
  );
};

export default MyComponent;
```

### 2. استخدام Props
```jsx
// تعريف Props
MyComponent.propTypes = {
  prop1: PropTypes.string.isRequired,
  prop2: PropTypes.number,
  onAction: PropTypes.func
};

// استخدام Props
<MyComponent
  prop1="value"
  prop2={123}
  onAction={handleAction}
/>
```

### 3. إدارة الحالة
```jsx
// استخدام useState
const [count, setCount] = useState(0);

// استخدام useEffect
useEffect(() => {
  // منطق جانبي
}, [dependencies]);

// استخدام useContext
const context = useContext(MyContext);
```

---

**هذا الدليل يغطي جميع المكونات في المشروع مع أمثلة عملية للاستخدام** 🚀
