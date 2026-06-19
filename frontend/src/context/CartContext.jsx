import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { orderApi } from '../api/services';
import { getErrorMessage } from '../utils/constants';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('g2c_cart');
    return saved ? JSON.parse(saved) : { growerId: null, growerName: null, items: [] };
  });

  useEffect(() => {
    localStorage.setItem('g2c_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (growerId, growerName, itemName) => {
    setCart((prev) => {
      // 1. Check if trying to add from a different grower
      if (prev.growerId && prev.growerId !== growerId) {
        toast.error('You can only order from one grower at a time. Clear your cart first.');
        return prev;
      }

      const existingIndex = prev.items.findIndex(
        (item) => item.name.toLowerCase() === itemName.toLowerCase()
      );

      let newItems = [...prev.items];
      if (existingIndex > -1) {
        newItems[existingIndex].quantity += 1;
      } else {
        newItems.push({
          name: itemName,
          quantity: 1,
          price: 45, // Mock price of 45 INR per unit
        });
      }

      toast.success(`Added ${itemName} to cart`);
      return {
        growerId,
        growerName,
        items: newItems,
      };
    });
  };

  const removeFromCart = (itemName) => {
    setCart((prev) => {
      const newItems = prev.items.filter(
        (item) => item.name.toLowerCase() !== itemName.toLowerCase()
      );
      if (newItems.length === 0) {
        return { growerId: null, growerName: null, items: [] };
      }
      return { ...prev, items: newItems };
    });
  };

  const updateQuantity = (itemName, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemName);
      return;
    }
    setCart((prev) => {
      const newItems = prev.items.map((item) =>
        item.name.toLowerCase() === itemName.toLowerCase()
          ? { ...item, quantity }
          : item
      );
      return { ...prev, items: newItems };
    });
  };

  const clearCart = () => {
    setCart({ growerId: null, growerName: null, items: [] });
  };

  const checkout = async () => {
    if (cart.items.length === 0) {
      toast.error('Your cart is empty');
      return false;
    }
    try {
      await orderApi.create({
        growerId: cart.growerId,
        items: cart.items,
      });
      toast.success('Order placed successfully!');
      clearCart();
      return true;
    } catch (err) {
      toast.error(getErrorMessage(err));
      return false;
    }
  };

  const totalAmount = useMemo(() => {
    return cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart.items]);

  const value = useMemo(
    () => ({
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      checkout,
      totalAmount,
      cartCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    [cart, totalAmount]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
