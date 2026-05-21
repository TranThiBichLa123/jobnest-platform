type Props = {
  value?: string;
};

export default function AdminStatusBadge({ value }: Props) {
  const status = String(value || "UNKNOWN").toUpperCase();

  const className =
    status === "ACTIVE" || status === "VERIFIED" || status === "ACCEPTED"
      ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
      : status === "PENDING_REVIEW" || status === "PENDING"
      ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300"
      : status === "REJECTED" || status === "BLOCKED" || status === "SUSPENDED"
      ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
      : status === "HIDDEN" || status === "WITHDRAWN"
      ? "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
      : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300";

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold ${className}`}>
      {status}
    </span>
  );
}