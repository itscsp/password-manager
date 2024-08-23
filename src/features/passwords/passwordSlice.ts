import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Define the types
interface Password {
  id: string;
  name: string;
  url: string;
  username: string;
  note: string;
  password: string;
  created_at: string;
  updated_at: string;

  // Add other relevant fields
}

interface PasswordState {
  passwords: Password[];
  loading: boolean;
  error: string | null;
}

interface FetchPasswordsArgs {
  sessionToken: string;
  token: string;
}

interface FetchPasswordArgs extends FetchPasswordsArgs {
  passwordId: number;
}

const initialState: PasswordState = {
  passwords: [],
  loading: false,
  error: null,
};

export const fetchPasswords = createAsyncThunk(
  "passwords/fetchPasswords",
  async ({ sessionToken, token }: FetchPasswordsArgs, { rejectWithValue }) => {
    console.log(token);
    let twoValue = token + "||" + sessionToken;
    try {
      const response = await axios.get(
        "https://goldenrod-herring-662637.hostingersite.com/wp-json/password-manager/v1/get-passwords",
        {
          headers: {
            "x-session-token": twoValue,
          },
        }
      );

      return response.data; // Assumes response data is the array of passwords
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch passwords"
      );
    }
  }
);

export const fetchIndividualPassword = createAsyncThunk(
  "passwords/fetchPassword",
  async (
    { sessionToken, token, passwordId }: FetchPasswordArgs,
    { rejectWithValue }
  ) => {
    console.log(passwordId);
    let twoValue = token + "||" + sessionToken;

    try {
      const response = await axios.get(
        `https://goldenrod-herring-662637.hostingersite.com/wp-json/password-manager/v1/get-password/${passwordId}`,
        {
          headers: {
            "x-session-token": twoValue,
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

const passwordSlice = createSlice({
  name: "passwords",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
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
      });
  },
});

export default passwordSlice.reducer;
