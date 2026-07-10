const API_BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(data.message || 'Request failed');
    error.status = res.status;
    error.data = data;
    throw error;
  }
  return data;
}

export const getProducts = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return request(`/products${query ? `?${query}` : ''}`);
};

export const getProduct = (id) => request(`/products/${id}`);

export const createProduct = (data) =>
  request('/products', { method: 'POST', body: JSON.stringify(data) });

export const updateProduct = (id, data) =>
  request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const deleteProduct = (id) =>
  request(`/products/${id}`, { method: 'DELETE' });

export const getOrders = () => request('/orders');

export const getOrder = (id) => request(`/orders/${id}`);

export const updateOrderStatus = (id, status) =>
  request(`/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) });

export const createStripeCheckoutSession = (checkoutData) =>
  request('/stripe/create-checkout-session', {
    method: 'POST',
    body: JSON.stringify(checkoutData),
  });

export const verifyPayment = (orderId) =>
  request(`/stripe/verify-payment/${orderId}`);
