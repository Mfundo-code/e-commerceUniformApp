// src/components/OrderStatus.js
import React, { useState } from 'react';
import { ordersAPI } from '../services/api';
import './OrderStatus.css';

const OrderStatus = () => {
  const [orderCode, setOrderCode] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!orderCode.trim()) return;

    setLoading(true);
    setError('');
    
    try {
      const orderData = await ordersAPI.getByCode(orderCode);
      setOrder(orderData);
    } catch (error) {
      setError('Order not found');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: 'status-pending',
      confirmed: 'status-confirmed',
      in_production: 'status-production',
      completed: 'status-completed',
      shipped: 'status-shipped',
      delivered: 'status-delivered',
      cancelled: 'status-cancelled'
    };
    
    return (
      <span className={`status-badge ${statusClasses[status] || ''}`}>
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  return (
    <div className="order-status">
      <h2>Track Your Order</h2>
      
      <form onSubmit={handleSearch} className="search-form card">
        <div className="form-group">
          <label>Enter Order Code</label>
          <input
            type="text"
            value={orderCode}
            onChange={(e) => setOrderCode(e.target.value)}
            placeholder="e.g., ABC123XY"
            required
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Searching...' : 'Track Order'}
        </button>
      </form>
      
      {error && <div className="error">{error}</div>}
      
      {order && (
        <div className="order-details card">
          <h3>Order #{order.order_code}</h3>
          
          <div className="order-header">
            <div className="order-status">
              Status: {getStatusBadge(order.status)}
            </div>
            <div className="order-date">
              Ordered on: {new Date(order.created_at).toLocaleDateString()}
            </div>
          </div>
          
          <div className="customer-info">
            <h4>Customer Information</h4>
            <p>Name: {order.customer_name}</p>
            <p>Phone: {order.customer_phone}</p>
            <p>Email: {order.customer_email}</p>
          </div>
          
          <div className="order-items">
            <h4>Items</h4>
            {order.lines.map(line => (
              <div key={line.id} className="order-item">
                <h5>{line.product_name}</h5>
                <p>Student: {line.student_name}</p>
                <p>Quantity: {line.quantity}</p>
                <p>Price: ${line.price}</p>
              </div>
            ))}
          </div>
          
          <div className="order-total">
            <h4>Total: ${order.total_amount}</h4>
          </div>
          
          {order.tailor && (
            <div className="tailor-info">
              <h4>Tailor Assigned</h4>
              <p>Name: {order.tailor.first_name} {order.tailor.last_name}</p>
            </div>
          )}
          
          {order.deadline && (
            <div className="deadline">
              <h4>Expected Completion</h4>
              <p>{new Date(order.deadline).toLocaleDateString()}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OrderStatus;