const dev = process.env.NODE_ENV !== "production";

export const server = dev
  ? "http://localhost:8080"
  : "https://jobnest-production.vercel.app/";

export const API_URL = process.env.NEXT_PUBLIC_API_URL!;
