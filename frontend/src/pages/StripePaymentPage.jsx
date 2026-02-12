// src/components/StripePaymentPage.jsx
import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from "@stripe/react-stripe-js";
import axios from "axios";
import "./StripePaymentPage.css"; // ملف CSS منفصل للتنسيق

// 🔹 المفتاح المباشر للـ Production
const stripePromise = loadStripe("pk_live_51R3mZXE0umYXt8cUi3uENbWe3YurKMHvm2RmexGj3AiK60J3ty1auc1D8EtNrqSKiikuUzBDncPQ5njbh6K8HfE500yJla4iwH");

const StripeCheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    axios.post("http://127.0.0.1:8000/api/payments/stripe/create-payment-intent/", {
      amount: 1000 // 10 SAR مثال
    })
    .then(res => setClientSecret(res.data.client_secret))
    .catch(err => setMessage("خطأ في الاتصال بالخادم"));
  }, []);

 const handleSubmit = async (e) => {
  e.preventDefault();
  if (!stripe || !elements || !clientSecret) return;

  setLoading(true);
  const card = elements.getElement(CardElement);

  const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
    payment_method: {
      card,
      billing_details: { address: { postal_code: "12345" } } // postal code مطلوب
    }
  });

  if (error) {
    // توجيه المستخدم لصفحة الفشل مع رسالة الخطأ
    navigate(`/payment-failed?desc=${encodeURIComponent(error.message)}`);
  } else if (paymentIntent && paymentIntent.status === "succeeded") {
    // توجيه المستخدم لصفحة النجاح
    navigate("/payment-success");
  }

  setLoading(false);
};



  return (
    <div className="stripe-container">
      <div className="stripe-card">
        <h2 className="stripe-title">ادفع باستخدام بطاقة Stripe</h2>
        <p className="stripe-subtitle">الرجاء إدخال بيانات بطاقتك لإتمام الدفع</p>

        <form onSubmit={handleSubmit} className="stripe-form">
          <div className="card-element-wrapper">
            <CardElement
  options={{
    style: {
      base: {
        fontSize: '16px',
        color: '#32325d',
        '::placeholder': { color: '#a0aec0' },
        fontFamily: 'Arial, sans-serif',
        padding: '10px 12px'
      },
      invalid: { color: '#fa755a' }
    },
    hidePostalCode: false // ✅ هذا يظهر حقل ZIP / Postal Code
  }}
/>

          </div>

          <button
            type="submit"
            disabled={!stripe || !clientSecret || loading}
            className="stripe-button"
          >
            {loading ? "جاري الدفع..." : "ادفع الآن"}
          </button>
        </form>

        {message && <p className="stripe-message">{message}</p>}
      </div>
    </div>
  );
};

const StripePaymentPage = () => (
  <Elements stripe={stripePromise}>
    <StripeCheckoutForm />
  </Elements>
);

export default StripePaymentPage;
