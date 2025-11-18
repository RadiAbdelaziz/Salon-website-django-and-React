import { Button } from '@/components/ui/button';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Facebook, 
  Instagram, 
  Twitter, 
  Youtube
} from 'lucide-react';

const Footer = ({ onNavigate }) => {
  const quickLinks = [
    { name: 'الرئيسية', href: '#home', onClick: () => onNavigate && onNavigate('home') },
    { name: 'الخدمات', href: '#services', onClick: () => onNavigate && onNavigate('services') },
    { name: 'العروض', href: '#offers', onClick: () => onNavigate && onNavigate('offers') },
    { name: 'المدونه', href: '#blog', onClick: () => onNavigate && onNavigate('blog') },
    { name: 'الدعم', href: '#contact', onClick: () => onNavigate && onNavigate('contact') }
  ];

  const services = [
    { name: 'علاجات الشعر', href: '#services' },
    { name: 'العناية بالبشرة', href: '#services' },
    { name: 'قسم المساج', href: '#services' }
  ];

  const supportLinks = [
    { name: 'سياسة الخصوصية', href: '#privacy', onClick: () => onNavigate && onNavigate('privacy') },
    { name: 'الشروط والأحكام', href: '#terms', onClick: () => onNavigate && onNavigate('terms') },
    { name: 'الأسئلة الشائعة', href: '#faq', onClick: () => onNavigate && onNavigate('faq') }
  ];

  const socialLinks = [
    { name: 'Facebook', icon: Facebook, href: '#', color: 'hover:text-blue-600' },
    { name: 'Instagram', icon: Instagram, href: '#', color: 'hover:text-pink-600' },
    { name: 'Twitter', icon: Twitter, href: '#', color: 'hover:text-blue-400' },
    { name: 'Youtube', icon: Youtube, href: '#', color: 'hover:text-red-600' }
  ];

  return (
<footer className="bg-gradient-to-b from-[#1a1a1a] to-[#000] text-auto relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, #B99668 2px, transparent 2px),
                           radial-gradient(circle at 75% 75%, #8A724C 1px, transparent 1px)`,
          backgroundSize: '50px 50px, 30px 30px'
        }}></div>
      </div>
      
      {/* المحتوى الرئيسي للفوتر */}
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8">
          {/* Company Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <img
                  src="/logo-05.png"
                  alt="Glammy Salon & Spa Logo"
                  className="h-16 w-auto object-contain"
                />
              </div>
              <p className="leading-relaxed text-base text-on-black">
                خدمات تجميل وسبا احترافية تصل إليك في منزلك. عيشي تجربة فاخرة ومريحة مع أخصائيات معتمدات.
              </p>
            </div>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-opacity-10 transition-colors" style={{ backgroundColor: 'rgba(185, 150, 104, 0.05)' }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#B99668' }}>
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-sm font-medium text-on-black">+966 55 123 4567</div>
                  <div className="text-xs text-on-black">اتصل بنا</div>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-opacity-10 transition-colors" style={{ backgroundColor: 'rgba(185, 150, 104, 0.05)' }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#B99668' }}>
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-sm font-medium text-on-black">hello@glammysalon.com</div>
                  <div className="text-xs text-on-black">راسلنا</div>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-opacity-10 transition-colors" style={{ backgroundColor: 'rgba(185, 150, 104, 0.05)' }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#B99668' }}>
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-sm font-medium text-on-black">الرياض، المملكة العربية السعودية</div>
                  <div className="text-xs text-on-black">موقعنا</div>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-opacity-10 transition-colors" style={{ backgroundColor: 'rgba(185, 150, 104, 0.05)' }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#B99668' }}>
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-sm font-medium text-on-black">الأحد - الخميس: 10ص - 8م</div>
                  <div className="text-xs text-on-black">ساعات العمل</div>
                </div>
              </div>
            </div>

            {/* وسائل التواصل */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-on-black">تابعينا</h4>
              <div className="flex space-x-3">
                {socialLinks.map((social) => {
                  const IconComponent = social.icon;
                  return (
                    <a
                      key={social.name}
                      href={social.href}
                      className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg group"
                      style={{ backgroundColor: '#8A724C' }}
                      aria-label={social.name}
                    >
                      <IconComponent className="w-5 h-5 transition-colors duration-300 group-hover:text-white text-on-black" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          {/* روابط سريعة */}
          <div>
            <h4 className="text-xl font-bold mb-4 relative text-on-black">
              روابط تهمك
              <div className="absolute -bottom-2 left-0 w-12 h-0.5" style={{ backgroundColor: '#B99668' }}></div>
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <button
                    onClick={link.onClick}
                    className="group flex items-center space-x-3 space-x-reverse text-left w-full p-2 rounded-lg transition-all duration-300 hover:bg-opacity-10 text-on-black hover:text-on-gold"
                  >
                    <div className="w-2 h-2 rounded-full transition-all duration-300 group-hover:scale-125" style={{ backgroundColor: '#8A724C' }}></div>
                    <span className="font-medium">{link.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* الخدمات */}
          <div>
            <h4 className="text-xl font-bold mb-4 relative text-on-black">
              خدماتنا
              <div className="absolute -bottom-2 left-0 w-12 h-0.5" style={{ backgroundColor: '#B99668' }}></div>
            </h4>
            <ul className="space-y-3">
              {services.map((service) => (
                <li key={service.name}>
                  <a
                    href={service.href}
                    className="group flex items-center space-x-3 space-x-reverse text-left w-full p-2 rounded-lg transition-all duration-300 hover:bg-opacity-10 text-on-black hover:text-on-gold"
                  >
                    <div className="w-2 h-2 rounded-full transition-all duration-300 group-hover:scale-125" style={{ backgroundColor: '#8A724C' }}></div>
                    <span className="font-medium">{service.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* الدعم */}
          <div>
            <h4 className="text-xl font-bold mb-4 relative text-on-black">
              الدعم
              <div className="absolute -bottom-2 left-0 w-12 h-0.5" style={{ backgroundColor: '#B99668' }}></div>
            </h4>
            <ul className="space-y-3">
              {supportLinks.map((link) => (
                <li key={link.name}>
                  <button
                    onClick={link.onClick}
                    className="group flex items-center space-x-3 space-x-reverse text-left w-full p-2 rounded-lg transition-all duration-300 hover:bg-opacity-10 text-on-black hover:text-on-gold"
                  >
                    <div className="w-2 h-2 rounded-full transition-all duration-300 group-hover:scale-125" style={{ backgroundColor: '#8A724C' }}></div>
                    <span className="font-medium">{link.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>


      {/* الشريط السفلي */}
      <div className="relative" style={{ 
        borderTop: '1px solid #8A724C',
        background: 'linear-gradient(90deg, rgba(138, 114, 76, 0.1) 0%, rgba(185, 150, 104, 0.05) 50%, rgba(138, 114, 76, 0.1) 100%)'
      }}>
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#B99668' }}>
                <span className="text-white font-bold text-sm">G</span>
              </div>
              <div className="text-sm font-medium text-on-black">
              © 2025 Glammy Salon & Spa. جميع الحقوق محفوظة.
              </div>
            </div>
            <div className="flex items-center space-x-8 text-sm">
              <a 
                href="#" 
                className="group flex items-center space-x-2 space-x-reverse transition-all duration-300 hover:scale-105 text-on-black hover:text-on-gold"
              >
                <div className="w-1 h-1 rounded-full transition-all duration-300 group-hover:scale-150" style={{ backgroundColor: '#8A724C' }}></div>
                <span>سياسة الخصوصية</span>
              </a>
              <a 
                href="#" 
                className="group flex items-center space-x-2 space-x-reverse transition-all duration-300 hover:scale-105 text-on-black hover:text-on-gold"
              >
                <div className="w-1 h-1 rounded-full transition-all duration-300 group-hover:scale-150" style={{ backgroundColor: '#8A724C' }}></div>
                <span>الشروط والأحكام</span>
              </a>
              <a 
                href="#" 
                className="group flex items-center space-x-2 space-x-reverse transition-all duration-300 hover:scale-105 text-on-black hover:text-on-gold"
              >
                <div className="w-1 h-1 rounded-full transition-all duration-300 group-hover:scale-150" style={{ backgroundColor: '#8A724C' }}></div>
                <span>سياسة الكوكيز</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

