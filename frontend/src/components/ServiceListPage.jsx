import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getAllServices } from "../data/services";
import { motion } from "framer-motion";

const ServiceListPage = () => {
  const { categorySlug } = useParams();
  const navigate = useNavigate();
  const [filteredServices, setFilteredServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const services = await getAllServices();
      const filtered = services.filter(
        (s) =>
          s.category_slug === categorySlug ||
          s.category === categorySlug ||
          s.slug_en === categorySlug
      );
      setFilteredServices(filtered);
      setLoading(false);
    };
    load();
  }, [categorySlug]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--glamour-gold)]"></div>
      </div>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* عنوان */}
        <h2 className="text-3xl font-bold mb-8 text-center text-[var(--text-on-black)]">
          خدمات {categorySlug} 
        </h2>

        {/* زر العودة */}
        <div className="flex justify-center mb-8">
          <button
            onClick={() => navigate("/")}
            className="px-6 py-2 bg-[var(--glamour-gold)] text-white rounded-xl shadow-md hover:bg-yellow-600 transition-all"
          >
            ← العودة إلى كل الخدمات
          </button>
        </div>

        {/* شبكة الخدمات */}
        {filteredServices.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => (
              <motion.div
                key={service.id}
                className="bg-white rounded-2xl shadow-md p-4 hover:shadow-xl transition-all duration-300"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <img
                  src={service.image}
                  alt={service.title}
                  className="rounded-xl mb-4 w-full h-48 object-cover"
                  onError={(e) => {
                    e.target.src =
                      "https://ozeesalon.com/assets/images/blog-placeholder-lg.svg";
                  }}
                />
                <h3 className="text-lg font-semibold mb-2">
                  {service.title}
                </h3>
                <p className="text-gray-600 mb-3">{service.description}</p>
                <p className="text-[var(--glamour-gold)] font-bold">
                  {service.price} جنيه
                </p>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 mt-10">
            لا توجد خدمات في هذه الفئة حاليًا.
          </p>
        )}
      </div>
    </section>
  );
};

export default ServiceListPage;
