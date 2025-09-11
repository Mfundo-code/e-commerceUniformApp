// src/context/CartContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { cartAPI } from '../services/api';

const CartContext = createContext();

export const useCart = () => {
  return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [cartCount, setCartCount] = useState(0);

  const fetchCart = async () => {
    try {
      const data = await cartAPI.get();
      setCart(data);
      setCartCount(data.items.reduce((total, item) => total + item.quantity, 0));
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    }
  };

  const addToCart = async (itemData) => {
    try {
      await cartAPI.addItem(itemData);
      await fetchCart();
    } catch (error) {
      console.error('Failed to add item to cart:', error);
      throw error;
    }
  };

  const updateCartItem = async (itemId, quantity) => {
    try {
      await cartAPI.updateItem(itemId, quantity);
      await fetchCart();
    } catch (error) {
      console.error('Failed to update cart item:', error);
      throw error;
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      await cartAPI.removeItem(itemId);
      await fetchCart();
    } catch (error) {
      console.error('Failed to remove item from cart:', error);
      throw error;
    }
  };

  const clearCart = () => {
    setCart(null);
    setCartCount(0);
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const value = {
    cart,
    cartCount,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    refreshCart: fetchCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};