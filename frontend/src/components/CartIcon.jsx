import React from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';

const CartIcon = ({ className = '' }) => {
  const { getTotalItems, setIsCartOpen } = useCart();
  const navigate = useNavigate();
  const totalItems = getTotalItems();

  const handleCartClick = () => {
    // navigate('/checkout');
    navigate('/cart');
    setIsCartOpen(true);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleCartClick}
      className={`relative flex items-center space-x-2 space-x-reverse ${className}`}
      style={{
        borderColor: 'var(--glamour-gold)',
        color: 'var(--warm-brown)',
        backgroundColor: 'transparent',
        cursor: "pointer"
      }}
       onMouseEnter={(e) => {
       e.currentTarget.style.backgroundColor = 'var(--glamour-gold)';
       e.currentTarget.style.color = 'white';
     }}
     onMouseLeave={(e) => {
     e.currentTarget.style.backgroundColor = 'transparent';
     e.currentTarget.style.color = 'var(--warm-brown)';
    }}
      
    >
      <ShoppingCart className="w-4 h-4" />
      <span>السلة</span>
      {totalItems > 0 && (
        <span
          className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold"
          style={{ fontSize: '10px' }}
        >
          {totalItems > 99 ? '99+' : totalItems}
        </span>
      )}
    </Button>
  );
};

export default CartIcon;
