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

export const logout = createAsyncThunk(
  "auth/logout",
  async ({ sessionToken }: sessionValues, { rejectWithValue }) => {
    console.log("Logging out...");

    try {
      const response = await axios.post(
        "https://goldenrod-herring-662637.hostingersite.com/wp-json/password-manager/v1/logout",
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
        "https://goldenrod-herring-662637.hostingersite.com/wp-json/password-manager/v1/login",
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
        "https://goldenrod-herring-662637.hostingersite.com/wp-json/password-manager/v1/start-registration",
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
        "https://goldenrod-herring-662637.hostingersite.com/wp-json/password-manager/v1/verify-email",
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
        "https://goldenrod-herring-662637.hostingersite.com/wp-json/password-manager/v1/complete-registration",
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

// Async thunk to restore session
export const restoreSession = createAsyncThunk(
  "auth/restoreSession",
  async (
    userData: {
      username: string;
      firstName: string;
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

// Timer function to update remaining time
let timerInterval: NodeJS.Timeout;


const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    decrementTime: (state) => {
      if (state.remainingTime > 0) {
        state.remainingTime -= 1;
        console.log("Remaining time:", state.remainingTime, "seconds");
      } else {
        clearInterval(timerInterval);
      }
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

      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(restoreSession.fulfilled, (state, action) => {
        console.log("I am in restore session");

        const username = sessionStorage.getItem("username");
        const firstName = sessionStorage.getItem("firstName");
        const lastActive = sessionStorage.getItem("lastActive");
        const sessionToken = sessionStorage.getItem("sessionToken");

        const currentTime = new Date().getTime();

        if (username && firstName && lastActive && sessionToken) {
          if (currentTime - parseInt(lastActive) < 10 * 60 * 1000) {
            // User is still active
            state.isLoggedIn = action.payload.sessionToken ? true : false;
            state.username = action.payload.username;
            state.firstName = action.payload.firstName;
            state.sessionToken = action.payload.sessionToken;
          } else {
            sessionStorage.clear(); // Clear session if inactive for more than 10 minutes
            sessionStorage.removeItem("username");
            sessionStorage.removeItem("firstName");
            sessionStorage.removeItem("sessionToken");
            sessionStorage.removeItem("lastActive");

            state.loading = false;
            state.isLoggedIn = false;
            state.username = null;
            state.firstName = null;
            state.sessionToken = null;
          }
          console.log("I am in restore session state:", state);
        }
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
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
