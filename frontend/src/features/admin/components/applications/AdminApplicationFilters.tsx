"use client";

import { BiRefresh, BiSearch } from "react-icons/bi";

type Props = {
  keyword: string;
  activeStatus: string;
  onKeywordChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onRefresh: () => void;
};

const tabs = [
  { label: "All", value: "" },
  { label: "Pending", value: "PENDING" },
  { label: "Reviewed", value: "REVIEWED" },
  { label: "Shortlisted", value: "SHORTLISTED" },
  { label: "Accepted", value: "ACCEPTED" },
  { label: "Rejected", value: "REJECTED" },
  { label: "Withdrawn", value: "WITHDRAWN" },
];

export default function AdminApplicationFilters({
  keyword,
  activeStatus,
  onKeywordChange,
  onStatusChange,
  onRefresh,
}: Props) {
  return (
    <div className="mb-6 space-y-4">
      <div className="rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="flex flex-1 items-center gap-3 rounded-2xl bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 px-4 py-3">
            <BiSearch className="text-2xl text-cyan-700 dark:text-cyan-300 shrink-0" />

            <input
              value={keyword}
              onChange={(event) => onKeywordChange(event.target.value)}
              placeholder="Search applications by candidate, email, job, company, or status..."
              className="w-full bg-transparent outline-none text-gray-900 dark:text-white placeholder:text-gray-400"
            />
          </div>

          <button
            type="button"
            onClick={onRefresh}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-cyan-700 text-white font-bold hover:bg-cyan-900 transition-colors"
          >
            <BiRefresh />
            Refresh
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {tabs.map((tab) => (
          <button
            key={tab.value || "all"}
            type="button"
            onClick={() => onStatusChange(tab.value)}
            className={`px-4 py-2 rounded-2xl text-sm font-bold transition-colors ${
              activeStatus === tab.value
                ? "bg-cyan-700 text-white shadow-lg shadow-cyan-900/20"
                : "bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}