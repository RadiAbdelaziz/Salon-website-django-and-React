import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Send,
  MessageCircle,
  Instagram,
  Facebook,
  Twitter,
  Heart,
  Star,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

const ContactSection = ({ onBookingClick, onBack }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    message: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
    alert('تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.');
  };

  const contactInfo = [
    {
      icon: Phone,
      title: 'اتصل بنا',
      details: ['+966 55 123 4567', '+966 11 234 5678'],
      description: 'متاح من 10 صباحاً حتى 10 مساءً'
    },
    {
      icon: Mail,
      title: 'البريد الإلكتروني',
      details: ['info@glammy.com', 'bookings@glammy.com'],
      description: 'نرد على جميع الرسائل خلال 24 ساعة'
    },
    {
      icon: MapPin,
      title: 'موقعنا',
      details: ['الرياض، المملكة العربية السعودية', 'جدة، المملكة العربية السعودية'],
      description: 'خدمة منزلية في جميع أنحاء المملكة'
    },
    {
      icon: Clock,
      title: 'ساعات العمل',
      details: ['السبت - الخميس: 10:00 ص - 10:00 م', 'الجمعة: 2:00 م - 10:00 م'],
      description: 'مواعيد مرنة حسب الطلب'
    }
  ];

  const services = [
    'العناية بالشعر',
    'المكياج',
    'العناية بالبشرة',
    'العناية بالأظافر',
    'المساج',
    'بكج العروس',
    'خدمات أخرى'
  ];

  const socialLinks = [
    { name: 'Instagram', icon: Instagram, href: '#', color: 'var(--glamour-gold)' },
    { name: 'Facebook', icon: Facebook, href: '#', color: 'var(--glamour-gold)' },
    { name: 'Twitter', icon: Twitter, href: '#', color: 'var(--glamour-gold)' },
    { name: 'WhatsApp', icon: MessageCircle, href: '#', color: 'var(--glamour-gold)' }
  ];

  const features = [
    {
      icon: CheckCircle,
      title: 'استجابة سريعة',
      description: 'نرد على جميع الاستفسارات خلال 24 ساعة'
    },
    {
      icon: Star,
      title: 'خدمة متميزة',
      description: 'فريق محترف من أخصائيات التجميل المعتمدات'
    },
    {
      icon: Heart,
      title: 'رعاية شخصية',
      description: 'نصمم كل خدمة حسب احتياجاتك الفريدة'
    }
  ];

  return (
    <div className="min-h-screen bg-salon-cream text-auto">
      {/* Back Button */}
      <div className="container mx-auto px-4 pt-6">
        <Button
          onClick={onBack}
          variant="outline"
          className="mb-6 flex items-center gap-2"
          style={{ 
            borderColor: 'var(--glamour-gold)', 
            color: 'var(--warm-brown)' 
          }}
        >
          <ArrowRight className="w-4 h-4" />
          العودة للرئيسية
        </Button>
      </div>

      <section id="contact" className="py-8">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center space-x-2 space-x-reverse mb-6">
              <MessageCircle className="w-6 h-6" style={{ color: 'var(--glamour-gold)' }} />
              <span className="text-sm font-medium tracking-wide" style={{ color: 'var(--glamour-gold)' }}>تواصل معنا</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold mb-6" style={{ color: 'var(--warm-brown)' }}>
              تواصل معنا
            </h2>
            <p className="text-lg max-w-3xl mx-auto" style={{ color: 'var(--warm-brown)' }}>
              نحن هنا لمساعدتك! تواصلي معنا للحصول على استشارة مجانية أو لحجز موعدك. فريقنا المحترف جاهز لتقديم أفضل الخدمات لك.
            </p>
          </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="space-y-8">
            <Card className="shadow-xl" style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderColor: 'var(--silken-dune)' }}>
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-center" style={{ color: 'var(--warm-brown)' }}>
                  أرسلي لنا رسالة
                </CardTitle>
                <p className="text-center" style={{ color: 'var(--warm-brown)' }}>
                  املئي النموذج وسنتواصل معك في أقرب وقت ممكن
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--warm-brown)' }}>
                        الاسم الكامل *
                      </label>
                      <Input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 transition-all duration-300"
                        style={{ borderColor: 'var(--silken-dune)', focusRingColor: 'var(--glamour-gold)' }}
                        placeholder="أدخلي اسمك الكامل"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--warm-brown)' }}>
                        البريد الإلكتروني *
                      </label>
                      <Input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 transition-all duration-300"
                        style={{ borderColor: 'var(--silken-dune)', focusRingColor: 'var(--glamour-gold)' }}
                        placeholder="أدخلي بريدك الإلكتروني"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--warm-brown)' }}>
                        رقم الهاتف
                      </label>
                      <Input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 transition-all duration-300"
                        style={{ borderColor: 'var(--silken-dune)', focusRingColor: 'var(--glamour-gold)' }}
                        placeholder="+966 5X XXX XXXX"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--warm-brown)' }}>
                        نوع الخدمة
                      </label>
                      <select
                        name="service"
                        value={formData.service}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 transition-all duration-300"
                        style={{ borderColor: 'var(--silken-dune)', focusRingColor: 'var(--glamour-gold)' }}
                      >
                        <option value="">اختر الخدمة</option>
                        {services.map((service, index) => (
                          <option key={index} value={service}>{service}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--warm-brown)' }}>
                      الرسالة *
                    </label>
                    <Textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={5}
                      className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 transition-all duration-300 resize-none"
                      style={{ borderColor: 'var(--silken-dune)', focusRingColor: 'var(--glamour-gold)' }}
                      placeholder="اكتبي رسالتك هنا..."
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                    style={{ background: 'linear-gradient(135deg, var(--glamour-gold), var(--glamour-gold-dark))', color: 'white' }}
                  >
                    <Send className="w-5 h-5 mr-2" />
                    أرسلي الرسالة
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Features */}
            <div className="grid md:grid-cols-3 gap-4">
              {features.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <Card key={index} className="text-center p-4" style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', borderColor: 'var(--silken-dune)' }}>
                    <CardContent className="p-4">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: 'var(--champagne-veil)' }}>
                        <IconComponent className="w-6 h-6" style={{ color: 'var(--glamour-gold)' }} />
                      </div>
                      <h4 className="font-semibold mb-2" style={{ color: 'var(--warm-brown)' }}>
                        {feature.title}
                      </h4>
                      <p className="text-sm" style={{ color: 'var(--warm-brown)' }}>
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            {/* Contact Cards */}
            <div className="space-y-6">
              {contactInfo.map((info, index) => {
                const IconComponent = info.icon;
                return (
                  <Card key={index} className="p-6" style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderColor: 'var(--silken-dune)' }}>
                    <div className="flex items-start space-x-4 space-x-reverse">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--champagne-veil)' }}>
                        <IconComponent className="w-6 h-6" style={{ color: 'var(--glamour-gold)' }} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--warm-brown)' }}>
                          {info.title}
                        </h3>
                        {info.details.map((detail, detailIndex) => (
                          <p key={detailIndex} className="font-medium" style={{ color: 'var(--warm-brown)' }}>
                            {detail}
                          </p>
                        ))}
                        <p className="text-sm mt-2" style={{ color: 'var(--glamour-gold)' }}>
                          {info.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Social Media */}
            <Card className="p-6" style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderColor: 'var(--silken-dune)' }}>
              <h3 className="text-lg font-semibold mb-4 text-center" style={{ color: 'var(--warm-brown)' }}>
                تابعينا على وسائل التواصل الاجتماعي
              </h3>
              <div className="flex justify-center space-x-4 space-x-reverse">
                {socialLinks.map((social) => {
                  const IconComponent = social.icon;
                  return (
                    <a
                      key={social.name}
                      href={social.href}
                      className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                      style={{ backgroundColor: 'var(--champagne-veil)', color: social.color }}
                      aria-label={social.name}
                    >
                      <IconComponent className="w-6 h-6" />
                    </a>
                  );
                })}
              </div>
            </Card>

            {/* Call to Action */}
            <Card className="p-8 text-center" style={{ background: 'linear-gradient(135deg, var(--glamour-gold), var(--glamour-gold-dark))', color: 'white' }}>
              <h3 className="text-2xl font-bold mb-4">
                جاهزة لحجز موعدك؟
              </h3>
              <p className="mb-6" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                احجزي موعدك الآن واستمتعي بأفضل خدمات التجميل في راحة منزلك
              </p>
              <Button
                size="lg"
                variant="secondary"
                className="bg-white px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                style={{ color: 'var(--glamour-gold)' }}
                onClick={() => onBookingClick && onBookingClick()}
              >
                احجزي الآن
              </Button>
            </Card>
          </div>
        </div>
      </div>
      </section>
    </div>
  );
};

export default ContactSection;