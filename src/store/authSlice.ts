import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { User, AuthState } from "@/types/auth";

const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isHydrated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuth(state, action: PayloadAction<{ user: User; token: string; refreshToken?: string }>) {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken || null;
      state.isHydrated = true;
      if (typeof window !== "undefined") {
        localStorage.setItem("accessToken", action.payload.token);
        localStorage.setItem("user", JSON.stringify(action.payload.user));
        if (action.payload.refreshToken) {
          localStorage.setItem("refreshToken", action.payload.refreshToken);
        }
      }
    },
    setToken(state, action: PayloadAction<string | null>) {
      state.token = action.payload;
      state.isHydrated = true;
      if (typeof window !== "undefined") {
        if (action.payload) {
          localStorage.setItem("accessToken", action.payload);
        } else {
          localStorage.removeItem("accessToken");
        }
      }
    },
    setUser(state, action: PayloadAction<User | null>) {
      state.user = action.payload;
      if (typeof window !== "undefined") {
        if (action.payload) {
          localStorage.setItem("user", JSON.stringify(action.payload));
        } else {
          localStorage.removeItem("user");
        }
      }
    },
    hydrateFromStorage(state) {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("accessToken");
        const refreshToken = localStorage.getItem("refreshToken");
        const userStr = localStorage.getItem("user");
        state.token = token;
        state.refreshToken = refreshToken;
        state.user = userStr ? JSON.parse(userStr) : null;
      }
      state.isHydrated = true;
    },
    logout(state) {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isHydrated = true;
      if (typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        localStorage.removeItem("customer_phone");
        localStorage.removeItem("checkout_customer");
        localStorage.removeItem("order_customer");
        localStorage.removeItem("customer");
        localStorage.removeItem("shipping_info");
      }
    },
  },
});

export const { setAuth, setToken, setUser, hydrateFromStorage, logout } = authSlice.actions;
export const authReducer = authSlice.reducer;

// Selectors
export const selectUser = (root: { auth: AuthState }) => root.auth.user;
export const selectToken = (root: { auth: AuthState }) => root.auth.token;
export const selectIsAuthed = (root: { auth: AuthState }) => Boolean(root.auth.token && root.auth.user);
export const selectIsAuthHydrated = (root: { auth: AuthState }) => root.auth.isHydrated;