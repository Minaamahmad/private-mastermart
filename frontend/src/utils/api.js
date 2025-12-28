import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : 'http://localhost:5000/api';
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Store function to set Auth0 token
let auth0TokenGetter = null;

export const setAuth0TokenGetter = (getter) => {
  auth0TokenGetter = getter;
};

// Add Auth0 token to requests if available
api.interceptors.request.use(async (config) => {
  if (auth0TokenGetter) {
    try {
      const token = await auth0TokenGetter();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      // Silently fail if token cannot be retrieved
      console.error('Error getting Auth0 token:', error);
    }
  }
  return config;
});

// Handle 401 errors globally - token expired or invalid
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token is invalid or expired - redirect to home
      // Auth0 will handle re-authentication if needed
      if (!window.location.pathname.startsWith('/admin')) {
        // Only redirect non-admin pages to home
        // Admin pages are protected by PrivateRoute which handles Auth0
      }
    }
    return Promise.reject(error);
  }
);

// Products API
export const getProducts = (params = {}) => {
  return api.get('/products', { params });
};

export const getProduct = (id) => {
  return api.get(`/products/${id}`);
};

export const createProduct = (formData) => {
  return api.post('/products', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const updateProduct = (id, formData) => {
  return api.put(`/products/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const deleteProduct = (id) => {
  return api.delete(`/products/${id}`);
};

// Orders API
export const createOrder = (orderData) => {
  return api.post('/orders', orderData);
};

export const getOrders = () => {
  return api.get('/orders');
};

export const getOrder = (id) => {
  return api.get(`/orders/${id}`);
};

export const updateOrderStatus = (id, status) => {
  return api.put(`/orders/${id}/status`, { status });
};

// User API (Auth0)
export const getUserProfile = () => {
  return api.get('/users/me');
};

export const updateUserProfile = (data) => {
  return api.put('/users/me', data);
};

export const syncUser = async (token) => {
  return api.post('/users/sync', {}, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

export const getUserOrders = () => {
  return api.get('/users/me/orders');
};

export default api;

