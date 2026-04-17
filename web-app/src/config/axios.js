import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5001/api',
  timeout: 60000, // 60 seconds timeout for AI requests
});

// Add a request interceptor to include token if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
