import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE_URL = "http://localhost:8000";

const TestimonialsSlider = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/api/testimonials/`);
        const data = await res.json();
        if (data.success) setTestimonials(data.testimonials);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTestimonials();
  }, []);

  // ⏱️ تلقائي كل 5 ثواني
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  if (loading)
    return (
      <div className="py-24 text-center">
        <div className="mx-auto w-10 h-10 border-4 border-[var(--glamour-gold)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  if (testimonials.length === 0) return null;

  const visible = [
    testimonials[(current - 1 + testimonials.length) % testimonials.length],
    testimonials[current],
    testimonials[(current + 1) % testimonials.length],
  ];

  return (
    <section className="relative py-24 bg-gradient-to-b from-[var(--silken-dune)]/10 to-white overflow-hidden">
      <div className="container mx-auto px-6 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-bold mb-12 text-[var(--text-on-black)]"
        >
          آراء عملائنا الكرام
        </motion.h2>

        <div className="relative flex justify-center items-center min-h-[420px]">
          <AnimatePresence>
            {visible.map((testimonial, index) => {
              const isCenter = index === 1;
              const defaultImage =
                "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face&auto=format&q=80";
              const imageUrl = testimonial.customer_image
                ? `${API_BASE_URL}${testimonial.customer_image}`
                : defaultImage;

              return (
                <motion.div
                  key={testimonial.id}
                  initial={{
                    opacity: 0,
                    scale: 0.8,
                    y: 50,
                  }}
                  animate={{
                    opacity: isCenter ? 1 : 0.5,
                    scale: isCenter ? 1 : 0.85,
                    y: isCenter ? 0 : 40,
                    x:
                      index === 0
                        ? "-200px"
                        : index === 2
                        ? "200px"
                        : "0px",
                  }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                  className={`absolute w-full max-w-sm sm:max-w-md mx-auto scale-90 sm:scale-100 ${
  isCenter ? "z-20" : "z-10 blur-[1px]"
}`}

                >
                  <motion.div
                    whileHover={
                      isCenter
                        ? { scale: 1.03, boxShadow: "0 8px 35px rgba(212,175,55,0.25)" }
                        : {}
                    }
                    className={`bg-white/80 backdrop-blur-lg border border-[var(--silken-dune)] rounded-3xl shadow-lg p-8 transition-all duration-500`}
                  >
                    <div className="flex flex-col items-center">
                      <motion.img
                        src={imageUrl}
                        alt={testimonial.customer_name}
                        onError={(e) => (e.target.src = defaultImage)}
                        className={`w-20 h-20 rounded-full border-4 ${
                          isCenter
                            ? "border-[var(--glamour-gold)] shadow-lg"
                            : "border-gray-300"
                        } object-cover mb-4`}
                        whileHover={isCenter ? { scale: 1.1 } : {}}
                      />
                      <h3 className="text-lg font-semibold text-[var(--text-on-black)]">
                        {testimonial.customer_name}
                      </h3>
                      <p className="text-sm text-gray-500 mb-3">
                        {testimonial.service_used || "عميلة مميزة"}
                      </p>
                      <p className="text-gray-700 text-sm md:text-base italic leading-relaxed">
                        “{testimonial.testimonial_text}”
                      </p>

                      <div className="flex justify-center mt-4">
                        {[...Array(testimonial.rating || 5)].map((_, i) => (
                          <svg
                            key={i}
                            className="w-4 h-4 text-[var(--glamour-gold)]"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* نقاط التحكم */}
        <div className="flex justify-center gap-2 mt-10">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-3 h-3 rounded-full transition-all ${
                i === current
                  ? "bg-[var(--glamour-gold)] w-6"
                  : "bg-gray-300 hover:bg-gray-400"
              }`}
            ></button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSlider;
