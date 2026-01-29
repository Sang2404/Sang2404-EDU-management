import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5001/api',
});

// Add a request interceptor to include token if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // Firebase token
  if (token) {
    // config.headers.Authorization = `Bearer ${token}`;
    // Note: Our current login implementation sends token in body for login, 
    // but for other requests, we might need middleware on server.
    // For now, let's keep it simple.
  }
  return config;
});

export default api;
