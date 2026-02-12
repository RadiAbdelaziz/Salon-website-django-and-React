import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "../contexts/AuthContext";
import {
  serviceCategoriesAPI,
  categoriesAPI,
  contactInfoAPI,
} from "../services/api";
import { getServiceCategories } from "../data/services";
import { useNavigate, useLocation } from "react-router-dom";
import CartIcon from "./CartIcon";
import { useCart } from "../contexts/CartContext";
import {
  Menu,
  X,
  Phone,
  MapPin,
  Clock,
  User,
  ChevronDown,
  Scissors,
  Palette,
  Heart,
  Hand,
  Sparkles,
  Crown,
  LogOut,
  Settings,
  Shield,
  Calendar,
} from "lucide-react";
import FavoritesPage from "./FavoritesPage";

// Default services fallback - Clean design without icons
const getDefaultServices = () => [
  {
    id: "natural-hair-treatments",
    title: "علاجات طبيعية للشعر",
    description: "علاجات طبيعية ومتخصصة للشعر",
  },
  {
    id: "ozih-packages",
    title: "بكجات أوزيه",
    description: "باقات متكاملة للعناية",
  },
  {
    id: "makeup-section",
    title: "قسم المكياج",
    description: "فن المكياج الاحترافي",
  },
  {
    id: "massage-section",
    title: "قسم المساج",
    description: "جلسات المساج والاسترخاء",
  },
  {
    id: "nail-care",
    title: "العناية بالأظافر",
    description: "تجميل وتزيين الأظافر",
  },
  {
    id: "hair-treatment",
    title: "علاج الشعر",
    description: "علاجات متخصصة للشعر",
  },
  {
    id: "hair-dyeing",
    title: "صبغ الشعر",
    description: "ألوان الشعر الطبيعية والآمنة",
  },
  {
    id: "body-care",
    title: "العناية بالجسم",
    description: "علاجات الجسم والترطيب",
  },
  {
    id: "skin-treatment",
    title: "علاج البشرة",
    description: "علاجات البشرة المتقدمة",
  },
  {
    id: "moroccan-bath",
    title: "الحمام المغربي",
    description: "تجربة الحمام المغربي التقليدي",
  },
  {
    id: "hair-styling",
    title: "تصفيف الشعر",
    description: "تسريحات الشعر المتنوعة",
  },
];

