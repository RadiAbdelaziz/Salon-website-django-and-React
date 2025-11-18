import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { ArrowLeft } from 'lucide-react'

export default function SignUpPage({ onBack, onSignupSuccess }) {
  const { register } = useAuth()
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    phone: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('كلمات المرور غير متطابقة')
      setLoading(false)
      return
    }

    // Validate password length
    if (formData.password.length < 8) {
      setError('كلمة المرور يجب أن تكون 8 أحرف على الأقل')
      setLoading(false)
      return
    }

    // Validate username length
    if (formData.username.length < 3) {
      setError('اسم المستخدم يجب أن يكون 3 أحرف على الأقل')
      setLoading(false)
      return
    }

    try {
      const { confirmPassword, ...signupData } = formData
      const response = await register(signupData)
      onSignupSuccess(response)
    } catch (err) {
      setError(err.message || 'حدث خطأ أثناء إنشاء الحساب')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fff2dc' }}>
      <div className="flex min-h-screen">
        {/* Left Side - Full Width Image */}
        <div className="hidden lg:block lg:w-1/2 relative">
          <img 
            src="/muaz.png" 
            alt="Salon Image" 
            className="w-full h-full object-cover"
          />
          {/* Optional overlay for better contrast */}
          <div className="absolute inset-0 bg-black/10"></div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-warm-brown mb-3">
                  إنشاء حساب جديد
                </h1>
                <p className="text-medium-beige text-sm leading-relaxed">
                  انضم إلينا واحصل على أفضل خدمات التجميل والعناية
                </p>
              </div>
          
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                      {error}
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="first_name" className="block text-sm font-medium text-warm-brown mb-2">
                        الاسم الأول
                      </label>
                      <input
                        type="text"
                        id="first_name"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-silken-dune rounded-lg focus:ring-2 focus:ring-salon-gold focus:border-salon-gold transition-colors text-sm"
                        placeholder="الاسم الأول"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="last_name" className="block text-sm font-medium text-warm-brown mb-2">
                        اسم العائلة
                      </label>
                      <input
                        type="text"
                        id="last_name"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-silken-dune rounded-lg focus:ring-2 focus:ring-salon-gold focus:border-salon-gold transition-colors text-sm"
                        placeholder="اسم العائلة"
                      />
                    </div>
                  </div>
            
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-warm-brown mb-2">
                      البريد الإلكتروني *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-silken-dune rounded-lg focus:ring-2 focus:ring-salon-gold focus:border-salon-gold transition-colors text-sm"
                      placeholder="البريد الإلكتروني"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-warm-brown mb-2">
                      اسم المستخدم *
                    </label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-silken-dune rounded-lg focus:ring-2 focus:ring-salon-gold focus:border-salon-gold transition-colors text-sm"
                      placeholder="اسم المستخدم"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-warm-brown mb-2">
                      رقم الهاتف *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-silken-dune rounded-lg focus:ring-2 focus:ring-salon-gold focus:border-salon-gold transition-colors text-sm"
                      placeholder="رقم الهاتف"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-warm-brown mb-2">
                      كلمة المرور *
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-silken-dune rounded-lg focus:ring-2 focus:ring-salon-gold focus:border-salon-gold transition-colors text-sm"
                      placeholder="كلمة المرور (8 أحرف على الأقل)"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-warm-brown mb-2">
                      تأكيد كلمة المرور *
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-silken-dune rounded-lg focus:ring-2 focus:ring-salon-gold focus:border-salon-gold transition-colors text-sm"
                      placeholder="تأكيد كلمة المرور"
                    />
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="terms"
                      name="terms"
                      required
                      className="mt-1 h-4 w-4 text-salon-gold border-gray-300 rounded focus:ring-salon-gold focus:ring-2"
                    />
                    <label htmlFor="terms" className="text-sm text-warm-brown">
                      أوافق على&nbsp;
                      <a href="#" className="text-salon-gold hover:text-glamour-gold-dark underline">
                        الشروط والأحكام
                      </a>
                      &nbsp;و&nbsp;
                      <a href="#" className="text-salon-gold hover:text-glamour-gold-dark underline">
                        سياسة الخصوصية
                      </a>
                    </label>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-salon-gold to-glamour-gold-dark text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        جاري الإنشاء...
                      </div>
                    ) : (
                      'إنشاء الحساب'
                    )}
                  </button>
                </form>
          
              <div className="text-center mt-6 space-y-3">
                <p className="text-sm text-warm-brown">
                  لديك حساب بالفعل؟&nbsp;
                  <a href="/sign-in" className="text-salon-gold hover:text-glamour-gold-dark underline font-medium">
                    تسجيل الدخول
                  </a>
                </p>
                
                <button
                  onClick={onBack}
                  className="text-salon-gold hover:text-glamour-gold-dark transition-colors duration-200 text-sm font-medium flex items-center justify-center mx-auto"
                >
                  <ArrowLeft className="w-4 h-4 ml-2" />
                  العودة للصفحة الرئيسية
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


