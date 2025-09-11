// src/components/ProductGrid.js
import React, { useState } from 'react';
import { productsAPI, cartAPI } from '../services/api';
import MeasurementForm from './MeasurementForm';
import './ProductGrid.css';

const ProductGrid = ({ schoolId }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showMeasurementForm, setShowMeasurementForm] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await productsAPI.getBySchool(schoolId);
        setProducts(data);
      } catch (error) {
        setError('Failed to load products');
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [schoolId]);

  const handleAddToCart = (product) => {
    setSelectedProduct(product);
    setShowMeasurementForm(true);
  };

  const handleMeasurementSubmit = async (formData) => {
    try {
      const cartItem = {
        product: selectedProduct.id,
        quantity: 1,
        student_name: formData.studentName,
        student_age: formData.studentAge,
        student_grade: formData.studentGrade,
        student_gender: formData.studentGender,
        student_height: formData.studentHeight,
        measurements: formData.measurements
      };

      await cartAPI.addItem(cartItem);
      alert('Item added to cart successfully!');
      setShowMeasurementForm(false);
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add item to cart');
    }
  };

  if (loading) return <div className="loading">Loading products...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="product-grid">
      <h2>Available Uniforms</h2>
      <div className="grid grid-3">
        {products.map(product => (
          <div key={product.id} className="product-card card">
            {product.image && (
              <img 
                src={product.image} 
                alt={product.description} 
                className="product-image"
              />
            )}
            <h3>{product.garment_type_display}</h3>
            <p>{product.description}</p>
            <p className="price">${product.price}</p>
            <button 
              onClick={() => handleAddToCart(product)}
              className="btn btn-primary"
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>

      {showMeasurementForm && selectedProduct && (
        <MeasurementForm
          product={selectedProduct}
          onSubmit={handleMeasurementSubmit}
          onCancel={() => setShowMeasurementForm(false)}
        />
      )}
    </div>
  );
};

export default ProductGrid;