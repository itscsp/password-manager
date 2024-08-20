import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

interface AuthState {
  loading: boolean;
  error: string | null;
  isLoggedIn: boolean;
  username: string | null;
  firstName: string | null;
  token: string | null;
  sessionToken: string | null;
  isEmailVerified?: boolean;
}

const initialState: AuthState = {
  loading: false,
  error: null,
  isLoggedIn: false,
  username: null,
  firstName: null,
  token: null,
  sessionToken: null,
  isEmailVerified: false,
};

export const logout = createAsyncThunk<void, void, {}>(
  "auth/logout",
  async () => {
    console.log("Logging out...");
    // Perform logout operations here, such as API calls or clearing storage
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
      const response = await axios.post("https://goldenrod-herring-662637.hostingersite.com/wp-json/password-manager/v1/login", {
        username,
        master_password,
      });
      const sessionToken = encryptedData;
      const { username: user, first_name, token } = response.data;
      return { user, first_name, token, sessionToken };

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
      await axios.post("https://goldenrod-herring-662637.hostingersite.com/wp-json/password-manager/v1/start-registration", {
        email,
      });
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
      await axios.get("https://goldenrod-herring-662637.hostingersite.com/wp-json/password-manager/v1/verify-email", {
        params: { email, token },
      });
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
      await axios.post("https://goldenrod-herring-662637.hostingersite.com/wp-json/password-manager/v1/complete-registration", {
        email,
        token,
        name,
        master_password,
        confirm_master_password,
      });
      return "Registration completed";
    } catch (error: any) {
      return rejectWithValue("Failed to complete registration");
    }
  }
);

// Async thunk to restore session
export const restoreSession = createAsyncThunk(
  "auth/restoreSession",
  async (
    userData: {
      username: string;
      firstName: string;
      token: string;
      sessionToken: string | null;
    },
    { rejectWithValue }
  ) => {
    try {
      // Optionally, you can validate or refresh the session here
      return userData;
    } catch (error: any) {
      return rejectWithValue("Failed to restore session");
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
        state.token = action.payload.token;
        state.token = action.payload.sessionToken;

        // Store session data in session storage
        sessionStorage.setItem("username", action.payload.user);
        sessionStorage.setItem("firstName", action.payload.first_name);
        sessionStorage.setItem("token", action.payload.token);
        sessionStorage.setItem("sessionToken", action.payload.sessionToken);

        sessionStorage.setItem("lastActive", new Date().getTime().toString());
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.isLoggedIn = true;
        state.username = action.payload.username;
        state.firstName = action.payload.firstName;
        state.token = action.payload.token;
        state.sessionToken = action.payload.sessionToken;

        // Optionally, store session data in state or local storage
      })
      .addCase(logout.pending, (state) => {
        state.loading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        sessionStorage.removeItem("username");
        sessionStorage.removeItem("firstName");
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("sessionToken");
        sessionStorage.removeItem("lastActive");

        state.loading = false;
        state.isLoggedIn = false;
        state.username = null;
        state.firstName = null;
        state.token = null;
        state.sessionToken = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
