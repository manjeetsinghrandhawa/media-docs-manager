import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define the shape of your auth state
interface AuthState {
  signupData: any;       // you can replace 'any' with a SignupData interface if you have one
  loading: boolean;
  token: string | null;
}

const getStoredToken = (): string | null => {
  const storedToken = localStorage.getItem("token");

  if (!storedToken) {
    return null;
  }

  // Supports both legacy JSON-stringified tokens and raw JWT strings.
  try {
    const parsed = JSON.parse(storedToken);
    return typeof parsed === "string" ? parsed : storedToken;
  } catch {
    return storedToken;
  }
};

// Define the initial state
const initialState: AuthState = {
  signupData: null,
  loading: false,
  token: getStoredToken(),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setSignupData(state, action: PayloadAction<any>) {
      state.signupData = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setToken(state, action: PayloadAction<string | null>) {
      state.token = action.payload;
    },
  },
});

export const { setSignupData, setLoading, setToken } = authSlice.actions;

export default authSlice.reducer;
