import axios from 'axios';
import { API_URL } from './apiConfig';

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Optional: Add request interceptor (e.g., to automatically attach token if auth is implemented later)
apiClient.interceptors.request.use(
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

// Optional: Add response interceptor for global error handling
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error('API Error Response:', error.response || error.message);
    
    // You can handle standard error codes here (e.g. 401 redirect to login)
    return Promise.reject(error);
  }
);

export default apiClient;
