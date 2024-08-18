import {
  User,
  AuthState,
  LoginCredentials,
  RegisterData,
  AuthResponse,
} from "./authTypes";

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Initial State
const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  error: null,
};

// Async Thunks
export const login = createAsyncThunk<AuthResponse, LoginCredentials>(
  "auth/login",
  async (credentials) => {
    const response = await apiClient.post("/auth/login", credentials);
    return response.data;
  }
);

export const register = createAsyncThunk<AuthResponse, RegisterData>(
  "auth/register",
  async (userData) => {
    const response = await apiClient.post("/auth/register", userData);
    return response.data;
  }
);

// Auth Slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        login.fulfilled,
        (state, action: PayloadAction<AuthResponse>) => {
          state.loading = false;
          state.user = action.payload.user;
          state.token = action.payload.token;
          // Save token in local storage or cookie
        }
      )
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to login";
      })
      .addCase(
        register.fulfilled,
        (state, action: PayloadAction<AuthResponse>) => {
          state.user = action.payload.user;
          state.token = action.payload.token;
        }
      );
  },
});

// Export the logout action and the reducer
export const { logout } = authSlice.actions;
export default authSlice.reducer;
