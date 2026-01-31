"use client";

import Image from "next/image";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { useState, useContext } from "react";
import { AuthContext } from "@/features/auth/context/AuthContext";
import GoogleRegisterButton from "@/shared/components/Auth/GoogleRegisterButton";

export default function LoginModal({
  show,
  onClose,
  onOpenForgot,
  onOpenRegister,
}: {
  show: boolean;
  onClose: () => void;
  onOpenForgot: () => void;
  onOpenRegister: () => void;
}) {
  const auth = useContext(AuthContext);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");

  // Email validation function
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (value && !isValidEmail(value)) {
      setEmailError("Please enter a valid email address");
    } else {
      setEmailError("");
    }
  };

  async function handleLogin() {
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      await auth?.login({ email, password });
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
    }
  }

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[30000]"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-gray-800 w-[600px] max-w-[95%] rounded-xl shadow-xl p-8 relative"
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 text-2xl hover:text-black"
        >
          ✕
        </button>

        <h2 className="text-2xl font-semibold mb-6 dark:text-white">Login to continue</h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Google */}
        <div className="mb-6">
          <GoogleRegisterButton
            fullWidth={true}
            onSuccess={(data) => {
              console.log("Google login successful:", data);
              onClose();
            }}
          />
        </div>

        <div className="text-center text-gray-500 dark:text-gray-400 my-3">or login by email</div>

        {/* Form */}
        <div className="space-y-5">
          <div>
            <label className="font-medium dark:text-white">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              className={`w-full border rounded-lg px-4 py-2 mt-1 outline-none ${
                emailError
                  ? "border-red-500 focus:border-red-500"
                  : "dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-cyan-500"
              }`}
            />
            {emailError && (
              <p className="text-red-500 text-sm mt-1">{emailError}</p>
            )}
          </div>

          <div>
            <label className="font-medium dark:text-white">
              Password <span className="text-red-500">*</span>
            </label>

            <div className="relative mt-1">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-2 outline-none focus:border-cyan-500 pr-10"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-1/2 -translate-y-1/2 right-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                {showPassword ? (
                  <EyeSlashIcon className="w-5 h-5" />
                ) : (
                  <EyeIcon className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Forgot password */}
            <div
              className="text-right mt-1 text-cyan-600 dark:text-cyan-400 text-sm cursor-pointer hover:underline"
              onClick={() => {
                onClose();
                onOpenForgot();
              }}
            >
              Forgot password?
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-8 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 border dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white"
          >
            Cancel
          </button>

          <button 
            onClick={handleLogin}
            className="px-6 py-2 bg-cyan-700 text-white rounded-lg hover:bg-cyan-800"
          >
            Login
          </button>
        </div>

        <div className="mt-6 text-center text-sm">
          Don't have an account yet?
          <span
            className="text-blue-600 cursor-pointer ml-1"
            onClick={() => {
              onClose();
              onOpenRegister();
            }}
          >
            Register
          </span>
        </div>
      </div>
    </div>
  );
}


