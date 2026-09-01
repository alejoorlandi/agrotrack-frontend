import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';
import { fetchAnimals } from './animalSlice';
import { fetchDashboardAlerts } from './alertSlice';

export const fetchRecords = createAsyncThunk(
  'sanitaryRecords/fetchRecords',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/sanitary-records');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al cargar registros sanitarios');
    }
  }
);

export const createRecord = createAsyncThunk(
  'sanitaryRecords/createRecord',
  async (recordData, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.post('/sanitary-records', recordData);
      
      // Auto-refresh animals and dashboard alerts
      // to keep dashboard stats in sync regarding quarantines.
      dispatch(fetchAnimals());
      dispatch(fetchDashboardAlerts());

      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al crear el registro sanitario');
    }
  }
);

export const deleteRecord = createAsyncThunk(
  'sanitaryRecords/deleteRecord',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await api.delete(`/sanitary-records/${id}`);
      
      // Re-fetch since deleting a record implicitly alters
      // the animal's dynamic status (e.g. from quarantine to healthy if it was the last record).
      dispatch(fetchAnimals());
      dispatch(fetchDashboardAlerts());
      
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al eliminar el registro sanitario');
    }
  }
);

const initialState = {
  records: [],
  loading: false,
  error: null,
};

const sanitaryRecordSlice = createSlice({
  name: 'sanitaryRecords',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchRecords.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecords.fulfilled, (state, action) => {
        state.loading = false;
        state.records = action.payload;
      })
      .addCase(fetchRecords.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create
      .addCase(createRecord.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createRecord.fulfilled, (state, action) => {
        state.loading = false;
        state.records.unshift(action.payload); // Add new record at the top
      })
      .addCase(createRecord.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete
      .addCase(deleteRecord.fulfilled, (state, action) => {
        state.records = state.records.filter(r => r.id !== action.payload);
      });
  },
});

export default sanitaryRecordSlice.reducer;
