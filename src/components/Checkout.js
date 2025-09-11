// src/components/Checkout.js
import React, { useState } from 'react';
import { ordersAPI, paymentAPI } from '../services/api';
import './Checkout.css';

const Checkout = ({ cart, onOrderComplete }) => {
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    school: cart.items[0]?.product.school || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Create order
      const orderData = {
        ...formData,
        total_amount: cart.total
      };
      
      const order = await ordersAPI.create(orderData);
      
      // Initiate payment
      const payment = await paymentAPI.initiate({
        order_id: order.order_id,
        order_code: order.order_code
      });
      
      // Redirect to PayPal
      window.location.href = payment.approval_url;
      
    } catch (error) {
      setError(error.response?.data?.error || 'Checkout failed');
      console.error('Checkout error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (cart.items.length === 0) {
    return <div className="error">Your cart is empty</div>;
  }

  return (
    <div className="checkout">
      <h2>Checkout</h2>
      
      <div className="checkout-content">
        <div className="order-summary card">
          <h3>Order Summary</h3>
          {cart.items.map(item => (
            <div key={item.id} className="order-item">
              <h4>{item.product_name}</h4>
              <p>For: {item.student_name}</p>
              <p>Quantity: {item.quantity}</p>
              <p>Price: ${item.price * item.quantity}</p>
            </div>
          ))}
          <div className="order-total">
            <h3>Total: ${cart.total}</h3>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="checkout-form card">
          <h3>Customer Information</h3>
          
          {error && <div className="error">{error}</div>}
          
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="customer_name"
              value={formData.customer_name}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              name="customer_phone"
              value={formData.customer_phone}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="customer_email"
              value={formData.customer_email}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>School</label>
            <input
              type="text"
              value={formData.school}
              disabled
            />
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Proceed to Payment'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Checkout;