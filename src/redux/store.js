import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import cvReducer from './slices/cvSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cv: cvReducer,
  },
});

export default store;
