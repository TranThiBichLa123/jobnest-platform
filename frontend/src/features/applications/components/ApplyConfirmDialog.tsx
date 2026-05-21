import { CandidateCV } from "@/shared/types/cv";
import { Job } from "@/shared/types/job";

type Props = {
  open: boolean;
  job: Job;
  selectedCV?: CandidateCV;
  submitting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function ApplyConfirmDialog({
  open,
  job,
  selectedCV,
  submitting,
  onCancel,
  onConfirm,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[50000] bg-black/60 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-gray-800 shadow-2xl p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Confirm application
        </h2>

        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Please review your selected CV before submitting.
        </p>

        <div className="mt-5 rounded-2xl bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 p-4 space-y-3">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Job</p>
            <p className="font-bold text-gray-900 dark:text-white">
              {job.title}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Company</p>
            <p className="font-bold text-gray-900 dark:text-white">
              {job.companyName || "Company"}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">CV</p>
            <p className="font-bold text-gray-900 dark:text-white">
              {selectedCV?.title || "No CV selected"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="rounded-2xl px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={submitting || !selectedCV}
            className="rounded-2xl px-4 py-3 bg-cyan-700 hover:bg-cyan-800 text-white font-bold transition-colors disabled:bg-gray-400"
          >
            {submitting ? "Submitting..." : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}