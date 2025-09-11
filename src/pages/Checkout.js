// src/pages/Checkout.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Checkout from '../components/Checkout';
import { cartAPI } from '../services/api';
import './Checkout.css';

const CheckoutPage = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const data = await cartAPI.get();
        setCart(data);
      } catch (error) {
        setError('Failed to load cart');
        console.error('Error fetching cart:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  const handleOrderComplete = () => {
    // Redirect to order tracking or home page
    navigate('/order-tracking');
  };

  if (loading) return <div className="loading">Loading checkout...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="checkout-page">
      {cart && (
        <Checkout cart={cart} onOrderComplete={handleOrderComplete} />
      )}
    </div>
  );
};

export default CheckoutPage;