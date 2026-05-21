import { AppRole } from "@/shared/security/access-control";

export type NavItem = {
  id: string;
  label: string;
  href: string;
  public?: boolean;
  roles?: AppRole[];
};

export const mainNavItems: NavItem[] = [
  { id: "home", label: "Home", href: "/", public: true },
  { id: "jobs", label: "Find Job", href: "/jobs", public: true },
  { id: "candidates", label: "Candidates", href: "#", roles: ["EMPLOYER", "ADMIN"] },
  { id: "employers", label: "Employers", href: "#", public: true },
  { id: "community", label: "Community", href: "/community", public: true },
  { id: "contact", label: "Contact", href: "#", public: true },
];

export const dashboardPathByRole: Record<AppRole, string> = {
  GUEST: "/",
  CANDIDATE: "/candidate/my-jobs",
  EMPLOYER: "/employer/dashboard",
  ADMIN: "/admin",
};

export const profilePathByRole: Record<AppRole, string> = {
  GUEST: "/",
  CANDIDATE: "/candidate/profile",
  EMPLOYER: "/employer/profile",
  ADMIN: "/admin",
};

export const jobsPathByRole: Record<AppRole, string> = {
  GUEST: "/jobs",
  CANDIDATE: "/candidate/my-jobs",
  EMPLOYER: "/employer/jobs",
  ADMIN: "/admin/jobs",
};

export function canSeeNavItem(item: NavItem, role: AppRole) {
  if (item.public) return true;
  if (!item.roles || item.roles.length === 0) return false;
  return item.roles.includes(role);
}

export function getJobPostTarget(role: AppRole) {
  if (role === "EMPLOYER") return "/employer/jobs/create";
  if (role === "ADMIN") return "/admin/jobs";
  return "/jobs";
}

export function getJobPostLabel(role: AppRole) {
  if (role === "ADMIN") return "Manage Jobs";
  return "Job Post";
}