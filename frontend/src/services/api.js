import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const requestUrl = error.config?.url || '';
    const isAuthAttempt = requestUrl.includes('/auth/login') || requestUrl.includes('/auth/register');

    // Handle unauthorized sessions without breaking explicit login/register errors.
    if (error.response?.status === 401) {
      localStorage.removeItem('token');

      if (!isAuthAttempt) {
        window.dispatchEvent(new Event('auth:expired'));
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
};

// Pass API
export const passAPI = {
  applyPass: (formData) => {
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };
    return api.post('/passes', formData, config);
  },
  getMyPasses: (params) => api.get('/passes/my-passes', { params }),
  getPass: (id) => api.get(`/passes/${id}`),
  getAllPasses: (params) => api.get('/passes', { params }),
  updatePassStatus: (id, data) => api.put(`/passes/${id}/status`, data),
  getStatistics: () => api.get('/passes/statistics'),
};

// Route API
export const routeAPI = {
  getAllRoutes: (params) => api.get('/routes', { params }),
  getRoute: (id) => api.get(`/routes/${id}`),
  createRoute: (data) => api.post('/routes', data),
  updateRoute: (id, data) => api.put(`/routes/${id}`, data),
  deleteRoute: (id) => api.delete(`/routes/${id}`),
  calculatePrice: (data) => api.post('/routes/calculate-price', data),
};

// Payment API
export const paymentAPI = {
  createOrder: (data) => api.post('/payment/create-order', data),
  verifyPayment: (data) => api.post('/payment/verify-payment', data),
  getPaymentStatus: (passId) => api.get(`/payment/status/${passId}`),
  handleFailedPayment: (data) => api.post('/payment/failed', data),
};

// Utility function for handling API errors
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    return {
      message: error.response.data.message || 'Server error',
      errors: error.response.data.errors || [],
      status: error.response.status,
    };
  } else if (error.request) {
    // Request was made but no response received
    return {
      message: 'Network error. Please check your connection.',
      status: null,
    };
  } else {
    // Something else happened
    return {
      message: error.message || 'An unexpected error occurred',
      status: null,
    };
  }
};

export default api;
