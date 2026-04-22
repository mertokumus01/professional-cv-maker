import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Async thunks
export const fetchCVs = createAsyncThunk(
  'cv/fetchCVs',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/cvs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch CVs');
    }
  }
);

export const fetchCV = createAsyncThunk(
  'cv/fetchCV',
  async (cvId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/cvs/${cvId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch CV');
    }
  }
);

export const createCV = createAsyncThunk(
  'cv/createCV',
  async ({ title, template }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/cvs`, 
        { title, template },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create CV');
    }
  }
);

export const updateCV = createAsyncThunk(
  'cv/updateCV',
  async ({ cvId, title, data, template, isPublic }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_URL}/cvs/${cvId}`,
        { title, data, template, isPublic },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update CV');
    }
  }
);

export const deleteCV = createAsyncThunk(
  'cv/deleteCV',
  async (cvId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/cvs/${cvId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return cvId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete CV');
    }
  }
);

const initialState = {
  cvs: [],
  currentCV: null,
  loading: false,
  error: null,
};

const cvSlice = createSlice({
  name: 'cv',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentCV: (state, action) => {
      state.currentCV = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch CVs
    builder
      .addCase(fetchCVs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCVs.fulfilled, (state, action) => {
        state.loading = false;
        state.cvs = action.payload;
      })
      .addCase(fetchCVs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch CV
    builder
      .addCase(fetchCV.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCV.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCV = action.payload;
      })
      .addCase(fetchCV.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Create CV
    builder
      .addCase(createCV.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCV.fulfilled, (state, action) => {
        state.loading = false;
        state.cvs.unshift(action.payload);
        state.currentCV = action.payload;
      })
      .addCase(createCV.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Update CV
    builder
      .addCase(updateCV.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCV.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.cvs.findIndex(cv => cv.id === action.payload.id);
        if (index !== -1) {
          state.cvs[index] = action.payload;
        }
        state.currentCV = action.payload;
      })
      .addCase(updateCV.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Delete CV
    builder
      .addCase(deleteCV.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCV.fulfilled, (state, action) => {
        state.loading = false;
        state.cvs = state.cvs.filter(cv => cv.id !== action.payload);
        if (state.currentCV?.id === action.payload) {
          state.currentCV = null;
        }
      })
      .addCase(deleteCV.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setCurrentCV } = cvSlice.actions;
export default cvSlice.reducer;
