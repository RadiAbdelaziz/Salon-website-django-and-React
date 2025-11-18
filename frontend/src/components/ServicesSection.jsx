import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import DynamicButton from './ui/DynamicButton';
import { Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { getAllServices, getServiceCategories } from '../data/services';
import { motion } from "framer-motion";
import { useNavigate } from 'react-router-dom';

const ServicesSection = ({ onBookingClick }) => {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState({});
  const [categoriesList, setCategoriesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const scrollContainerRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate(); 

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkScreenSize();
    let timeoutId;
    const debouncedCheckScreenSize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(checkScreenSize, 100);
    };
    window.addEventListener('resize', debouncedCheckScreenSize);
    return () => {
      window.removeEventListener('resize', debouncedCheckScreenSize);
      clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [servicesData, categoriesData] = await Promise.all([
          getAllServices(),
          getServiceCategories()
        ]);

        const transformedCategories = Object.values(categoriesData).map(category => {
          const minPrice = category.services?.length
            ? Math.min(...category.services.map(service => service.basePrice || 0))
            : 0;
          return {
            id: category.id,
            slug_en: category.slug_en,
            title: category.title,
            price: `${minPrice}`,
            image: category.image || 'http://localhost:8000/api/placeholder/400/300/',
            category: category.id
          };
        });

        setServices(transformedCategories);
        setCategories(categoriesData);
        setCategoriesList(Object.values(categoriesData));
      } catch (error) {
        console.error('Failed to load services:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // ✅ الدالة المعدلة لفتح الخدمات الخاصة بالفئة عند الضغط
  const handleCategoryClick = (category) => {
    const categorySlug =
      category.slug_en ||
      category.slug ||
      (typeof category.title === "string"
        ? category.title.toLowerCase().replace(/\s+/g, "-")
        : category.id);

    navigate(`/services/${categorySlug}`);
  };
const scrollLeft = () => {
  if (scrollContainerRef.current) {
    const container = scrollContainerRef.current;
    const cardWidth = 240;

    // في RTL: التمرير لليسار يعني الذهاب للخلف بصرياً، لذا نعكس الاتجاه
    container.scrollBy({ left: cardWidth, behavior: 'smooth' });

    setCurrentIndex(prev => Math.min(prev + 1, services.length - 1));
  }
};

const scrollRight = () => {
  if (scrollContainerRef.current) {
    const container = scrollContainerRef.current;
    const cardWidth = 240;

    // في RTL: التمرير لليمين يعني الذهاب للأمام بصرياً
    container.scrollBy({ left: -cardWidth, behavior: 'smooth' });

    setCurrentIndex(prev => Math.max(prev - 1, 0));
  }
};

  if (loading) {
    return (
      <section id="services" className="py-16 bg-salon-cream text-auto">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: 'var(--glamour-gold)' }}></div>
          <p className="mt-4 text-on-cream">جاري تحميل الخدمات...</p>
        </div>
      </section>
    );
  }

  return (
    <section id="services" className="py-8 md:py-16 bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 md:mb-12">
          <div className="flex items-center justify-center space-x-2 space-x-reverse mb-3 md:mb-4">
            <Sparkles className="w-5 h-5 md:w-6 md:h-6" style={{ color: 'var(--glamour-gold)' }} />
            <span className="text-xs md:text-sm font-medium tracking-wide text-on-cream">خدماتنا</span>
          </div>
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4 text-on-cream relative inline-block">
            خدماتنا
            {/* <img src="https://ozeesalon.com/assets/images/underline.svg" alt="underline"
              className="absolute -bottom-1 md:-bottom-2 left-1/2 transform -translate-x-1/2 w-20 md:w-32 h-auto" /> */}
          </h2>
          <p className="text-sm md:text-lg max-w-2xl mx-auto mt-4 md:mt-6 text-on-cream/90 leading-relaxed">
         اكتشفي مجموعتنا المتكاملة من خدمات التجميل الاحترافية لتعزيز جمالك ورفاهيتك
          </p>
        </div>
      </div>

      {/* Desktop Carousel */}
      <div className="relative">
        <button
          onClick={scrollLeft}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/80 text-gray-800 shadow-md hover:shadow-[0_8px_30px_rgba(185,150,104,0.25)]
 hover:bg-white transition-all flex items-center justify-center"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={scrollRight}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/80 text-gray-800 shadow-md hover:shadow-[0_8px_30px_rgba(185,150,104,0.25)]
 hover:bg-white transition-all flex items-center justify-center"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <div className="relative">
          <div className="absolute left-0 top-0 h-full w-24 bg-gradient-to-r from-[var(--text-on-black)] via-[color-mix(in srgb, var(--text-on-black) 80%, transparent)] to-transparent pointer-events-none z-10"></div>
          <div
            ref={scrollContainerRef}
            className="flex overflow-x-auto gap-6 px-16 py-4 scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {services.map((service, i) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                className={`flex-shrink-0 bg-white rounded-2xl shadow-lg hover:shadow-[0_8px_30px_rgba(185,150,104,0.25)]
                transition-all duration-300 transform hover:scale-110 
                active:scale-95
                cursor-pointer overflow-hidden group relative ${
                  isMobile ? 'w-35 h-40 '  : 'w-64'
                }`}
                onClick={() => handleCategoryClick(service)}
              >
                <motion.img
                  alt={service.title}
                  src={service.image}
className={`w-full object-cover transition-transform duration-700 group-hover:scale-110 ${
  isMobile ? 'h-25' : 'h-48'
}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6 }}
                />
                {/* ✅ overlay fade animation كما طلبت */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute top-3 right-3 w-7 h-7 bg-pink-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" />
                  </svg>
                </div>
                <div className="p-4 text-center">
                  <h3 className="text-lg font-semibold text-gray-800 leading-tight">{service.title}</h3>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-[var(--text-on-gold)] via-[color-mix(in srgb, var(--text-on-gold) 60%, transparent)] to-transparent pointer-events-none z-10"></div>
        </div>

        {/* ✅ Pagination Dots */}
        <div className="flex justify-center mt-6 gap-2">
          {services.map((_, i) => (
            <div
              key={i}
              className={`transition-all duration-300 ${i === currentIndex ? 'w-6 bg-black' : 'w-2 bg-gray-300'} h-2 rounded-full`}
            />
          ))}
        </div>
      </div>

      {/* ✅ قسم الدعوة للحجز */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.3 }}
          whileHover={{ scale: 1.02 }}
          className="relative max-w-3xl mx-auto text-center cursor-default"
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-tr from-[var(--silken-dune)]/30 via-white/70 to-[var(--glamour-gold)]/10 backdrop-blur-xl rounded-3xl border border-[var(--silken-dune)] shadow-[0_8px_40px_rgba(0,0,0,0.08)] transition-all duration-500"
            whileHover={{
              boxShadow: "0 0 30px rgba(212, 175, 55, 0.3)",
              borderColor: "var(--glamour-gold)",
            }}
          />
          <div className="relative z-10 p-8 md:p-12">
            <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 text-on-cream tracking-tight">
              جاهزة لحجز خدمتك؟
            </h3>
            <p className="mb-8 text-base md:text-lg text-on-cream/90 leading-relaxed">
              اختاري من باقة خدماتنا الاحترافية واحجزي موعدك اليوم بسهولة وسرعة
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                <DynamicButton
                  onClick={() => onBookingClick()}
                  categoryId={categoriesList.length > 0 ? categoriesList[0].id : null}
                  categories={categoriesList}
                  className="px-8 py-3 md:px-10 md:py-4 rounded-full font-semibold text-sm md:text-base text-white shadow-lg bg-[var(--glamour-gold)] hover:bg-[color-mix(in srgb, var(--glamour-gold) 85%, black)] transition-all duration-300"
                  size="lg"
                >
                  احجزي موعد
                </DynamicButton>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ServicesSection;
