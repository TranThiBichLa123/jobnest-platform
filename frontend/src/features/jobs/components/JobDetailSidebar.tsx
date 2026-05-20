"use client";

import { BiBookmark, BiCheckCircle, BiShareAlt } from "react-icons/bi";
import { FaBookmark } from "react-icons/fa";

type Props = {
  isSaved: boolean;
  checkingAction: boolean;
  applyButtonLabel: string;
  hasApplied: boolean;
  isOpen: boolean;
  isCandidate?: boolean;
  onSave: () => void;
  onApply: () => void;
};

export default function JobDetailSidebar({
  isSaved,
  checkingAction,
  applyButtonLabel,
  hasApplied,
  isOpen,
  isCandidate,
  onSave,
  onApply,
}: Props) {
  return (
    <aside className="space-y-5">
      <div className="rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm p-5">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Apply for this job
        </h2>

        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Submit your application using one of your uploaded CVs.
        </p>

        <button
          onClick={onApply}
          disabled={checkingAction || hasApplied || !isOpen}
          className="mt-5 w-full px-6 py-3 rounded-2xl bg-cyan-700 hover:bg-cyan-800 text-white font-bold transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {checkingAction ? "Checking..." : applyButtonLabel}
        </button>

        <div className="grid grid-cols-2 gap-3 mt-3">
          <button
            onClick={onSave}
            disabled={checkingAction}
            className="px-4 py-3 rounded-2xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2 font-semibold text-gray-700 dark:text-gray-200"
          >
            {isSaved ? (
              <FaBookmark className="text-cyan-600" />
            ) : (
              <BiBookmark />
            )}
            Save
          </button>

          <button
            type="button"
            className="px-4 py-3 rounded-2xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2 font-semibold text-gray-700 dark:text-gray-200"
          >
            <BiShareAlt />
            Share
          </button>
        </div>

        {isCandidate && !hasApplied && isOpen && (
          <p className="mt-4 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
            <BiCheckCircle />
            Make sure your CV is up to date before applying.
          </p>
        )}
      </div>
    </aside>
  );
}