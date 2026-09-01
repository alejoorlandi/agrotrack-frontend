import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

export const fetchAnimals = createAsyncThunk(
  'animals/fetchAnimals',
  async (statusFilter = null, { rejectWithValue }) => {
    try {
      const url = statusFilter ? `/animals?status=${statusFilter}` : '/animals';
      const response = await api.get(url);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'No se pudieron cargar los animales');
    }
  }
);

export const updateAnimal = createAsyncThunk(
  'animals/updateAnimal',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/animals/${id}`, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al actualizar animal');
    }
  }
);

export const deleteAnimal = createAsyncThunk(
  'animals/deleteAnimal',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/animals/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al eliminar animal');
    }
  }
);

const initialState = {
  animals: [],
  stats: {
    total: 0,
    healthy: 0,
    in_treatment: 0,
    quarantine: 0
  },
  loading: false,
  error: null,
};

const animalSlice = createSlice({
  name: 'animals',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnimals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAnimals.fulfilled, (state, action) => {
        state.loading = false;
        state.animals = action.payload;
        
        // Calculate stats
        state.stats = {
          total: action.payload.length,
          healthy: action.payload.filter(a => a.status === 'healthy').length,
          in_treatment: action.payload.filter(a => a.is_in_treatment || a.status === 'in_treatment').length,
          quarantine: action.payload.filter(a => a.is_in_quarantine || a.status === 'quarantine').length,
        };
      })
      .addCase(fetchAnimals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update
      .addCase(updateAnimal.fulfilled, (state, action) => {
        const index = state.animals.findIndex(a => a.id === action.payload.id);
        if (index !== -1) {
          state.animals[index] = action.payload;
        }
      })
      // Delete
      .addCase(deleteAnimal.fulfilled, (state, action) => {
        state.animals = state.animals.filter(a => a.id !== action.payload);
      });
  },
});

export default animalSlice.reducer;
