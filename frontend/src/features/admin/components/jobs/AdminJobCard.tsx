import {
  BiBriefcase,
  BiCheck,
  BiDetail,
  BiHide,
  BiMap,
  BiMoney,
  BiRefresh,
  BiTime,
  BiUndo,
  BiX,
} from "react-icons/bi";
import AdminStatusBadge from "@/features/admin/components/AdminStatusBadge";
import { Job } from "@/shared/types/job";
import {
  formatJobType,
  formatSalary,
  getTimeAgo,
} from "@/shared/utils/job-format";

type Props = {
  job: Job;
  loadingId: number | null;
  onViewDetail: (job: Job) => void;
  onApprove: (job: Job) => void;
  onReject: (job: Job) => void;
  onHide: (job: Job) => void;
  onRestore: (job: Job) => void;
};

function normalizedStatus(job: Job) {
  return String(job.status || "UNKNOWN").toUpperCase();
}

function canApprove(job: Job) {
  const status = normalizedStatus(job);
  return status === "PENDING" || status === "PENDING_REVIEW";
}

function canReject(job: Job) {
  const status = normalizedStatus(job);
  return status === "PENDING" || status === "PENDING_REVIEW";
}

function canHide(job: Job) {
  return normalizedStatus(job) === "ACTIVE";
}

function canRestore(job: Job) {
  const status = normalizedStatus(job);
  return status === "HIDDEN" || status === "REJECTED";
}

export default function AdminJobCard({
  job,
  loadingId,
  onViewDetail,
  onApprove,
  onReject,
  onHide,
  onRestore,
}: Props) {
  const status = normalizedStatus(job);
  const isLoading = loadingId === job.id;

  return (
    <article className="rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5 shadow-sm hover:shadow-xl transition-all">
      <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <AdminStatusBadge value={status} />

            {job.isUrgent && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                Urgent
              </span>
            )}
          </div>

          <h2 className="text-xl font-extrabold text-gray-950 dark:text-white">
            {job.title}
          </h2>

          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
            {job.description || "No description provided."}
          </p>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 text-sm text-gray-600 dark:text-gray-400">
            <span className="flex items-center gap-2">
              <BiBriefcase className="text-cyan-700 dark:text-cyan-300" />
              {job.companyName || "Unknown company"}
            </span>

            <span className="flex items-center gap-2">
              <BiMap className="text-cyan-700 dark:text-cyan-300" />
              {job.location || "Unknown location"}
            </span>

            <span className="flex items-center gap-2">
              <BiMoney className="text-cyan-700 dark:text-cyan-300" />
              {formatSalary(job.minSalary, job.maxSalary)}
            </span>

            <span className="flex items-center gap-2">
              <BiTime className="text-cyan-700 dark:text-cyan-300" />
              {getTimeAgo(job.postedAt)}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-bold">
              {formatJobType(job.type)}
            </span>

            {job.categoryName && (
              <span className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-bold">
                {job.categoryName}
              </span>
            )}

            {job.experienceLevel && (
              <span className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-bold">
                {job.experienceLevel}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap xl:flex-col gap-3 shrink-0">
          <button
            type="button"
            onClick={() => onViewDetail(job)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <BiDetail />
            Detail
          </button>

          {canApprove(job) && (
            <button
              type="button"
              onClick={() => onApprove(job)}
              disabled={isLoading}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-green-600 text-white text-sm font-bold hover:bg-green-700 disabled:opacity-60 transition-colors"
            >
              {isLoading ? <BiRefresh className="animate-spin" /> : <BiCheck />}
              Approve
            </button>
          )}

          {canReject(job) && (
            <button
              type="button"
              onClick={() => onReject(job)}
              disabled={isLoading}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 disabled:opacity-60 transition-colors"
            >
              <BiX />
              Reject
            </button>
          )}

          {canHide(job) && (
            <button
              type="button"
              onClick={() => onHide(job)}
              disabled={isLoading}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gray-700 text-white text-sm font-bold hover:bg-gray-900 disabled:opacity-60 transition-colors"
            >
              <BiHide />
              Hide
            </button>
          )}

          {canRestore(job) && (
            <button
              type="button"
              onClick={() => onRestore(job)}
              disabled={isLoading}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-cyan-700 text-white text-sm font-bold hover:bg-cyan-900 disabled:opacity-60 transition-colors"
            >
              <BiUndo />
              Restore
            </button>
          )}
        </div>
      </div>
    </article>
  );
}