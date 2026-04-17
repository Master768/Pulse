/**
 * API UTILITY
 * 
 * This file configures Axios for all network requests to the backend.
 * It ensures that:
 * 1. All requests are sent to the correct Base URL.
 * 2. Auth tokens (JWT) are automatically injected into every request.
 * 3. Expired or invalid tokens trigger a logout (401 handling).
 */

import axios from 'axios';

// 1. Determine the API location (from environment variables or local fallback)
const baseURL = import.meta.env.VITE_API_URL 
  ? (import.meta.env.VITE_API_URL.endsWith('/api') ? import.meta.env.VITE_API_URL : `${import.meta.env.VITE_API_URL}/api`)
  : 'http://127.0.0.1:8080/api';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * REQUEST INTERCEPTOR
 * Runs BEFORE every single API call.
 * Purpose: Attach the 'pulse_token' from local storage to the Authorization header.
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('pulse_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * RESPONSE INTERCEPTOR
 * Runs AFTER every API response comes back.
 * Purpose: If the server returns a 401 (Unauthorized), it means our token is dead 
 * or missing, so we clear it to force the user to log in again.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('pulse_token');
      // Note: AuthContext handles the state change when it detects the token is gone.
    }
    return Promise.reject(error);
  }
);

export default api;

