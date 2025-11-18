import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Phone, Mail, MapPin, Clock, Send,
  CheckCircle, AlertCircle
} from 'lucide-react';

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 }
};

const ContactPage = ({ onBookingClick, onBack }) => {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', subject: '', message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);
    try {
      const response = await fetch('http://localhost:8000/api/contact/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setSubmitStatus('success');
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      } else {
        setSubmitStatus('error');
      }
    } catch {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
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

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 py-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div 
          className="text-center mb-12"
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--warm-brown)' }}>
            تواصلي معنا
          </h1>
          <p className="text-lg" style={{ color: 'var(--medium-beige)' }}>
            نحن هنا لمساعدتك في جميع استفساراتك  
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Form */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <Card className="shadow-xl border-0 backdrop-blur-md bg-white/90">
                <CardHeader className="text-center pb-6">
                  <CardTitle className="text-2xl font-bold" style={{ color: 'var(--warm-brown)' }}>
                    أرسلي لنا رسالة
                  </CardTitle>
                  <p className="text-sm" style={{ color: 'var(--medium-beige)' }}>
                    املئي النموذج وسنتواصل معك في أقرب وقت ممكن
                  </p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <InputGroup label="الاسم الكامل *" name="name" type="text" value={formData.name} onChange={handleInputChange} required placeholder="أدخلي اسمك الكامل" />
                      <InputGroup label="البريد الإلكتروني *" name="email" type="email" value={formData.email} onChange={handleInputChange} required placeholder="أدخلي بريدك الإلكتروني" />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <InputGroup label="رقم الهاتف" name="phone" type="tel" value={formData.phone} onChange={handleInputChange} placeholder="+966 5X XXX XXXX" />
                      <InputGroup label="موضوع الرسالة" name="subject" type="text" value={formData.subject} onChange={handleInputChange} placeholder="موضوع الرسالة" />
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
                        style={{ borderColor: 'var(--silken-dune)' }}
                        placeholder="اكتبي رسالتك هنا..."
                      />
                    </div>

                    {submitStatus === 'success' && (
                      <AlertBox icon={CheckCircle} color="green" text="تم إرسال رسالتك بنجاح! سنتواصل معك قريباً." />
                    )}
                    {submitStatus === 'error' && (
                      <AlertBox icon={AlertCircle} color="red" text="حدث خطأ في إرسال الرسالة. يرجى المحاولة مرة أخرى." />
                    )}

                    <motion.div whileHover={{ scale: 1.05 }}>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                        style={{ background: 'linear-gradient(135deg, var(--glamour-gold), var(--glamour-gold-dark))', color: 'white' }}
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            جاري الإرسال...
                          </>
                        ) : (
                          <>
                            <Send className="w-5 h-5 mr-2" />
                            أرسلي الرسالة
                          </>
                        )}
                      </Button>
                    </motion.div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-center mb-8" style={{ color: 'var(--warm-brown)' }}>
              معلومات التواصل
            </h2>
            {contactInfo.map((info, index) => {
              const Icon = info.icon;
              return (
                <motion.div key={index} whileHover={{ scale: 1.03 }} transition={{ type: "spring", stiffness: 200 }}>
                  <Card className="p-6 shadow-lg border-0 backdrop-blur-md bg-white/90">
                    <div className="flex items-start space-x-4 space-x-reverse">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--champagne-veil)' }}>
                        <Icon className="w-6 h-6" style={{ color: 'var(--glamour-gold)' }} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--warm-brown)' }}>
                          {info.title}
                        </h3>
                        {info.details.map((detail, detailIndex) => (
                          <p key={detailIndex} className="font-medium mb-1" style={{ color: 'var(--warm-brown)' }}>
                            {detail}
                          </p>
                        ))}
                        <p className="text-sm mt-2" style={{ color: 'var(--glamour-gold)' }}>
                          {info.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}

            <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }}>
              <Card className="p-8 text-center shadow-lg border-0"
                style={{ background: 'linear-gradient(135deg, var(--glamour-gold), var(--glamour-gold-dark))', color: 'white' }}>
                <h3 className="text-2xl font-bold mb-4">
                  جاهزة لحجز موعدك؟
                </h3>
                <p className="mb-6" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                  احجزي موعدك الآن واستمتعي بأفضل خدمات التجميل
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
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

// 🔸 عناصر مساعدة
const InputGroup = ({ label, ...props }) => (
  <div>
    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--warm-brown)' }}>
      {label}
    </label>
    <Input
      {...props}
      className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 transition-all duration-300"
      style={{ borderColor: 'var(--silken-dune)' }}
    />
  </div>
);

const AlertBox = ({ icon: Icon, color, text }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className={`flex items-center gap-2 p-4 rounded-lg bg-${color}-50 border border-${color}-200`}
  >
    <Icon className={`w-5 h-5 text-${color}-600`} />
    <p className={`text-${color}-800 font-medium`}>{text}</p>
  </motion.div>
);

export default ContactPage;
