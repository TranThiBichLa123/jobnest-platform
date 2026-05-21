import { useEffect, useState } from "react";
import { ApplicationResponse, ApplicationStatus } from "@/shared/types/applications";

type Props = {
  open: boolean;
  application: ApplicationResponse | null;
  loading: boolean;
  onCancel: () => void;
  onConfirm: (status: ApplicationStatus, notes: string) => void;
};

const statuses: ApplicationStatus[] = [
  "REVIEWED",
  "SHORTLISTED",
  "ACCEPTED",
  "REJECTED",
];

export default function EmployerStatusDialog({
  open,
  application,
  loading,
  onCancel,
  onConfirm,
}: Props) {
  const [status, setStatus] = useState<ApplicationStatus>("REVIEWED");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!application) return;

    setStatus(
      application.status === "PENDING" || application.status === "WITHDRAWN"
        ? "REVIEWED"
        : application.status
    );
    setNotes(application.notes || "");
  }, [application]);

  if (!open || !application) return null;

  return (
    <div className="fixed inset-0 z-[20000] bg-black/50 flex items-center justify-center px-4">
      <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-gray-800 border dark:border-gray-700 p-6 shadow-2xl">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Update application status
        </h2>

        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Candidate:{" "}
          <span className="font-semibold">{application.candidateName}</span>
        </p>

        <label className="block mt-5 text-sm font-bold text-gray-700 dark:text-gray-300">
          Status
        </label>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as ApplicationStatus)}
          className="mt-2 w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-600"
        >
          {statuses.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <label className="block mt-5 text-sm font-bold text-gray-700 dark:text-gray-300">
          Notes
        </label>
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          rows={4}
          placeholder="Optional review notes..."
          className="mt-2 w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-600"
        />

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => onConfirm(status, notes)}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-cyan-700 text-white font-bold hover:bg-cyan-900 disabled:opacity-60 transition-colors"
          >
            {loading ? "Saving..." : "Save status"}
          </button>
        </div>
      </div>
    </div>
  );
}