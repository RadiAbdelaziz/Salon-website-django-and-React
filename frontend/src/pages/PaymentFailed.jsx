export default function PaymentFailed() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");

  return (
    <div className="p-10 text-center">
      <h1 className="text-3xl font-bold text-red-600">❌ فشلت عملية الدفع</h1>
      <p className="mt-4">رمز الخطأ: {code}</p>
    </div>
  );
}
