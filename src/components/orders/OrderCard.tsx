"use client";

import { useState } from "react";
import { Eye, ChevronDown, ChevronUp, FileText, Mail } from "lucide-react";
import CustomerInfo from "./CustomerInfo";
import OrderItemsList from "./OrderItemsList";
import OrderSummary from "./OrderSummary";
import type { Order } from "@/types/order";

interface OrderCardProps {
  order: Order;
  onViewInvoice?: (order: Order) => void;
}

export default function OrderCard({ order, onViewInvoice }: OrderCardProps) {
  const [expanded, setExpanded] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return "text-teal-500";
      case "CANCELLED":
        return "text-red-500";
      case "IN_SHIPPING":
        return "text-cyan-500";
      default:
        return "text-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return "Completed";
      case "CANCELLED":
        return "Rejected";
      case "IN_SHIPPING":
        return "Partial Delivered";
      case "IN_PROGRESS":
        return "Processing";
      default:
        return status;
    }
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    const dateStr = d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const timeStr = d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    return `${dateStr} ${timeStr}`;
  };

  const handleContactSupport = () => {
    const subject = encodeURIComponent(`Invoice request for order ${order._id}`);
    const body = encodeURIComponent(`Hello,\n\nI would like to request an invoice for my order ${order._id}.\n\nThank you.`);
    window.location.href = `mailto:support@yourshop.com?subject=${subject}&body=${body}`;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="p-4">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              ID: {order._id.slice(-6)}
            </h3>
            <p className="text-sm text-gray-500">
              Ordered: {formatDate(order.createdAt)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-gray-900 mb-1">
              ৳ {order.totals.grandTotal.toFixed(2)}
            </p>
            <p className="text-sm text-gray-500">
              Items: {order.lines.length}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className={`text-sm text-orange-600 font-semibold ${getStatusColor(order.status)}`}>
            {getStatusText(order.status)}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 px-2 py-1 text-xs border border-[#167389] bg-[#167389] hover:bg-[#125f70] text-white rounded transition"
            >
              <Eye className="w-4 h-4" /> View
              {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            {onViewInvoice && (
              <button
                onClick={() => onViewInvoice(order)}
                className="px-2 py-1 text-xs border border-[#167389] bg-[#167389] hover:bg-[#125f70] text-white rounded transition"
              >
                Invoice
              </button>
            )}
            <button
              onClick={handleContactSupport}
              className="px-2 py-1 text-xs border border-[#167389] bg-[#167389] hover:bg-[#125f70] text-white rounded transition"
            >
              Support
            </button>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <CustomerInfo order={order} />
          <OrderItemsList order={order} />
          <OrderSummary order={order} />
        </div>
      )}
    </div>
  );
}
