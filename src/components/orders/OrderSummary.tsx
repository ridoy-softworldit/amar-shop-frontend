"use client";

import type { Order } from "@/types/order";

export default function OrderSummary({ order }: { order: Order }) {
  const { subTotal, shipping, grandTotal } = order.totals;

  return (
    <div className="mt-6 pt-4 border-t border-pink-200 space-y-3">
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-600">Subtotal:</span>
        <span className="font-semibold text-gray-900">৳{subTotal.toFixed(2)}</span>
      </div>
      
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-600">Shipping:</span>
        <span className="font-semibold text-gray-900">৳{shipping.toFixed(2)}</span>
      </div>
      
      <div className="pt-3 border-t border-pink-100 flex justify-between items-center">
        <span className="text-lg font-bold text-gray-900">Grand Total:</span>
        <span className="text-2xl sm:text-3xl bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent font-bold">
          ৳{grandTotal.toFixed(2)}
        </span>
      </div>
    </div>
  );
}
