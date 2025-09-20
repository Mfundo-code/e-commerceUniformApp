// src/services/api.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,  // This ensures cookies are sent with requests
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add CSRF token if available
    const csrfToken = getCookie('csrftoken');
    if (csrfToken) {
      config.headers['X-CSRFToken'] = csrfToken;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Helper function to get cookie value
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

// Auth API
export const authAPI = {
  setToken: (token) => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  },

  login: (credentials) => {
    return api.post('/token/', credentials).then(res => res.data);
  },

  register: (userData) => {
    return api.post('/auth/register/', userData).then(res => res.data);
  },

  getProfile: () => {
    return api.get('/auth/profile/').then(res => res.data);
  },

  tailorRegister: (data) => {
    return api.post('/auth/tailor/register/', data).then(res => res.data);
  },

  deliveryRegister: (data) => {
    return api.post('/auth/delivery/register/', data).then(res => res.data);
  },

  verifyEmail: (data) => {
    return api.post('/auth/verify-email/', data).then(res => res.data);
  },

  resendVerification: (data) => {
    return api.post('/auth/resend-verification/', data).then(res => res.data);
  }
};

// Schools API
export const schoolsAPI = {
  getAll: () => {
    return api.get('/schools/').then(res => res.data);
  },

  getById: (id) => {
    return api.get(`/schools/${id}/`).then(res => res.data);
  }
};

// Products API
export const productsAPI = {
  getBySchool: (schoolId) => {
    return api.get(`/schools/${schoolId}/products/`).then(res => res.data);
  }
};

// Cart API
export const cartAPI = {
  get: () => {
    return api.get('/cart/').then(res => res.data);
  },

  addItem: (item) => {
    return api.post('/cart/add/', item).then(res => res.data);
  },

  updateItem: (id, quantity) => {
    return api.patch(`/cart/update/${id}/`, { quantity }).then(res => res.data);
  },

  removeItem: (id) => {
    return api.delete(`/cart/remove/${id}/`).then(res => res.data);
  }
};

// Orders API
export const ordersAPI = {
  create: (orderData) => {
    return api.post('/checkout/guest/', orderData).then(res => res.data);
  },

  getByCode: (orderCode) => {
    return api.get(`/orders/${orderCode}/`).then(res => res.data);
  },

  tailorConfirm: (token) => {
    return api.patch(`/tailor/confirm-order/${token}/`).then(res => res.data);
  }
};

// Measurements API
export const measurementsAPI = {
  getTemplate: (productId) => {
    return api.get(`/measurements/template/?product_id=${productId}`).then(res => res.data);
  }
};

// Payment API
export const paymentAPI = {
  initiate: (orderData) => {
    return api.post('/payments/initiate/', orderData).then(res => res.data);
  },

  execute: (paymentData) => {
    return api.post('/payments/execute/', paymentData).then(res => res.data);
  },

  getStatus: (paymentId) => {
    return api.get(`/payments/status/?payment_id=${paymentId}`).then(res => res.data);
  }
};

// Tailor API
export const tailorAPI = {
  getOrders: () => {
    return api.get('/tailor/orders/').then(res => res.data);
  },

  updateOrder: (id, data) => {
    return api.patch(`/tailor/orders/${id}/status/`, data).then(res => res.data);
  }
};

// Delivery API
export const deliveryAPI = {
  getShipments: () => {
    return api.get('/delivery/shipments/').then(res => res.data);
  },

  updateShipment: (id, data) => {
    return api.patch(`/delivery/shipments/${id}/status/`, data).then(res => res.data);
  }
};

export default api;