"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import api from "@/lib/axios";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function verifyEmail() {
      const token = searchParams?.get("token");

      if (!token) {
        setStatus("error");
        setMessage("Invalid verification link");
        return;
      }

      try {
        const response = await api.post("/auth/verify-email", { token });
        setStatus("success");
        setMessage(response.data.message || "Email verified successfully!");
        setTimeout(() => router.push("/"), 3000);
      } catch (err: any) {
        setStatus("error");
        setMessage(
          err.response?.data?.message || "Failed to verify email. The link may be expired or invalid."
        );
      }
    }

    verifyEmail();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen pt-[12vh] bg-white dark:bg-[#0f2137] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-dark-card rounded-xl shadow-lg p-8 border border-slate-200 dark:border-slate-700 text-center">
          {status === "loading" && (
            <>
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-cyan-600 mx-auto mb-4"></div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                Verifying Email...
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Please wait while we verify your email address.
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                Email Verified!
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {message}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Redirecting to login...
              </p>
            </>
          )}

          {status === "error" && (
            <>
              <XCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                Verification Failed
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {message}
              </p>
              <a
                href="/"
                className="inline-block bg-cyan-700 hover:bg-cyan-800 text-white font-semibold py-3 px-6 rounded-lg transition"
              >
                Back to Home
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
