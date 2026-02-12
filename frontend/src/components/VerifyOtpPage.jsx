import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function VerifyOTPPage({ phone, onSuccess }) {
  const { verifyPhoneOTP } = useAuth();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async () => {
    if (code.length < 4) {
      setError('أدخل رمز التحقق كاملاً');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await verifyPhoneOTP(phone, code);
      onSuccess();
    } catch (err) {
      setError(err.message || 'رمز غير صحيح');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "url('/BEAUTY SALON.jpeg')" }}
    >
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-4 text-warm-brown">
          أدخل رمز التحقق
        </h2>

        <p className="text-center text-sm text-gray-500 mb-6">
          تم إرسال رمز التحقق إلى <br />
          <span className="font-semibold">{phone}</span>
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <input
          type="text"
          maxLength={4}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
          className="w-full text-center text-2xl tracking-widest px-4 py-3 border rounded-lg focus:ring-2 focus:ring-salon-gold"
          placeholder="----"
          dir="ltr"
        />

        <button
          onClick={handleVerify}
          disabled={loading}
          className="w-full mt-6 bg-gradient-to-r from-salon-gold to-glamour-gold-dark text-white py-3 rounded-xl font-semibold"
        >
          {loading ? 'جاري التحقق...' : 'تأكيد'}
        </button>
      </div>
    </div>
  );
}
