/* eslint-disable @typescript-eslint/no-explicit-any */
// app/my-orders/page.tsx - IMPROVED
"use client";

import { useState, useCallback, useEffect } from "react";
import {
  AlertCircle,
  Search,
  Sparkles,
  Package,
  RefreshCw,
  Phone,
  User,
  LogIn,
  CheckCircle,
} from "lucide-react";
import OrderCard from "@/components/orders/OrderCard";
import { useCustomerOrders } from "@/hooks/useCustomerOrders";
import type { Order, OrderStatus } from "@/types/order";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export default function MyOrdersPage() {
  const { isAuthed, user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "">("");
  const { orders, isLoading, error, refetch, currentPhone } =
    useCustomerOrders();
  const [renderKey, setRenderKey] = useState(0);

  // local state for invoice checks
  const [invoiceCache, setInvoiceCache] = useState<Record<string, any | null>>(
    {}
  );
  const [loadingInvoice, setLoadingInvoice] = useState<Record<string, boolean>>(
    {}
  );

  // ✅ FORCE REFRESH FUNCTION
  const handleForceRefresh = async () => {
    console.log("🔄 Manual refresh triggered");
    await refetch();
    setRenderKey((prev) => prev + 1);
  };

  const fetchInvoiceForOrder = useCallback(
    async (orderId: string) => {
      if (invoiceCache[orderId] !== undefined) return invoiceCache[orderId];

      setLoadingInvoice((s) => ({ ...s, [orderId]: true }));
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/invoices/by-order/${orderId}`
        );

        if (res.status === 404) {
          setInvoiceCache((s) => ({ ...s, [orderId]: null }));
          return null;
        }

        if (!res.ok) throw new Error(`Server ${res.status}`);

        const invoice = await res.json();
        setInvoiceCache((s) => ({ ...s, [orderId]: invoice }));
        return invoice;
      } catch (err) {
        console.error("fetchInvoiceForOrder", err);
        setInvoiceCache((s) => ({ ...s, [orderId]: null }));
        return null;
      } finally {
        setLoadingInvoice((s) => ({ ...s, [orderId]: false }));
      }
    },
    [invoiceCache]
  );

  const handleOpenInvoice = async (order: Order) => {
    // Always use guest invoice page for all users
    window.location.href = `/invoices/guest/${order._id}`;
  };

  // Filtering - Only show user's orders
  // const filteredOrders = orders.filter((order) => {
  //   // ✅ ENSURE ORDER BELONGS TO CURRENT USER
  //   const belongsToUser = order.customer?.phone === currentPhone;

  //   const matchesSearch = searchTerm
  //     ? order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //       (order.customer?.name ?? "")
  //         .toLowerCase()
  //         .includes(searchTerm.toLowerCase())
  //     : true;

  //   const matchesStatus = statusFilter ? order.status === statusFilter : true;

  //   return belongsToUser && matchesSearch && matchesStatus;
  // });

  const filteredOrders = orders.filter((order) => {
    // ✅ SIMPLE FILTERING - Backend should return only user's orders
    const matchesSearch = searchTerm
      ? order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.customer?.name ?? "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      : true;

    const matchesStatus = statusFilter ? order.status === statusFilter : true;

    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-[#167389] border-t-transparent rounded-full mb-4" />
        <p className="text-gray-600">Loading your orders...</p>
        {currentPhone && (
          <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
            <Phone className="w-4 h-4" />
            <span>{currentPhone}</span>
          </div>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <p className="text-gray-700 mb-4">{error}</p>
        <button
          onClick={handleForceRefresh}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#167389] text-white rounded-lg hover:bg-[#145a65]"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
        {!currentPhone && (
          <div className="mt-6">
            <p className="text-gray-600 mb-4">
              You need to place an order first to view order history
            </p>
            <Link
              href="/products"
              className="inline-block bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-all"
            >
              Start Shopping
            </Link>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-20 sm:py-8">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6">
        {/* Header */}
        <div className="text-center mb-3 sm:mb-8">
          <div className="flex items-center justify-center gap-2 mb-2 sm:mb-4">
            <div className="p-2 sm:p-3 bg-[#167389] rounded-xl sm:rounded-2xl">
              <Sparkles className="w-5 h-5 sm:w-8 sm:h-8 text-white" />
            </div>
            <h1 className="text-xl sm:text-4xl lg:text-5xl font-bold text-[#167389]">
              My Orders
            </h1>
          </div>

          {/* User Status Info */}
          {isAuthed && user ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-2 sm:p-4 max-w-md mx-auto mb-2 sm:mb-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1 sm:p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs sm:text-sm text-green-600">Logged in as</p>
                    <p className="text-sm sm:text-base font-semibold text-green-800">{user.name}</p>
                    <p className="text-[10px] sm:text-xs text-green-600">{user.email || user.phone}</p>
                  </div>
                </div>
                <button
                  onClick={handleForceRefresh}
                  disabled={isLoading}
                  className="inline-flex items-center gap-1 px-2 py-1 border-2 border-green-600 bg-white text-green-600 rounded-lg hover:bg-green-50 disabled:opacity-50 text-xs whitespace-nowrap font-semibold"
                >
                  <span>{isLoading ? "Refreshing..." : "Refresh"}</span>
                  <RefreshCw
                    className={`w-3 h-3 ${isLoading ? "animate-spin" : ""}`}
                  />
                </button>
              </div>
            </div>
          ) : currentPhone ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 sm:p-4 max-w-md mx-auto mb-2 sm:mb-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1 sm:p-2 bg-blue-100 rounded-lg">
                    <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs sm:text-sm text-blue-600">Tracking orders for</p>
                    <p className="text-sm sm:text-base font-semibold text-blue-800">{currentPhone}</p>
                  </div>
                </div>
                <button
                  onClick={handleForceRefresh}
                  disabled={isLoading}
                  className="inline-flex items-center gap-1 px-2 py-1 border-2 border-green-600 bg-white text-green-600 rounded-lg hover:bg-green-50 disabled:opacity-50 text-xs whitespace-nowrap font-semibold"
                >
                  <span>{isLoading ? "Refreshing..." : "Refresh"}</span>
                  <RefreshCw
                    className={`w-3 h-3 ${isLoading ? "animate-spin" : ""}`}
                  />
                </button>
              </div>
            </div>
          ) : null}

          {/* Guest Sign-in Prompt */}
          {!isAuthed && (
            <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 rounded-lg p-2 sm:p-4 max-w-2xl mx-auto mb-2 sm:mb-4">
              <div className="flex items-start gap-2 sm:gap-3">
                <LogIn className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs sm:text-sm font-semibold text-gray-800 mb-1">
                    Want to see all your orders in one place?
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-600 mb-1 sm:mb-2 hidden sm:block">
                    Sign in to automatically track all orders linked to your account
                  </p>
                  <Link
                    href="/login?redirect=/orders"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-600 hover:text-cyan-700"
                  >
                    Sign in now →
                  </Link>
                </div>
              </div>
            </div>
          )}

          <p className="text-sm sm:text-lg lg:text-xl text-gray-700 max-w-2xl mx-auto mb-2 sm:mb-4 hidden sm:block">
            Your personal order history
          </p>
        </div>

        {/* Search and Filter */}
        {orders.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 shadow-md p-2 sm:p-4 lg:p-6 mb-3 sm:mb-6 lg:mb-8">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#167389] focus:border-[#167389] text-gray-700 text-xs"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as OrderStatus | "")
                }
                className="px-2 py-2 border rounded-lg focus:ring-2 focus:ring-[#167389] text-gray-700 text-xs"
              >
                <option value="">All</option>
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">Processing</option>
                <option value="IN_SHIPPING">Shipping</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>
        )}

        {/* Orders List */}
        <div className="space-y-6" key={renderKey}>
          {filteredOrders.length > 0 ? (
            <>
              <div className="text-sm text-gray-600">
                Showing {filteredOrders.length} of {orders.length} orders
              </div>

              {filteredOrders.map((order: Order) => (
                <OrderCard 
                  key={order._id} 
                  order={order} 
                  onViewInvoice={handleOpenInvoice}
                />
              ))}
            </>
          ) : (
            <div className="text-center py-20">
              <Package className="w-20 h-20 text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                {orders.length === 0 ? "No Orders Found" : "No Matching Orders"}
              </h3>
              <p className="text-gray-600 mb-6">
                {orders.length === 0
                  ? currentPhone
                    ? "You haven't placed any orders with this phone number yet."
                    : "Please place an order first to view your order history."
                  : "No orders match your search criteria."}
              </p>
              {orders.length === 0 && !currentPhone && (
                <Link
                  href="/products"
                  className="inline-block bg-[#167389] text-white px-6 py-3 rounded-xl hover:bg-[#125f70] transition-all"
                >
                  Start Shopping
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
