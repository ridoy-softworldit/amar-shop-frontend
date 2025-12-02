/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Phone, Search, Package, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

interface GuestOrderTrackingProps {
  onPhoneSubmit?: (phone: string) => void;
  className?: string;
}

export default function GuestOrderTracking({
  onPhoneSubmit,
  className = "",
}: GuestOrderTrackingProps) {
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate phone number
    const phoneRegex = /^01[0-9]{9}$/;
    if (!phoneRegex.test(phone)) {
      setError("Please enter a valid Bangladeshi phone number (01XXXXXXXXX)");
      return;
    }

    // Save to localStorage
    try {
      localStorage.setItem("customer_phone", phone);
    } catch (err) {
      console.error("Failed to save phone to localStorage:", err);
    }

    // Call callback if provided
    if (onPhoneSubmit) {
      onPhoneSubmit(phone);
    } else {
      // Default: redirect to orders page
      window.location.href = "/orders";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-2xl border-2 border-pink-100 shadow-lg p-6 ${className}`}
    >
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-100 to-rose-100 rounded-2xl mb-4">
          <Package className="w-8 h-8 text-pink-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Track Your Orders
        </h2>
        <p className="text-gray-600 text-sm">
          Enter your phone number to view your order history
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-pink-500" />
            <input
              type="tel"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setError("");
              }}
              placeholder="01XXXXXXXXX"
              className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 ${
                error
                  ? "border-red-300 focus:border-red-500"
                  : "border-pink-200 focus:border-pink-500"
              } focus:outline-none focus:ring-4 ${
                error ? "focus:ring-red-100" : "focus:ring-pink-100"
              } transition-all`}
              maxLength={11}
            />
          </div>
          {error && (
            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {error}
            </p>
          )}
        </div>

        <motion.button
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-3 rounded-xl font-semibold hover:from-pink-600 hover:to-rose-600 transition-all shadow-lg flex items-center justify-center gap-2"
        >
          <Search className="w-5 h-5" />
          Track Orders
        </motion.button>
      </form>

      <div className="mt-6 pt-6 border-t border-pink-100">
        <p className="text-xs text-gray-500 text-center">
          💡 Tip: Sign in to automatically see all your orders without entering
          your phone number each time
        </p>
      </div>
    </motion.div>
  );
}
