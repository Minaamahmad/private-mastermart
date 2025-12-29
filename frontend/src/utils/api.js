import axios from 'axios';

// Determine API URL - use Railway backend in production if env var not set
const getApiUrl = () => {
  let baseUrl;
  
  // If VITE_API_URL is explicitly set, use it
  if (import.meta.env.VITE_API_URL) {
    baseUrl = import.meta.env.VITE_API_URL;
  }
  // If running in production (on Vercel), use Railway backend
  else if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    baseUrl = 'https://master-mart-production.up.railway.app';
  }
  // Default to localhost for development
  else {
    baseUrl = 'http://localhost:5000';
  }
  
  // Remove trailing slashes and add /api
  baseUrl = baseUrl.replace(/\/+$/, '');
  return `${baseUrl}/api`;
};

const API_URL = getApiUrl();

// Log the API URL being used
if (typeof window !== 'undefined') {
  console.log('🔌 API URL:', API_URL);
}

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Auth0 token getter
let auth0TokenGetter = null;
export const setAuth0TokenGetter = (getter) => {
  auth0TokenGetter = getter;
};

// Attach token to all requests
api.interceptors.request.use(async (config) => {
  if (auth0TokenGetter) {
    try {
      const token = await auth0TokenGetter();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting Auth0 token:', error);
    }
  }
  return config;
});

// Handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log the full URL being requested
    const fullUrl = error.config?.baseURL && error.config?.url 
      ? `${error.config.baseURL}${error.config.url}`
      : error.config?.url || 'unknown';
    
    if (error.response) {
      // Server responded with error status
      if (error.response.status === 401) {
        console.warn('Unauthorized request. Token may be invalid or expired.');
      } else {
        console.error(`API Error ${error.response.status}:`, {
          fullUrl,
          baseURL: error.config?.baseURL,
          path: error.config?.url,
          method: error.config?.method,
          message: error.response.data?.message || error.message,
          data: error.response.data
        });
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error('Network Error - No response from server:', {
        fullUrl,
        baseURL: error.config?.baseURL,
        path: error.config?.url,
        message: 'This usually means the backend server is not running or not accessible'
      });
    } else {
      // Something else happened
      console.error('Request Error:', error.message, { fullUrl });
    }
    return Promise.reject(error);
  }
);

// Orders API
export const getOrders = () => api.get('/orders'); // requires read:orders
export const updateOrderStatus = (id, status) =>
  api.put(`/orders/${id}/status`, { status }); // requires update:orders

// Products API
export const getProducts = (params = {}) => api.get('/products', { params });
export const getProduct = (id) => api.get(`/products/${id}`);
export const createProduct = (formData) =>
  api.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateProduct = (id, formData) =>
  api.put(`/products/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteProduct = (id) => api.delete(`/products/${id}`);

// User API
export const getUserProfile = () => api.get('/users/me');
export const updateUserProfile = (data) => api.put('/users/me', data);
export const getUserOrders = () => api.get('/users/me/orders');

// Optional: Sync user with backend (for first-time login or role update)
export const syncUser = async (token) =>
  api.post('/users/sync', {}, { headers: { Authorization: `Bearer ${token}` } });
export const createOrder = (orderData) => api.post('/orders', orderData);


// Orders API


export const getOrder = (id) => api.get(`/orders/${id}`);

export default api;

