// src/store/index.ts
import { configureStore } from "@reduxjs/toolkit";
import { catalogApi } from "@/services/catalog.api";
import productStockReducer from "./productStockSlice";
import { authReducer } from "./authSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [catalogApi.reducerPath]: catalogApi.reducer,
    productStock: productStockReducer,
  },
  middleware: (getDefault) => getDefault().concat(catalogApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
