import React, { useState, useEffect } from 'react';
import { Heart, Clock, ShoppingCart } from 'lucide-react';
import { useCart } from "../../contexts/CartContext";
import { useNavigate } from "react-router-dom";

const MobileServiceCard = ({ service, category }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [favorite, setFavorite] = useState(false);

  const navigate = useNavigate();

  // Load favorites
  useEffect(() => {
    const favs = JSON.parse(localStorage.getItem("favorites")) || [];
    const exists = favs.some(fav => fav.id === service.id);
    setFavorite(exists);
  }, [service.id]);

  const primaryColor = category?.primary_color || '#B89F67';
  const primaryColorLight = category?.primary_color
    ? `${category.primary_color}CC`
    : '#D4C08A';

  const { toggleCart, isInCart } = useCart();
  const inCart = isInCart(service.id);

  const handleToggleFavorite = (e) => {
    e.stopPropagation();
    let favs = JSON.parse(localStorage.getItem("favorites")) || [];
    const exists = favs.some(fav => fav.id === service.id);

    if (exists) {
      favs = favs.filter(fav => fav.id !== service.id);
    } else {
      favs.push(service);
    }

    localStorage.setItem("favorites", JSON.stringify(favs));
    setFavorite(!exists);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    toggleCart(service);
  };

  const handleBookNow = (e) => {
    e.stopPropagation();
    navigate(`/booking/${service.id}`, { state: { service } });
  };

  return (
    <div
      onClick={() => navigate(`/service/${service.id}`, { state: { service } })}
      className="group relative bg-white rounded-[20px] shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden w-full"
      style={{
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: isHovered
          ? '0 20px 40px rgba(0,0,0,0.15), 0 0 0 1px rgba(184,159,103,0.1)'
          : '0 8px 25px rgba(0,0,0,0.08)'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >

      {/* IMAGE */}
      <div className="relative h-[180px] overflow-hidden">
        <img
          src={service.image}
          alt={service.name}
          className={`object-cover transition-all duration-700 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "20px",
            transform: isHovered ? "scale(1.05)" : "scale(1)"
          }}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
        />

        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />
        )}

        {/* Gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Duration badge */}
        <div
          className="absolute top-3 right-3 px-3 py-1.5 rounded-xl backdrop-blur-sm"
          style={{
            background: "rgba(255,255,255,0.85)",
            fontSize: "12px"
          }}
        >
          <div className="flex items-center text-gray-700 font-medium">
            <Clock className="w-3 h-3 ml-1" />
            {service.duration || "60"}
          </div>
        </div>

        {service.is_featured && (
          <div
            className="absolute bottom-3 right-3 px-3 py-1 rounded-full text-white text-xs"
            style={{
              background: "linear-gradient(135deg,#ff6b6b,#ee5a52)"
            }}
          >
            مميز
          </div>
        )}
      </div>

      {/* CONTENT */}
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-[16px]">{service.name}</h3>

          {/* Favorite */}
          <button
            onClick={handleToggleFavorite}
            className="p-2 rounded-full"
            style={{
              background: favorite
                ? "rgba(184,159,103,0.1)"
                : "rgba(0,0,0,0.05)",
              border: favorite
                ? "1px solid rgba(184,159,103,0.3)"
                : "1px solid rgba(0,0,0,0.1)"
            }}
          >
            <Heart
              className={`w-5 h-5 ${
                favorite ? "fill-current" : ""
              }`}
              style={{ color: favorite ? "red" : "#666" }}
            />
          </button>
        </div>

        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
          {service.description}
        </p>

        <div className="flex justify-between items-center mt-3">
          <div
            className="text-lg font-bold"
            style={{ color: primaryColor }}
          >
            {service.basePrice || service.price_min || service.price || 800}
          </div>
        </div>

        {/* BUTTONS */}
        <div className="flex gap-3 mt-3">
          <button
            onClick={handleBookNow}
            className="flex-1 py-2 rounded-xl text-white font-semibold text-sm"
            style={{
              background: `linear-gradient(90deg, ${primaryColor}, ${primaryColorLight})`,
              boxShadow: `0 4px 15px ${primaryColor}4D`
            }}
          >
            احجزي الآن
          </button>

          <button
            onClick={handleAddToCart}
            className="px-4 py-2 rounded-xl transition-all"
            style={{
              border: `2px solid ${inCart ? primaryColor : "#ddd"}`,
              color: inCart ? "white" : primaryColor,
              background: inCart ? primaryColor : "transparent",
              boxShadow: inCart
                ? `0 4px 12px ${primaryColor}66`
                : undefined
            }}
          >
            <ShoppingCart className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileServiceCard;
