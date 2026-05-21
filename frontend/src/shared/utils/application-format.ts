import { ApplicationStatus } from "@/shared/types/applications";

export function formatDate(dateString?: string) {
  if (!dateString) return "N/A";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function normalizeApplicationStatus(status?: string): ApplicationStatus {
  const normalized = String(status || "PENDING").toUpperCase();

  if (normalized === "SUBMITTED") return "PENDING";
  if (normalized === "INTERVIEW") return "INTERVIEWED";

  const validStatuses: ApplicationStatus[] = [
    "PENDING",
    "REVIEWED",
    "SHORTLISTED",
    "INTERVIEWED",
    "HIRED",
    "ACCEPTED",
    "REJECTED",
    "WITHDRAWN",
  ];

  return validStatuses.includes(normalized as ApplicationStatus)
    ? (normalized as ApplicationStatus)
    : "PENDING";
}

export function canWithdrawApplication(status?: string) {
  return normalizeApplicationStatus(status) === "PENDING";
}

export function getApplicationStatusLabel(status?: string) {
  const normalized = normalizeApplicationStatus(status);

  const labels: Record<ApplicationStatus, string> = {
    PENDING: "Pending",
    SUBMITTED: "Pending",
    REVIEWED: "Reviewed",
    SHORTLISTED: "Shortlisted",
    INTERVIEW: "Interviewed",
    INTERVIEWED: "Interviewed",
    HIRED: "Hired",
    ACCEPTED: "Accepted",
    REJECTED: "Rejected",
    WITHDRAWN: "Withdrawn",
  };

  return labels[normalized];
}

export function getApplicationStatusClass(status?: ApplicationStatus | string) {
  const normalized = normalizeApplicationStatus(status);

  const classes: Record<ApplicationStatus, string> = {
    PENDING:
      "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300",
    SUBMITTED:
      "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300",
    REVIEWED:
      "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
    SHORTLISTED:
      "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300",
    INTERVIEW:
      "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300",
    INTERVIEWED:
      "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300",
    HIRED:
      "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300",
    ACCEPTED:
      "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300",
    REJECTED: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300",
    WITHDRAWN:
      "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300",
  };

  return classes[normalized];
}