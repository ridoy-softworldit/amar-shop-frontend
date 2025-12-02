"use client";

import { Toaster } from "react-hot-toast";

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: "#fff",
          color: "#1f2937",
          border: "1px solid #e5e7eb",
          borderRadius: "12px",
          boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
          padding: "12px 16px",
          fontSize: "14px",
          fontWeight: "500",
        },
        success: {
          duration: 3000,
          iconTheme: {
            primary: "#10B981",
            secondary: "#fff",
          },
          style: {
            border: "1px solid #10B981",
          },
        },
        error: {
          duration: 5000,
          iconTheme: {
            primary: "#EF4444",
            secondary: "#fff",
          },
          style: {
            border: "1px solid #EF4444",
          },
        },
        loading: {
          duration: Infinity,
          style: {
            border: "1px solid #3B82F6",
          },
        },
      }}
    />
  );
}
