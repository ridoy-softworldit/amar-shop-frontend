"use client";

import { useState } from "react";
import {
  Package,
  Eye,
  EyeOff,
  Calendar,
  DollarSign,
  ShoppingBag,
  Truck,
} from "lucide-react";
import StatusBadge from "./StatusBadge";
import CustomerInfo from "./CustomerInfo";
import OrderItemsList from "./OrderItemsList";
import OrderSummary from "./OrderSummary";
import type { Order } from "@/types/order";

export default function OrderCard({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-pink-100 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm bg-opacity-95">
      <div className="p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-col xs:flex-row xs:items-center gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#167389] rounded-lg">
                  <Package className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 truncate">
                  Order #{order._id.slice(-8)}
                </h3>
              </div>
              <StatusBadge status={order.status} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 text-sm">
              <div className="flex items-center gap-2 text-gray-700 bg-gray-50 px-3 py-2 rounded-lg">
                <Calendar className="w-4 h-4 text-black shrink-0" />
                <span className="font-medium truncate">
                  {new Date(order.createdAt ?? "").toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-700 bg-gray-50 px-3 py-2 rounded-lg">
                <ShoppingBag className="w-4 h-4 text-pink-500 shrink-0" />
                <span className="font-medium">
                  {order.lines.length} item{order.lines.length > 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-700 bg-gray-50 px-3 py-2 rounded-lg">
                <DollarSign className="w-4 h-4 text-pink-500 shrink-0" />
                <span className="font-medium">৳{order.totals.subTotal}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700 bg-gray-50 px-3 py-2 rounded-lg">
                <Truck className="w-4 h-4 text-pink-500 shrink-0" />
                <span className="font-medium">
                  Shipping: ৳{order.totals.shipping}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col items-end gap-3 lg:gap-2">
            <div className="text-right">
              <div className="text-2xl lg:text-3xl font-bold bg-linear-to-r from-[#167389] to-[#167389] bg-clip-text text-transparent">
                ৳{order.totals.grandTotal}
              </div>
              <p className="text-sm text-gray-600 mt-1">Total Amount</p>
            </div>
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#167389] text-white rounded-xl font-semibold hover:bg-[#125f70] transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              {expanded ? (
                <>
                  <EyeOff className="w-4 h-4" />
                  <span className="hidden sm:inline">Hide Details</span>
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  <span className="hidden sm:inline">View Details</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-pink-100 p-4 sm:p-6 bg-linear-to-br from-pink-50/50 to-rose-50/50">
          <CustomerInfo order={order} />
          <OrderItemsList order={order} />
          <OrderSummary order={order} />
        </div>
      )}
    </div>
  );
}
