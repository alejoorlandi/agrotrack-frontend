import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

export const fetchMedicines = createAsyncThunk(
  'medicines/fetchMedicines',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/medicines');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al cargar medicamentos');
    }
  }
);

export const createMedicine = createAsyncThunk(
  'medicines/createMedicine',
  async (medicineData, { rejectWithValue }) => {
    try {
      const response = await api.post('/medicines', medicineData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al crear medicamento');
    }
  }
);

export const updateMedicine = createAsyncThunk(
  'medicines/updateMedicine',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/medicines/${id}`, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al actualizar medicamento');
    }
  }
);

export const deleteMedicine = createAsyncThunk(
  'medicines/deleteMedicine',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/medicines/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al eliminar medicamento');
    }
  }
);

const initialState = {
  medicines: [],
  loading: false,
  error: null,
};

const medicineSlice = createSlice({
  name: 'medicines',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchMedicines.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMedicines.fulfilled, (state, action) => {
        state.loading = false;
        state.medicines = action.payload;
      })
      .addCase(fetchMedicines.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create
      .addCase(createMedicine.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createMedicine.fulfilled, (state, action) => {
        state.loading = false;
        state.medicines.push(action.payload);
      })
      .addCase(createMedicine.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update
      .addCase(updateMedicine.fulfilled, (state, action) => {
        const index = state.medicines.findIndex(m => m.id === action.payload.id);
        if (index !== -1) {
          state.medicines[index] = action.payload;
        }
      })
      // Delete
      .addCase(deleteMedicine.fulfilled, (state, action) => {
        state.medicines = state.medicines.filter(m => m.id !== action.payload);
      });
  },
});

export default medicineSlice.reducer;
