import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";

const PaymentResult = () => {
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const resourcePath = queryParams.get("resourcePath");

    if (!resourcePath) {
      setError("لا يوجد resourcePath في الرابط.");
      return;
    }

    const fetchResult = async () => {
      try {
        const resp = await axios.get(
          `http://127.0.0.1:8000/api/payments/result/?resourcePath=${encodeURIComponent(resourcePath)}`
        );
        setResult(resp.data);
      } catch (err) {
        setError(err.response?.data || err.message);
      }
    };

    fetchResult();
  }, [location.search]);

  if (error) return <div>❌ حدث خطأ: {JSON.stringify(error)}</div>;
  if (!result) return <div>⏳ جاري التحقق من نتيجة الدفع...</div>;

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      {result?.raw?.result?.code?.startsWith("000.") ? (
        <>
          <h2 style={{ color: "green" }}>✅ تم الدفع بنجاح!</h2>
          <p>رقم العملية: {result?.raw?.id}</p>
          <p>الوصف: {result?.raw?.result?.description}</p>
        </>
      ) : (
        <>
          <h2 style={{ color: "red" }}>❌ فشلت عملية الدفع</h2>
          <p>الكود: {result?.raw?.result?.code}</p>
          <p>الوصف: {result?.raw?.result?.description}</p>
        </>
      )}
    </div>
  );
};

export default PaymentResult;
