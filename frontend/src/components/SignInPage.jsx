import { useState } from 'react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { ArrowLeft } from 'lucide-react';
import { authAPI } from '../services/api';

export default function SignInPage({ onBack, onLoginSuccess }) {
  const [step, setStep] = useState('phone'); // phone | otp
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // إرسال OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');

    if (!phone) {
      setError('يرجى إدخال رقم الهاتف');
      return;
    }

    try {
      setLoading(true);

      const cleanPhone = phone.replace(/\s/g, '');
      console.log("Sending OTP to:", cleanPhone);

      await authAPI.sendOtp({ phone_number: cleanPhone });
      setStep('otp');
    } catch (err) {
      setError(err.message || 'فشل إرسال رمز التحقق');
    } finally {
      setLoading(false);
    }
  };

  // التحقق من OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');

    if (!otp) {
      setError('يرجى إدخال رمز التحقق');
      return;
    }

    try {
      setLoading(true);

      const cleanPhone = phone.replace(/\s/g, '');

      const response = await authAPI.verifyOtp({
        phone_number: cleanPhone,
        otp_code: otp,
      });

      // حفظ التوكن
      if (response?.token) {
        localStorage.setItem('authToken', response.token);
      }

      // نجاح الدخول
      onLoginSuccess(response);

    } catch (err) {
      setError(err.message || 'رمز التحقق غير صحيح');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-no-repeat bg-fixed bg-center bg-cover"
      style={{ backgroundImage: "url('/BEAUTY SALON.jpeg')" }}
    >
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-warm-brown mb-2">
            {step === 'phone' ? 'مرحباً بك' : 'رمز التحقق'}
          </h1>
          <p className="text-medium-beige text-sm">
            {step === 'phone'
              ? 'أدخل رقم هاتفك'
              : 'أدخل الرمز المرسل إلى هاتفك'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        {step === 'phone' && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <PhoneInput
              country="sa"
              value={phone}
              onChange={(value) => setPhone("+" + value)}
              inputStyle={{
                width: '100%',
                direction: 'ltr',
                fontSize: '16px',
                paddingLeft: '60px',
              }}
              buttonStyle={{
                border: 'none',
              }}
              containerClass="w-full"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-salon-gold to-glamour-gold-dark text-white font-semibold py-4 rounded-xl"
            >
              {loading ? 'جاري الإرسال...' : 'إرسال رمز التحقق'}
            </button>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg text-center tracking-widest"
              placeholder="••••••"
              dir="ltr"
              maxLength={6}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-salon-gold to-glamour-gold-dark text-white font-semibold py-4 rounded-xl"
            >
              {loading ? 'جاري التحقق...' : 'تأكيد'}
            </button>
          </form>
        )}

        <div className="text-center mt-6 border-t pt-4">
          <button
            onClick={onBack}
            className="text-sm flex items-center justify-center mx-auto"
          >
            <ArrowLeft className="w-4 h-4 ml-2" />
            العودة
          </button>
        </div>
      </div>
    </div>
  );
}
