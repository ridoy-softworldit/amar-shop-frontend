/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { useState } from "react";
import { X, User, CheckCircle, LogIn } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { createOrder } from "@/services/orders";
import CustomerInfoForm from "@/components/checkout/CustomerInfoForm";
import OrderSummaryCard from "@/components/checkout/OrderSummaryCard";
import { useDeliveryCharge } from "@/hooks/useDeliveryCharge";
import { useCustomerInfo } from "@/hooks/useCustomerInfo";

const HOTLINE = process.env.NEXT_PUBLIC_HOTLINE || "+8801318319610";

// helper
const toNum = (v: unknown, f = 0) =>
  Number.isFinite(Number(v)) ? Number(v) : f;
const money = (n: number) => `৳${toNum(n).toFixed(2)}`;

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const getTotalPrice = useCartStore((s) => s.getTotalPrice);
  const { customerInfo, isGuest, isLoggedIn, user } = useCustomerInfo();

  const subtotal = getTotalPrice ? getTotalPrice() : 0;
  
  // Fetch delivery charge dynamically
  const { deliveryInfo, loading: deliveryLoading } = useDeliveryCharge(subtotal);
  const deliveryCharge = deliveryInfo?.deliveryCharge || 0;
  const isFreeDelivery = deliveryInfo?.isFree || false;
  const amountNeeded = deliveryInfo ? Math.max(0, deliveryInfo.freeDeliveryThreshold - subtotal) : 0;
  
  const total = subtotal + deliveryCharge;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMobileSummary, setShowMobileSummary] = useState(false);

  // 🧾 FIXED: handle order submit
  const handleSubmit = async (customerData: any) => {
    if (!items.length) {
      toast.error("Your cart is empty. Please add products first.");
      return;
    }

    // ✅ Save customer phone for order tracking
    localStorage.setItem("customer_phone", customerData.phone);

    // ✅ PREPARE PROPER PAYLOAD STRUCTURE
    const customer: any = {
      name: customerData.name,
      phone: customerData.phone,
      houseOrVillage: customerData.houseOrVillage,
      roadOrPostOffice: customerData.roadOrPostOffice,
      blockOrThana: customerData.blockOrThana,
      district: customerData.district,
    };

    // Always send billing address (required)
    customer.billingAddress = customerData.billingAddress;

    const payload = {
      items: items.map((it) => ({
        _id: String(it._id), // ✅ Backend expects _id
        quantity: Math.max(1, toNum(it.quantity, 1)),
      })),
      customer,
      totals: {
        subTotal: subtotal,
        shipping: deliveryCharge,
        grandTotal: total,
      },
    };

    console.log("✅ Final order payload:", payload);

    try {
      setIsSubmitting(true);
      const loadingToast = toast.loading("Placing your order...");

      // ✅ CALL FIXED createOrder FUNCTION
      const result = await createOrder(payload);

      toast.dismiss(loadingToast);

      if (result.ok) {
        toast.success("Order placed successfully!");

        // ✅ CLEAR CART AFTER SUCCESSFUL ORDER
        clearCart();

        // ✅ REDIRECT AFTER DELAY
        setTimeout(() => router.push("/orders"), 1500);
      } else {
        throw new Error(result.message || "Failed to place order");
      }
    } catch (err: any) {
      console.error("❌ Order submission error:", err);
      toast.dismiss();

      // ✅ BETTER ERROR MESSAGES
      const errorMessage =
        err?.data?.message ||
        err?.message ||
        "Failed to place order. Please try again.";

      toast.error(errorMessage);

      // ✅ SPECIFIC ERROR HANDLING
      if (err?.data?.code === "NO_ITEMS") {
        console.error("Items payload issue:", payload.items);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🛒 Empty cart view
  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 bg-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Your cart is empty
          </h2>
          <p className="text-gray-600 mb-6">
            Please add items to proceed to checkout.
          </p>
          <button
            onClick={() => router.push("/products")}
            className="inline-block bg-[#167389] text-white px-6 py-3 rounded-xl hover:bg-[#125f70] transition-all shadow-lg"
          >
            Browse Products
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="mt-6 bg-linear-to-br from-pink-50 via-rose-50 to-purple-50 min-h-screen py-8 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto pt-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8 text-center"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-linear-to-r from-[#167389] to-[#125f70]">
            Checkout
          </h1>
          <p className="text-gray-600 text-sm sm:text-base mt-1">
            Fill in your details to complete the order.
          </p>

          {/* User Status Indicator */}
          {isLoggedIn ? (
            <div className="mt-4 inline-flex items-center gap-2 bg-green-50 border-2 border-green-200 px-4 py-2 rounded-xl">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div className="text-left">
                <p className="text-sm font-semibold text-green-700">
                  Ordering as: {user?.name}
                </p>
                <p className="text-xs text-green-600">
                  {user?.email || user?.phone}
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-4 inline-flex items-center gap-2 bg-blue-50 border-2 border-blue-200 px-4 py-2 rounded-xl">
              <User className="w-5 h-5 text-blue-600" />
              <div className="text-left">
                <p className="text-sm font-semibold text-blue-700">
                  Continue as Guest
                </p>
                <p className="text-xs text-blue-600">
                  No account needed
                </p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Guest Sign-in Prompt */}
        {isGuest && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-linear-to-r from-cyan-50 to-blue-50 border border-cyan-200 rounded-2xl p-4"
          >
            <div className="flex items-start gap-3">
              <LogIn className="w-5 h-5 text-cyan-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800 mb-1">
                  Have an account?
                </p>
                <p className="text-xs text-gray-600 mb-2">
                  Sign in for faster checkout and order tracking
                </p>
                <Link
                  href="/login?redirect=/checkout"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-600 hover:text-cyan-700"
                >
                  Sign in now →
                </Link>
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid md:grid-cols-5 gap-6 lg:gap-8">
          {/* Left: Customer Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="md:col-span-3"
          >
            <div className="bg-white rounded-2xl shadow-lg p-6 lg:p-8 border border-pink-100">
              {isLoggedIn && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl">
                  <p className="text-sm text-green-700">
                    ✓ Your information has been pre-filled. You can edit if needed.
                  </p>
                </div>
              )}
              <CustomerInfoForm
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                initialData={customerInfo}
              />

              {/* Call to Order */}
              <div className="text-center pt-6 border-t border-pink-100">
                <p className="text-gray-600 mb-3 text-sm">Or</p>
                <a
                  href={`tel:${HOTLINE}`}
                  className="inline-flex items-center gap-2 text-[#167389] hover:text-pink-700 font-semibold text-sm sm:text-base"
                >
                  📞 Call to order: {HOTLINE}
                </a>
              </div>
            </div>
          </motion.div>

          {/* Right: Summary (Desktop) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="md:col-span-2 hidden md:block"
          >
            <div className="sticky top-4">
              <OrderSummaryCard
                items={items}
                subtotal={subtotal}
                deliveryCharge={deliveryCharge}
                deliveryLoading={deliveryLoading}
                isFreeDelivery={isFreeDelivery}
                amountNeeded={amountNeeded}
                total={total}
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* ✅ Mobile Bottom Bar */}
      <div className="fixed md:hidden left-0 right-0 bottom-0 z-40 bg-white/90 backdrop-blur border-t border-pink-200">
        <div className="max-w-6xl mx-auto px-5 py-3 flex items-center justify-between">
          <div className="text-sm">
            <div className="text-gray-600">Total</div>
            <div className="text-lg font-bold text-pink-700">
              {money(total)}
            </div>
          </div>
          <button
            onClick={() => setShowMobileSummary(true)}
            className="px-4 py-2 rounded-xl bg-[#167389] text-white font-semibold hover:bg-[#125f70] shadow-lg text-sm"
          >
            View Summary
          </button>
        </div>
      </div>

      {/* ✅ Mobile Summary Modal */}
      {showMobileSummary && (
        <div className="md:hidden fixed inset-0 z-50">
          <button
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowMobileSummary(false)}
            aria-label="Close summary"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 180, damping: 20 }}
            className="absolute left-0 right-0 bottom-0 max-h-[85vh] rounded-t-2xl bg-white p-4 shadow-2xl"
          >
            <div className="flex items-center justify-between pb-2 border-b border-pink-100">
              <h3 className="text-lg font-semibold">Order Summary</h3>
              <button
                onClick={() => setShowMobileSummary(false)}
                className="p-2 rounded-lg hover:bg-pink-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="pt-3 overflow-y-auto">
              <OrderSummaryCard
                items={items}
                subtotal={subtotal}
                deliveryCharge={deliveryCharge}
                deliveryLoading={deliveryLoading}
                isFreeDelivery={isFreeDelivery}
                amountNeeded={amountNeeded}
                total={total}
              />
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
