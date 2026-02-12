import React from "react";
import { useLocation } from "react-router-dom";
import "./PaymentResult.css";

const PaymentFailed = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const desc = params.get("desc") || "حدث خطأ أثناء الدفع.";

  return (
    <div className="result-container failed">
      <h1>❌ فشل الدفع</h1>
      <p>{desc}</p>
    </div>
  );
};

export default PaymentFailed;
