"use client";

import { useState } from "react";
import { Eye, ChevronDown, ChevronUp, X, Package } from "lucide-react";
import toast from "react-hot-toast";
import CustomerInfo from "./CustomerInfo";
import OrderItemsList from "./OrderItemsList";
import OrderSummary from "./OrderSummary";
import type { Order, OrderLine } from "@/types/order";

interface OrderCardProps {
  order: Order;
  onViewInvoice?: (order: Order) => void;
}

export default function OrderCard({ order, onViewInvoice }: OrderCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [showReorderModal, setShowReorderModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return "text-teal-500";
      case "CANCELLED":
        return "text-red-500";
      case "RETURNED":
        return "text-orange-500";
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
      case "RETURNED":
        return "Returned";
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

  const handleOrderAgain = async () => {
    setShowConfirmModal(false);
    setShowReorderModal(false);

    try {
      const loadingToast = toast.loading("Creating order...");

      const payload = {
        items: order.lines.map((line) => ({
          _id: line.productId || line.product?._id || line._id,
          quantity: line.quantity || line.qty,
        })),
        customer: {
          name: order.customer.name,
          phone: order.customer.phone,
          houseOrVillage: order.customer.houseOrVillage,
          roadOrPostOffice: order.customer.roadOrPostOffice,
          blockOrThana: order.customer.blockOrThana,
          district: order.customer.district,
          billingAddress: order.customer.billingAddress,
        },
        totals: {
          subTotal: order.totals.subTotal,
          shipping: order.totals.shipping,
          grandTotal: order.totals.grandTotal,
        },
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      toast.dismiss(loadingToast);

      if (result.ok) {
        toast.success("Order placed successfully!");
        setTimeout(() => window.location.reload(), 1500);
      } else {
        toast.error(result.message || "Failed to place order");
      }
    } catch (error) {
      console.error("Order again error:", error);
      toast.error("Failed to place order");
    }
  };

  const handleContactSupport = () => {
    const subject = encodeURIComponent(`Invoice request for order ${order._id}`);
    const body = encodeURIComponent(`Hello,\n\nI would like to request an invoice for my order ${order._id}.\n\nThank you.`);
    window.location.href = `mailto:support@yourshop.com?subject=${subject}&body=${body}`;
  };

  const getProductImage = (line: OrderLine) => {
    return line.product?.images?.[0] || line.image || "/placeholder.png";
  };

  const getProductTitle = (line: OrderLine) => {
    return line.product?.title || line.title || line.name || "Product";
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

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <p className={`text-sm font-semibold ${getStatusColor(order.status)}`}>
              {getStatusText(order.status)}
            </p>
            {order.status === "RETURNED" && (
              <button
                onClick={() => setShowReorderModal(true)}
                className="flex items-center gap-1 px-2 py-1 text-xs border-2 border-green-600 bg-white text-green-600 hover:bg-green-50 rounded transition font-semibold"
              >
                Request Delivery Again
              </button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
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

      {/* Reorder Modal */}
      {showReorderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowReorderModal(false)}>
          <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Order Items</h3>
              <button onClick={() => setShowReorderModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5 text-gray-700" />
              </button>
            </div>
            <div className="p-4">
              {order.lines.map((line, idx) => (
                <div key={idx} className="flex gap-3 mb-3 pb-3 border-b last:border-0">
                  <img src={getProductImage(line)} alt="" className="w-16 h-16 object-cover rounded" />
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-gray-900">{getProductTitle(line)}</p>
                    <p className="text-xs text-gray-600">Qty: {line.quantity || line.qty}</p>
                    <p className="text-sm font-bold text-gray-900">৳ {line.price?.toFixed(2)}</p>
                  </div>
                </div>
              ))}
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-700">Subtotal:</span>
                  <span className="font-semibold text-gray-900">৳ {order.totals.subTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-700">Shipping:</span>
                  <span className="font-semibold text-gray-900">৳ {order.totals.shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-gray-900">Total:</span>
                  <span className="text-gray-900">৳ {order.totals.grandTotal.toFixed(2)}</span>
                </div>
              </div>
              <button
                onClick={() => setShowConfirmModal(true)}
                className="w-full mt-4 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
              >
                Request Delivery Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowConfirmModal(false)}>
          <div className="bg-white rounded-lg max-w-sm w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-4">
              <Package className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <h3 className="text-lg font-bold mb-2 text-gray-900">Confirm Order</h3>
              <p className="text-sm text-gray-700">Are you sure you want to place this order again?</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleOrderAgain}
                className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
