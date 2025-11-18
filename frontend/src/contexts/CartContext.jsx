import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

export function CartProvider({ children }) {

  // Lazy initialization — مهم جداً حتى لا يتم مسح السلة عند أول render
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('salon-cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [bookingData, setBookingData] = useState(() => {
    const savedBooking = localStorage.getItem('salon-booking-data');
    return savedBooking ? JSON.parse(savedBooking) : null;
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  // Save cart to localStorage whenever cart changes
  useEffect(() => {
    localStorage.setItem('salon-cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Save booking data to localStorage whenever it changes
  useEffect(() => {
    if (bookingData !== null) {
      localStorage.setItem('salon-booking-data', JSON.stringify(bookingData));
    }
  }, [bookingData]);

  // Add item to cart
  const addToCart = (service, quantity = 1) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === service.id);

      if (existingItem) {
        return prevItems.map(item =>
          item.id === service.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        const cartItem = {
          id: service.id,
          name: service.name || service.title,
          description: service.description,
          price: service.price || service.basePrice || service.price_min || 0,
          image: service.image,
          duration: service.duration || 60,
          category: service.category,
          quantity: quantity
        };
        return [...prevItems, cartItem];
      }
    });
  };

  const toggleCart = (service) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === service.id);

      if (existingItem) {
        return prevItems.filter(item => item.id !== service.id);
      } else {
        const cartItem = {
          id: service.id,
          name: service.name || service.title,
          description: service.description,
          price: service.price || service.basePrice || service.price_min || 0,
          image: service.image,
          duration: service.duration || 60,
          category: service.category,
          quantity: 1
        };
        return [...prevItems, cartItem];
      }
    });
  };

  const removeFromCart = (serviceId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== serviceId));
  };

  const updateQuantity = (serviceId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(serviceId);
      return;
    }

    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === serviceId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const isInCart = (serviceId) => {
    return cartItems.some(item => item.id === serviceId);
  };

  const getItemQuantity = (serviceId) => {
    const item = cartItems.find(item => item.id === serviceId);
    return item ? item.quantity : 0;
  };

  const updateBookingData = (data) => {
    setBookingData(data);
  };

  const getBookingData = () => {
    return bookingData;
  };

  const clearBookingData = () => {
    setBookingData(null);
    localStorage.removeItem('salon-booking-data');
  };

  const clearAll = () => {
    setCartItems([]);
    setBookingData(null);
    localStorage.removeItem('salon-cart');
    localStorage.removeItem('salon-booking-data');
  };

  const value = {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    addToCart,
    toggleCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
    isInCart,
    getItemQuantity,
    bookingData,
    updateBookingData,
    getBookingData,
    clearBookingData,
    clearAll
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}
