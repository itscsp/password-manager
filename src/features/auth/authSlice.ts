import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

interface AuthState {
  loading: boolean;
  error: string | null;
  isLoggedIn: boolean;
  username: string | null;
  firstName: string | null;
  sessionToken: string | null;
  isEmailVerified?: boolean;
  remainingTime: number; // Added remaining time state
}

const initialState: AuthState = {
  loading: false,
  error: null,
  isLoggedIn: false,
  username: null,
  firstName: null,
  sessionToken: null,
  isEmailVerified: false,
  remainingTime: 10 * 60, // 10 minutes in seconds
};

interface sessionValues {
  sessionToken: string;
}

const api_root_url = import.meta.env.VITE_BASE_API_URL

export const logout = createAsyncThunk(
  "auth/logout",
  async ({ sessionToken }: sessionValues, { rejectWithValue }) => {
    console.log("Logging out...");

    try {
      const response = await axios.post(
        `${api_root_url}/logout`,
        {}, // Empty object if there's no request body
        {
          headers: {
            "x-session-token": sessionToken,
          },
        }
      );

      return response.data; // Assumes response data is the array of passwords
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Logout failed");
    }
  }
);
// Async thunk to handle login
export const login = createAsyncThunk(
  "auth/login",
  async (
    {
      username,
      master_password,
      encryptedData,
    }: { username: string; master_password: string; encryptedData: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post(
        `${api_root_url}/login`,
        {
          username,
          master_password,
        }
      );

      const { username: user, first_name, token } = response.data;
      const sessionToken = token + "||" + encryptedData;
      return { user, first_name, sessionToken };
    } catch (error: any) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

// Async thunk to start registration (send email)
export const startRegistration = createAsyncThunk(
  "auth/startRegistration",
  async (email: string, { rejectWithValue }) => {
    try {
      await axios.post(
        `${api_root_url}/start-registration`,
        {
          email,
        }
      );
      return "Verification email sent";
    } catch (error: any) {
      return rejectWithValue("Failed to send verification email");
    }
  }
);

// Async thunk to verify email token
export const verifyEmailToken = createAsyncThunk(
  "auth/verifyEmailToken",
  async (
    { email, token }: { email: string; token: string },
    { rejectWithValue }
  ) => {
    try {
      await axios.get(
        `${api_root_url}/verify-email`,
        {
          params: { email, token },
        }
      );
      return "Email verified";
    } catch (error: any) {
      return rejectWithValue("Invalid verification token");
    }
  }
);

// Async thunk to complete registration
export const completeRegistration = createAsyncThunk(
  "auth/completeRegistration",
  async (
    {
      email,
      token,
      name,
      master_password,
      confirm_master_password,
    }: {
      email: string;
      token: string;
      name: string;
      master_password: string;
      confirm_master_password: string;
    },
    { rejectWithValue }
  ) => {
    try {
      await axios.post(
        `${api_root_url}/complete-registration`,
        {
          email,
          token,
          name,
          master_password,
          confirm_master_password,
        }
      );
      return "Registration completed";
    } catch (error: any) {
      return rejectWithValue("Failed to complete registration");
    }
  }
);

export const restoreSession = createAsyncThunk(
  "auth/restoreSession",
  async (_, { rejectWithValue }) => {
    try {
      const sessionToken = sessionStorage.getItem("sessionToken");
      const username = sessionStorage.getItem("username");
      const firstName = sessionStorage.getItem("firstName");
      const lastActive = sessionStorage.getItem("lastActive");

      if (!sessionToken || !username || !firstName || !lastActive) {
        return rejectWithValue("Incomplete session data.");
      }

      const lastActiveTime = parseInt(lastActive, 10);
      if (isNaN(lastActiveTime)) {
        return rejectWithValue("Invalid last active time.");
      }

      const currentTime = Date.now();
      if (currentTime - lastActiveTime >= 10 * 60 * 1000) {
        sessionStorage.clear();
        return rejectWithValue("Session has expired.");
      }

      const response = await axios.get(
        `${api_root_url}/check-session`,
        {
          headers: {
            "x-session-token": sessionToken,
          },
        }
      );

      if (response.data) {
        return { status: "valid", username, firstName, sessionToken };
      } else {
        sessionStorage.clear();
        return rejectWithValue("Invalid session.");
      }
    } catch (error: any) {
      sessionStorage.clear();
      return rejectWithValue("Failed to restore session: " + error.message);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    logout: (state) => {
      state.loading = false;
      state.isLoggedIn = false;
      state.username = null;
      state.firstName = null;
      state.sessionToken = null;
      sessionStorage.clear();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(startRegistration.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(startRegistration.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(startRegistration.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(verifyEmailToken.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyEmailToken.fulfilled, (state) => {
        state.loading = false;
        state.isEmailVerified = true;
      })
      .addCase(verifyEmailToken.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(completeRegistration.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(completeRegistration.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(completeRegistration.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isLoggedIn = true;
        state.username = action.payload.user;
        state.firstName = action.payload.first_name;
        state.sessionToken = action.payload.sessionToken;

        sessionStorage.setItem("username", action.payload.user);
        sessionStorage.setItem("firstName", action.payload.first_name);
        sessionStorage.setItem("sessionToken", action.payload.sessionToken);
        sessionStorage.setItem("lastActive", new Date().getTime().toString());
        // debugger
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(logout.pending, (state) => {
        state.loading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        sessionStorage.clear();
        state.loading = false;
        state.isLoggedIn = false;
        state.username = null;
        state.firstName = null;
        state.sessionToken = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(restoreSession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.loading = false;
        state.isLoggedIn = true;
        state.username = action.payload.username;
        state.firstName = action.payload.firstName;
        state.sessionToken = action.payload.sessionToken;
        state.error = null;
      })
      .addCase(restoreSession.rejected, (state, action) => {
        state.loading = false;
        state.isLoggedIn = false;
        state.username = null;
        state.firstName = null;
        state.sessionToken = null;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
