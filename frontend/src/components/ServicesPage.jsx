import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Star, Scissors, Palette, Heart, Hand, Sparkles, Crown } from 'lucide-react';
import { fetchCategories } from '../data/services';

const ServicesPage = ({ onBack, onBookingClick, onNavigateToService }) => {
  const [hoveredCard, setHoveredCard] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const apiCategories = await fetchCategories();
        
        // تحويل بيانات الفئات من Django API إلى التنسيق المطلوب
        const transformedCategories = Object.values(apiCategories).map(category => {
          const icons = {
            'hair_care': Scissors,
            'makeup': Palette,
            'nail_care': Hand,
            'skincare': Heart,
            'special_packages': Crown,
            'massage_&_relaxation': Sparkles,
            'other_services': Heart,
            'body_bath': Sparkles
          };

          // No fallback images - only use uploaded images from Django

          // الحصول على أقل سعر في الفئة
          const minPrice = category.services && category.services.length > 0 
            ? Math.min(...category.services.map(service => service.basePrice || 0))
            : 0;

          return {
            id: category.id,
            title: category.title,
            description: category.description,
            price: `${minPrice}`,
            image: category.image || 'http://localhost:8000/api/placeholder/400/400/',
            icon: icons[category.id] || Sparkles,
            items: category.services ? category.services.map(service => service.name) : []
          };
        });

        setCategories(transformedCategories);
      } catch (error) {
        console.error('Failed to load categories:', error);
        // Fallback to static data
        setCategories([
          {
            id: 'hair-care',
            title: 'العناية بالشعر',
            description: 'مجموعة شاملة من علاجات الشعر المتقدمة',
            price: '300',
            image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=400&fit=crop&crop=face',
            icon: Scissors,
            items: ['صبغات الشعر', 'علاج الشعر', 'تصفيف الشعر']
          },
          {
            id: 'makeup',
            title: 'المكياج',
            description: 'فن المكياج الاحترافي لجميع المناسبات',
            price: '500',
            image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop&crop=face',
            icon: Palette,
            items: ['مكياج المناسبات', 'مكياج العروس', 'مكياج يومي']
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  return (
    <div className="min-h-screen bg-salon-cream text-auto">
      {/* Header Section */}
      <div className="relative py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <div className="mb-8">
            <Button
              onClick={onBack}
              variant="ghost"
              className="flex items-center space-x-2 space-x-reverse text-sm font-medium transition-colors hover:opacity-80"
              style={{ color: 'var(--warm-brown)' }}
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              <span>العودة للرئيسية</span>
            </Button>
          </div>

          {/* Title Section */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center space-x-2 space-x-reverse mb-4">
              <Star className="w-6 h-6" style={{ color: 'var(--glamour-gold)' }} />
              <h2 className="text-lg font-medium" style={{ color: 'var(--warm-brown)' }}>
                خدماتنا 
              </h2>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6" style={{ color: 'var(--warm-brown)' }}>
              خدماتنا
            </h1>
            <div className="w-24 h-1 mx-auto mb-6" style={{ background: 'var(--glamour-gold)' }}></div>
            <p className="text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed" style={{ color: 'var(--warm-brown)' }}>
              اكتشفي مجموعتنا المتكاملة من خدمات التجميل الاحترافية لتعزيز جمالك ورفاهيتك
            </p>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: 'var(--glamour-gold)' }}></div>
              <p className="mt-4" style={{ color: 'var(--warm-brown)' }}>جاري تحميل الفئات...</p>
            </div>
          ) : (
            <>
              {/* Services Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
                {categories.map((category, index) => {
              const IconComponent = category.icon;
              return (
                <div
                  key={category.id}
                  className="group relative"
                  onMouseEnter={() => setHoveredCard(category.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  {/* Service Card */}
                  <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 text-center">
                    {/* Circular Image */}
                    <div className="relative mb-6">
                      <div className="w-32 h-32 mx-auto rounded-full overflow-hidden shadow-lg group-hover:scale-110 transition-transform duration-500">
                        <img
                          src={category.image}
                          alt={category.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {/* Icon Overlay */}
                      <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500"
                           style={{ background: 'linear-gradient(135deg, var(--glamour-gold), var(--glamour-gold-dark))' }}>
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                    </div>

                    {/* Category Info */}
                    <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--warm-brown)' }}>
                      {category.title} 
                    </h3>
                    <p className="text-sm mb-4 opacity-80" style={{ color: 'var(--warm-brown)' }}>
                      {category.description}
                    </p>
                    <div className="text-2xl font-bold mb-6 sar-symbol" style={{ color: 'var(--glamour-gold)' }}>
                      ابتداء من {category.price}
                    </div>

                    {/* Category Items */}
                    <div className="space-y-2 mb-6">
                      {category.items.slice(0, 3).map((item, itemIndex) => (
                        <div key={itemIndex} className="text-sm" style={{ color: 'var(--warm-brown)' }}>
                          • {item}
                        </div>
                      ))}
                      {category.items.length > 3 && (
                        <div className="text-sm" style={{ color: 'var(--glamour-gold)' }}>
                          + {category.items.length - 3} خدمات أخرى
                        </div>
                      )}
                    </div>

                    {/* Navigate Button */}
                  <Button
                    onClick={() => onNavigateToService(category.id)}
                    className="w-full py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105"
                    style={{
                      background: hoveredCard === category.id 
                        ? 'linear-gradient(135deg, var(--glamour-gold-dark), var(--glamour-gold))'
                        : 'linear-gradient(135deg, var(--glamour-gold), var(--glamour-gold-dark))',
                      color: 'white',
                      boxShadow: hoveredCard === category.id 
                        ? '0 10px 25px rgba(212, 175, 55, 0.4)'
                        : '0 5px 15px rgba(212, 175, 55, 0.3)'
                    }}
                  >
                    عرض الخدمات
                  </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Call to Action */}
          <div className="text-center mt-16">
            <div className="bg-white rounded-2xl p-8 shadow-lg max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold mb-4" style={{ color: 'var(--warm-brown)' }}>
                هل تحتاجين إلى استشارة شخصية؟
              </h3>
              <p className="text-lg mb-6 opacity-80" style={{ color: 'var(--warm-brown)' }}>
                فريقنا من الخبراء جاهز لمساعدتك في اختيار الخدمات المناسبة لك
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => onBookingClick()}
                  className="px-8 py-3 rounded-full font-semibold"
                  style={{
                    background: 'linear-gradient(135deg, var(--glamour-gold), var(--glamour-gold-dark))',
                    color: 'white'
                  }}
                >
                  احجزي استشارة مجانية 
                </Button>
                <Button
                  variant="outline"
                  className="px-8 py-3 rounded-full font-semibold"
                  style={{
                    borderColor: 'var(--glamour-gold)',
                    color: 'var(--glamour-gold)',
                    backgroundColor: 'transparent'
                  }}
                >
                  اتصل بنا
                </Button>
              </div>
            </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;
