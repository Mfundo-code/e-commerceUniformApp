// src/components/Header.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { cartAPI } from '../services/api';
import { useState, useEffect } from 'react';
import './Header.css';

const Header = () => {
  const { currentUser, logout } = useAuth();
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const cart = await cartAPI.get();
        setCartCount(cart.items.reduce((total, item) => total + item.quantity, 0));
      } catch (error) {
        console.error('Failed to fetch cart:', error);
      }
    };

    fetchCart();
  }, []);

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="header">
      <div className="container">
        <Link to="/" className="logo">
          <h1>School Uniforms</h1>
        </Link>
        
        <nav className="nav">
          <Link to="/schools">Schools</Link>
          <Link to="/cart" className="cart-link">
            Cart {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
          </Link>
          <Link to="/order-tracking">Track Order</Link>
          
          {currentUser ? (
            <div className="user-menu">
              <span>Hello, {currentUser.first_name || currentUser.username}</span>
              {currentUser.is_staff && (
                <Link to="/admin">Admin</Link>
              )}
              <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
            </div>
          ) : (
            <div className="auth-links">
              <Link to="/tailor-login" className="btn btn-secondary">Tailor Login</Link>
              <Link to="/delivery-login" className="btn btn-secondary">Delivery Login</Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;