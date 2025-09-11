// src/pages/Products.js
import React from 'react';
import { useParams } from 'react-router-dom';
import ProductGrid from '../components/ProductGrid';
import './Products.css';

const Products = () => {
  const { schoolId } = useParams();

  return (
    <div className="products-page">
      <ProductGrid schoolId={schoolId} />
    </div>
  );
};

export default Products;