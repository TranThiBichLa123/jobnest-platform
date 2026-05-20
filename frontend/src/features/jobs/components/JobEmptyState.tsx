import { FiBriefcase } from "react-icons/fi";

export default function JobEmptyState() {
  return (
    <div className="rounded-3xl bg-white dark:bg-gray-800 border dark:border-gray-700 p-12 text-center shadow-sm">
      <div className="mx-auto w-16 h-16 rounded-2xl bg-cyan-50 dark:bg-cyan-900/30 flex items-center justify-center">
        <FiBriefcase className="text-3xl text-cyan-700 dark:text-cyan-300" />
      </div>

      <h3 className="mt-5 text-xl font-bold text-gray-900 dark:text-white">
        No active jobs found
      </h3>

      <p className="mt-2 text-gray-500 dark:text-gray-400">
        Try another keyword, location, or clear current filters.
      </p>
    </div>
  );
}