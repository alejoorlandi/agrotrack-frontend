import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import animalReducer from './animalSlice';
import alertReducer from './alertSlice';
import medicineReducer from './medicineSlice';
import sanitaryRecordReducer from './sanitaryRecordSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    animals: animalReducer,
    alerts: alertReducer,
    medicines: medicineReducer,
    sanitaryRecords: sanitaryRecordReducer,
  },
});
