import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import PremiumServiceCard from "./ui/PremiumServiceCard";
import MobileServiceCard from "./ui/MobileServiceCard";
import {
  Search,
  Star,
  Clock,
  ArrowRight,
  Filter,
  Grid,
  List,
  ShoppingCart,
  Plus,
} from "lucide-react";
import { getAllServices } from "../data/services";
import { useCart } from "../contexts/CartContext";
import "../styles/premium-cards.css";
import ButtonGroup from "@mui/material/ButtonGroup";
import FavoritesPage from "./FavoritesPage";

// import Button from '@mui/material/Button'

// Add custom styles for enhanced card design
const cardStyles = `
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .backdrop-blur-sm {
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
  }
  
  .service-card-hover {
    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .service-card-hover:hover {
    transform: translateY(-8px) scale(1.02);
  }
  
  .gradient-gold {
    background: linear-gradient(135deg, #d4af37 0%, #b8941f 50%, #d4af37 100%);
  }
  
  .gradient-gold:hover {
    background: linear-gradient(135deg, #b8941f 0%, #d4af37 50%, #b8941f 100%);
  }
`;

const EnhancedServicesPage = ({ onBookingClick, onBack }) => {
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [hoveredCard, setHoveredCard] = useState(null);
  const { addToCart, toggleCart, isInCart } = useCart();
  const [showFavorites, setShowFavorites] = useState(false);

  // Service categories
  const categories = [
    { id: "all", name: "جميع الخدمات" },
    { id: "hair_care", name: "العناية بالشعر" },
    { id: "makeup", name: "المكياج" },
    { id: "nail_care", name: "العناية بالأظافر" },
    { id: "skincare", name: "العناية بالبشرة" },
    { id: "massage_&_relaxation", name: "المساج والاسترخاء" },
    { id: "special_packages", name: "الباقات الخاصة" },
  ];

  useEffect(() => {
    const loadServices = async () => {
      try {
        const allServices = await getAllServices();
        console.log("Loaded services in EnhancedServicesPage:", allServices);

        if (allServices && allServices.length > 0) {
          setServices(allServices);
          setFilteredServices(allServices);
        } else {
          // Fallback services if API fails
          const fallbackServices = [
            {
              id: 1,
              name: "خدمة تجميل",
              description: "خدمة تجميل احترافية",
              basePrice: 500,
              image: "http://localhost:8000/api/placeholder/300/200/",
              duration: 60,
            },
            {
              id: 2,
              name: "العناية بالشعر",
              description: "خدمات العناية بالشعر المتقدمة",
              basePrice: 300,
              image: "http://localhost:8000/api/placeholder/300/200/",
              duration: 90,
            },
            {
              id: 3,
              name: "المكياج",
              description: "فن المكياج الاحترافي",
              basePrice: 400,
              image: "http://localhost:8000/api/placeholder/300/200/",
              duration: 120,
            },
          ];
          setServices(fallbackServices);
          setFilteredServices(fallbackServices);
        }
      } catch (error) {
        console.error("Failed to load services:", error);
        // Set fallback services
        const fallbackServices = [
          {
            id: 1,
            name: "خدمة تجميل",
            description: "خدمة تجميل احترافية",
            basePrice: 500,
            image: "/api/placeholder/300/200",
            duration: 60,
          },
        ];
        setServices(fallbackServices);
        setFilteredServices(fallbackServices);
      } finally {
        setLoading(false);
      }
    };

    loadServices();
  }, []);

  // Filter services based on search and category
  useEffect(() => {
    let filtered = services;

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (service) =>
          service.category === selectedCategory ||
          service.category_id === selectedCategory
      );
    }

    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (service) =>
          service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          service.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredServices(filtered);
  }, [services, selectedCategory, searchTerm]);

  const handleServiceSelect = (service) => {
    onBookingClick(service);
  };

  const handleAddToCart = (service, e) => {
    if (e && e.stopPropagation) {
      e.stopPropagation(); // Prevent card click
    }
    toggleCart(service);
  };

  // Event handlers for premium cards
  const handleBookNow = (service) => {
    onBookingClick(service);
  };

  const handleViewDetails = (service) => {
    // Navigate to service details - you can implement this
    console.log("Viewing details for:", service);
  };
  const handleToggleFavorite = (service) => {
    const existingFavorites =
      JSON.parse(localStorage.getItem("favorites")) || [];
    const isAlreadyFavorite = existingFavorites.some(
      (fav) => fav.id === service.id
    );

    let updatedFavorites;
    if (isAlreadyFavorite) {
      updatedFavorites = existingFavorites.filter(
        (fav) => fav.id !== service.id
      );
    } else {
      updatedFavorites = [...existingFavorites, service];
    }

    localStorage.setItem("favorites", JSON.stringify(updatedFavorites));

    // update heart color
    setFilteredServices((prev) =>
      prev.map((s) =>
        s.id === service.id ? { ...s, favorite: !isAlreadyFavorite } : s
      )
    );
  };

  // check is favorite
  const isFavorite = (serviceId) => {
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    return favorites.some((fav) => fav.id === serviceId);
  };

  // if user choose favorite page update it
  if (showFavorites) {
    return (
      <FavoritesPage
        onBack={() => setShowFavorites(false)}
        onViewDetails={handleViewDetails}
        onBookNow={handleBookNow}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-salon-cream text-auto">
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
            style={{ borderColor: "var(--glamour-gold)" }}
          ></div>
          <p className="text-lg" style={{ color: "var(--warm-brown)" }}>
            جاري تحميل الخدمات...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-salon-cream text-auto">
      {/* Inject custom styles */}
      <style dangerouslySetInnerHTML={{ __html: cardStyles }} />
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4 space-x-reverse">
              <Button
                onClick={onBack}
                variant="ghost"
                className="flex items-center space-x-2 space-x-reverse"
                style={{ color: "var(--warm-brown)" }}
              >
                <ArrowRight className="w-4 h-4 rotate-180" />
                <span>العودة</span>
              </Button>
              <div>
                <h1
                  className="text-3xl font-bold"
                  style={{ color: "var(--warm-brown)" }}
                >
                  خدماتنا
                </h1>
                <p className="text-sm" style={{ color: "var(--medium-beige)" }}>
                  اكتشفي مجموعتنا المتكاملة من خدمات التجميل الاحترافية radi
                </p>
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center space-x-2 space-x-reverse">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
                style={{
                  background:
                    viewMode === "grid" ? "var(--glamour-gold)" : "transparent",
                  color: viewMode === "grid" ? "white" : "var(--warm-brown)",
                  borderColor: "var(--silken-dune)",
                }}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
                style={{
                  background:
                    viewMode === "list" ? "var(--glamour-gold)" : "transparent",
                  color: viewMode === "list" ? "white" : "var(--warm-brown)",
                  borderColor: "var(--silken-dune)",
                }}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search
                className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
                style={{ color: "var(--medium-beige)" }}
              />
              <Input
                placeholder="ابحثي عن الخدمات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
                style={{ borderColor: "var(--silken-dune)" }}
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center space-x-2 space-x-reverse">
              <Filter
                className="w-4 h-4"
                style={{ color: "var(--medium-beige)" }}
              />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 rounded-md border"
                style={{
                  borderColor: "var(--silken-dune)",
                  color: "var(--warm-brown)",
                  backgroundColor: "white",
                }}
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {filteredServices.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3
              className="text-xl font-semibold mb-2"
              style={{ color: "var(--warm-brown)" }}
            >
              لم يتم العثور على خدمات
            </h3>
            <p className="text-sm" style={{ color: "var(--medium-beige)" }}>
              جربي البحث بكلمات مختلفة أو اختر فئة أخرى
            </p>
          </div>
        ) : (
          <div className="w-full">
            {/* Desktop/Tablet View */}
            <div className="hidden sm:block" style={{ padding: "0 60px" }}>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "15px",
                  cursor: "pointer",
                }}
              >
                {filteredServices.map((service) => (
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
            </div>

            {/* Mobile View */}
            <div className="block sm:hidden">
              <div className="grid grid-cols-1 gap-6">
                {filteredServices.map((service) => (
                  <MobileServiceCard
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
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className="text-center mt-8">
          <p className="text-sm" style={{ color: "var(--medium-beige)" }}>
            عرض {filteredServices.length} من {services.length} خدمة
          </p>
        </div>
      </div>
    </div>
  );
};

export default EnhancedServicesPage;
