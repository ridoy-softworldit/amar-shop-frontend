"use client";

import React, { useState } from "react";
import { Sparkles, Mail, ArrowLeft, Send } from "lucide-react";
import { authApi } from "@/services/auth.api";
import Link from "next/link";
import { motion } from "framer-motion";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setIsLoading(true);

    try {
      const response = await authApi.forgotPassword({ email });

      if (response.ok) {
        setMessage("Password reset link has been sent to your email address.");
      } else {
        throw new Error(response.message || "Failed to send reset email");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F5FDF8] flex items-center justify-center p-4 relative">
      <Link href="/login" className="absolute top-6 left-6 inline-flex items-center gap-2 text-[#167389] hover:text-cyan-700 transition-colors z-10">
        <ArrowLeft size={20} />
        <span className="font-medium">Back to Login</span>
      </Link>

      <div className="w-full max-w-md">

        <Link href="/" className="text-center mb-6 block">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-[#167389] rounded-2xl shadow-lg mb-3"
          >
            <Sparkles className="w-8 h-8 text-white" strokeWidth={2.5} />
          </motion.div>
          <h1 className="text-3xl font-bold text-[#167389] mb-1">
            আমার শপ
          </h1>
          <p className="text-gray-600 text-sm">Reset Your Password</p>
        </Link>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
        >
          <div className="mb-5">
            <h2 className="text-xl font-bold text-gray-800 mb-1">Forgot Password?</h2>
            <p className="text-gray-500 text-sm">Enter your email to receive a reset link</p>
          </div>

          {message ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="w-8 h-8 text-green-600" />
              </div>
              <div className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-md px-4 py-3 mb-4">
                {message}
              </div>
              <p className="text-gray-600 text-sm mb-4">
                Check your email and click the reset link to create a new password.
              </p>
              <Link 
                href="/login" 
                className="text-[#167389] hover:text-cyan-700 font-semibold hover:underline"
              >
                Back to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#167389]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#167389] focus:ring-1 focus:ring-[#167389] transition placeholder:text-gray-400 text-gray-900 selection:bg-[#167389] selection:text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#167389] hover:bg-cyan-700 text-white font-semibold py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
              >
                {isLoading ? (
                  <>
                    <span className="inline-block w-5 h-5 border-2 border-white/70 border-t-transparent rounded-full animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Send Reset Link</span>
                  </>
                )}
              </button>

              {error && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                  {error}
                </div>
              )}
            </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Remember your password?{" "}
              <Link href="/login" className="text-[#167389] hover:text-cyan-700 font-semibold hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </main>
  );
}