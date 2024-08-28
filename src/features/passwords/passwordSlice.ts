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
  message: string | null;
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

interface UpdatePasswordArgs extends FetchPasswordsArgs {
  passwordId: number;
  passwordData: Partial<Password>;
}

const initialState: PasswordState = {
  passwords: [],
  message: null,
  loading: false,
  error: null,
};

const api_root_url = import.meta.env.VITE_BASE_API_URL


// Fetch all passwords
export const fetchPasswords = createAsyncThunk(
  "passwords/fetchPasswords",
  async ({ sessionToken }: FetchPasswordsArgs, { rejectWithValue }) => {
    try {
      const response = await axios.get<Password[]>(
        `${api_root_url}/get-passwords`,
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
        `${api_root_url}/get-password/${passwordId}`,
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

    console.log(formData)

    try {
      const response = await axios.post<Password>(
        `${api_root_url}/add-password`,
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

// Delete password
export const deletePassword = createAsyncThunk(
  "passwords/delete",
  async (
    { sessionToken, passwordId }: FetchPasswordArgs,
    { rejectWithValue }
  ) => {
    try {
      console.log(sessionToken, passwordId);

      // API call
      const response = await axios.delete(
        `${api_root_url}/delete-password/${passwordId}`,
        {
          headers: {
            "x-session-token": sessionToken,
          },
        }
      );

      return { passwordId, message: response.data.message };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete password"
      );
    }
  }
);

export const updatePassword = createAsyncThunk(
  "passwords/update",
  async (
    { sessionToken, passwordId, passwordData }: UpdatePasswordArgs,
    { rejectWithValue }
  ) => {
    console.log("Updating Password ID:", passwordId);
    console.log("Password Data:", passwordData);

    try {
      const response = await axios.put<Password>(
        `${api_root_url}/update-password/${passwordId}`,
        passwordData,
        {
          headers: {
            "x-session-token": sessionToken,
            "Content-Type": "application/json", 
          },
        }
      );
      return response.data;
    } catch (error: any) {
      console.error("Error updating password:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to update password"
      );
    }
  }
);



const passwordSlice = createSlice({
  name: "passwords",
  initialState,
  reducers: {
  },
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
      .addCase(deletePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePassword.fulfilled, (state, action) => {
        state.loading = false;
        console.log(action);
        console.log(state);

        const index = state.passwords.findIndex(
          (p) => Number(p.id) === Number(action.payload.passwordId)
        );
        if (index !== -1) {
          state.passwords.splice(index, 1); // Remove the password from the array
        }

        state.message = action.payload.message;
      })
      .addCase(deletePassword.rejected, (state, action) => {
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
      })
      .addCase(updatePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePassword.fulfilled, (state, action) => {
        state.loading = false;
        state.passwords.push(action.payload);
        state.message = "Password updated successfully";
      })
      .addCase(updatePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default passwordSlice.reducer;
