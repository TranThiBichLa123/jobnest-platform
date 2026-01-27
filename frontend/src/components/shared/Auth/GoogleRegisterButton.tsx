"use client";

import { GoogleLogin } from "@react-oauth/google";
import api from "@/lib/axios";
import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";

export default function GoogleRegisterButton({ 
  role = "CANDIDATE",
  onSuccess,
  fullWidth = false
}: { 
  role?: "CANDIDATE" | "EMPLOYER";
  onSuccess: (data: any) => void;
  fullWidth?: boolean;
}) {
  const auth = useContext(AuthContext);

  return (
    <div className={fullWidth ? "w-full" : "flex justify-center"}>
      <GoogleLogin
        theme="outline"         // nền trắng viền xám chuẩn Google
        shape="rectangular"
        size="large"
        width={fullWidth ? "100%" : "260"}
        text="continue_with"    // Nút Google: "Continue with Google"

        onSuccess={async (res) => {
          try {
            console.log("Google OAuth Success - sending to backend...");
            const result = await api.post("/auth/google/verify", {
              credential: res.credential,
              role: role
            });

            console.log("Backend response:", result.data);

            // Store tokens from response
            const { accessToken, refreshToken, account } = result.data;
            localStorage.setItem("accessToken", accessToken);
            localStorage.setItem("refreshToken", refreshToken);
            api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
            
            console.log("User account data:", account);
            
            // Update auth context with user data immediately
            if (auth && auth.setUser) {
              auth.setUser(account);
              console.log("User set in auth context");
            } else {
              console.error("Auth context or setUser not available");
            }

            onSuccess(result.data);
          } catch (err) {
            console.error("Google sign-in error:", err);
            alert("Google Register Failed!");
          }
        }}

        onError={() => {
          alert("Google Register Failed!");
        }}
      />
    </div>
  );
}
