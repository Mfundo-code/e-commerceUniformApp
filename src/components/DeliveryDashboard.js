// src/components/DeliveryDashboard.js
import React, { useState, useEffect } from 'react';
import { deliveryAPI } from '../services/api';
import './DeliveryDashboard.css';

const DeliveryDashboard = () => {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchShipments = async () => {
      try {
        const data = await deliveryAPI.getShipments();
        setShipments(data);
      } catch (error) {
        setError('Failed to load shipments');
        console.error('Error fetching shipments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchShipments();
  }, []);

  const updateShipmentStatus = async (shipmentId, newStatus) => {
    try {
      await deliveryAPI.updateShipment(shipmentId, { status: newStatus });
      // Refresh shipments list
      const data = await deliveryAPI.getShipments();
      setShipments(data);
    } catch (error) {
      console.error('Error updating shipment:', error);
      alert('Failed to update shipment status');
    }
  };

  if (loading) return <div className="loading">Loading shipments...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="delivery-dashboard">
      <h2>My Shipments</h2>
      
      {shipments.length === 0 ? (
        <div className="no-shipments">No shipments assigned to you yet.</div>
      ) : (
        <div className="shipments-list">
          {shipments.map(shipment => (
            <div key={shipment.id} className="shipment-card card">
              <div className="shipment-header">
                <h3>Shipment #{shipment.tracking_code}</h3>
                <span className={`status status-${shipment.status}`}>
                  {shipment.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              
              <div className="shipment-details">
                <p><strong>Order Code:</strong> {shipment.order.order_code}</p>
                <p><strong>Customer:</strong> {shipment.order.customer_name}</p>
                <p><strong>Delivery Address:</strong> {shipment.order.school.address}</p>
                <p><strong>School:</strong> {shipment.order.school.name}</p>
              </div>
              
              <div className="shipment-actions">
                <select 
                  value={shipment.status} 
                  onChange={(e) => updateShipmentStatus(shipment.id, e.target.value)}
                  className="status-select"
                >
                  <option value="assigned">Assigned</option>
                  <option value="picked_up">Picked Up</option>
                  <option value="in_transit">In Transit</option>
                  <option value="delivered">Delivered</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DeliveryDashboard;