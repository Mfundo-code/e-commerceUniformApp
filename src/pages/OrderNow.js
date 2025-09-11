// src/pages/OrderNow.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SchoolSearch from '../components/SchoolSearch';
import './OrderNow.css';

const OrderNow = () => {
  const [selectedSchool, setSelectedSchool] = useState(null);
  const navigate = useNavigate();

  const handleSchoolSelect = (school) => {
    setSelectedSchool(school);
    navigate(`/schools/${school.id}/products`);
  };

  return (
    <div className="order-now-page">
      <div className="container">
        {!selectedSchool ? (
          <SchoolSearch onSchoolSelect={handleSchoolSelect} />
        ) : (
          <div className="selected-school">
            <h2>Products for {selectedSchool.name}</h2>
            <p>Browse available uniforms for {selectedSchool.name}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderNow;