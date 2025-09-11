// src/components/SchoolSearch.js
import React, { useState, useEffect } from 'react';
import { schoolsAPI } from '../services/api';
import './SchoolSearch.css';

const SchoolSearch = ({ onSchoolSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [schools, setSchools] = useState([]);
  const [filteredSchools, setFilteredSchools] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchSchools = async () => {
      setIsLoading(true);
      try {
        const data = await schoolsAPI.getAll();
        setSchools(data);
        setFilteredSchools(data);
      } catch (error) {
        console.error('Error fetching schools:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchools();
  }, []);

  useEffect(() => {
    if (searchTerm === '') {
      setFilteredSchools(schools);
    } else {
      const filtered = schools.filter(school =>
        school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        school.town.toLowerCase().includes(searchTerm.toLowerCase()) ||
        school.province.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSchools(filtered);
    }
  }, [searchTerm, schools]);

  return (
    <div className="school-search">
      <div className="search-header">
        <h2>Find Your School</h2>
        <p>Select your school to view available uniforms</p>
      </div>
      
      <div className="search-box">
        <input
          type="text"
          placeholder="Search by school name, town, or province..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <i className="fas fa-search search-icon"></i>
      </div>

      {isLoading ? (
        <div className="loading-schools">
          <div className="spinner"></div>
          <p>Loading schools...</p>
        </div>
      ) : (
        <div className="schools-grid">
          {filteredSchools.map(school => (
            <div 
              key={school.id} 
              className="school-card"
              onClick={() => onSchoolSelect(school)}
            >
              <div className="school-info">
                <h3>{school.name}</h3>
                <p>{school.town}, {school.province}</p>
              </div>
              <div className="select-school">
                <button className="btn btn-primary">Select</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredSchools.length === 0 && !isLoading && (
        <div className="no-results">
          <p>No schools found. Please try a different search term.</p>
        </div>
      )}
    </div>
  );
};

export default SchoolSearch;