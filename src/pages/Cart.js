import React, { useState, useEffect } from 'react';
import { cartAPI } from '../services/api';
import './Cart.css';

const Cart = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedItems, setExpandedItems] = useState({});

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const data = await cartAPI.get();
      console.log('Cart data:', data); // Debug log
      setCart(data);
    } catch (error) {
      console.error('Error fetching cart:', error);
      setError('Failed to load cart. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      await cartAPI.updateItem(itemId, { quantity: newQuantity });
      await fetchCart(); // Refresh cart
    } catch (error) {
      console.error('Error updating cart:', error);
      alert('Failed to update item quantity');
    }
  };

  const removeItem = async (itemId) => {
    if (window.confirm('Are you sure you want to remove this item from your cart?')) {
      try {
        await cartAPI.removeItem(itemId);
        await fetchCart(); // Refresh cart
      } catch (error) {
        console.error('Error removing item:', error);
        alert('Failed to remove item from cart');
      }
    }
  };

  const toggleItemDetails = (itemId) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const clearCart = async () => {
    if (window.confirm('Are you sure you want to clear your entire cart?')) {
      try {
        // Remove all items one by one
        if (cart && cart.items) {
          for (const item of cart.items) {
            await cartAPI.removeItem(item.id);
          }
        }
        await fetchCart(); // Refresh cart
      } catch (error) {
        console.error('Error clearing cart:', error);
        alert('Failed to clear cart');
      }
    }
  };

  if (loading) return <div className="loading">Loading cart...</div>;
  if (error) return <div className="error">{error}</div>;

  // Check if cart is empty or doesn't have items
  const isEmpty = !cart || !cart.items || cart.items.length === 0;

  return (
    <div className="cart-page">
      <div className="cart-header">
        <h2>Your Cart</h2>
        {!isEmpty && (
          <div className="cart-summary-header">
            <span>{cart.items.length} item{cart.items.length !== 1 ? 's' : ''}</span>
            <button onClick={clearCart} className="btn-clear">
              Clear Cart
            </button>
          </div>
        )}
      </div>
      
      {isEmpty ? (
        <div className="empty-cart">
          <div className="empty-icon">🛒</div>
          <p>Your cart is empty</p>
          <p className="empty-subtext">Add items to your cart to see them here</p>
        </div>
      ) : (
        <div className="cart-content">
          <div className="cart-items">
            {cart.items.map(item => (
              <div key={item.id} className="cart-item card">
                <div className="item-main">
                  <div className="item-image">
                    {item.product && item.product.image ? (
                      <img src={item.product.image} alt={item.product_name} />
                    ) : (
                      <div className="image-placeholder">
                        <i className="fas fa-tshirt"></i>
                      </div>
                    )}
                  </div>
                  
                  <div className="item-details">
                    <h3>{item.product_name || 'Product'}</h3>
                    <p className="garment-type">{item.garment_type_display || 'School Uniform'}</p>
                    
                    <div className="student-info">
                      <h4>Student Details</h4>
                      <p><strong>Name:</strong> {item.student_name || 'Not specified'}</p>
                      {item.student_age && <p><strong>Age:</strong> {item.student_age} years</p>}
                      {item.student_grade && <p><strong>Grade:</strong> {item.student_grade}</p>}
                      {item.student_gender && <p><strong>Gender:</strong> {item.student_gender}</p>}
                      {item.student_height && <p><strong>Height:</strong> {item.student_height} cm</p>}
                    </div>
                    
                    {item.measurements && Object.keys(item.measurements).length > 0 && (
                      <button 
                        onClick={() => toggleItemDetails(item.id)}
                        className="btn-details"
                      >
                        {expandedItems[item.id] ? 'Hide Measurements' : 'Show Measurements'}
                      </button>
                    )}
                  </div>
                  
                  <div className="item-pricing">
                    <p className="price">R{parseFloat(item.price || 0).toFixed(2)}</p>
                    <div className="item-quantity">
                      <label>Quantity:</label>
                      <div className="quantity-controls">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="quantity-btn"
                        >
                          -
                        </button>
                        <span className="quantity">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="quantity-btn"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <p className="item-total">Total: R{parseFloat(item.total || 0).toFixed(2)}</p>
                  </div>
                </div>
                
                {expandedItems[item.id] && item.measurements && (
                  <div className="item-measurements">
                    <h4>Body Measurements (cm)</h4>
                    <div className="measurements-grid">
                      {Object.entries(item.measurements).map(([key, value]) => (
                        value && (
                          <div key={key} className="measurement-item">
                            <span className="measurement-label">
                              {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}:
                            </span>
                            <span className="measurement-value">{value} cm</span>
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                )}
                
                <button 
                  onClick={() => removeItem(item.id)}
                  className="btn-remove"
                  title="Remove item"
                >
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            ))}
          </div>
          
          <div className="cart-summary card">
            <h3>Order Summary</h3>
            <div className="summary-row">
              <span>Subtotal ({cart.items.length} item{cart.items.length !== 1 ? 's' : ''}):</span>
              <span>R{parseFloat(cart.total || 0).toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping:</span>
              <span>Free</span>
            </div>
            <div className="summary-row">
              <span>Tax (estimated):</span>
              <span>R{(parseFloat(cart.total || 0) * 0.15).toFixed(2)}</span>
            </div>
            <div className="summary-row total">
              <span>Total:</span>
              <span>R{(parseFloat(cart.total || 0) * 1.15).toFixed(2)}</span>
            </div>
            
            <button className="btn btn-primary checkout-btn">
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;