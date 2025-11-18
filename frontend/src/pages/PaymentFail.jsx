export default function PaymentFail() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-red-50">
      <h2 className="text-3xl font-bold text-red-600 mb-4">فشل الدفع ❌</h2>
      <p className="text-gray-600">يرجى المحاولة مرة أخرى.</p>
    </div>
  );
}
