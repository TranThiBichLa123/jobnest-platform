"use client";

import { FiMapPin, FiSearch, FiSliders } from "react-icons/fi";

type Props = {
  keyword: string;
  location: string;
  type: string;
  onKeywordChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClear: () => void;
};

export default function JobSearchPanel({
  keyword,
  location,
  type,
  onKeywordChange,
  onLocationChange,
  onTypeChange,
  onSubmit,
  onClear,
}: Props) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-800 via-slate-900 to-gray-950 p-6 md:p-8 shadow-2xl mb-8">
      <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="absolute -left-16 bottom-0 h-48 w-48 rounded-full bg-blue-500/20 blur-3xl" />

      <div className="relative">
        <div className="flex items-center gap-2 text-cyan-100 text-sm mb-3">
          <FiSliders />
          <span>Smart job discovery</span>
        </div>

        <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
          Find your next opportunity
        </h1>

        <p className="mt-3 text-cyan-50/80 max-w-2xl">
          Browse active job posts, filter by role and location, then apply using
          your secured uploaded CV.
        </p>

        <form
          onSubmit={onSubmit}
          className="mt-8 rounded-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur p-3 shadow-xl"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 px-3 py-3 bg-gray-50 dark:bg-gray-800">
              <FiSearch className="text-gray-400" />
              <input
                value={keyword}
                onChange={(e) => onKeywordChange(e.target.value)}
                placeholder="Job title or keyword"
                className="w-full bg-transparent outline-none text-gray-900 dark:text-white"
              />
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 px-3 py-3 bg-gray-50 dark:bg-gray-800">
              <FiMapPin className="text-gray-400" />
              <input
                value={location}
                onChange={(e) => onLocationChange(e.target.value)}
                placeholder="Location"
                className="w-full bg-transparent outline-none text-gray-900 dark:text-white"
              />
            </div>

            <select
              value={type}
              onChange={(e) => onTypeChange(e.target.value)}
              className="rounded-xl border border-gray-200 dark:border-gray-700 px-3 py-3 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none"
            >
              <option value="">All job types</option>
              <option value="FULLTIME">Full Time</option>
              <option value="PARTTIME">Part Time</option>
              <option value="REMOTE">Remote</option>
              <option value="CONTRACT">Contract</option>
              <option value="FREELANCE">Freelance</option>
              <option value="INTERNSHIP">Internship</option>
            </select>

            <button
              type="submit"
              className="rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white font-bold transition-colors"
            >
              Search Jobs
            </button>
          </div>

          <button
            type="button"
            onClick={onClear}
            className="mt-3 text-sm text-cyan-700 dark:text-cyan-300 hover:underline"
          >
            Clear all filters
          </button>
        </form>
      </div>
    </div>
  );
}