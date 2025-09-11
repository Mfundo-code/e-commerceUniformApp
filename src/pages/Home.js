// src/pages/Home.js (updated)
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { productsAPI, schoolsAPI } from '../services/api';
import './Home.css';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const slideInterval = useRef(null);
  const carouselRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
    
    // Set up auto-rotation for the carousel
    slideInterval.current = setInterval(() => {
      const slides = Math.max(1, Math.ceil(featuredProducts.length / 4));
      setCurrentSlide(prev => (prev + 1) % slides);
    }, 5000);
    
    return () => clearInterval(slideInterval.current);
  }, [featuredProducts.length]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch all schools to get products
      const schoolsData = await schoolsAPI.getAll();
      
      // Fetch all products from all schools
      const allProducts = [];
      for (const school of schoolsData) {
        try {
          const products = await productsAPI.getBySchool(school.id);
          // enrich with school info if necessary
          const enriched = products.map(p => ({ ...p, school_name: school.name, school: school.id }));
          allProducts.push(...enriched);
        } catch (error) {
          console.error(`Error fetching products for school ${school.id}:`, error);
        }
      }
      
      // Shuffle and select 12 random products for the carousel
      const shuffled = [...allProducts].sort(() => 0.5 - Math.random());
      setFeaturedProducts(shuffled.slice(0, 12));
      
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProductSelect = (product) => {
    // Navigate to product listing for that school
    navigate(`/schools/${product.school}/products`);
  };

  const handleBuyNowClick = () => {
    // Navigate to the order now page
    navigate('/order-now');
  };

  // When a user clicks the small Order Now button on a product card
  const handleOrderNowClick = (product, e) => {
    // stop the parent card click
    if (e && e.stopPropagation) e.stopPropagation();
    // pass selectedSchool and product via location state so OrderNow can prefill if desired
    navigate('/order-now', { state: { selectedSchool: { id: product.school, name: product.school_name }, product } });
  };

  const renderProductSlide = () => {
    if (isLoading) {
      return (
        <div className="loading-slide">
          <div className="spinner"></div>
          <p>Loading featured products...</p>
        </div>
      );
    }
    
    if (featuredProducts.length === 0) {
      return (
        <div className="empty-slide">
          <p>No products available at the moment.</p>
        </div>
      );
    }
    
    const startIdx = currentSlide * 4;
    const slideProducts = featuredProducts.slice(startIdx, startIdx + 4);
    
    return (
      <div className="products-slide">
        {slideProducts.map(product => (
          <div 
            key={product.id} 
            className="product-card"
            onClick={() => handleProductSelect(product)}
          >
            {product.image ? (
              <img 
                src={product.image} 
                alt={product.description} 
                className="product-image"
              />
            ) : (
              <div className="product-image-placeholder">
                <i className="fas fa-image"></i>
              </div>
            )}
            <div className="product-info">
              <h4>{product.garment_type_display}</h4>
              <p className="school-name">{product.school_name}</p>
              <p className="price">${product.price}</p>
            </div>
            <button 
              className="order-btn"
              onClick={(e) => handleOrderNowClick(product, e)}
            >
              Order Now
            </button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="home">
      {/* Hero Section */}
      <div className="hero">
        <div className="hero-content">
          <h1>Welcome to School Uniforms</h1>
          <p>Quality uniforms tailored for your school</p>
          {/* Buy Now button that navigates to order page */}
          <button className="order-now-btn" onClick={handleBuyNowClick}>
            Order Now <i className="fas fa-arrow-right"></i>
          </button>
        </div>
      </div>
      
      {/* Featured Products Carousel */}
      <section className="featured-products">
        <h2>Featured Uniforms</h2>
        <div className="carousel-container">
          <div className="carousel" ref={carouselRef}>
            {renderProductSlide()}
          </div>
          
          {/* Carousel Controls */}
          <div className="carousel-controls">
            <button 
              className="control-btn"
              onClick={() => {
                clearInterval(slideInterval.current);
                const slides = Math.max(1, Math.ceil(featuredProducts.length / 4));
                setCurrentSlide(prev => (prev === 0 ? slides - 1 : prev - 1));
              }}
            >
              <i className="fas fa-chevron-left"></i>
            </button>
            
            <div className="carousel-dots">
              {Array.from({ length: Math.max(1, Math.ceil(featuredProducts.length / 4)) }).map((_, index) => (
                <button
                  key={index}
                  className={`dot ${index === currentSlide ? 'active' : ''}`}
                  onClick={() => {
                    clearInterval(slideInterval.current);
                    setCurrentSlide(index);
                  }}
                />
              ))}
            </div>
            
            <button 
              className="control-btn"
              onClick={() => {
                clearInterval(slideInterval.current);
                const slides = Math.max(1, Math.ceil(featuredProducts.length / 4));
                setCurrentSlide(prev => (prev + 1) % slides);
              }}
            >
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
