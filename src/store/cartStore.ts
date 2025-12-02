// src/store/cartStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Robust cart store:
 * - upsert behavior (increase qty if exists)
 * - clamps quantities
 * - prevents accidental duplicate adds if called repeatedly within short time window
 */

export interface CartItem {
  _id: string;
  title: string;
  brand?: string;
  manufacturer?: string;
  slug?: string;
  price: number;
  image?: string;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

const DUPLICATE_PROTECT_MS = 300; // ignore duplicate adds within 300ms per product

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => {
      // closure map to track recent add timestamps per product id
      const lastAddTs = new Map<string, number>();

      return {
        items: [],

        addItem: (newItem) => {
          try {
            // sanitize input
            if (!newItem || typeof newItem._id !== "string") return;
            const id = String(newItem._id);
            let qty = Number(newItem.quantity || 1);
            if (!Number.isFinite(qty) || qty < 1) qty = 1;

            // duplicate-click protection
            const now = Date.now();
            const last = lastAddTs.get(id) ?? 0;
            if (now - last < DUPLICATE_PROTECT_MS) {
              // ignore as likely duplicate quick-click
              return;
            }
            lastAddTs.set(id, now);

            set((state) => {
              const existing = state.items.find((i) => i._id === id);
              if (existing) {
                // clamp result to avoid negative/NaN
                const newQty = Math.max(1, (existing.quantity || 0) + qty);
                return {
                  items: state.items.map((i) =>
                    i._id === id ? { ...i, quantity: newQty } : i
                  ),
                };
              } else {
                const safeItem: CartItem = {
                  _id: id,
                  title: String(newItem.title || ""),
                  slug: newItem.slug,
                  price: Number(newItem.price || 0),
                  image: newItem.image,
                  quantity: qty,
                };
                return { items: [...state.items, safeItem] };
              }
            });
          } catch (err) {
            console.error("cartStore.addItem error", err);
          }
        },

        removeItem: (id) => {
          set((state) => ({ items: state.items.filter((i) => i._id !== id) }));
        },

        updateQuantity: (id, quantity) => {
          const q = Number(quantity || 0);
          if (!Number.isFinite(q)) return;
          if (q <= 0) {
            // remove if zero or negative
            set((state) => ({
              items: state.items.filter((i) => i._id !== id),
            }));
            return;
          }
          set((state) => ({
            items: state.items.map((i) =>
              i._id === id ? { ...i, quantity: Math.max(1, Math.floor(q)) } : i
            ),
          }));
        },

        clearCart: () => set({ items: [] }),

        getTotalPrice: () => {
          const s = get();
          return s.items.reduce(
            (acc, it) => acc + Number(it.price || 0) * (it.quantity || 0),
            0
          );
        },

        getTotalItems: () => {
          const s = get();
          return s.items.reduce((acc, it) => acc + (it.quantity || 0), 0);
        },
      };
    },
    { name: "cart-storage" }
  )
);
