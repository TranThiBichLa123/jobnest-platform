"use client";

import Image from "next/image";
import { useState } from "react";
import api from "@/lib/axios";

export default function ForgotPasswordModal({
  show,
  onClose,
}: {
  show: boolean;
  onClose: () => void;
}) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");

  // Email validation function
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    setEmailError("");
    if (value && !isValidEmail(value)) {
      setEmailError("Please enter a valid email address");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      await api.post("/auth/password/forgot", { email });
      setMessage("Password reset link has been sent! Please check your email inbox (and spam folder). You can also check the backend console for the reset link.");
      setEmail("");
      
      // Auto close after 5 seconds
      setTimeout(() => {
        onClose();
        setMessage("");
      }, 5000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send reset link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[30000]"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-gray-800 w-[500px] max-w-[95%] rounded-xl shadow-xl p-8 relative"
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 text-2xl hover:text-black"
        >
          ✕
        </button>

        <h2 className="text-2xl font-semibold mb-6 text-center">
          Forgot Password
        </h2>

        {/* IMAGE */}
        <div className="flex justify-center mb-3">
          <Image
            src="/images/p.jpg"
            width={200}
            height={200}
            alt="security"
          />
        </div>

        <p className="text-center text-gray-600 dark:text-gray-300 mb-4">
          Enter your email below. We will send you a password reset link.
        </p>

        {/* Success Message */}
        {message && (
          <div className="mb-4 p-3 bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-600 text-green-700 dark:text-green-200 rounded-lg text-sm">
            {message}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-200 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit}>
          {/* INPUT EMAIL */}
          <div className="mb-6">
            <label className="font-medium dark:text-white">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              placeholder="your-email@example.com"
              className={`w-full border rounded-lg px-4 py-2 mt-1 outline-none ${
                emailError
                  ? "border-red-500 focus:border-red-500"
                  : "dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-cyan-500"
              }`}
              disabled={loading}
            />
            {emailError && (
              <p className="text-red-500 text-sm mt-1">{emailError}</p>
            )}
          </div>

          {/* BUTTON */}
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-700 hover:bg-cyan-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-2 rounded-lg transition-colors"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
      </div>
    </div>
  );
}
