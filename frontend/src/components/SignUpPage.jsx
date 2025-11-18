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
  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState('')
  const [otpVerified, setOtpVerified] = useState(false)
  const [sendingOtp, setSendingOtp] = useState(false)
  const [verifyingOtp, setVerifyingOtp] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  // إرسال كود OTP
  const handleSendOTP = async () => {
    if (!formData.phone) {
      setError('يرجى إدخال رقم الهاتف أولاً')
      return
    }
    try {
      setSendingOtp(true)
      setError('')
      const res = await fetch('/api/send-otp/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formData.phone })
      })
      if (!res.ok) throw new Error('فشل إرسال كود التحقق')
      setOtpSent(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setSendingOtp(false)
    }
  }

  // التحقق من كود OTP
  const handleVerifyOTP = async () => {
    try {
      setVerifyingOtp(true)
      const res = await fetch('/api/verify-otp/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formData.phone, otp })
      })
      if (!res.ok) throw new Error('رمز التحقق غير صحيح')
      setOtpVerified(true)
      setError('')
    } catch (err) {
      setError(err.message)
    } finally {
      setVerifyingOtp(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('كلمات المرور غير متطابقة')
      setLoading(false)
      return
    }

    if (formData.password.length < 8) {
      setError('كلمة المرور يجب أن تكون 8 أحرف على الأقل')
      setLoading(false)
      return
    }

    if (formData.username.length < 3) {
      setError('اسم المستخدم يجب أن يكون 3 أحرف على الأقل')
      setLoading(false)
      return
    }

    if (!otpVerified) {
      setError('يرجى التحقق من رقم الهاتف أولاً')
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
    <div className="min-h-screen bg-no-repeat bg-fixed bg-center bg-cover
" style={{  backgroundImage: "url('/BEAUTY SALON.jpeg')"  }}>
      <div className="flex min-h-screen justify-center">
        {/* <div className="hidden lg:block lg:w-1/2 relative">
          <img src="/muaz.png" alt="Salon Image" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/10"></div>
        </div> */}

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

                {/* الاسم الأول واسم العائلة */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-warm-brown mb-2">الاسم الأول</label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border rounded-lg text-sm focus:ring-2 focus:ring-salon-gold"
                      placeholder="الاسم الأول"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-warm-brown mb-2">اسم العائلة</label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border rounded-lg text-sm focus:ring-2 focus:ring-salon-gold"
                      placeholder="اسم العائلة"
                    />
                  </div>
                </div>

                {/* البريد الإلكتروني */}
                <div>
                  <label className="block text-sm font-medium text-warm-brown mb-2">البريد الإلكتروني *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border rounded-lg text-sm focus:ring-2 focus:ring-salon-gold"
                    placeholder="البريد الإلكتروني"
                  />
                </div>

                {/* اسم المستخدم */}
                <div>
                  <label className="block text-sm font-medium text-warm-brown mb-2">اسم المستخدم *</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border rounded-lg text-sm focus:ring-2 focus:ring-salon-gold"
                    placeholder="اسم المستخدم"
                  />
                </div>

                {/* رقم الهاتف + كود OTP */}
                <div>
                  <label className="block text-sm font-medium text-warm-brown mb-2">رقم الهاتف *</label>
                  <div className="flex space-x-2">
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="flex-1 px-4 py-3 border rounded-lg text-sm focus:ring-2 focus:ring-salon-gold"
                      placeholder="رقم الهاتف"
                    />
                    <button
                      type="button"
                      onClick={handleSendOTP}
                      disabled={sendingOtp}
                      className="bg-salon-gold text-white px-4 py-2 rounded-lg text-sm hover:bg-glamour-gold-dark disabled:opacity-50"
                    >
                      {sendingOtp ? 'جاري الإرسال...' : otpSent ? 'إعادة الإرسال' : 'إرسال كود'}
                    </button>
                  </div>
                  {otpSent && !otpVerified && (
                    <div className="mt-3 flex space-x-2">
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="أدخل الكود"
                        className="flex-1 px-4 py-3 border rounded-lg text-sm focus:ring-2 focus:ring-salon-gold"
                      />
                      <button
                        type="button"
                        onClick={handleVerifyOTP}
                        disabled={verifyingOtp}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 disabled:opacity-50"
                      >
                        {verifyingOtp ? 'جارٍ التحقق...' : 'تحقق'}
                      </button>
                    </div>
                  )}
                  {otpVerified && <p className="text-green-600 text-sm mt-1">✅ تم التحقق من رقم الهاتف</p>}
                </div>

                {/* كلمات المرور */}
                <div>
                  <label className="block text-sm font-medium text-warm-brown mb-2">كلمة المرور *</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border rounded-lg text-sm focus:ring-2 focus:ring-salon-gold"
                    placeholder="كلمة المرور"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-warm-brown mb-2">تأكيد كلمة المرور *</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border rounded-lg text-sm focus:ring-2 focus:ring-salon-gold"
                    placeholder="تأكيد كلمة المرور"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-salon-gold to-glamour-gold-dark text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 hover:shadow-lg disabled:opacity-50"
                >
                  {loading ? 'جاري الإنشاء...' : 'إنشاء الحساب'}
                </button>
              </form>

              <div className="text-center mt-6 space-y-3">
                <p className="text-sm text-warm-brown">
                  لديك حساب بالفعل؟{' '}
                  <a href="/sign-in" className="text-salon-gold underline font-medium">
                    تسجيل الدخول
                  </a>
                </p>
                <button
                  onClick={onBack}
                  className="text-salon-gold text-sm font-medium flex items-center justify-center mx-auto"
                >
                  <ArrowLeft className="w-4 h-4 ml-2" /> العودة للصفحة الرئيسية
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
