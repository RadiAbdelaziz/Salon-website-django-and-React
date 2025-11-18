import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  Navigation,
  Pagination,
  Autoplay,
  EffectCoverflow,
} from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-coverflow";
import { getHeroImages } from "../services/simpleApi";

const HeroSection = ({ onBookingClick }) => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHeroImages = async () => {
      try {
        setLoading(true);
        const heroImages = await getHeroImages();
        setOffers(heroImages);
      } catch (error) {
        console.error("Failed to load hero images:", error);
        // getHeroImages already handles fallback, so this shouldn't happen
        // but just in case, set empty array and let the API function handle it
        setOffers([]);
      } finally {
        setLoading(false);
      }
    };

    loadHeroImages();
  }, []);

  if (loading) {
    return (
      <section
        className="hero-section relative overflow-hidden bg-white text-auto rounded-b-[20px]"
        style={{ margin: 0, padding: 0, minHeight: "400px" }}
      >
        <div className="w-full flex justify-center px-4">
          <div className="w-[95%] sm:w-[92%] flex items-center justify-center h-96">
            <div
              className="animate-spin rounded-full h-12 w-12 border-b-2"
              style={{ borderColor: "#D4AF37" }}
            ></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="hero-section relative overflow-hidden bg-white text-auto rounded-b-[20px]"
      style={{ margin: 0, padding: 0 }}
    >
      <div
        className="w-full flex justify-center px-4"
        style={{ margin: 0, padding: 0 }}
      >
        {/* Swiper Carousel */}
        <div className="relative w-[95%] sm:w-[92%]">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={10}
            slidesPerView={1}
            navigation={{
              nextEl: ".swiper-button-next",
              prevEl: ".swiper-button-prev",
            }}
            pagination={{
              clickable: true,
              el: ".swiper-pagination",
            }}
            autoplay={{
              delay: 4000,
              disableOnInteraction: false,
            }}
            speed={800}
            loop={offers.length > 1}
            breakpoints={{
              640: {
                slidesPerView: 1,
                spaceBetween: 10,
              },
              768: {
                slidesPerView: 1,
                spaceBetween: 10,
              },
              1024: {
                slidesPerView: 1,
                spaceBetween: 10,
              },
            }}
            className="mySwiper"
          >
            {offers.map((offer) => (
              <SwiperSlide key={offer.id}>
                <a href="#" className="block">
                  <img
                    src={offer.image}
                    alt={offer.alt}
                    className="w-full h-auto rounded-[20px] shadow-lg hover:shadow-xl transition-all duration-500 ease-in-out"
                    style={{
                      boxShadow:
                        "0 10px 25px rgba(0, 0, 0, 0.1), 0 4px 10px rgba(0, 0, 0, 0.05)",
                      borderRadius: "20px",
                    }}
                    onError={(e) => {
                      e.target.src =
                        "https://ozeesalon.com/assets/images/blog-placeholder-lg.svg";
                    }}
                  />
                </a>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Custom Navigation Buttons - Hidden on mobile, visible on desktop */}
          <div className="swiper-button-prev !text-white !bg-white/20 !rounded-full !w-8 !h-8 !mt-0 !-translate-y-1/2 hover:!bg-white/30 transition-all duration-200 !border-0 !shadow-lg backdrop-blur-sm hidden  sm:flex "></div>
          <div className="swiper-button-next !text-white !bg-white/20 !rounded-full !w-8 !h-8 !mt-0 !-translate-y-1/2 hover:!bg-white/30 transition-all duration-200 !border-0 !shadow-lg backdrop-blur-sm hidden sm:!flex"></div>

          {/* Custom Pagination - Small dots with rectangular active */}
          <div className="swiper-pagination !relative !mt-4 !flex !justify-center !gap-2">
            <style jsx>{`
              .swiper-pagination-bullet {
                width: 8px !important;
                height: 8px !important;
                background: #d1d5db !important;
                opacity: 1 !important;
                border-radius: 50% !important;
                transition: all 0.3s ease !important;
              }
              .swiper-pagination-bullet-active {
                background: #000000 !important;
                border-radius: 12px !important;
                width: 24px !important;
                height: 8px !important;
                transform: none !important;
              }
            `}</style>
          </div>
          <div className="swiper-pagination !relative !mt-6 !flex !justify-center !gap-2 z-10"></div>

          <style jsx>{`
            .swiper-pagination-bullet {
              width: 8px !important;
              height: 8px !important;
              background: #d1d5db !important;
              opacity: 1 !important;
              border-radius: 50% !important;
              transition: all 0.3s ease !important;
            }
            .swiper-pagination-bullet-active {
              background: var(--glamour-gold) !important;
              border-radius: 12px !important;
              width: 24px !important;
              height: 8px !important;
              transform: none !important;
            }
          `}</style>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
