import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

export const fetchDashboardAlerts = createAsyncThunk(
  'alerts/fetchDashboardAlerts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/dashboard/alerts');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'No se pudieron cargar las alertas');
    }
  }
);

const initialState = {
  alertsData: { total: 0, message: '', alerts: [] },
  loading: false,
  error: null,
};

const alertSlice = createSlice({
  name: 'alerts',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardAlerts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardAlerts.fulfilled, (state, action) => {
        state.loading = false;
        state.alertsData = action.payload;
      })
      .addCase(fetchDashboardAlerts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default alertSlice.reducer;
