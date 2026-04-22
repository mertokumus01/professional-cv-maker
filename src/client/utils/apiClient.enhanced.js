import axios from 'axios';
import store from '../redux/store';
import { logout } from '../redux/slices/authSlice';

// Create axios instance
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  timeout: 30000, // 30 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
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

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Timeout error handling
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout - server took too long to respond');
      return Promise.reject({
        status: 408,
        message: 'Request timeout. Please try again.',
        type: 'TIMEOUT_ERROR',
      });
    }

    // Network error handling
    if (!error.response) {
      console.error('Network error:', error.message);
      return Promise.reject({
        status: 0,
        message: 'Network error. Please check your connection.',
        type: 'NETWORK_ERROR',
      });
    }

    const { status, data } = error.response;

    // Handle 401 Unauthorized - Try token refresh
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/refresh-token`,
          { refreshToken }
        );

        const { token: newToken, refreshToken: newRefreshToken } = response.data.data;
        localStorage.setItem('token', newToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        store.dispatch(logout());
        window.location.href = '/login';
        return Promise.reject({
          status: 401,
          message: 'Session expired. Please login again.',
          type: 'UNAUTHORIZED',
        });
      }
    }

    // Handle 403 Forbidden
    if (status === 403) {
      return Promise.reject({
        status: 403,
        message: 'You do not have permission to perform this action.',
        type: 'FORBIDDEN',
      });
    }

    // Handle 404 Not Found
    if (status === 404) {
      return Promise.reject({
        status: 404,
        message: 'The requested resource was not found.',
        type: 'NOT_FOUND',
      });
    }

    // Handle 409 Conflict
    if (status === 409) {
      return Promise.reject({
        status: 409,
        message: data.message || 'A conflict occurred. Please try again.',
        type: 'CONFLICT',
      });
    }

    // Handle 429 Too Many Requests
    if (status === 429) {
      return Promise.reject({
        status: 429,
        message: 'Too many requests. Please wait before trying again.',
        type: 'RATE_LIMITED',
        retryAfter: data.retryAfter,
      });
    }

    // Handle 500+ Server Errors
    if (status >= 500) {
      console.error('Server error:', data);
      return Promise.reject({
        status,
        message: 'Server error. Please try again later.',
        type: 'SERVER_ERROR',
      });
    }

    // Handle 400 Bad Request
    if (status === 400) {
      return Promise.reject({
        status: 400,
        message: data.message || 'Invalid request. Please check your input.',
        type: 'BAD_REQUEST',
        errors: data.errors,
      });
    }

    // Generic error handling
    return Promise.reject({
      status,
      message: data.message || 'An error occurred. Please try again.',
      type: 'UNKNOWN_ERROR',
      data,
    });
  }
);

export default apiClient;
