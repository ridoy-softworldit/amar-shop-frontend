// src/store/productStockSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type StockState = {
  // productId -> local delta applied (negative if reserved locally)
  deltas: Record<string, number>;
};

const initialState: StockState = { deltas: {} };

const slice = createSlice({
  name: "productStock",
  initialState,
  reducers: {
    applyLocalDelta(
      state,
      action: PayloadAction<{ id: string; delta: number }>
    ) {
      const { id, delta } = action.payload;
      state.deltas[id] = (state.deltas[id] || 0) + delta;
      // keep small deltas only
      if (state.deltas[id] === 0) delete state.deltas[id];
    },
    setLocalDelta(state, action: PayloadAction<{ id: string; value: number }>) {
      const { id, value } = action.payload;
      if (value === 0) delete state.deltas[id];
      else state.deltas[id] = value;
    },
    clearLocalDelta(state, action: PayloadAction<{ id: string }>) {
      delete state.deltas[action.payload.id];
    },
    clearAll(state) {
      state.deltas = {};
    },
  },
});

export const { applyLocalDelta, setLocalDelta, clearLocalDelta, clearAll } =
  slice.actions;
export default slice.reducer;
