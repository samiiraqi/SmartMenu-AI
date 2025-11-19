import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Menu API
export const menuAPI = {
  getAll: () => api.get('/api/menu/'),
  getById: (id) => api.get(`/api/menu/${id}`),
  create: (data) => api.post('/api/menu/', data),
  update: (id, data) => api.put(`/api/menu/${id}`, data),
  delete: (id) => api.delete(`/api/menu/${id}`),
};

// Order API
export const orderAPI = {
  getAll: () => api.get('/api/orders/'),
  getById: (id) => api.get(`/api/orders/${id}`),
  create: (data) => api.post('/api/orders/', data),
  updateStatus: (id, newStatus) => api.put(`/api/orders/${id}`, { status: newStatus }),
  delete: (id) => api.delete(`/api/orders/${id}`),
};

// Chatbot API
export const chatAPI = {
  sendMessage: (data) => api.post('/api/chat/', data),
  getHistory: (sessionId) => api.get(`/api/chat/history/${sessionId}`),
};

export default api;
