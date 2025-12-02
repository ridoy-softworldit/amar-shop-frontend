/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Package } from "lucide-react";
import Image from "next/image";
import type { Order } from "@/types/order";
import { useGetProductByIdQuery } from "@/services/catalog.api";

const money = (n: number) => `৳${Number(n || 0).toFixed(2)}`;

interface OrderItemProps {
  item: any;
  index: number;
}

function OrderItem({ item, index, order }: OrderItemProps & { order: Order }) {
  const qty = item.qty ?? item.quantity ?? 0;
  const productId = item.productId;

  const { data: product, isLoading } = useGetProductByIdQuery(productId, {
    skip: !productId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-pink-100 shadow-sm">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 animate-pulse rounded-lg" />
        <div className="flex-1">
          <div className="h-4 bg-gray-200 animate-pulse rounded mb-2" />
          <div className="h-3 bg-gray-200 animate-pulse rounded w-1/2" />
        </div>
        <div className="w-20 h-6 bg-gray-200 animate-pulse rounded" />
      </div>
    );
  }

  const title = product?.title || item.title || item.name || "Product";
  // Calculate price from order totals if product fetch failed
  const calculatedPrice = order.totals.subTotal / order.lines.reduce((sum, line) => sum + (line.qty || line.quantity || 0), 0);
  const price = product?.price || item.price || calculatedPrice || 0;
  const image = product?.images?.[0] || product?.image || item.image;
  const lineTotal = price * qty;

  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-pink-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="relative flex-shrink-0">
        {image ? (
          <Image
            src={image}
            alt={title}
            width={80}
            height={80}
            className="w-16 h-16 sm:w-20 sm:h-20 object-scale-down bg-pink-50 rounded-lg border border-pink-200 p-1"
          />
        ) : (
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-gradient-to-br from-pink-100 to-rose-100 border border-pink-200 flex items-center justify-center">
            <Package className="w-8 h-8 text-pink-400" />
          </div>
        )}

        <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#167389] rounded-full flex items-center justify-center">
          <span className="text-white text-xs font-bold">{qty}</span>
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <h5 className="font-semibold text-gray-900 text-base sm:text-lg mb-1 line-clamp-2">
          {title}
        </h5>
        <p className="text-gray-600 text-sm sm:text-base">
          {money(price)} × {qty}
        </p>
      </div>

      <div className="text-right">
        <p className="text-lg sm:text-xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
          {money(lineTotal)}
        </p>
      </div>
    </div>
  );
}

export default function OrderItemsList({ order }: { order: Order }) {
  return (
    <div>
      <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-lg">
        <Package className="w-5 h-5 text-[#167389]" />
        Order Items
      </h4>

      <div className="space-y-4">
        {order.lines.map((item, i) => (
          <OrderItem key={item._id || i} item={item} index={i} order={order} />
        ))}
      </div>
    </div>
  );
}
