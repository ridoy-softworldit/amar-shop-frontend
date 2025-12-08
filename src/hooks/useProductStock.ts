// frontend/src/hooks/useProductStock.ts
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/store";
import { applyLocalDelta } from "@/store/productStockSlice";
import { useConfirmOrderMutation } from "@/services/catalog.api"; // existing mutation to create order
import { useCallback } from "react";

/**
 * useProductStock
 * - returns effectiveStock = product.stock + localDelta
 * - provides localReserve(productId, qty) to immediately reserve in UI
 */
export function useProductStock() {
  const deltas = useSelector((s: RootState) => s.productStock.deltas);
  const dispatch = useDispatch();
  const [confirmOrder] = useConfirmOrderMutation();

  const getEffective = useCallback(
    (product: { _id: string; stock?: number }) => {
      const base = typeof product.stock === "number" ? product.stock : 0;
      const delta = deltas[product._id] || 0;
      return Math.max(0, base + delta);
    },
    [deltas]
  );

  // reserve locally (e.g., Add to Bag)
  const localReserve = useCallback(
    (id: string, qty = 1) => {
      dispatch(applyLocalDelta({ id, delta: -qty }));
    },
    [dispatch]
  );

  // rollback local reserve
  const localRollback = useCallback(
    (id: string, qty = 1) => {
      dispatch(applyLocalDelta({ id, delta: +qty }));
    },
    [dispatch]
  );

  // on checkout: call confirmOrder (or call stock API). Example usage:
  const placeOrder = async (payload: {
    items: Array<{ _id: string; quantity: number }>;
  }) => {
    // optimistic UI already reserved via localReserve before calling this
    try {
      const res = await confirmOrder(payload).unwrap();
      // server will invalidate product list via RTK Query (already configured)
      return res;
    } catch (err) {
      // on error you must rollback local deltas for each item
      for (const it of payload.items) {
        dispatch(applyLocalDelta({ id: it._id, delta: +it.quantity }));
      }
      throw err;
    }
  };

  return { getEffective, localReserve, localRollback, placeOrder };
}
