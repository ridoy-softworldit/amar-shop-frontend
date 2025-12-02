"use client";

import { Clock, CheckCircle, XCircle, Truck, AlertCircle } from "lucide-react";
import type { OrderStatus } from "@/types/order";

const STATUS_CONFIG: Record<
  OrderStatus,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  { label: string; color: string; bgColor: string; icon: any }
> = {
  PENDING: {
    label: "Pending",
    color: "text-amber-800",
    bgColor: "bg-amber-50 border-amber-200",
    icon: Clock,
  },
  IN_PROGRESS: {
    label: "Processing",
    color: "text-blue-800",
    bgColor: "bg-blue-50 border-blue-200",
    icon: AlertCircle,
  },
  IN_SHIPPING: {
    label: "Shipping",
    color: "text-indigo-800",
    bgColor: "bg-indigo-50 border-indigo-200",
    icon: Truck,
  },
  DELIVERED: {
    label: "Delivered",
    color: "text-emerald-800",
    bgColor: "bg-emerald-50 border-emerald-200",
    icon: CheckCircle,
  },
  CANCELLED: {
    label: "Cancelled",
    color: "text-rose-800",
    bgColor: "bg-rose-50 border-rose-200",
    icon: XCircle,
  },
};

export default function StatusBadge({ status }: { status: OrderStatus }) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-full border ${config.bgColor} ${config.color} shadow-sm`}
    >
      <Icon className="w-4 h-4 flex-shrink-0" />
      <span className="text-sm font-semibold whitespace-nowrap">
        {config.label}
      </span>
    </div>
  );
}
