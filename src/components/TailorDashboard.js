// src/components/TailorDashboard.js
import React, { useState, useEffect } from 'react';
import { tailorAPI } from '../services/api';
import './TailorDashboard.css';

const TailorDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await tailorAPI.getOrders();
        setOrders(data);
      } catch (error) {
        setError('Failed to load orders');
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await tailorAPI.updateOrder(orderId, { status: newStatus });
      // Refresh orders list
      const data = await tailorAPI.getOrders();
      setOrders(data);
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Failed to update order status');
    }
  };

  if (loading) return <div className="loading">Loading orders...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="tailor-dashboard">
      <h2>My Orders</h2>
      
      {orders.length === 0 ? (
        <div className="no-orders">No orders assigned to you yet.</div>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <div key={order.id} className="order-card card">
              <div className="order-header">
                <h3>Order #{order.order_code}</h3>
                <span className={`status status-${order.status}`}>
                  {order.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              
              <div className="order-details">
                <p><strong>School:</strong> {order.school.name}</p>
                <p><strong>Customer:</strong> {order.customer_name}</p>
                <p><strong>Student:</strong> {order.student_name}</p>
                <p><strong>Total:</strong> ${order.total_amount}</p>
                <p><strong>Deadline:</strong> {new Date(order.deadline).toLocaleDateString()}</p>
              </div>
              
              <div className="order-items">
                <h4>Items:</h4>
                {order.lines.map(line => (
                  <div key={line.id} className="order-item">
                    <p>{line.product_name} - {line.quantity}x</p>
                    <p>Student: {line.student_name}</p>
                  </div>
                ))}
              </div>
              
              <div className="order-actions">
                <select 
                  value={order.status} 
                  onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                  className="status-select"
                >
                  <option value="confirmed">Confirmed</option>
                  <option value="in_production">In Production</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TailorDashboard;