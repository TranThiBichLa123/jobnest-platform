const dev = process.env.NODE_ENV !== "production";

const rawServer =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  (dev ? "http://localhost:8080" : "https://jobnest-production.vercel.app");

export const server = rawServer.replace(/\/$/, "");

export const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || `${server}/api`
).replace(/\/$/, "");