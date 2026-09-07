// frontend/src/services/api.ts
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const api = axios.create({
  baseURL: 'http://localhost:3000/api/v1',
  withCredentials: true, 
});

// Axios Interceptor: Automatically attach the JWT token to every request
api.interceptors.request.use(
  (config) => {
    // Get the current access token from Zustand
    const token = useAuthStore.getState().accessToken;
    
    // If the token exists, attach it to the Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;