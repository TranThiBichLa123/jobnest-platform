"use client";

import { useEffect, useState } from "react";
import { Job } from "@/shared/types/job";

type Props = {
  open: boolean;
  job: Job | null;
  loading: boolean;
  onCancel: () => void;
  onConfirm: (reason: string) => void;
};

export default function AdminJobRejectDialog({
  open,
  job,
  loading,
  onCancel,
  onConfirm,
}: Props) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (open) {
      setReason("");
    }
  }, [open]);

  if (!open || !job) return null;

  return (
    <div className="fixed inset-0 z-[30000] bg-black/50 flex items-center justify-center px-4">
      <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 shadow-2xl">
        <h2 className="text-xl font-extrabold text-gray-950 dark:text-white">
          Reject job
        </h2>

        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Job: <span className="font-bold">{job.title}</span>
        </p>

        <label className="block mt-5 text-sm font-bold text-gray-700 dark:text-gray-300">
          Reject reason
        </label>

        <textarea
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          rows={4}
          placeholder="Explain why this job cannot be published..."
          className="mt-2 w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 px-4 py-3 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-600 resize-none"
        />

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => onConfirm(reason)}
            disabled={loading || !reason.trim()}
            className="px-4 py-2 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 disabled:opacity-60 transition-colors"
          >
            {loading ? "Rejecting..." : "Reject job"}
          </button>
        </div>
      </div>
    </div>
  );
}