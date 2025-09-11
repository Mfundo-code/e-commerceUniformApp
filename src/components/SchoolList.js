// src/components/SchoolList.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { schoolsAPI } from '../services/api';
import './SchoolList.css';

const SchoolList = () => {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const data = await schoolsAPI.getAll();
        setSchools(data);
      } catch (error) {
        setError('Failed to load schools');
        console.error('Error fetching schools:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSchools();
  }, []);

  if (loading) return <div className="loading">Loading schools...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="school-list">
      <h2>Select Your School</h2>
      <div className="grid grid-3">
        {schools.map(school => (
          <div key={school.id} className="school-card card">
            <h3>{school.name}</h3>
            <p>{school.town}, {school.province}</p>
            <Link 
              to={`/schools/${school.id}/products`} 
              className="btn btn-primary"
            >
              View Uniforms
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SchoolList;