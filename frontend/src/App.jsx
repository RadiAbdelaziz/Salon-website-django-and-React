import { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import SignInPage from "./components/SignInPage";
import Header from "./components/Header";
import HomePage from "./components/HomePage";
import { BlogPage, BlogPostDetail } from "./components/blog";
import CategoryServices from "./components/CategoryServices";
import ContactSection from "./components/ContactSection";
import ContactPage from "./components/ContactPage";
import ServicesPage from "./components/ServicesPage";
import Footer from "./components/Footer";
import BookingModal from "./components/BookingModal";
import EnhancedBookingPage from "./components/EnhancedBookingPage";
import EnhancedServicesPage from "./components/EnhancedServicesPage";
import ScrollToTop from "./components/ScrollToTop";
import SignUpPage from "./components/SignUpPage";
import ServiceSinglePage from "./components/ServiceSinglePage";
import CartPage from "./components/CartPage";
import ProfilePage from "./components/ProfilePage";
import PrivacyPolicy from "./components/PrivacyPolicy";
import OffersPage from "./components/OffersPage";
import BookingCancelledPage from "./components/BookingCancelledPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import PaymentPage from "./pages/PaymentPage";
import TestBackendConnection from "./components/TestBackendConnection";
import ErrorBoundary from "./components/ErrorBoundary";
import { serviceCategories } from "./data/services";
import "./App.css";
import PaymentSimulation from "./pages/paymentsimulate";
import ServiceListPage from "./components/ServiceListPage";
import PaymentResult from "./pages/PaymentResult";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFailed from "./pages/PaymentFailed";
import FavoritesPage from "./components/FavoritesPage";
import NewOfferPage from "./components/OffersPage";
import OfferDetailPage from "./components/OfferDetailPage";
import { Toaster } from "sonner";
import StripePaymentPage from "./pages/StripePaymentPage";
// import BookingWizard from './components/BookingWizard';

function AppContent() {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isEnhancedBookingOpen, setIsEnhancedBookingOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, customer, loading } = useAuth();

  // Show loading while auth context is initializing
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  // Remove global auth gate - auth only required for booking

  const openBookingModal = (service = null) => {
    setSelectedService(service);
    setIsBookingModalOpen(true);
  };

  const openEnhancedBooking = (service = null) => {
    setSelectedService(service);
    navigate("/book");
  };

  const closeEnhancedBooking = () => {
    setIsEnhancedBookingOpen(false);
    setSelectedService(null);
  };

  const closeBookingModal = () => {
    setIsBookingModalOpen(false);
    setSelectedService(null);
  };

  const navigateToPage = (page, serviceCategory = null) => {
    if (page === "service-category" && serviceCategory) {
      navigate(`/services/${serviceCategory}`);
    } else if (page === "service-item" && serviceCategory) {
      navigate(`/service/${serviceCategory}`);
    } else if (page === "home") {
      navigate("/home");
    } else if (page === "service-category" && !serviceCategory) {
      navigate("/services");
    } else {
      navigate(`/${page}`);
    }
  };

  const navigateToServiceDetail = (serviceCategory) => {
    // If serviceCategory is an object with slug_en, use it directly
    if (typeof serviceCategory === "object" && serviceCategory.slug_en) {
      navigate(`/services/${serviceCategory.slug_en}`);
      return;
    }

    // Fallback: Convert category name to URL-friendly format
    const categorySlug =
      typeof serviceCategory === "string"
        ? serviceCategory
            .toLowerCase()
            .replace(/\s+/g, "_")
            .replace(/[^a-z0-9_]/g, "")
        : serviceCategory;
    navigate(`/services/${categorySlug}`);
  };

  const navigateBack = () => {
    navigate("/");
  };

  const navigateBackFromServiceDetail = () => {
    navigate("/services");
  };

  const handleLoginSuccess = (response) => {
    // User is automatically logged in via AuthContext
    navigate("/");
  };

  const handleSignupSuccess = (response) => {
    // User is automatically logged in via AuthContext
    navigate("/");
  };

  // Get service category from URL - now using API data
  const getServiceCategoryFromPath = () => {
    const pathParts = location.pathname.split("/");
    if (pathParts[1] === "services" && pathParts[2]) {
      // Return null - will fetch from API
      return null;
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-white">
      <ScrollToTop />
      <Header
        onBookingClick={() => openEnhancedBooking()}
        onNavigate={navigateToPage}
        isAuthenticated={isAuthenticated}
        user={user}
        customer={customer}
      />
      <main>
        <Toaster richColors position="top-center" />
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                onBookingClick={openEnhancedBooking}
                onNavigateToService={navigateToServiceDetail}
              />
            }
          />
          <Route
            path="/home"
            element={
              <HomePage
                onBookingClick={openEnhancedBooking}
                onNavigateToService={navigateToServiceDetail}
              />
            }
          />
          <Route
            path="/services"
            element={
              <EnhancedServicesPage
                onBack={navigateBack}
                onBookingClick={openEnhancedBooking}
              />
            }
          />
          <Route
            path="/services/:slug"
            element={
              <CategoryServices
                onBack={navigateBack}
                onBookingClick={openEnhancedBooking}
              />
            }
          />
          <Route
            path="/service/:serviceId"
            element={
              <ServiceSinglePage
                onBack={navigateBackFromServiceDetail}
                onBookingClick={openEnhancedBooking}
              />
            }
          />
          <Route path="/category/:categorySlug" element={<ServiceListPage />} />
          <Route
            path="/offers/:offerId"
            element={<OfferDetailPage onBookingClick={openEnhancedBooking} />}
          />
          <Route
            path="/offers"
            element={
              <OffersPage
                onBookingClick={openEnhancedBooking}
                onNavigate={navigateToPage}
              />
            }
          />
          <Route
            path="/affer"
            element={
              <NewOfferPage
                onBookingClick={openEnhancedBooking}
                onNavigate={navigateToPage}
              />
            }
          />
          <Route
            path="/blog"
            element={
              <BlogPage
                onBack={navigateBack}
                onBookingClick={openEnhancedBooking}
              />
            }
          />
          <Route
            path="/blog/:slug"
            element={
              <BlogPostDetail
                onBack={navigateBack}
                onBookingClick={openEnhancedBooking}
              />
            }
          />
          <Route
            path="/contact"
            element={
              <ContactPage
                onBookingClick={openEnhancedBooking}
                onBack={navigateBack}
              />
            }
          />
          <Route
            path="/sign-in"
            element={
              <SignInPage
                onBack={navigateBack}
                onLoginSuccess={handleLoginSuccess}
                onSwitchToSignup={() => navigate("/sign-up")}
              />
            }
          />
          <Route
            path="/sign-up"
            element={
              <SignUpPage
                onBack={navigateBack}
                onSignupSuccess={handleSignupSuccess}
              />
            }
          />
          <Route path="/profile" element={<ProfilePage />} />
          <Route
            path="/book"
            element={
              <EnhancedBookingPage
                onClose={() => navigate("/")}
                selectedService={null}
                isAuthenticated={isAuthenticated}
                user={user}
                customer={customer}
              />
            }
          />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/order-success" element={<OrderSuccessPage />} />
          <Route path="/stripe-payment" element={<StripePaymentPage />} />
          {/* <Route path="/payment" element={<PaymentPage />} /> */}
          {/* <Route path="/payments" element={<PaymentPage />} /> */}
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-failed" element={<PaymentFailed />} />
          <Route path="/payment-result" element={<PaymentResult />} />
          <Route
            path="/favorite"
            element={
              <FavoritesPage
                onBack={() => navigate("/")}
                onBookNow={openEnhancedBooking}
                onViewDetails={navigateToServiceDetail}
              />
            }
          />
          <Route path="/sim" element={<PaymentSimulation />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/booking-cancelled" element={<BookingCancelledPage />} />
          <Route path="/test-backend" element={<TestBackendConnection />} />
          {/* Fallback route for service-category */}
          <Route
            path="/service-category"
            element={
              <EnhancedServicesPage
                onBack={navigateBack}
                onBookingClick={openEnhancedBooking}
              />
            }
          />
        </Routes>
      </main>
      <Footer onNavigate={navigateToPage} />

      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={closeBookingModal}
        selectedService={selectedService}
        isAuthenticated={isAuthenticated}
        user={user}
        customer={customer}
      />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <CartProvider>
          <Router>
            <AppContent />
          </Router>
        </CartProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
