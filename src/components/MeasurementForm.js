// src/components/MeasurementForm.js
import React, { useState, useEffect } from 'react';
import { measurementsAPI } from '../services/api';
import './MeasurementForm.css';

const MeasurementForm = ({ product, onSubmit, onCancel }) => {
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    studentName: '',
    studentAge: '',
    studentGrade: '',
    studentGender: '',
    studentHeight: '',
    measurements: {}
  });

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const data = await measurementsAPI.getTemplate(product.id);
        setTemplate(data);
        
        // Initialize measurements object
        const initialMeasurements = {};
        data.fields.forEach(field => {
          initialMeasurements[field.name] = '';
        });
        
        setFormData(prev => ({
          ...prev,
          measurements: initialMeasurements
        }));
      } catch (error) {
        console.error('Error fetching measurement template:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplate();
  }, [product.id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('measurement.')) {
      const fieldName = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        measurements: {
          ...prev.measurements,
          [fieldName]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (loading) return <div className="loading">Loading measurement form...</div>;

  return (
    <div className="measurement-modal">
      <div className="measurement-content">
        <h2>Measurements for {product.garment_type_display}</h2>
        <p className="template-name">{template?.name}</p>
        
        <form onSubmit={handleSubmit}>
          <div className="student-info">
            <h3>Student Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Student Name</label>
                <input
                  type="text"
                  name="studentName"
                  value={formData.studentName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Age</label>
                <input
                  type="number"
                  name="studentAge"
                  value={formData.studentAge}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Grade/Class</label>
                <input
                  type="text"
                  name="studentGrade"
                  value={formData.studentGrade}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Gender</label>
                <select
                  name="studentGender"
                  value={formData.studentGender}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            
            <div className="form-group">
              <label>Height (cm)</label>
              <input
                type="number"
                name="studentHeight"
                value={formData.studentHeight}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          
          <div className="measurements">
            <h3>Measurements (in cm)</h3>
            {template?.fields.map(field => (
              <div key={field.name} className="form-group">
                <label>
                  {field.label} {field.optional && '(Optional)'}
                </label>
                <input
                  type="number"
                  step="0.1"
                  name={`measurement.${field.name}`}
                  value={formData.measurements[field.name] || ''}
                  onChange={handleInputChange}
                  required={!field.optional}
                />
              </div>
            ))}
          </div>
          
          <div className="form-actions">
            <button type="button" onClick={onCancel} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Add to Cart
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MeasurementForm;