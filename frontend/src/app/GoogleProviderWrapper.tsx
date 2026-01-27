"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";

export default function GoogleProviderWrapper({ children }: { children: React.ReactNode }) {

  // ⭐ KIỂM TRA ENV Ở ĐÂY
  console.log("ENV CLIENT ID:", process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
      {children}
    </GoogleOAuthProvider>
  );
}
