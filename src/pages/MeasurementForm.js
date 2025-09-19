// src/pages/MeasurementForm.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { measurementsAPI, cartAPI } from '../services/api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './MeasurementForm.css';

const MeasurementForm = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const product = location.state?.product;
  
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
        const data = await measurementsAPI.getTemplate(productId);
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
  }, [productId]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Add item to cart with measurements
      await cartAPI.addItem({
        product: productId,
        quantity: 1,
        measurements: formData.measurements,
        student_info: {
          name: formData.studentName,
          age: formData.studentAge,
          grade: formData.studentGrade,
          gender: formData.studentGender,
          height: formData.studentHeight
        }
      });
      
      // Redirect to cart page
      navigate('/cart');
    } catch (error) {
      console.error('Error adding item to cart:', error);
      alert('Failed to add item to cart. Please try again.');
    }
  };

  const handleCancel = () => {
    navigate(-1); // Go back to previous page
  };

  if (loading) return <div className="loading">Loading measurement form...</div>;

  return (
    <div className="App">
      <Header />
      <main className="main-content">
        <div className="measurement-page">
          <div className="measurement-container">
            <h2>Measurements for {product?.garment_type_display}</h2>
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
                <button type="button" onClick={handleCancel} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add to Cart
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MeasurementForm;