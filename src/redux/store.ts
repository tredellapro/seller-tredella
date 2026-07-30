import { configureStore, combineReducers } from '@reduxjs/toolkit';
import usersSlice from './slices/Admin/AdminsSlice';

const rootReducer = combineReducers({
  usersSlice: usersSlice
});

export const store = configureStore({
  reducer: rootReducer
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
