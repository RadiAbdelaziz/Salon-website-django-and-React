import React, { useState } from "react";
import api from "../api";
import { useLocation, useNavigate } from "react-router-dom";

export default function OTPVerify() {
  const [otp, setOtp] = useState("");
  const { state } = useLocation();
  const navigate = useNavigate();
 

  const handleVerify = async () => {
    try {
      const res = await api.post("accounts/verify-otp/", {
        phone: state.phone,
        otp,
      });
      alert("تم التحقق بنجاح ✅");
      navigate("/checkout");
    } catch {
      alert("رمز غير صحيح ❌");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-pink-50">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-80 text-center">
        <h2 className="text-xl font-bold mb-4">أدخل رمز التحقق</h2>
        <input
          type="text"
          placeholder="XXXX"
          className="border p-2 w-full rounded mb-4 text-center"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />
        <button
          onClick={handleVerify}
          className="bg-green-500 text-white px-4 py-2 rounded w-full hover:bg-green-600"
        >
          تحقق
        </button>
      </div>
    </div>
  );
}
