import Link from "next/link";
import { BiMap, BiMoney, BiTime, BiUserCheck } from "react-icons/bi";
import { Job } from "@/shared/types/job";
import {
  formatJobType,
  formatSalary,
  getTimeAgo,
} from "@/shared/utils/job-format";

type Props = {
  job: Job;
  applicationsCount?: number;
};

function getStatusClass(status?: string) {
  const normalized = String(status || "").toUpperCase();

  if (normalized === "ACTIVE") {
    return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300";
  }

  if (normalized === "PENDING_REVIEW" || normalized === "PENDING") {
    return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300";
  }

  if (normalized === "REJECTED") {
    return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300";
  }

  return "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300";
}

function isPublicJob(status?: string) {
  return String(status || "").toUpperCase() === "ACTIVE";
}

export default function EmployerJobCard({ job, applicationsCount = 0 }: Props) {
  const publicJob = isPublicJob(job.status);

  return (
    <article className="rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-5 shadow-sm hover:shadow-xl transition-all">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusClass(
                job.status
              )}`}
            >
              {job.status || "UNKNOWN"}
            </span>

            {job.isUrgent && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                Urgent
              </span>
            )}

            <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300">
              {applicationsCount} applicants
            </span>
          </div>

          {publicJob ? (
            <Link
              href={`/jobs/${job.id}`}
              className="text-xl font-bold text-gray-900 dark:text-white hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors"
            >
              {job.title}
            </Link>
          ) : (
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {job.title}
            </h2>
          )}

          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
            {job.description}
          </p>

          <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <BiMap />
              {job.location || "Unknown location"}
            </span>

            <span className="flex items-center gap-1">
              <BiMoney />
              {formatSalary(job.minSalary, job.maxSalary)}
            </span>

            <span className="flex items-center gap-1">
              <BiTime />
              {getTimeAgo(job.postedAt)}
            </span>

            <span>{formatJobType(job.type)}</span>
          </div>

          {!publicJob && (
            <div className="mt-4 rounded-2xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-800 p-3 text-sm text-yellow-700 dark:text-yellow-300">
              This job is not public yet. Admin approval is required before
              candidates can view and apply.
            </div>
          )}
        </div>

        <div className="flex lg:flex-col gap-3 shrink-0">
          <Link
            href={`/employer/jobs/${job.id}/applications`}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-cyan-700 text-white text-sm font-bold hover:bg-cyan-900 transition-colors"
          >
            <BiUserCheck />
            View Applicants
          </Link>

          {publicJob ? (
            <Link
              href={`/jobs/${job.id}`}
              className="inline-flex items-center justify-center px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Public Detail
            </Link>
          ) : (
            <button
              type="button"
              disabled
              className="inline-flex items-center justify-center px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-400 dark:text-gray-500 cursor-not-allowed"
            >
              Not Public Yet
            </button>
          )}
        </div>
      </div>
    </article>
  );
}