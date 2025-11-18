import React, { useState } from "react";

const PaymentSimulation = () => {
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  const handlePay = (brand) => {
    alert(`محاكاة الدفع بواسطة ${brand}\nCard: ${cardNumber}\nExpiry: ${expiry}\nCVV: ${cvv}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white shadow-xl rounded-2xl max-w-md w-full p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">إتمام عملية الدفع</h1>

        {/* Card Info Simulation */}
        <div className="space-y-4">
          <div>
            <label className="block text-gray-600 mb-1">رقم البطاقة</label>
            <input
              type="text"
              placeholder="0000 0000 0000 0000"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              className="w-full border-gray-300 rounded-lg shadow-sm p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="block text-gray-600 mb-1">تاريخ الانتهاء</label>
              <input
                type="text"
                placeholder="MM/YY"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                className="w-full border-gray-300 rounded-lg shadow-sm p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div className="flex-1">
              <label className="block text-gray-600 mb-1">CVV</label>
              <input
                type="text"
                placeholder="123"
                value={cvv}
                onChange={(e) => setCvv(e.target.value)}
                className="w-full border-gray-300 rounded-lg shadow-sm p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Payment Buttons */}
          <div className="space-y-2 mt-4">
            <button
              onClick={() => handlePay("MADA")}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition"
            >
              الدفع بواسطة MADA
            </button>
            <button
              onClick={() => handlePay("VISA")}
              className="w-full bg-gray-800 hover:bg-gray-900 text-white py-2 rounded-lg transition"
            >
              الدفع بواسطة VISA
            </button>
            <button
              onClick={() => handlePay("MASTER")}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition"
            >
              الدفع بواسطة MASTER
            </button>
          </div>
        </div>

        <p className="mt-6 text-sm text-gray-500 text-center">
          هذه مجرد محاكاة. عند ربط HyperPay SDK سيظهر نموذج البطاقة الحقيقي.
        </p>
      </div>
    </div>
  );
};

export default PaymentSimulation;
