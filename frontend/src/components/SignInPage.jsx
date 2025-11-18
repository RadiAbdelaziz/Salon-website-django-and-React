import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { ArrowLeft } from 'lucide-react'

export default function SignInPage({ onBack, onLoginSuccess, onSwitchToSignup }) {
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    username: '',
    password: ''
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

    try {
      const response = await login(formData)
      onLoginSuccess(response)
    } catch (err) {
      setError(err.message || 'حدث خطأ أثناء تسجيل الدخول')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-no-repeat bg-fixed bg-center bg-cover
" style={{  backgroundImage: "url('/BEAUTY SALON.jpeg')" }}>
      <div className="flex min-h-screen justify-center">
        {/* Left Side - Full Width Image */}
       

        {/* Right Side - Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-warm-brown mb-3">
                  مرحباً بعودتك
                </h1>
                <p className="text-medium-beige text-sm leading-relaxed">
                  سجل دخولك للوصول إلى حسابك
                </p>
              </div>
          
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                      {error}
                    </div>
                  )}
                  
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-warm-brown mb-2">
                      اسم المستخدم
                    </label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-silken-dune rounded-lg focus:ring-2 focus:ring-salon-gold focus:border-salon-gold transition-colors text-sm"
                      placeholder="اسم المستخدم"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-warm-brown mb-2">
                      كلمة المرور
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-silken-dune rounded-lg focus:ring-2 focus:ring-salon-gold focus:border-salon-gold transition-colors text-sm"
                      placeholder="كلمة المرور"
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-salon-gold to-glamour-gold-dark text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        جاري تسجيل الدخول...
                      </div>
                    ) : (
                      'تسجيل الدخول'
                    )}
                  </button>
                </form>
          
              <div className="text-center mt-6 space-y-3">
                <button
                  onClick={onSwitchToSignup}
                  className="text-salon-gold hover:text-glamour-gold-dark transition-colors duration-200 text-sm font-medium"
                >
                  ليس لديك حساب؟ إنشاء حساب جديد
                </button>
                
                <div className="border-t border-silken-dune pt-4">
                  <button
                    onClick={onBack}
                    className="text-medium-beige hover:text-warm-brown transition-colors duration-200 text-sm font-medium flex items-center justify-center mx-auto"
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
    </div>
  )
}