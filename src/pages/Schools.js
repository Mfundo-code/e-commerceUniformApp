// src/pages/Schools.js
import React from 'react';
import SchoolList from '../components/SchoolList';
import './Schools.css';

const Schools = () => {
  return (
    <div className="schools-page">
      <h1>Our Partner Schools</h1>
      <SchoolList />
    </div>
  );
};

export default Schools;