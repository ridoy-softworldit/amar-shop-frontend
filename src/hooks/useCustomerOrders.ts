/* eslint-disable @typescript-eslint/no-explicit-any */
// src/hooks/useCustomerOrders.ts
import { useState, useEffect, useCallback, useRef } from "react";
import type { Order } from "@/types/order";

const API =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";

interface UseCustomerOrdersResult {
  orders: Order[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  currentPhone: string | null;
}

export function useCustomerOrders(): UseCustomerOrdersResult {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPhone, setCurrentPhone] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const phone = localStorage.getItem("customer_phone");
        setCurrentPhone(phone);
      }
    } catch (e) {
      // ignore localStorage read err
      setCurrentPhone(null);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    // cancel previous
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    if (!currentPhone) {
      setOrders([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const url = `${API}/customer/orders?phone=${encodeURIComponent(currentPhone)}&limit=50`;

      const res = await fetch(url, {
        credentials: "include",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        signal: ac.signal,
      });

      if (ac.signal.aborted) return;

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`Failed to load orders (${res.status}) ${txt}`);
      }

      const json = await res.json().catch(() => ({}));
      
      if (!json || json.ok === false) {
        throw new Error(json?.message || "Failed to load orders");
      }

      const ordersList: Order[] = Array.isArray(json?.data?.items)
        ? json.data.items
        : [];
      
      setOrders(ordersList);
    } catch (e: any) {
      if (e?.name === "AbortError") return;
      console.error("useCustomerOrders error:", e);
      setError(e?.message || "Failed to load your orders");
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentPhone]);

  useEffect(() => {
    fetchOrders();
    return () => abortRef.current?.abort();
  }, [fetchOrders]);

  return {
    orders,
    isLoading,
    error,
    refetch: fetchOrders,
    currentPhone,
  };
}
