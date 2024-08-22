import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Define the types
interface Password {
  id: string;
  name: string;
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

const initialState: PasswordState = {
  passwords: [],
  loading: false,
  error: null,
};

export const fetchPasswords = createAsyncThunk(
  "passwords/fetchPasswords",
  async ({ sessionToken, token }: FetchPasswordsArgs, { rejectWithValue }) => {
    console.log(token);
    let twoValue = token + "||" + sessionToken
    try {
      const response = await axios.get(
        "https://goldenrod-herring-662637.hostingersite.com/wp-json/password-manager/v1/get-passwords",
        {
          headers: {
            "X-Session-Token": twoValue,
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
      });
  },
});

export default passwordSlice.reducer;
