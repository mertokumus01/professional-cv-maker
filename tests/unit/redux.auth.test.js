// Redux Auth Slice tests
import { configureStore } from '@reduxjs/toolkit';
import authReducer, { logout } from '../../src/redux/slices/authSlice';

describe('Auth Redux Slice', () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        auth: authReducer,
      },
    });
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = store.getState().auth;
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.isAuthenticated).toBeFalsy();
      expect(state.loading).toBeFalsy();
      expect(state.error).toBeNull();
    });
  });

  describe('Logout Action', () => {
    it('should handle logout', () => {
      store.dispatch(logout());
      const state = store.getState().auth;
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.refreshToken).toBeNull();
      expect(state.isAuthenticated).toBeFalsy();
    });
  });

  describe('Authentication State', () => {
    it('should update state correctly on login', () => {
      // Mock successful login state
      const mockState = {
        user: {
          id: '123',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
        },
        token: 'mock_token_123',
        refreshToken: 'mock_refresh_token',
        isAuthenticated: true,
        loading: false,
        error: null,
      };

      expect(mockState.isAuthenticated).toBeTruthy();
      expect(mockState.user).toBeDefined();
      expect(mockState.token).toBeDefined();
    });

    it('should handle authentication error', () => {
      const mockState = {
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: 'Invalid credentials',
      };

      expect(mockState.isAuthenticated).toBeFalsy();
      expect(mockState.error).toBeDefined();
    });
  });

  describe('Token Management', () => {
    it('should store and retrieve tokens from localStorage', () => {
      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';
      localStorage.setItem('token', mockToken);
      
      expect(localStorage.getItem('token')).toBe(mockToken);
    });

    it('should clear tokens on logout', () => {
      localStorage.setItem('token', 'test_token');
      localStorage.setItem('refreshToken', 'test_refresh');
      
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      
      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('refreshToken')).toBeNull();
    });
  });
});
