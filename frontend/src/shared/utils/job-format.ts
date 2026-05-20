import { Job } from "@/shared/types/job";

export function formatSalary(min?: number, max?: number) {
  if (!min && !max) return "Competitive";

  const format = (value: number) => {
    if (value >= 1000) return `$${Math.round(value / 1000)}k`;
    return `$${value}`;
  };

  if (min && max) return `${format(min)} - ${format(max)}`;
  if (min) return `From ${format(min)}`;
  if (max) return `Up to ${format(max)}`;

  return "Competitive";
}

export function formatJobType(type?: string) {
  if (!type) return "Not specified";

  const normalized = type.toLowerCase();

  const map: Record<string, string> = {
    fulltime: "Full Time",
    full_time: "Full Time",
    parttime: "Part Time",
    part_time: "Part Time",
    remote: "Remote",
    contract: "Contract",
    freelance: "Freelance",
    internship: "Internship",
  };

  return map[normalized] || type;
}

export function getTimeAgo(dateString?: string) {
  if (!dateString) return "Recently";

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor(diffMs / (1000 * 60));

  if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;

  return "Just now";
}

export function splitSkills(skills?: string) {
  if (!skills) return [];

  return skills
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);
}

export function isJobOpen(job?: Job | null) {
  if (!job) return false;

  const status = String(job.status || "").toUpperCase();
  if (status && status !== "ACTIVE") return false;

  if (job.expiresAt) {
    return new Date(job.expiresAt).getTime() > Date.now();
  }

  return true;
}