const Header = ({
  onBookingClick,
  onNavigate,
  isAuthenticated,
  user,
  customer,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [services, setServices] = useState(getDefaultServices());
  const [loadingServices, setLoadingServices] = useState(true);
  const [contactInfo, setContactInfo] = useState({
    phone_number: "+966 55 123 4567",
    location: "الرياض، المملكة العربية السعودية",
    working_hours: "الأحد - الخميس: 10ص - 8م",
  });
  const navigate = useNavigate();
  const [loadingContactInfo, setLoadingContactInfo] = useState(true);
  const servicesRef = useRef(null);
  const userMenuRef = useRef(null);
  const { logout, loading } = useAuth();
  const [showFavorites, setShowFavorites] = useState(false);
  const { addToCart } = useCart(); // ✅ من الكونتكست
  const handleAddToCart = (service) => {
    addToCart(service);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleServices = () => {
    setIsServicesOpen(!isServicesOpen);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const handleLogout = async () => {
    try {
      await logout();
      setIsUserMenuOpen(false);
      setIsMenuOpen(false);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Fetch services from API
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoadingServices(true);

        const categoriesData = await getServiceCategories();

        const transformed = Object.values(categoriesData).map((category) => ({
          id: category.id,
          slug_en: category.slug_en,
          title: category.title,
          image:
            category.image || "http://localhost:8000/api/placeholder/400/300/",
        }));

        setServices(transformed);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setServices([]);
      } finally {
        setLoadingServices(false);
      }
    };

    fetchServices();
  }, []);

  // Fetch contact info from API
  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        setLoadingContactInfo(true);
        const response = await contactInfoAPI.get();

        if (response.success && response.contact_info) {
          setContactInfo({
            phone_number: response.contact_info.phone_number,
            location: response.contact_info.location,
            working_hours: response.contact_info.working_hours,
          });
        }
      } catch (error) {
        console.error("Error fetching contact info:", error);
        // Keep default values if API fails
      } finally {
        setLoadingContactInfo(false);
      }
    };

    fetchContactInfo();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (servicesRef.current && !servicesRef.current.contains(event.target)) {
        setIsServicesOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Activation items
  const location = useLocation(); // المسار الحالي

  // حالة activeSection
  const [activeSection, setActiveSection] = useState("home");

  // تحديث activeSection عند تغير المسار
  useEffect(() => {
    const path = location.pathname;

    if (path === "/" || path === "/home") {
      setActiveSection("home");
    } else if (path.startsWith("/services")) {
      setActiveSection("services");
    } else if (path.startsWith("/offers")) {
      setActiveSection("offers");
    } else if (path.startsWith("/contact")) {
      setActiveSection("contact");
    } else if (path.startsWith("/blog")) {
      setActiveSection("blog");
    } else {
      setActiveSection("");
    }
  }, [location.pathname]);

  return (
    <header className="bg-white shadow-sm" style={{ margin: 0, padding: 0 }}>
      {/* الشريط العلوي - مخفي على الهواتف */}
      <div
        className="hidden md:block py-3 border-b bg-salon-cream text-auto"
        style={{ borderColor: "var(--silken-dune)", margin: 0, padding: 0 }}
      >
        <div
          className="w-full px-4"
          style={{ margin: 0, padding: "12px 16px" }}
        >
          {/* Desktop Layout */}
          <div
            className="hidden lg:flex items-center justify-between text-sm text-on-cream"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div className="flex items-center space-x-6 space-x-reverse">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Phone
                  className="w-4 h-4"
                  style={{ color: "var(--glamour-gold)" }}
                />
                <span dir="ltr">{contactInfo.phone_number}</span>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <MapPin
                  className="w-4 h-4"
                  style={{ color: "var(--glamour-gold)" }}
                />
                <span>{contactInfo.location}</span>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <Clock
                  className="w-4 h-4"
                  style={{ color: "var(--glamour-gold)" }}
                />
                <span>{contactInfo.working_hours}</span>
              </div>
            </div>
            <div className="flex items-center space-x-4 space-x-reverse">
              <Button
                variant="ghost"
                size="sm"
                style={{
                  color: "var(--glamour-gold)",
                  backgroundColor: "transparent",
                }}
                className="hover:opacity-80"
              >
                العربية
              </Button>
              <Button
                variant="ghost"
                size="sm"
                style={{
                  color: "var(--warm-brown)",
                  backgroundColor: "transparent",
                }}
                className="hover:opacity-80"
              >
                English
              </Button>
            </div>
          </div>

          {/* Mobile Layout - Only Language Buttons */}
          <div className="lg:hidden">
            <div className="flex justify-end items-center">
              <div className="flex items-center space-x-1 space-x-reverse">
                <Button
                  variant="ghost"
                  size="sm"
                  style={{
                    color: "var(--glamour-gold)",
                    backgroundColor: "transparent",
                  }}
                  className="hover:opacity-80 text-xs px-2"
                >
                  العربية
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  style={{
                    color: "var(--warm-brown)",
                    backgroundColor: "transparent",
                  }}
                  className="hover:opacity-80 text-xs px-2"
                >
                  English
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* الهيدر الرئيسي */}
      <div className="w-full py-4" style={{ margin: 0, padding: "16px" }}>
        <div
          className="flex items-center justify-between"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* الشعار */}
          <div
            className="flex items-center cursor-pointer"
            onClick={() => {
              onNavigate("home");
            }}
          >
            <img
              src="/logo-05.png"
              alt="glammy logo"
              className="w-16 h-20 sm:w-20 sm:h-12 object-contain"
            />
          </div>

          {/* قائمة سطح المكتب */}
          <nav className="hidden md:flex items-center space-x-8 space-x-reverse">
            <button
              onClick={() => {
                onNavigate("home");
                setActiveSection("home");
              }}
              className={`font-medium transition-colors  nav-link ${
                activeSection === "home" ? "active" : ""
              }`}
              style={{ color: "var(--warm-brown)", cursor: "pointer" }}
              onMouseEnter={(e) =>
                (e.target.style.color = "var(--glamour-gold)")
              }
              onMouseLeave={(e) => (e.target.style.color = "var(--warm-brown)")}
            >
              الرئيسية
            </button>

            {/* Services Dropdown */}
            <div className="relative" ref={servicesRef}>
              <button
                onClick={toggleServices}
                className={`font-medium transition-colors nav-link 
                       ${
                         isServicesOpen || activeSection === "services"
                           ? "active"
                           : ""
                       }`}
                style={{ color: "var(--warm-brown)" }}
                onMouseEnter={(e) =>
                  (e.target.style.color = "var(--glamour-gold)")
                }
                onMouseLeave={(e) =>
                  (e.target.style.color = "var(--warm-brown)")
                }
              >
                <span className="cursor-pointer">الخدمات</span>
              </button>

              {isServicesOpen && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                  <div className="py-2">
                    {loadingServices ? (
                      <div className="text-center py-4">
                        <div className="text-sm text-gray-500">
                          جاري التحميل...
                        </div>
                      </div>
                    ) : (
                      <div>
                        {console.log(
                          "Rendering services array:",
                          services,
                          "Length:",
                          services.length
                        )}
                        {services.length === 0 ? (
                          <div className="text-center py-4">
                            <div className="text-sm text-gray-500">
                              لا توجد خدمات متاحة
                            </div>
                          </div>
                        ) : (
                          services.map((service, index) => (
                            <button
                              style={{ transition: "all 0.2s ease-in-out" }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  "var(--glamour-gold)";
                                e.currentTarget.style.color = "white";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  "transparent";
                                e.currentTarget.style.color =
                                  "var(--warm-brown)";
                              }}
                              key={index}
                              //    onClick={() => {
                              //    const categoryIdentifier = service.id || service.slug || service.title;
                              //   onNavigate(`services?category=${encodeURIComponent(categoryIdentifier)}`);
                              //   setActiveSection('services');
                              //   setIsServicesOpen(false);
                              // }}
                              onClick={() => {
                                const categorySlug =
                                  service.slug_en ||
                                  service.slug ||
                                  (typeof service.title === "string"
                                    ? service.title
                                        .toLowerCase()
                                        .replace(/\s+/g, "-")
                                    : service.id);

                                // onNavigate(`/services/${categorySlug}`);
                                navigate(`/services/${categorySlug}`);
                                setActiveSection("services");
                                setIsServicesOpen(false);
                              }}
                              className={`w-full text-right px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 cursor-pointer nav-link ${
                                activeSection === "services" ? "active" : ""
                              }`}
                            >
                              {service.title}
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                onNavigate("offers");
                setActiveSection("offers");
              }}
              className={`font-medium transition-colors nav-link ${
                activeSection == "offers" ? "active" : ""
              }`}
              style={{ color: "var(--warm-brown)", cursor: "pointer" }}
              onMouseEnter={(e) =>
                (e.target.style.color = "var(--glamour-gold)")
              }
              onMouseLeave={(e) => (e.target.style.color = "var(--warm-brown)")}
            >
              العروض
            </button>
            <button
              onClick={() => {
                onNavigate("contact"), setActiveSection("contact");
              }}
              className={`font-medium transition-colors nav-link ${
                activeSection === "contact" ? "active" : ""
              }`}
              style={{ color: "var(--warm-brown)", cursor: "pointer" }}
              onMouseEnter={(e) =>
                (e.target.style.color = "var(--glamour-gold)")
              }
              onMouseLeave={(e) => (e.target.style.color = "var(--warm-brown)")}
            >
              تواصل معنا
            </button>
            <div className="w-3"></div>
            <button
              onClick={() => {
                onNavigate("blog"), setActiveSection("blog");
              }}
              className={`font-medium transition-colors nav-link ${
                activeSection === "blog" ? "active" : ""
              }`}
              style={{ color: "var(--warm-brown)", cursor: "pointer" }}
              onMouseEnter={(e) =>
                (e.target.style.color = "var(--glamour-gold)")
              }
              onMouseLeave={(e) => (e.target.style.color = "var(--warm-brown)")}
            >
              {" "}
              المدونة
            </button>
          </nav>

          {/* الأزرار */}
          <div
            className="hidden md:flex items-center space-x-4 space-x-reverse"
            style={{ cursor: "pointer" }}
          >
            {/* Cart Icon */}

            <CartIcon onMouseEnter="background : red;" />

            {/* Profile Button - Always visible like in the image */}
            <div className="relative hover-span ml-2" ref={userMenuRef}>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleUserMenu}
                disabled={loading}
                className="flex items-centerspace-x-2 space-x-reverse"
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--glamour-gold)";
                  e.currentTarget.style.color = "white";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "var(--warm-brown)";
                }}
              >
                <User className="w-4 h-4" />
                <span>الملف الشخصي</span>
                <ChevronDown className="w-3 h-3" />
              </Button>

              {isUserMenuOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  {!isAuthenticated ? (
                    <div className="p-1">
                      <button
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor =
                            "var(--glamour-gold)";
                          e.currentTarget.style.color = "white";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                          e.currentTarget.style.color = "var(--warm-brown)";
                        }}
                        onClick={() => {
                          onNavigate("sign-in");
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-right px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md flex items-center"
                      >
                        <User className="w-4 h-4 ml-2" />
                        تسجيل الدخول
                      </button>
                      
                    </div>
                  ) : (
                    <>
                      <div className="p-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">
                          {customer?.name ||
                            `${user?.first_name} ${user?.last_name}`.trim() ||
                            user?.username}
                        </p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                      <div className="p-1">
                        <button
                          onClick={() => {
                            onNavigate("profile");
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full text-right px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md flex items-center"
                        >
                          <User className="w-4 h-4 ml-2" />
                          الملف الشخصي
                        </button>
                        <button
                          onClick={() => {
                            onNavigate("bookings");
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full text-right px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md flex items-center"
                        >
                          <Calendar className="w-4 h-4 ml-2" />
                          حجوزاتي
                        </button>

                        <hr className="my-1" />
                        <button
                          onClick={handleLogout}
                          className="w-full text-right px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md flex items-center"
                        >
                          <LogOut className="w-4 h-4 ml-2" />
                          تسجيل الخروج
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
            <Button
              onClick={() => navigate("/favorite")}
              className="flex items-center space-x-2 space-x-reverse"
              style={{
                background: "var(--glamour-gold)",
                color: "white",
                borderRadius: "6px",
              }}
            >
              ❤️ مفضلتي
            </Button>
          </div>

          {showFavorites && (
            <div className="fixed inset-0 bg-white z-50 overflow-auto">
              <FavoritesPage
                onBack={() => setShowFavorites(false)}
                onViewDetails={() => {}}
                onBookNow={onBookingClick}
                onAddToCart={handleAddToCart}
              />
            </div>
          )}

          {/* أزرار الجوال */}
          <div className="md:hidden flex items-center space-x-2 space-x-reverse">
            <button
              className="p-2 rounded-md hover:bg-gray-100 transition-colors"
              onClick={toggleMenu}
              aria-label="فتح وإغلاق القائمة"
              style={{ color: "var(--warm-brown)" }}
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* قائمة الجوال */}
        {/* قائمة الجوال */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 py-4 border-t border-[var(--silken-dune)] bg-white rounded-xl shadow-md">
            <nav className="flex flex-col space-y-3 px-4">
              {/* روابط رئيسية */}
              <button
                onClick={() => {
                  onNavigate("home");
                  setIsMenuOpen(false);
                }}
                className="text-[var(--warm-brown)] text-base font-medium text-right px-3 py-2 rounded-lg hover:bg-[rgba(185,150,104,0.08)] transition-colors"
              >
                الرئيسية
              </button>

              {/* Dropdown الخدمات */}
              <div>
                <button
                  onClick={toggleServices}
                  className="w-full text-[var(--warm-brown)] text-base font-medium text-right px-3 py-2 rounded-lg hover:bg-[rgba(185,150,104,0.08)] flex justify-between items-center"
                >
                  <span>الخدمات</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-300 ${
                      isServicesOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isServicesOpen && (
                  <div className="mt-2 mr-3 space-y-2 border-r-2 border-[var(--glamour-gold)] pr-3">
                    {services.map((service, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          const categoryIdentifier =
                            service.id || service.slug || service.title;
                          onNavigate(
                            `services?category=${encodeURIComponent(
                              categoryIdentifier
                            )}`
                          );
                          setIsServicesOpen(false);
                          setIsMenuOpen(false);
                        }}
                        className="w-full text-right text-sm text-gray-600 hover:text-[var(--glamour-gold)] transition-colors"
                      >
                        {service.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  onNavigate("offers");
                  setIsMenuOpen(false);
                }}
                className="text-[var(--warm-brown)] text-base font-medium text-right px-3 py-2 rounded-lg hover:bg-[rgba(185,150,104,0.08)] transition-colors"
              >
                العروض
              </button>

              <button
                onClick={() => {
                  onNavigate("contact");
                  setIsMenuOpen(false);
                }}
                className="text-[var(--warm-brown)] text-base font-medium text-right px-3 py-2 rounded-lg hover:bg-[rgba(185,150,104,0.08)] transition-colors"
              >
                تواصل معنا
              </button>

              {/* معلومات التواصل */}
              <div className="pt-4 mt-2 border-t border-[var(--silken-dune)]">
                <h4 className="text-sm font-semibold mb-3 text-[var(--glamour-gold)]">
                  معلومات التواصل
                </h4>
                <div className="space-y-2 text-[var(--warm-brown)] text-sm">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Phone className="w-4 h-4 text-[var(--glamour-gold)]" />
                    <a
                      href={`tel:${contactInfo.phone_number.replace(
                        /\s/g,
                        ""
                      )}`}
                      dir="ltr"
                      style={{
                        textDecoration: "none",
                        color: "var(--warm-brown)",
                      }}
                    >
                      {contactInfo.phone_number}
                    </a>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <MapPin className="w-4 h-4 text-[var(--glamour-gold)]" />
                    <span>{contactInfo.location}</span>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Clock className="w-4 h-4 text-[var(--glamour-gold)]" />
                    <span>{contactInfo.working_hours}</span>
                  </div>
                </div>
              </div>

              {/* أزرار أسفل القائمة */}
              <div className="pt-5 border-t border-[var(--silken-dune)] flex flex-col gap-3">
                <CartIcon className="w-full justify-center" />
                <div className="relative ml-2" ref={userMenuRef}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleUserMenu}
                    disabled={loading}
                    className="flex items-centerspace-x-2 space-x-reverse w-100"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor =
                        "var(--glamour-gold)";
                      e.currentTarget.style.color = "white";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.color = "var(--warm-brown)";
                    }}
                  >
                    <User className="w-4 h-4 " />
                    <span>الملف الشخصي</span>
                    <ChevronDown className="w-3 h-3" />
                  </Button>

                  {isUserMenuOpen && (
                    <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                      {!isAuthenticated ? (
                        <div className="p-1">
                          <button
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor =
                                "var(--glamour-gold)";
                              e.currentTarget.style.color = "white";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor =
                                "transparent";
                              e.currentTarget.style.color = "var(--warm-brown)";
                            }}
                            onClick={() => {
                              onNavigate("sign-in");
                              setIsUserMenuOpen(false);
                            }}
                            className="w-full text-right px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md flex items-center"
                          >
                            <User className="w-4 h-4 ml-2" />
                            تسجيل الدخول
                          </button>
                          <button
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor =
                                "var(--glamour-gold)";
                              e.currentTarget.style.color = "white";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor =
                                "transparent";
                              e.currentTarget.style.color = "var(--warm-brown)";
                            }}
                            onClick={() => {
                              onNavigate("sign-up");
                              setIsUserMenuOpen(false);
                            }}
                            className="w-full text-right px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md flex items-center"
                          >
                            <User className="w-4 h-4 ml-2" />
                            إنشاء حساب
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="p-3 border-b border-gray-100">
                            <p className="text-sm font-medium text-gray-900">
                              {customer?.name ||
                                `${user?.first_name} ${user?.last_name}`.trim() ||
                                user?.username}
                            </p>
                            <p className="text-xs text-gray-500">
                              {user?.email}
                            </p>
                          </div>
                          <div className="p-1">
                            <button
                              onClick={() => {
                                onNavigate("profile");
                                setIsUserMenuOpen(false);
                              }}
                              className="w-full text-right px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md flex items-center"
                            >
                              <User className="w-4 h-4 ml-2" />
                              الملف الشخصي
                            </button>
                            <button
                              onClick={() => {
                                onNavigate("bookings");
                                setIsUserMenuOpen(false);
                              }}
                              className="w-full text-right px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md flex items-center"
                            >
                              <Calendar className="w-4 h-4 ml-2" />
                              حجوزاتي
                            </button>

                            <hr className="my-1" />
                            <button
                              onClick={handleLogout}
                              className="w-full text-right px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md flex items-center"
                            >
                              <LogOut className="w-4 h-4 ml-2" />
                              تسجيل الخروج
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Booking Button  */}
                <Button
                  onClick={() => navigate("/favorite")}
                  className="flex items-center space-x-2 space-x-reverse"
                  style={{
                    background: "var(--glamour-gold)",
                    color: "white",
                    borderRadius: "6px",
                  }}
                >
                  ❤️ مفضلتي
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
