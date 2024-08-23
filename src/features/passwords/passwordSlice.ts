import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Define the types
interface Password {
  id?: string;
  name?: string;
  url: string;
  username: string;
  note?: string;
  password: string;
  created_at?: string;
  updated_at?: string;
  // Add other relevant fields
}

interface PasswordState {
  passwords: Password[];
  loading: boolean;
  error: string | null;
}

interface FetchPasswordsArgs {
  sessionToken: string | null;
}

interface AddPasswordArgs extends FetchPasswordsArgs {
  passwordData: Password;
}

interface FetchPasswordArgs extends FetchPasswordsArgs {
  passwordId: number; // Assuming ID is a string
}

const initialState: PasswordState = {
  passwords: [],
  loading: false,
  error: null,
};

// Fetch all passwords
export const fetchPasswords = createAsyncThunk(
  "passwords/fetchPasswords",
  async ({ sessionToken }: FetchPasswordsArgs, { rejectWithValue }) => {
    try {
      const response = await axios.get<Password[]>(
        "https://goldenrod-herring-662637.hostingersite.com/wp-json/password-manager/v1/get-passwords",
        {
          headers: {
            "x-session-token": sessionToken,
          },
        }
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch passwords"
      );
    }
  }
);

// Fetch a single password
export const fetchIndividualPassword = createAsyncThunk(
  "passwords/fetchPassword",
  async (
    { sessionToken, passwordId }: FetchPasswordArgs,
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.get<Password>(
        `https://goldenrod-herring-662637.hostingersite.com/wp-json/password-manager/v1/get-password/${passwordId}`,
        {
          headers: {
            "x-session-token": sessionToken,
          },
        }
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch password"
      );
    }
  }
);

// Add a new password
export const addPassword = createAsyncThunk(
  "passwords/add",
  async (
    { sessionToken, passwordData }: AddPasswordArgs,
    { rejectWithValue }
  ) => {

    console.log(passwordData);

    // Create FormData object
    const formData = new FormData();
    formData.append("username", passwordData.username);
    formData.append("password", passwordData.password);
    formData.append("url", passwordData.url);
    formData.append("note", passwordData.note ? passwordData.note : "");

    try {
      const response = await axios.post<Password>(
        "https://goldenrod-herring-662637.hostingersite.com/wp-json/password-manager/v1/add-password",
        formData,
        {
          headers: {
            "x-session-token": sessionToken,
            "Content-Type": "multipart/form-data", // Ensure this header is set
          },
        }
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add password"
      );
    }
  }
);

const passwordSlice = createSlice({
  name: "passwords",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPasswords.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPasswords.fulfilled, (state, action) => {
        state.loading = false;
        state.passwords = action.payload;
      })
      .addCase(fetchPasswords.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchIndividualPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchIndividualPassword.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.passwords.findIndex(
          (p) => p.id === action.payload.id
        );
        if (index !== -1) {
          state.passwords[index] = action.payload;
        } else {
          state.passwords.push(action.payload);
        }
      })
      .addCase(fetchIndividualPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(addPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.passwords.push(action.payload);
      })
      .addCase(addPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default passwordSlice.reducer;
