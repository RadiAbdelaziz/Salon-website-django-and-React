import React, { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

export default function PhoneSignup() {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOTP = async () => {
    setLoading(true);
    try {
      await api.post("auth/send-otp/", { phone });
      alert("تم إرسال رمز التحقق إلى WhatsApp ");
      navigate("/verify-otp", { state: { phone } });
    } catch (err) {
      alert("حدث خطأ أثناء الإرسال");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-pink-50">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-80">
        <h2 className="text-2xl font-bold mb-4 text-center">تسجيل عبر رقم الجوال</h2>
        <input
          type="tel"
          placeholder="أدخل رقم جوالك (مثال: +9665...)"
          className="border p-2 w-full rounded mb-4 text-center"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <button
          onClick={handleSendOTP}
          disabled={loading}
          className="bg-pink-500 text-white px-4 py-2 rounded w-full hover:bg-pink-600"
        >
          {loading ? "جارٍ الإرسال..." : "إرسال الرمز"}
        </button>
      </div>
    </div>
  );
}
