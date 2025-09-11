// src/pages/OrderTracking.js
import React from 'react';
import OrderStatus from '../components/OrderStatus';
import './OrderTracking.css';

const OrderTracking = () => {
  return (
    <div className="order-tracking-page">
      <OrderStatus />
    </div>
  );
};

export default OrderTracking;