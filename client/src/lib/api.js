import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

export const fetchProducts = async (params = {}) => {
  const { data } = await api.get('/products', { params });
  return data;
};

export const fetchProduct = async (slug) => {
  const { data } = await api.get(`/products/${slug}`);
  return data;
};

export const fetchCollections = async () => {
  const { data } = await api.get('/collections/summary');
  return data;
};

export const requestSignupVerification = async (payload) => {
  const { data } = await api.post('/auth/signup/request', payload);
  return data;
};

export const verifySignupCode = async (payload) => {
  const { data } = await api.post('/auth/signup/verify', payload);
  return data;
};

export const loginCustomer = async (payload) => {
  const { data } = await api.post('/auth/login', payload);
  return data;
};

export const submitCustomRequest = async (formData) => {
  const { data } = await api.post('/custom-requests', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const createOrder = async (payload) => {
  const { data } = await api.post('/orders', payload);
  return data;
};

export const fetchDashboard = async () => {
  const { data } = await api.get('/dashboard');
  return data;
};

export const fetchOrders = async () => {
  const { data } = await api.get('/orders');
  return data;
};

export const fetchCustomRequests = async () => {
  const { data } = await api.get('/custom-requests');
  return data;
};

export const updateCustomRequestQuote = async (id, payload) => {
  const { data } = await api.put(`/custom-requests/${id}/quote`, payload);
  return data;
};

export const createProduct = async (payload) => {
  const { data } = await api.post('/products', payload);
  return data;
};

export const updateProduct = async (id, payload) => {
  const { data } = await api.put(`/products/${id}`, payload);
  return data;
};

export const trackOrder = async (trackingCode) => {
  const { data } = await api.get(`/orders/track/${trackingCode}`);
  return data;
};

export const fetchRazorpayConfig = async () => {
  const { data } = await api.get('/config/razorpay');
  return data;
};

export default api;
