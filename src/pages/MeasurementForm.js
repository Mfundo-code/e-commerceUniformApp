import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { cartAPI } from '../services/api';
import './MeasurementForm.css';

const MeasurementForm = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const product = location.state?.product;

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('student'); // 'student' | 'measurements'

  const [formData, setFormData] = useState({
    student_name: '',
    student_age: '',
    student_grade: '',
    student_gender: '',
    student_height: ''
  });

  // measurement fields state will be initialized when step moves to 'measurements'
  const [measurementData, setMeasurementData] = useState({});

  useEffect(() => {
    if (step === 'measurements') {
      // initialize measurementData keys when we open the measurement form
      const fields = getMeasurementFields(getGarmentType());
      const init = {};
      fields.forEach(f => {
        init[f.name] = measurementData[f.name] ?? '';
      });
      setMeasurementData(init);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, product]);

  const getGarmentType = () => {
    // normalize garment type from product if available
    const g = (product?.garment_type_display || product?.name || '').toLowerCase();
    // try to detect common keywords
    if (g.includes('tunic')) return 'tunic';
    if (g.includes('trouser') || g.includes('pants') || g.includes('trousers')) return 'trousers';
    if (g.includes('shirt')) return 'shirt';
    if (g.includes('skirt')) return 'skirt';
    if (g.includes('blazer') || g.includes('jacket')) return 'blazer';
    if (g.includes('dress')) return 'dress';
    return 'general';
  };

  const getMeasurementFields = (garmentType) => {
    // returns array of fields: { name, label, placeholder }
    switch (garmentType) {
      case 'tunic':
        return [
          { name: 'bust_chest', label: 'Bust / Chest (cm)', placeholder: 'e.g., 78.5' },
          { name: 'waist', label: 'Waist (cm)', placeholder: 'e.g., 62.0' },
          { name: 'hips', label: 'Hips (cm)', placeholder: 'e.g., 84.0' },
          { name: 'shoulder_width', label: 'Shoulder Width (cm)', placeholder: 'Shoulder width' },
          { name: 'sleeve_length', label: 'Sleeve Length (cm)', placeholder: 'From shoulder to wrist' },
          { name: 'front_length', label: 'Front Length (cm)', placeholder: 'From shoulder to hem (front)' },
          { name: 'back_length', label: 'Back Length (cm)', placeholder: 'From nape to hem (back)' }
        ];
      case 'trousers':
        return [
          { name: 'waist', label: 'Waist (cm)', placeholder: 'e.g., 62.0' },
          { name: 'hips', label: 'Hips (cm)', placeholder: 'e.g., 84.0' },
          { name: 'inseam', label: 'Inseam (cm)', placeholder: 'Inside leg - crotch to ankle' },
          { name: 'outseam', label: 'Outseam (cm)', placeholder: 'Waist to ankle' },
          { name: 'thigh', label: 'Thigh (cm)', placeholder: 'Around fullest part of thigh' },
          { name: 'knee', label: 'Knee (cm)', placeholder: 'Around knee' }
        ];
      case 'shirt':
        return [
          { name: 'chest', label: 'Chest (cm)', placeholder: 'e.g., 78.5' },
          { name: 'waist', label: 'Waist (cm)', placeholder: 'e.g., 62.0' },
          { name: 'neck', label: 'Neck (cm)', placeholder: 'Collar/neck circumference' },
          { name: 'shoulder_width', label: 'Shoulder Width (cm)', placeholder: 'Shoulder width' },
          { name: 'sleeve_length', label: 'Sleeve Length (cm)', placeholder: 'From shoulder to wrist' },
          { name: 'shirt_length', label: 'Shirt Length (cm)', placeholder: 'From shoulder to hem' }
        ];
      case 'skirt':
        return [
          { name: 'waist', label: 'Waist (cm)', placeholder: 'e.g., 62.0' },
          { name: 'hips', label: 'Hips (cm)', placeholder: 'e.g., 84.0' },
          { name: 'skirt_length', label: 'Skirt Length (cm)', placeholder: 'From waist to hem' }
        ];
      case 'blazer':
        return [
          { name: 'chest', label: 'Chest (cm)', placeholder: 'e.g., 80.0' },
          { name: 'waist', label: 'Waist (cm)', placeholder: 'e.g., 62.0' },
          { name: 'shoulder_width', label: 'Shoulder Width (cm)', placeholder: 'Shoulder width' },
          { name: 'sleeve_length', label: 'Sleeve Length (cm)', placeholder: 'From shoulder to wrist' },
          { name: 'back_length', label: 'Back Length (cm)', placeholder: 'From nape to bottom hem' }
        ];
      case 'dress':
        return [
          { name: 'bust_chest', label: 'Bust / Chest (cm)', placeholder: 'e.g., 78.5' },
          { name: 'waist', label: 'Waist (cm)', placeholder: 'e.g., 62.0' },
          { name: 'hips', label: 'Hips (cm)', placeholder: 'e.g., 84.0' },
          { name: 'shoulder_width', label: 'Shoulder Width (cm)', placeholder: 'Shoulder width' },
          { name: 'sleeve_length', label: 'Sleeve Length (cm)', placeholder: 'From shoulder to wrist' },
          { name: 'dress_length', label: 'Dress Length (cm)', placeholder: 'From shoulder to hem' }
        ];
      default:
        return [
          { name: 'height', label: 'Height (cm)', placeholder: 'Overall height' },
          { name: 'chest', label: 'Chest (cm)', placeholder: 'e.g., 78.5' },
          { name: 'waist', label: 'Waist (cm)', placeholder: 'e.g., 62.0' },
          { name: 'hips', label: 'Hips (cm)', placeholder: 'e.g., 84.0' }
        ];
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMeasurementChange = (e) => {
    const { name, value } = e.target;
    setMeasurementData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStudentSubmit = (e) => {
    e.preventDefault();
    // Basic front-end validation already enforced by input required attrs.
    // Move to measurements step instead of adding to cart
    setStep('measurements');
  };

  const handleMeasurementsSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Build payload: student info + measurement fields
      // Convert numeric-looking fields to numbers (float)
      const measurementsPayload = {};
      Object.entries(measurementData).forEach(([k, v]) => {
        const num = v === '' ? null : Number(v);
        measurementsPayload[k] = v === '' ? null : (Number.isNaN(num) ? v : num);
      });

      await cartAPI.addItem({
        product: parseInt(productId),
        quantity: 1,
        ...formData,
        ...measurementsPayload
      });

      navigate('/cart');
    } catch (error) {
      console.error('Error adding item to cart:', error);
      alert('Failed to add item to cart. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => navigate(-1);
  const handleBackToStudent = () => setStep('student');

  const garmentType = getGarmentType();
  const measurementFields = getMeasurementFields(garmentType);

  return (
    <div className="App">
      <main className="main-content">
        <div className="measurement-page">
          <div className="measurement-container">
            <div className="measurement-header">
              <h2>
                {step === 'student'
                  ? `Student Details for ${product?.garment_type_display || product?.name || 'Product'}`
                  : `Body Measurements for ${product?.garment_type_display || product?.name || 'Product'}`}
              </h2>
              <p className="hint">
                {step === 'student'
                  ? 'Fill student information. After continuing you will provide body measurements required by the tailor.'
                  : `Measurements required for a ${garmentType}. Enter values in centimetres (cm).`}
              </p>
            </div>

            {step === 'student' && (
              <form onSubmit={handleStudentSubmit}>
                <div className="student-info-form">
                  <h3>Student Information</h3>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Student Full Name *</label>
                      <input
                        type="text"
                        name="student_name"
                        value={formData.student_name}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter student's full name"
                      />
                    </div>

                    <div className="form-group">
                      <label>Age *</label>
                      <input
                        type="number"
                        name="student_age"
                        value={formData.student_age}
                        onChange={handleInputChange}
                        required
                        min="3"
                        max="18"
                        placeholder="Age in years"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Grade/Class *</label>
                      <input
                        type="text"
                        name="student_grade"
                        value={formData.student_grade}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g., Grade 5, Class 3B"
                      />
                    </div>

                    <div className="form-group">
                      <label>Gender *</label>
                      <select
                        name="student_gender"
                        value={formData.student_gender}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Height (cm) *</label>
                    <input
                      type="number"
                      name="student_height"
                      value={formData.student_height}
                      onChange={handleInputChange}
                      step="0.1"
                      required
                      placeholder="Height in centimeters"
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="btn btn-secondary"
                    disabled={loading}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    Continue to Measurements
                  </button>
                </div>
              </form>
            )}

            {step === 'measurements' && (
              <form onSubmit={handleMeasurementsSubmit}>
                <div className="measurement-form">
                  <h3>Body Measurements ({garmentType})</h3>

                  <div className="measurements-grid">
                    {measurementFields.map(field => (
                      <div key={field.name} className="form-group">
                        <label>{field.label} *</label>
                        <input
                          type="number"
                          name={field.name}
                          value={measurementData[field.name] ?? ''}
                          onChange={handleMeasurementChange}
                          step="0.1"
                          required
                          placeholder={field.placeholder}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="form-note">
                    <small>
                      Tip: measure in cm. If unsure, leave an accurate estimate — the tailor will confirm.
                    </small>
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    onClick={handleBackToStudent}
                    className="btn btn-secondary"
                    disabled={loading}
                  >
                    Back
                  </button>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? 'Adding to Cart...' : 'Add to Cart'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default MeasurementForm;
