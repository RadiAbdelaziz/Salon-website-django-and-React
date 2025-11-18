import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Heart, ShoppingCart, Clock } from "lucide-react";
import { useCart } from "../contexts/CartContext.jsx";
import { useFavorites } from "../contexts/FavoritesContext.jsx";

const ServiceDetails = () => {
  const { id } = useParams(); // نأخذ ID الخدمة من الرابط
  const navigate = useNavigate();

  const { addToCart, isInCart, toggleCart } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();

  const [service, setService] = useState(null);

  // ⚙️ جلب بيانات الخدمة (محاكاة — يمكنك ربطها بـ API لاحقًا)
  useEffect(() => {
    // مثال لخدمة واحدة — في الواقع ستجلبها من API أو context
    const storedServices = JSON.parse(localStorage.getItem("all-services")) || [];
    const foundService = storedServices.find((s) => s.id.toString() === id);
    setService(foundService);
  }, [id]);

  if (!service) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-600">
        جاري تحميل التفاصيل...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* 🔙 زر الرجوع */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 text-sm text-[#B89F67] font-medium hover:underline"
      >
        ← عودة
      </button>

      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* صورة الخدمة */}
        <div className="relative">
          <img
            src={service.image}
            alt={service.name}
            className="w-full h-80 object-cover"
          />

          {/* المفضلة ❤️ */}
          <button
            onClick={() => toggleFavorite(service)}
            className={`absolute top-4 right-4 p-3 rounded-full transition ${
              isFavorite(service.id)
                ? "bg-red-500 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Heart size={20} />
          </button>
        </div>

        {/* محتوى التفاصيل */}
        <div className="p-6">
          <h1 className="text-2xl font-semibold text-gray-800 mb-2">
            {service.name}
          </h1>
          <p className="text-gray-500 mb-4">{service.category}</p>

          <p className="text-gray-700 mb-6 leading-relaxed">
            {service.description || "لا توجد تفاصيل متاحة لهذه الخدمة حالياً."}
          </p>

          <div className="flex items-center gap-6 mb-8">
            <div className="flex items-center gap-2 text-gray-600">
              <Clock size={18} />
              <span>{service.duration || 60} دقيقة</span>
            </div>

            <span className="text-xl font-bold text-[#B89F67]">
              {service.price} ريال
            </span>
          </div>

          <div className="flex gap-4">
            {/* زر السلة */}
            <button
              onClick={() => toggleCart(service)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg transition ${
                isInCart(service.id)
                  ? "bg-[#B89F67] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <ShoppingCart size={18} />
              {isInCart(service.id) ? "إزالة من السلة" : "أضف إلى السلة"}
            </button>

            {/* زر الحجز */}
            <button
              onClick={() => navigate("/book")}
              className="px-6 py-3 bg-[#B89F67] text-white rounded-lg hover:bg-[#a58e5b] transition"
            >
              احجزي الآن
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetails;
