// src/pages/Home.js
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ImageHolder from '../components/ImageHolder';
import { productsAPI } from '../services/api';
import './Home.css';

const ITEMS_PER_SLIDE = 4;
const MAX_FEATURED = 12; // keep up to 12 random items
const SLIDE_INTERVAL_MS = 5000;

const shuffleArray = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const chunk = (arr, size) => {
  const res = [];
  for (let i = 0; i < arr.length; i += size) res.push(arr.slice(i, i + size));
  return res;
};

const Home = () => {
  const navigate = useNavigate();
  const [featured, setFeatured] = useState([]);
  const [slides, setSlides] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const slideInterval = useRef(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    fetchAndPrepare();
    return () => {
      isMounted.current = false;
      clearInterval(slideInterval.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // whenever featured changes, rebuild slides and restart autoplay
    const s = chunk(featured, ITEMS_PER_SLIDE);
    setSlides(s);
    setCurrentSlide(0);
    restartAutoplay(s.length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [featured]);

  const restartAutoplay = (slidesCount) => {
    clearInterval(slideInterval.current);
    if (!slidesCount || slidesCount <= 1) return;
    slideInterval.current = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slidesCount);
    }, SLIDE_INTERVAL_MS);
  };

  const fetchAndPrepare = async () => {
    try {
      setIsLoading(true);
      let res = [];

      if (productsAPI && typeof productsAPI.getFeatured === 'function') {
        res = await productsAPI.getFeatured();
      } else if (productsAPI && typeof productsAPI.getAll === 'function') {
        res = await productsAPI.getAll();
      } else if (productsAPI && typeof productsAPI.getBySchool === 'function') {
        // best-effort fallback — try a couple of likely school ids
        try {
          const s1 = await productsAPI.getBySchool(1);
          res = Array.isArray(s1) ? s1 : (s1 && s1.data ? s1.data : []);
        } catch (e) {
          res = [];
        }
      }

      const items = Array.isArray(res) ? res : (res && res.data ? res.data : []);
      const shuffled = shuffleArray(items).slice(0, MAX_FEATURED);
      if (isMounted.current) setFeatured(shuffled);
    } catch (error) {
      console.error('Error fetching featured products:', error);
      if (isMounted.current) setFeatured([]);
    } finally {
      if (isMounted.current) setIsLoading(false);
    }
  };

  const handlePrev = () => {
    clearInterval(slideInterval.current);
    setCurrentSlide(prev => (prev === 0 ? Math.max(0, slides.length - 1) : prev - 1));
    restartAutoplay(slides.length);
  };

  const handleNext = () => {
    clearInterval(slideInterval.current);
    setCurrentSlide(prev => (prev + 1) % Math.max(1, slides.length));
    restartAutoplay(slides.length);
  };

  const goToSlide = (index) => {
    clearInterval(slideInterval.current);
    setCurrentSlide(index);
    restartAutoplay(slides.length);
  };

  const handleBuyNowClick = () => navigate('/order-now');

  return (
    <div className="home">
      <div className="hero">
        <div className="hero-content">
          <h1>Welcome to School Uniforms</h1>
          <p>Quality uniforms tailored for your school</p>
          <button className="order-now-btn" onClick={handleBuyNowClick}>
            Order Now <i className="fas fa-arrow-right"></i>
          </button>
        </div>
      </div>

      <section className="featured-products">
        <h2>Featured Uniforms</h2>

        <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative' }}>
          {isLoading ? (
            <div style={{ padding: 40, textAlign: 'center' }}>Loading products…</div>
          ) : slides.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center' }}>No products available.</div>
          ) : (
            <>
              {/* Carousel viewport */}
              <div style={{ overflow: 'hidden' }}>
                <div
                  className="slides"
                  style={{
                    display: 'flex',
                    transition: 'transform 0.6s ease',
                    transform: `translateX(-${currentSlide * 100}%)`
                  }}
                >
                  {slides.map((slideItems, idx) => (
                    <div key={idx} style={{ flex: '0 0 100%', padding: 16 }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                        {slideItems.map((p) => (
                          <ImageHolder key={p.id || p.product_id || p.slug} product={p} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Controls */}
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 18 }}>
                <button onClick={handlePrev} className="control-btn" aria-label="Previous slide">
                  <i className="fas fa-chevron-left"></i>
                </button>

                <div style={{ display: 'flex', gap: 8 }}>
                  {slides.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => goToSlide(i)}
                      aria-label={`Go to slide ${i + 1}`}
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        border: 'none',
                        background: i === currentSlide ? '#224abe' : '#ddd',
                        cursor: 'pointer'
                      }}
                    />
                  ))}
                </div>

                <button onClick={handleNext} className="control-btn" aria-label="Next slide">
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
