import React, { useState, useEffect } from "react";
import { Heart, Clock, Star, ShoppingCart, Eye } from "lucide-react";
import { useCart } from "../../contexts/CartContext";
import { useNavigate } from "react-router-dom";

const PremiumServiceCard = ({
  service,
  onBookNow,
  onViewDetails,
  onAddToCart,
  className = "",
  category = null,
}) => {
  // Force refresh to clear cache
  const version = Date.now();
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [favorite, setFavorite] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const favs = JSON.parse(localStorage.getItem("favorites")) || [];
    const exists = favs.some((fav) => fav.id === service.id);
    setFavorite(exists);
  }, [service.id]);

  // Get primary color from category or use default
  const primaryColor = category?.primary_color || "#B89F67";
  const primaryColorLight = category?.primary_color
    ? `${category.primary_color}CC`
    : "#D4C08A";

  const handleBookNow = (e) => {
    e.stopPropagation();
    navigate("/book", { state: { service } });
  };

  const handleViewDetails = (e) => {
    e.stopPropagation();
    onViewDetails?.(service);
  };

  const { toggleCart, isInCart } = useCart();
  const inCart = isInCart(service.id);

  // add to cart
  const handleAddToCart = (e) => {
    e.stopPropagation();
    toggleCart(service);
  };

  // favorites  page logic
  const handleToggleFavoriteClick = (e) => {
    e.stopPropagation();

    const favs = JSON.parse(localStorage.getItem("favorites")) || [];
    const exists = favs.some((fav) => fav.id === service.id);

    if (exists) {
      // حذف من localStorage
      const updatedFavs = favs.filter((fav) => fav.id !== service.id);
      localStorage.setItem("favorites", JSON.stringify(updatedFavs));
    } else {
      favs.push(service);
      localStorage.setItem("favorites", JSON.stringify(favs));
    }

    setFavorite(!exists);

    // Update the page
    onToggleFavorite?.(service);
  };

  return (
    <div
      onClick={() => navigate(`/service/${service.id}`, { state: { service } })}
      className={`group relative bg-white rounded-[20px] shadow-lg hover:shadow-2xl transition-all duration-500 ease-out overflow-hidden ${className}`}
      style={{
        width: "270px",
        height: "330",
        maxWidth: "100%",
        transform: isHovered ? "translateY(-4px)" : "translateY(0)",
        boxShadow: isHovered
          ? "0 20px 40px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(184, 159, 103, 0.1)"
          : "0 8px 25px rgba(0, 0, 0, 0.08)",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-version={version}
    >
      {/* Image Section - Optimized for 1200x800 images */}
      <div
        className="relative h-[280px] overflow-hidden"
        style={{ width: "270px", height: "130px" }}
      >
        {/* Service Image */}
        <img
          src={
            service.image || "http://localhost:8000/api/placeholder/1200/800/"
          }
          alt={service.name}
          className={`object-cover transition-all duration-700 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
          style={{
            width: "100%",
            padding: "8px",
            borderRadius: "30px",
            transform: isHovered ? "scale(1.05)" : "scale(1)",
          }}
          onLoad={() => setImageLoaded(true)}
          loading="lazy"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Loading Placeholder */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse" />
        )}

        {/* Gradient Overlay for Text Readability */}
        <div
          className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/60 to-transparent transition-opacity duration-300"
          style={{ opacity: isHovered ? 0.8 : 0.6 }}
        />

        {/* Duration Badge */}
        <div
          className="absolute top-4 right-4 px-3 py-1.5 rounded-xl backdrop-blur-sm transition-all duration-300"
          style={{
            background: "rgba(255, 255, 255, 0.85)",
            borderRadius: "12px",
            fontSize: "13px",
            padding: "4px 10px",
            transform: isHovered ? "scale(1.05)" : "scale(1)",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          }}
        >
          <div className="flex items-center text-gray-700 font-medium">
            <Clock className="w-3 h-3 ml-1" />
            {service.duration || "60"} {/* Duration without minute */}
          </div>
        </div>

        {/* Featured Badge */}
        {service.is_featured && (
          <div
            className="absolute bottom-4 right-4 px-3 py-1 rounded-full backdrop-blur-sm transition-all duration-300"
            style={{
              background: "linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)",
              color: "white",
              fontSize: "12px",
              fontWeight: "600",
              transform: isHovered ? "scale(1.05)" : "scale(1)",
              boxShadow: "0 2px 8px rgba(255, 107, 107, 0.3)",
            }}
          >
            مميز
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-5">
        {/* Title and Rating */}
        <div style={{ paddingTop: "3px" }}>
          {/* Title with Favorite Icon */}
          <div className="flex items-start justify-between">
            <h3
              className="font-bold text-lg leading-tight transition-colors duration-300 flex-1"
              style={{
                color: "#2D2D2D",
                fontSize: "17px",
              }}
            >
              {service.name}
            </h3>

            {/* Heart Icon for Favorites */}
            <button
              onClick={handleToggleFavoriteClick}
              className="p-2 rounded-full transition-all duration-300 hover:scale-110 ml-3 flex-shrink-0"
              style={{
                background: favorite
                  ? "rgba(184, 159, 103, 0.1)"
                  : "rgba(0, 0, 0, 0.05)",
                border: favorite
                  ? "1px solid rgba(184, 159, 103, 0.3)"
                  : "1px solid rgba(0, 0, 0, 0.1)",
              }}
            >
              <Heart
                className={`w-5 h-5 transition-colors duration-300 ${
                  favorite ? "fill-current text-red-500" : ""
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between"></div>
        </div>

        {/* Description */}
        <p
          className="text-sm leading-relaxed transition-colors duration-300"
          style={{
            color: "#777",
            fontSize: "14px",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
          }}
        >
          {service.description}
        </p>

        {/* Price and Duration */}
        <div className="flex items-center justify-between">
          <div
            className="text-xl font-bold transition-colors duration-300 sar-symbol"
            style={{
              color: primaryColor,
              fontSize: "14px",
              padding: "2px",
            }}
          >
            {service.basePrice || service.price_min || service.price || 800}
          </div>

          {/* Duration Info */}
          <div className="flex items-center text-sm text-gray-600"></div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          {/* Book Now Button */}
          <button
            onClick={handleBookNow}
            className="flex-1 rounded-xl font-semibold text-sm transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{
              background: `linear-gradient(90deg, ${primaryColor}, ${primaryColorLight})`,
              color: "white",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              boxShadow: isHovered
                ? `0 8px 25px ${primaryColor}66, inset 0 1px 0 rgba(255, 255, 255, 0.2)`
                : `0 4px 15px ${primaryColor}4D, inset 0 1px 0 rgba(255, 255, 255, 0.1)`,
              border: "none",
            }}
          >
            احجزي الآن
          </button>

          {/* Cart Button */}
          <button
            onClick={handleAddToCart}
            className="px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{
              border: `2px solid ${inCart ? primaryColor : "#ddd"}`,
              color: inCart ? "white" : primaryColor,
              backgroundColor: inCart ? primaryColor : "transparent",
              fontSize: "14px",
              cursor: "pointer",
              fontWeight: "600",
              marginBottom: "10px",
              boxShadow: inCart
                ? `0 4px 12px ${primaryColor}66`
                : isHovered
                ? `0 4px 12px ${primaryColor}33`
                : "none",
            }}
            title={inCart ? "إزالة من السلة" : "إضافة إلى السلة"}
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PremiumServiceCard;
