// src/pages/DeliveryLogin.js
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import './Auth.css';

const DeliveryLogin = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    id_number: '',
    nationality: '',
    physical_address: '',
    town: '',
    province: '',
    payment_details: '',
    phone: '',
    vehicle_type: '',
    license_plate: ''
  });
  const [verificationCode, setVerificationCode] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { login } = useAuth();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login({
        username: formData.username,
        password: formData.password
      });

      if (result.success) {
        setSuccess('Login successful!');
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      await authAPI.deliveryRegister(formData);
      setShowVerification(true);
      setSuccess('Registration successful! Please check your email for verification code.');
    } catch (error) {
      setError(error.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await authAPI.verifyEmail({
        email: formData.email,
        verification_code: verificationCode,
        user_type: 'delivery'
      });
      setSuccess('Email verified successfully! Your account is pending admin approval.');
      setShowVerification(false);
      setIsLogin(true);
    } catch (error) {
      setError(error.response?.data?.error || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setLoading(true);
    setError('');

    try {
      await authAPI.resendVerification({
        email: formData.email,
        user_type: 'delivery'
      });
      setSuccess('Verification code sent! Please check your email.');
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to resend verification code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container card">
        <h2>{isLogin ? 'Delivery Partner Login' : 'Delivery Partner Registration'}</h2>
        
        {!showVerification ? (
          <>
            {error && <div className="error">{error}</div>}
            {success && <div className="success">{success}</div>}
            
            <form onSubmit={isLogin ? handleLogin : handleRegister}>
              {!isLogin && (
                <>
                  <div className="form-row">
                    <div className="form-group">
                      <label>First Name</label>
                      <input
                        type="text"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleInputChange}
                        required={!isLogin}
                      />
                    </div>
                    <div className="form-group">
                      <label>Last Name</label>
                      <input
                        type="text"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleInputChange}
                        required={!isLogin}
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required={!isLogin}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>ID Number</label>
                    <input
                      type="text"
                      name="id_number"
                      value={formData.id_number}
                      onChange={handleInputChange}
                      required={!isLogin}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required={!isLogin}
                    />
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Town</label>
                      <input
                        type="text"
                        name="town"
                        value={formData.town}
                        onChange={handleInputChange}
                        required={!isLogin}
                      />
                    </div>
                    <div className="form-group">
                      <label>Province</label>
                      <input
                        type="text"
                        name="province"
                        value={formData.province}
                        onChange={handleInputChange}
                        required={!isLogin}
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>Nationality</label>
                    <input
                      type="text"
                      name="nationality"
                      value={formData.nationality}
                      onChange={handleInputChange}
                      required={!isLogin}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Physical Address</label>
                    <textarea
                      name="physical_address"
                      value={formData.physical_address}
                      onChange={handleInputChange}
                      required={!isLogin}
                      rows="3"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Vehicle Type</label>
                    <input
                      type="text"
                      name="vehicle_type"
                      value={formData.vehicle_type}
                      onChange={handleInputChange}
                      required={!isLogin}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>License Plate</label>
                    <input
                      type="text"
                      name="license_plate"
                      value={formData.license_plate}
                      onChange={handleInputChange}
                      required={!isLogin}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Payment Details (Bank Account)</label>
                    <textarea
                      name="payment_details"
                      value={formData.payment_details}
                      onChange={handleInputChange}
                      required={!isLogin}
                      rows="3"
                    />
                  </div>
                </>
              )}
              
              <div className="form-group">
                <label>{isLogin ? 'Username' : 'Create Username'}</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              {!isLogin && (
                <div className="form-group">
                  <label>Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              )}
              
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Processing...' : (isLogin ? 'Login' : 'Register')}
              </button>
            </form>
            
            <div className="auth-switch">
              <p>
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button 
                  type="button" 
                  onClick={() => setIsLogin(!isLogin)}
                  className="link-btn"
                >
                  {isLogin ? 'Register' : 'Login'}
                </button>
              </p>
            </div>
          </>
        ) : (
          <div className="verification-form">
            <h3>Email Verification</h3>
            <p>Please enter the verification code sent to your email</p>
            
            {error && <div className="error">{error}</div>}
            {success && <div className="success">{success}</div>}
            
            <form onSubmit={handleVerification}>
              <div className="form-group">
                <label>Verification Code</label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  required
                />
              </div>
              
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Verifying...' : 'Verify Email'}
              </button>
            </form>
            
            <div className="resend-verification">
              <p>Didn't receive the code?</p>
              <button 
                type="button" 
                onClick={handleResendVerification}
                className="link-btn"
                disabled={loading}
              >
                Resend Verification Code
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryLogin;