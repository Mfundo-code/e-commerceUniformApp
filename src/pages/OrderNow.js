// src/pages/OrderNow.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { schoolsAPI, productsAPI } from '../services/api';
import ImageHolder from '../components/ImageHolder';
import './OrderNow.css';

const findClosestSchool = (schools, query) => {
  if (!query || !schools.length) return null;

  const normalizedQuery = query.toLowerCase().trim();

  // Try exact match first
  const exactMatch = schools.find(school => 
    school.name.toLowerCase() === normalizedQuery
  );
  if (exactMatch) return exactMatch;

  // Try partial match
  const partialMatch = schools.find(school => 
    school.name.toLowerCase().includes(normalizedQuery)
  );
  if (partialMatch) return partialMatch;

  // Fuzzy match with simple distance algorithm
  const results = schools.map(school => {
    const name = school.name.toLowerCase();
    let distance = 0;
    let matches = 0;

    // Calculate character matches
    const queryChars = normalizedQuery.split('');
    const nameChars = name.split('');

    queryChars.forEach(char => {
      if (nameChars.includes(char)) matches++;
    });

    distance = Math.max(normalizedQuery.length, name.length) - matches;

    return {
      school,
      distance,
      similarity: matches / Math.max(normalizedQuery.length, name.length)
    };
  });

  // Find best match with highest similarity
  const bestMatch = results.sort((a, b) => b.similarity - a.similarity)[0];
  return bestMatch.similarity >= 0.4 ? bestMatch.school : null;
};

const OrderNow = () => {
  const [schools, setSchools] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [products, setProducts] = useState([]);
  const [schoolName, setSchoolName] = useState('');
  const [loading, setLoading] = useState(false);
  const [schoolError, setSchoolError] = useState('');
  const [suggestedSchool, setSuggestedSchool] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        setLoading(true);
        const data = await schoolsAPI.getAll();
        setSchools(data);
      } catch (error) {
        setSchoolError('Failed to load schools');
        console.error('Error fetching schools:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSchools();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!selectedSchool) return;

      try {
        setLoading(true);
        const data = await productsAPI.getBySchool(selectedSchool.id);
        setProducts(data);
      } catch (error) {
        setSchoolError('Failed to load products');
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    if (selectedSchool) {
      fetchProducts();
    }
  }, [selectedSchool]);

  const handleSearch = async () => {
    if (!schoolName.trim()) {
      setSchoolError('Please enter a school name');
      return;
    }

    setLoading(true);
    setSchoolError('');
    setSuggestedSchool(null);

    try {
      // Find closest school match using fuzzy search
      const closestSchool = findClosestSchool(schools, schoolName);

      if (!closestSchool) {
        setSchoolError('School not found. Please request assistance or try another name.');
        setProducts([]);
        setLoading(false);
        return;
      }

      // Check if we need to confirm with user
      const normalizedInput = schoolName.toLowerCase().trim();
      const normalizedSchool = closestSchool.name.toLowerCase();

      if (!normalizedSchool.includes(normalizedInput)) {
        setSuggestedSchool(closestSchool);
        setSchoolError(`Did you mean ${closestSchool.name}?`);
        setProducts([]);
        setLoading(false);
        return;
      }

      // Set the selected school
      setSelectedSchool(closestSchool);
    } catch (error) {
      console.error('Error finding school:', error);
      setSchoolError('Failed to find school. Please try again.');
    }

    setLoading(false);
  };

  const handleUseSuggestion = async () => {
    if (!suggestedSchool) return;

    setSelectedSchool(suggestedSchool);
    setSchoolName(suggestedSchool.name);
    setSuggestedSchool(null);
    setSchoolError('');
  };


  return (
    <div className="order-now-page">
      <div className="container">
        <h2>School Uniforms</h2>

        {!selectedSchool ? (
          <div className="school-selection">
            <div className="search-container">
              <input
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                placeholder="Enter your school name"
                className="search-input"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button 
                className="search-button"
                onClick={handleSearch}
                disabled={loading}
              >
                {loading ? 'Searching...' : 'Find Uniforms'}
              </button>
            </div>

            {schoolError && (
              <div className="error-container">
                <p className="error-text">{schoolError}</p>

                {suggestedSchool && (
                  <button 
                    className="suggestion-button"
                    onClick={handleUseSuggestion}
                  >
                    Yes, show {suggestedSchool.name} uniforms
                  </button>
                )}

                <div className="action-buttons">
                  <button 
                    className="assistance-button"
                    onClick={() => navigate('/communication')}
                  >
                    Request Assistance
                  </button>
                  <button 
                    className="other-products-button"
                    onClick={() => navigate('/')}
                  >
                    See More Products
                  </button>
                </div>
              </div>
            )}

            {loading && (
              <div className="loading-container">
                <i className="fas fa-spinner fa-spin spinner"></i>
                <p>Loading uniforms...</p>
              </div>
            )}
          </div>
        ) : (
          <div className="products-section">
            <div className="school-header">
              <h3>Uniforms for {selectedSchool.name}</h3>
              <button 
                className="btn btn-secondary"
                onClick={() => {
                  setSelectedSchool(null);
                  setSchoolName('');
                  setProducts([]);
                }}
              >
                Change School
              </button>
            </div>

            {loading && <div className="loading">Loading products...</div>}

            <div className="products-grid">
              {products.length > 0 ? (
                products.map(product => (
                  <div key={product.id} className="product-item">
                    <ImageHolder 
                      product={product} 
                    />
                  </div>
                ))
              ) : (
                !loading && <p className="instruction">No uniforms found for this school</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderNow;
