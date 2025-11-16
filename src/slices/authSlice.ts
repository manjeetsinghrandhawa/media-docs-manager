import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define the shape of your auth state
interface AuthState {
  signupData: any;       // you can replace 'any' with a SignupData interface if you have one
  loading: boolean;
  token: string | null;
}

// Define the initial state
const initialState: AuthState = {
  signupData: null,
  loading: false,
  token: localStorage.getItem("token") ? JSON.parse(localStorage.getItem("token") as string) : null,
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
