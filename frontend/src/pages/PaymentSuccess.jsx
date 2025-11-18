export default function PaymentSuccess() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");

  return (
    <div className="p-10 text-center">
      <h1 className="text-3xl font-bold text-green-600">✅ تم الدفع بنجاح!</h1>
      <p className="mt-4">رمز العملية: {code}</p>
    </div>
  );
}
