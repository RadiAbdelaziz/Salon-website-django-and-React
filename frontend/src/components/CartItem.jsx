import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Minus, Plus, Trash2, Clock } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();

  const handleQuantityChange = (newQuantity) => {
    updateQuantity(item.id, newQuantity);
  };

  const handleRemove = () => {
    removeFromCart(item.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <motion.div
        whileHover={{ scale: 1.02, boxShadow: '0 8px 20px rgba(0,0,0,0.1)' }}
        transition={{ duration: 0.25 }}
      >
        <Card className="mb-4 rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 bg-white/70 backdrop-blur-md">
          <CardContent className="p-5">
            <div className="flex items-start space-x-4 space-x-reverse">
              {/* Service Image */}
              <motion.div
                className="flex-shrink-0"
                whileHover={{ rotate: 2, scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                <img
                  src={item.image || '/api/placeholder/100/100'}
                  alt={item.name}
                  className="w-24 h-24 object-cover rounded-lg border border-gray-100 shadow-sm"
                  onError={(e) => {
                    e.target.src = '/api/placeholder/100/100';
                  }}
                />
              </motion.div>

              {/* Service Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3
                      className="font-semibold text-lg mb-1 tracking-tight"
                      style={{ color: 'var(--warm-brown)' }}
                    >
                      {item.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {item.description}
                    </p>

                    {/* Duration Badge */}
                    <div className="flex items-center space-x-2 space-x-reverse mb-3 text-gray-500">
                      <Clock className="w-3 h-3 text-yellow-600" />
                      <span className="text-xs">{item.duration}</span>
                    </div>

                    {/* Price */}
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <span className="text-sm text-gray-500">السعر:</span>
                      <span
                        className="font-bold text-lg"
                        style={{ color: 'var(--glamour-gold)' }}
                      >
                        {item.price}
                      </span>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <motion.div whileHover={{ rotate: 15 }}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRemove}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-full transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </motion.div>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center justify-between mt-5">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <span className="text-sm text-gray-600">الكمية:</span>
                    <div className="flex items-center space-x-1 space-x-reverse">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleQuantityChange(item.quantity - 1)
                        }
                        className="w-8 h-8 p-0 rounded-full hover:bg-gray-100 transition-all"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>

                      <Badge
                        variant="outline"
                        className="px-3 py-1 min-w-[40px] text-center text-sm font-medium rounded-md"
                        style={{
                          borderColor: 'var(--glamour-gold)',
                          color: 'var(--warm-brown)',
                        }}
                      >
                        {item.quantity}
                      </Badge>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleQuantityChange(item.quantity + 1)
                        }
                        className="w-8 h-8 p-0 rounded-full hover:bg-gray-100 transition-all"
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Total Price */}
                  <motion.div
                    className="text-right"
                    initial={{ opacity: 0.6 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <span className="text-sm text-gray-500">المجموع:</span>
                    <div
                      className="font-bold text-lg mt-1"
                      style={{ color: 'var(--glamour-gold)' }}
                    >
                      {item.price * item.quantity}
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default CartItem;
