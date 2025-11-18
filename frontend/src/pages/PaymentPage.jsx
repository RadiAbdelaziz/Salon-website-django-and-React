import { useEffect, useState } from "react";

const PaymentPage = () => {
  const [checkoutId, setCheckoutId] = useState(null);

  useEffect(() => {
    // 1. طلب إنشاء checkout من Django
    fetch("http://127.0.0.1:8000/api/payments/create-checkout/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: "100.00", // المبلغ الذي تريد اختباره
        currency: "SAR",  // أو USD، حسب الإعدادات
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setCheckoutId(data.checkout_id);
        // تحميل سكربت HyperPay تلقائيًا
        const script = document.createElement("script");
        script.src = data.script_url;
        document.body.appendChild(script);
      })
      .catch((err) => console.error("Error:", err));
  }, []);

  if (!checkoutId) return <p>جاري التحضير للدفع...</p>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">الدفع عبر HyperPay</h2>

      {/* هذا هو الفورم المهم */}
      <form
        action="http://127.0.0.1:8000/api/payments/result/"
        className="paymentWidgets"
        data-brands="VISA MASTER MADA"
      ></form>
    </div>
  );
};

export default PaymentPage;
