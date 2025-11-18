import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Calendar, ArrowRight, Share2, Heart, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';

// import { useCart } from "../../contexts/CartContext";
import { useCart } from "../contexts/CartContext";

const OfferDetailPage = ({ onBookingClick }) => {
  const { offerId } = useParams();
  const navigate = useNavigate();
  const { toggleCart, isInCart } = useCart();

  const [offerDetails, setOfferDetails] = useState(null);
  const [favorite, setFavorite] = useState(false);
  const [loading, setLoading] = useState(true);

  // ---------------- Fetch Offer ------------------
  useEffect(() => {
    const fetchOfferDetails = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/offers/${offerId}/`);
        const data = await response.json();
        setOfferDetails(data.offer);

        // Check if in favorites
        const favs = JSON.parse(localStorage.getItem("favorites")) || [];
        setFavorite(favs.some(fav => fav.id === data.offer.id));

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOfferDetails();
  }, [offerId]);

  // ---------------- Toggle Favorite ------------------
  const toggleFavorite = () => {
    let favs = JSON.parse(localStorage.getItem("favorites")) || [];
    const exists = favs.some(f => f.id === offerDetails.id);

    if (exists) {
      favs = favs.filter(f => f.id !== offerDetails.id);
    } else {
      favs.push(offerDetails);
    }

    localStorage.setItem("favorites", JSON.stringify(favs));
    setFavorite(!exists);
  };

  // ---------------- Add to Cart ------------------
  const addToCart = () => {
    toggleCart(offerDetails); // using your context system
  };

  // ---------------- Share Offer ------------------
  const shareOffer = () => {
    navigator.clipboard.writeText(window.location.href);
toast.success("تم نسخ الرابط بنجاح");
  };

  // ---------------- Booking ------------------
  const handleBooking = () => {
    onBookingClick(offerDetails); // This opens /book page


   


  };

  if (loading) return <p className="text-center py-8">جاري تحميل العرض...</p>;
  if (!offerDetails) return <p className="text-center py-8">العرض غير موجود</p>;

 const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("ar-SA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 space-y-6">

        {/* HEADER */}
<div className="flex justify-between items-start gap-4 mb-4">
  <div>
    <h1 className="text-3xl font-bold text-gray-900 mb-2">{offerDetails.title}</h1>
    <p className="text-xl font-semibold text-red-600">{offerDetails.price} ر.س</p>
  </div>

  <div className="flex gap-3 mt-1">
    <Button variant="outline" className="rounded-full p-2" onClick={toggleFavorite}>
      <Heart className={favorite ? "fill-red-500 text-red-500" : "text-gray-500"} />
    </Button>

    <Button variant="outline" className="rounded-full p-2" onClick={shareOffer}>
      <Share2 />
    </Button>
  </div>
</div>

{/* DESCRIPTION */}
<p className="text-gray-700 text-base leading-relaxed">{offerDetails.description}</p>

        {/* PRICE CARD */}
        <Card>
          <CardHeader>
            <CardTitle className="flex gap-2"><DollarSign /> السعر</CardTitle>
          </CardHeader>
          <CardContent>
            <p>السعر الأصلي: {offerDetails.original_price} ريال</p>
            <p className="font-bold text-xl text-yellow-600">بعد الخصم: {offerDetails.offer_price} ريال</p>
          </CardContent>
        </Card>

        {/* DATE CARD */}
        <Card>
          <CardHeader>
            <CardTitle className="flex gap-2"><Calendar /> الصلاحية</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="mt-3 space-y-6">

    {/* يبدأ */}
    <div className="flex items-start gap-4">
      <div className="relative">
        <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
        <div className="absolute top-4 left-1/2 -translate-x-1/2 h-10 w-[2px] bg-gray-300"></div>
      </div>

      <div>
        <p className="text-gray-500 text-sm">يبدأ من</p>
        <p className="font-semibold text-lg text-gray-800">
          {formatDate(offerDetails.valid_from)}
        </p>
      </div>
    </div>

    {/* ينتهي */}
    <div className="flex items-start gap-4">
      <div className="w-4 h-4 bg-green-500 rounded-full"></div>
      <div>
        <p className="text-gray-500 text-sm">ينتهي في</p>
        <p className="font-semibold text-lg text-gray-800">
          {formatDate(offerDetails.valid_until)}
        </p>
      </div>
    </div>

  </div>

          </CardContent>
        </Card>

        {/* BUTTONS */}
        <div className="flex gap-4 mt-4">

          <Button
            className="flex-1 bg-yellow-500 text-white py-6"
            onClick={handleBooking}
          >
            احجز الآن <ArrowRight />
          </Button>

         <Button
  onClick={addToCart}
  className="p-3 rounded-full transition-all duration-300 "
  style={{
    backgroundColor: isInCart(offerDetails.id) ? "#B89F67" : "transparent",
    border: `2px solid ${isInCart(offerDetails.id) ? "#B89F67" : "#ccc"}`,
    
  }}
>
  <ShoppingCart
    className="w-5 h-5 transition-colors"
    style={{
      color: isInCart(offerDetails.id) ? "white" : "#B89F67",
    }}
  />
</Button>

        </div>

        <Button
  variant="ghost"
  onClick={() => navigate(-1)}
  className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors duration-200 shadow-sm"
>
  العودة
</Button>

      </div>
    </div>
  );
};

export default OfferDetailPage;
