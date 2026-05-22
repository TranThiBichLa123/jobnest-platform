"use client";

import { BiBriefcase, BiMap, BiMoney, BiTime, BiX } from "react-icons/bi";
import AdminStatusBadge from "@/features/admin/components/AdminStatusBadge";
import { Job } from "@/shared/types/job";
import {
  formatJobType,
  formatSalary,
  getTimeAgo,
} from "@/shared/utils/job-format";

type Props = {
  job: Job | null;
  onClose: () => void;
};

function Field({ label, value }: { label: string; value?: string | number }) {
  return (
    <div className="rounded-2xl bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 p-4">
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className="mt-1 font-bold text-gray-950 dark:text-white break-words">
        {value || "N/A"}
      </p>
    </div>
  );
}

export default function AdminJobDetailModal({ job, onClose }: Props) {
  if (!job) return null;

  return (
    <div className="fixed inset-0 z-[30000] bg-black/50 flex items-center justify-center px-4">
      <div className="w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-2xl">
        <div className="sticky top-0 z-10 bg-white/95 dark:bg-gray-900/95 backdrop-blur border-b border-gray-100 dark:border-gray-800 p-6 flex items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <AdminStatusBadge value={job.status} />

              {job.isUrgent && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                  Urgent
                </span>
              )}
            </div>

            <h2 className="mt-3 text-2xl font-extrabold text-gray-950 dark:text-white">
              {job.title}
            </h2>

            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Admin moderation detail view
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="h-11 w-11 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <BiX className="text-2xl" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <Field label="Company" value={job.companyName} />
            <Field label="Employer" value={job.employerName} />
            <Field label="Category" value={job.categoryName} />
            <Field label="Job Type" value={formatJobType(job.type)} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <Field label="Location" value={job.location} />
            <Field label="Salary" value={formatSalary(job.minSalary, job.maxSalary)} />
            <Field label="Experience" value={job.experience || job.experienceLevel} />
            <Field label="Education" value={job.education} />
          </div>

          <section className="rounded-3xl bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 p-5">
            <h3 className="font-extrabold text-gray-950 dark:text-white">
              Job Description
            </h3>
            <p className="mt-3 whitespace-pre-line text-gray-600 dark:text-gray-300 leading-relaxed">
              {job.description || "No description provided."}
            </p>
          </section>

          <section className="rounded-3xl bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 p-5">
            <h3 className="font-extrabold text-gray-950 dark:text-white">
              Skills / Requirements
            </h3>
            <p className="mt-3 whitespace-pre-line text-gray-600 dark:text-gray-300 leading-relaxed">
              {job.skills || "No skills provided."}
            </p>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4">
              <BiMap className="text-cyan-700 dark:text-cyan-300" />
              {job.location || "N/A"}
            </div>

            <div className="flex items-center gap-2 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4">
              <BiMoney className="text-cyan-700 dark:text-cyan-300" />
              {formatSalary(job.minSalary, job.maxSalary)}
            </div>

            <div className="flex items-center gap-2 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4">
              <BiTime className="text-cyan-700 dark:text-cyan-300" />
              {getTimeAgo(job.postedAt)}
            </div>
          </div>

          <div className="rounded-3xl bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-100 dark:border-cyan-800 p-5 text-sm text-cyan-800 dark:text-cyan-200">
            <div className="flex items-center gap-2 font-bold">
              <BiBriefcase />
              Moderation note
            </div>

            <p className="mt-2">
              Approving this job makes it public for candidates. Hiding or
              rejecting it removes it from public discovery.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}