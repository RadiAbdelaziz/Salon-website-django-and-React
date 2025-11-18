import React, { useState } from 'react';
import PremiumServiceCard from './PremiumServiceCard';

const PremiumServiceGrid = ({ 
  services = [], 
  onBookNow, 
  onViewDetails, 
  onAddToCart, 
  onToggleFavorite,
  getCartStatus,
  getFavoriteStatus,
  className = ""
}) => {
  const [hoveredCard, setHoveredCard] = useState(null);

  const handleBookNow = (service) => {
    onBookNow?.(service);
  };

  const handleViewDetails = (service) => {
    onViewDetails?.(service);
  };

  const handleAddToCart = (service) => {
    onAddToCart?.(service);
  };

  const handleToggleFavorite = (service) => {
    onToggleFavorite?.(service);
  };

  const isInCart = (serviceId) => {
    return getCartStatus?.(serviceId) || false;
  };

  const isFavorite = (serviceId) => {
    return getFavoriteStatus?.(serviceId) || false;
  };

  if (services.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-semibold mb-2" style={{ color: '#2D2D2D' }}>
          لم يتم العثور على خدمات
        </h3>
        <p className="text-sm" style={{ color: '#777' }}>
          جربي البحث بكلمات مختلفة أو اختر فئة أخرى
        </p>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Desktop Grid */}
      <div className="hidden md:grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8 justify-items-center">
        {services.map((service) => (
          <PremiumServiceCard
            key={service.id}
            service={service}
            onBookNow={handleBookNow}
            onViewDetails={handleViewDetails}
            onAddToCart={handleAddToCart}
            onToggleFavorite={handleToggleFavorite}
            isInCart={isInCart(service.id)}
            isFavorite={isFavorite(service.id)}
          />
        ))}
      </div>

      {/* Tablet Grid */}
      <div className="hidden sm:grid md:hidden grid-cols-1 gap-6 justify-items-center">
        {services.map((service) => (
          <PremiumServiceCard
            key={service.id}
            service={service}
            onBookNow={handleBookNow}
            onViewDetails={handleViewDetails}
            onAddToCart={handleAddToCart}
            onToggleFavorite={handleToggleFavorite}
            isInCart={isInCart(service.id)}
            isFavorite={isFavorite(service.id)}
            className="w-full max-w-sm"
          />
        ))}
      </div>

      {/* Mobile Grid */}
      <div className="grid sm:hidden grid-cols-1 gap-6">
        {services.map((service) => (
          <div key={service.id} className="w-full">
            <PremiumServiceCard
              service={service}
              onBookNow={handleBookNow}
              onViewDetails={handleViewDetails}
              onAddToCart={handleAddToCart}
              onToggleFavorite={handleToggleFavorite}
              isInCart={isInCart(service.id)}
              isFavorite={isFavorite(service.id)}
              className="w-full"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PremiumServiceGrid;
