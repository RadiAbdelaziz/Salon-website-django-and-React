import React, { useState, useEffect } from "react";
import { ArrowRight, Heart as HeartIcon } from "lucide-react";
import PremiumServiceCard from "./ui/PremiumServiceCard";
import { Button } from "@/components/ui/button";

const FavoritesPage = ({ onBack, onBookNow, onViewDetails, onAddToCart }) => {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const favs = JSON.parse(localStorage.getItem("favorites")) || [];
    setFavorites(favs);
  }, []);

  const handleToggleFavorite = (service) => {
    const updatedFavorites = favorites.filter((fav) => fav.id !== service.id);
    localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
    setFavorites(updatedFavorites);
  };

  const handleRemoveFavorite = (serviceToRemove) => {
    const updatedFavorites = favorites.filter(
      (fav) => fav.id !== serviceToRemove.id
    );
    setFavorites(updatedFavorites); // ✅ يحدث state الصفحة مباشرة
    localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
  };

  return (
    <div className="min-h-screen bg-salon-cream flex flex-col items-center py-10 px-4 sm:px-8">
      {/* العنوان */}
      <div className="flex justify-between items-center w-full max-w-6xl mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[var(--warm-brown)] mb-2">
            ❤️ مفضلتي
          </h1>
          <p className="text-[var(--warm-brown)]/70 text-sm">
            هنا تجد كل الخدمات التي أعجبتك لتعودي إليها لاحقًا بسهولة.
          </p>
        </div>
        <Button
          onClick={onBack}
          className="flex items-center space-x-2 space-x-reverse bg-[var(--glamour-gold)] text-white hover:bg-[var(--glamour-gold-dark)] transition-all"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة</span>
        </Button>
      </div>

      {/* المفضلة */}
      {favorites.length === 0 ? (
        <div className="text-center mt-20">
          <div
            className="mx-auto mb-6 rounded-full flex items-center justify-center"
            style={{
              width: 140,
              height: 140,
              background:
                "linear-gradient(135deg, rgba(212,175,55,0.12), rgba(212,175,55,0.06))",
              border: "1px solid rgba(212,175,55,0.12)",
            }}
            aria-hidden
          >
            {/* Lucide icon — سهل التخصيص */}
            <HeartIcon className="w-16 h-16" />
          </div>
          <p className="text-[var(--warm-brown)] text-lg font-medium">
            لم تقومي بإضافة أي خدمة إلى المفضلة بعد
          </p>
          <p className="text-sm text-[var(--warm-brown)]/70 mt-2">
            اكتشفي خدماتنا وأضيفي ما يعجبك بالضغط على ❤️
          </p>
          <Button
            onClick={() => onBack?.()}
            className="mt-6 bg-[var(--glamour-gold)] text-white hover:bg-[var(--glamour-gold-dark)] px-6"
          >
            تصفح الخدمات
          </Button>
        </div>
      ) : (
        <div
          className="grid gap-6 w-full max-w-6xl"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          }}
        >
          {favorites.map((service) => (
            <div key={service.id} className="animate-fadeIn m-auto">
              <PremiumServiceCard
                service={service}
                onBookNow={onBookNow}
                onViewDetails={onViewDetails}
                onToggleFavorite={handleRemoveFavorite}
                isFavorite={true}
                onAddToCart={onAddToCart}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
