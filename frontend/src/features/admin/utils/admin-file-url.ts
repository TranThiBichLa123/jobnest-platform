import { server } from "@/config/env";

export function resolveAdminFileUrl(path?: string | null) {
  if (!path || path.trim() === "") return "";

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  if (path.startsWith("/uploads")) {
    return `${server}${path}`;
  }

  if (path.startsWith("/")) {
    return path;
  }

  return path;
}