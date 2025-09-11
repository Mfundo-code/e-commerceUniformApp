// src/pages/Admin.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI, schoolsAPI, productsAPI } from '../services/api';
import './Admin.css';

const Admin = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [schools, setSchools] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentUser && currentUser.is_staff) {
      fetchData();
    }
  }, [currentUser]);

  const fetchData = async () => {
    try {
      const [schoolsData, productsData] = await Promise.all([
        schoolsAPI.getAll(),
        productsAPI.getBySchool('') // This would need to be adjusted
      ]);
      setSchools(schoolsData);
      setProducts(productsData);
    } catch (error) {
      setError('Failed to load data');
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser || !currentUser.is_staff) {
    return (
      <div className="admin-page">
        <div className="error">Access denied. Admin privileges required.</div>
      </div>
    );
  }

  if (loading) return <div className="loading">Loading admin panel...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="admin-page">
      <h1>Admin Dashboard</h1>
      
      <div className="admin-tabs">
        <button 
          className={activeTab === 'dashboard' ? 'active' : ''}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
        <button 
          className={activeTab === 'schools' ? 'active' : ''}
          onClick={() => setActiveTab('schools')}
        >
          Schools
        </button>
        <button 
          className={activeTab === 'products' ? 'active' : ''}
          onClick={() => setActiveTab('products')}
        >
          Products
        </button>
        <button 
          className={activeTab === 'users' ? 'active' : ''}
          onClick={() => setActiveTab('users')}
        >
          Users
        </button>
      </div>
      
      <div className="admin-content">
        {activeTab === 'dashboard' && (
          <div className="dashboard-stats">
            <div className="stat-card card">
              <h3>Total Schools</h3>
              <p className="stat-number">{schools.length}</p>
            </div>
            <div className="stat-card card">
              <h3>Total Products</h3>
              <p className="stat-number">{products.length}</p>
            </div>
            <div className="stat-card card">
              <h3>Active Users</h3>
              <p className="stat-number">0</p>
            </div>
          </div>
        )}
        
        {activeTab === 'schools' && (
          <div className="schools-admin">
            <h2>School Management</h2>
            <button className="btn btn-primary">Add New School</button>
            
            <div className="schools-list">
              {schools.map(school => (
                <div key={school.id} className="school-admin-card card">
                  <h3>{school.name}</h3>
                  <p>{school.town}, {school.province}</p>
                  <p>Status: {school.is_active ? 'Active' : 'Inactive'}</p>
                  
                  <div className="school-actions">
                    <button className="btn btn-secondary">Edit</button>
                    <button className="btn btn-secondary">
                      {school.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {activeTab === 'products' && (
          <div className="products-admin">
            <h2>Product Management</h2>
            <button className="btn btn-primary">Add New Product</button>
            
            <div className="products-list">
              {products.map(product => (
                <div key={product.id} className="product-admin-card card">
                  <h3>{product.garment_type_display}</h3>
                  <p>School: {product.school_name}</p>
                  <p>Price: ${product.price}</p>
                  
                  <div className="product-actions">
                    <button className="btn btn-secondary">Edit</button>
                    <button className="btn btn-secondary">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {activeTab === 'users' && (
          <div className="users-admin">
            <h2>User Management</h2>
            <p>User management functionality coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;