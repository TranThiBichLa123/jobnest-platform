export type AppRole = "GUEST" | "CANDIDATE" | "EMPLOYER" | "ADMIN";

export function normalizeRole(role?: string | null): AppRole {
  const value = String(role || "")
    .replace("ROLE_", "")
    .toUpperCase();

  if (value === "CANDIDATE" || value === "JOB_SEEKER") return "CANDIDATE";
  if (value === "EMPLOYER") return "EMPLOYER";
  if (value === "ADMIN") return "ADMIN";

  return "GUEST";
}

export function isGuest(role?: string | null) {
  return normalizeRole(role) === "GUEST";
}

export function isCandidate(role?: string | null) {
  return normalizeRole(role) === "CANDIDATE";
}

export function isEmployer(role?: string | null) {
  return normalizeRole(role) === "EMPLOYER";
}

export function isAdmin(role?: string | null) {
  return normalizeRole(role) === "ADMIN";
}