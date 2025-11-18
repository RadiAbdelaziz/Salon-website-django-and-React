import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, ShoppingBag, Trash2, Clock, CreditCard } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import CartItem from './CartItem';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay }
  })
};

const CartPage = () => {
  const { cartItems, getTotalItems, getTotalPrice, clearCart } = useCart();
  const navigate = useNavigate();

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();
  const totalDuration = cartItems.reduce((total, item) => total + (item.duration * item.quantity), 0);

  const handleCheckout = () => navigate('/book');
  const handleContinueShopping = () => navigate('/services');

  if (totalItems === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-salon-cream text-auto"
      >
        <div className="max-w-4xl mx-auto px-4 py-8">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="text-center mb-8"
          >
            <h1 className="text-3xl font-bold mb-4" style={{ color: 'var(--warm-brown)' }}>
              سلة الخدمات
            </h1>
            <div className="w-24 h-1 mx-auto mb-6" style={{ background: 'var(--glamour-gold)' }}></div>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
          >
            <Card
              className="text-center py-16 hover:shadow-2xl transition-all duration-300"
            >
              <CardContent>
                <ShoppingBag className="w-24 h-24 mx-auto mb-6" style={{ color: 'var(--medium-beige)' }} />
                <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--warm-brown)' }}>
                  سلة الخدمات فارغة
                </h2>
                <p className="text-gray-600 mb-8">
                  لم تقومي بإضافة أي خدمات للسلة بعد. ابدئي بتصفح خدماتنا المميزة!
                </p>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                  <Button
                    onClick={handleContinueShopping}
                    className="px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                    style={{
                      background: 'linear-gradient(135deg, var(--glamour-gold), var(--glamour-gold-dark))',
                      color: 'white'
                    }}
                  >
                    تصفح الخدمات
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-salon-cream text-auto"
    >
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold mb-4" style={{ color: 'var(--warm-brown)' }}>
            سلة الخدمات
          </h1>
          <div className="w-24 h-1 mx-auto mb-6" style={{ background: 'var(--glamour-gold)' }}></div>
          <p className="text-gray-600">{totalItems} خدمة في السلة</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="lg:col-span-2 space-y-4"
          >
            {cartItems.map((item, i) => (
              <motion.div
                key={item.id}
                variants={fadeInUp}
                custom={i * 0.1}
                initial="hidden"
                animate="visible"
              >
                <CartItem item={item} />
              </motion.div>
            ))}

            <motion.div whileHover={{ scale: 1.03 }} className="mt-6 text-center">
              <Button
                variant="outline"
                onClick={clearCart}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 ml-2" />
                مسح السلة بالكامل
              </Button>
            </motion.div>
          </motion.div>

          {/* Order Summary */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.3 }}
            className="lg:col-span-1"
          >
            <motion.div
              whileHover={{ y: -5 }}
              transition={{ type: 'spring', stiffness: 100 }}
            >
              <Card className="sticky top-4 shadow-md hover:shadow-2xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 space-x-reverse">
                    <CreditCard className="w-5 h-5" style={{ color: 'var(--glamour-gold)' }} />
                    <span style={{ color: 'var(--warm-brown)' }}>ملخص الطلب</span>
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Services Count */}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">عدد الخدمات:</span>
                    <Badge variant="outline" style={{ borderColor: 'var(--glamour-gold)', color: 'var(--warm-brown)' }}>
                      {totalItems}
                    </Badge>
                  </div>

                  {/* Total Duration */}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">المدة الإجمالية:</span>
                    <div className="flex items-center space-x-1 space-x-reverse">
                      <Clock className="w-4 h-4" style={{ color: 'var(--glamour-gold)' }} />
                      <span className="font-medium">{totalDuration}</span>
                    </div>
                  </div>

                  {/* Services List */}
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-gray-600">الخدمات المختارة:</span>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {cartItems.map((item) => (
                        <div key={item.id} className="flex justify-between items-center text-sm">
                          <span className="truncate flex-1">{item.name}</span>
                          <div className="flex items-center space-x-1 space-x-reverse text-xs text-gray-500">
                            <span>x{item.quantity}</span>
                            <span>{item.price * item.quantity}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Total Price */}
                  <div className="border-t pt-4" style={{ borderColor: 'var(--silken-dune)' }}>
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span style={{ color: 'var(--warm-brown)' }}>المجموع الكلي:</span>
                      <span className="text-2xl" style={{ color: 'var(--glamour-gold)' }}>
                        {totalPrice}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3 pt-4">
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                      <Button
                        onClick={handleCheckout}
                        className="w-full py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                        style={{
                          background: 'linear-gradient(135deg, var(--glamour-gold), var(--glamour-gold-dark))',
                          color: 'white'
                        }}
                      >
                        <CreditCard className="w-4 h-4 ml-2" />
                        إتمام الطلب
                      </Button>
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                      <Button
                        onClick={handleContinueShopping}
                        variant="outline"
                        className="w-full py-3 rounded-full font-semibold transition-all duration-300"
                        style={{
                          borderColor: 'var(--glamour-gold)',
                          color: 'var(--glamour-gold)'
                        }}
                      >
                        <ArrowRight className="w-4 h-4 ml-2" />
                        إضافة المزيد
                      </Button>
                    </motion.div>
                  </div>

                  <div className="text-xs text-gray-500 text-center pt-4 border-t" style={{ borderColor: 'var(--silken-dune)' }}>
                    <p>سيتم توجيهك لصفحة الحجز لإتمام الطلب</p>
                    <p>يمكنك تعديل المواعيد والتفاصيل هناك</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default CartPage;
