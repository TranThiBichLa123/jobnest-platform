"use client";

import React, { useState, useContext } from "react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { AuthContext } from "@/features/auth/context/AuthContext";
import GoogleRegisterButton from "@/shared/components/Auth/GoogleRegisterButton";

export default function RegisterModal({
  onClose,
  onOpenLogin,
}: {
  onClose: () => void;
  onOpenLogin?: () => void;
}) {
  const auth = useContext(AuthContext);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
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

  async function handleRegister() {
    if (!username || !email || !password) {
      alert("Please fill in all fields");
      return;
    }

    if (!isValidEmail(email)) {
      alert("Please enter a valid email address");
      return;
    }

    if (!agreedToTerms) {
      alert("Please accept the terms and conditions");
      return;
    }

    if (!auth) {
      alert("Authentication system not available");
      return;
    }

    try {
      await auth.register({
        username,
        email,
        password,
        role: "CANDIDATE"
      });
      alert("Registration successful! Please check your email to verify your account before logging in.");
      onClose();
      if (onOpenLogin) {
        onOpenLogin(); // Open login modal after successful registration
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Registration failed");
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[30000]"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 w-[650px] max-w-[95%] rounded-xl shadow-xl p-10 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 text-2xl hover:text-black"
        >
          ✕
        </button>

        <h2 className="text-3xl font-semibold mb-6 text-center">
          Sign up as a member!
        </h2>

        {/* ---------------- GOOGLE REGISTER ---------------- */}
        <div className="mb-8">
          <GoogleRegisterButton
            fullWidth={true}
            onSuccess={(data: any) => {
              console.log("Google Registered user:", data);
              // Close modal and user avatar should appear automatically
              onClose();
              // Show success message
              setTimeout(() => {
                alert("Google sign-up successful! Welcome to JobNest!");
              }, 100);
            }}
          />
        </div>

        {/* Separator */}
       

        {/* Form */}
        <div className="mb-4">
          <label className="font-medium dark:text-white">Username</label>
          <input
            type="text"
            placeholder="Choose a unique username"
            className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-2 mt-1 outline-none focus:border-cyan-500"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        {/* Email */}
        <div className="mb-4">
          <label className="font-medium dark:text-white">Email</label>
          <input
            type="email"
            placeholder="Use a real email for verification"
            className={`w-full border rounded-lg px-4 py-2 mt-1 outline-none ${
              emailError
                ? "border-red-500 focus:border-red-500"
                : "dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-cyan-500"
            }`}
            value={email}
            onChange={(e) => handleEmailChange(e.target.value)}
          />
          {emailError && (
            <p className="text-red-500 text-sm mt-1">{emailError}</p>
          )}
        </div>

        {/* Password */}
        <div className="mb-4">
          <label className="font-medium dark:text-white">Password</label>
          <div className="relative mt-1">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="At least 6 characters"
              className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-2 outline-none focus:border-cyan-500 pr-12"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
        </div>

        {/* Terms */}
        <div className="flex items-start gap-3 mb-6">
          <input 
            type="checkbox" 
            className="w-5 h-5 accent-cyan-600 cursor-pointer flex-shrink-0 border-2 border-gray-300 dark:border-gray-600 rounded mt-0.9" 
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
          />
          <p className="text-sm dark:text-gray-300">
            I accept the{" "}
            <span className="text-cyan-600 cursor-pointer hover:underline">Usage agreement</span>{" "}
            and{" "}
            <span className="text-cyan-600 cursor-pointer hover:underline">
              Security regulations
            </span>{" "}
            of JobNest.
          </p>
        </div>

        {/* Submit */}
        <button
          onClick={handleRegister}
          className="w-full bg-cyan-700 text-white py-3 rounded-lg text-lg font-semibold hover:bg-cyan-800"
        >
          Register
        </button>

        {/* Login link */}
        <div className="mt-6 text-center text-sm">
          Already a member?
          <span
            className="text-blue-600 cursor-pointer ml-1"
            onClick={() => {
              onClose();
              onOpenLogin?.();
            }}
          >
            Login
          </span>
        </div>
      </div>
    </div>
  );
}


