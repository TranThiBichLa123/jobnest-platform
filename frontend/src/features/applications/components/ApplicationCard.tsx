import Link from "next/link";
import { BiFile, BiLinkExternal, BiTime, BiTrash } from "react-icons/bi";
import { server } from "@/config/env";
import { ApplicationResponse } from "@/shared/types/applications";
import {
  canWithdrawApplication,
  formatDate,
  getApplicationStatusClass,
  getApplicationStatusLabel,
} from "@/shared/utils/application-format";

type Props = {
  application: ApplicationResponse;
  onWithdraw: (application: ApplicationResponse) => void;
};

function getCvUrl(application: ApplicationResponse) {
  const rawUrl = application.cvFileUrl || application.resumeUrl;

  if (!rawUrl) return null;

  if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) {
    return rawUrl;
  }

  if (rawUrl.startsWith("/uploads")) {
    return `${server}${rawUrl}`;
  }

  if (rawUrl.startsWith("/")) {
    return rawUrl;
  }

  return rawUrl;
}

export default function ApplicationCard({ application, onWithdraw }: Props) {
  const canWithdraw = canWithdrawApplication(application.status);
  const cvUrl = getCvUrl(application);
  const cvName = application.cvTitle || application.cvFileName || "Candidate CV";

  return (
    <article className="rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-5 shadow-sm hover:shadow-xl transition-all">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <Link
            href={`/jobs/${application.jobId}`}
            className="text-xl font-bold text-gray-900 dark:text-white hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors"
          >
            {application.jobTitle}
          </Link>

          <div className="flex flex-wrap items-center gap-2 mt-3">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${getApplicationStatusClass(
                application.status
              )}`}
            >
              {getApplicationStatusLabel(application.status)}
            </span>

            <span className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
              <BiTime />
              Applied {formatDate(application.appliedAt)}
            </span>
          </div>
        </div>

        {canWithdraw && (
          <button
            type="button"
            onClick={() => onWithdraw(application)}
            className="p-2 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            title="Withdraw application"
          >
            <BiTrash className="text-xl" />
          </button>
        )}
      </div>

      {application.coverLetter && (
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
          {application.coverLetter}
        </p>
      )}

      {(application.cvTitle || application.cvFileName || cvUrl) && (
        <div className="mt-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 p-4">
          {cvUrl ? (
            <a
              href={cvUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-700 dark:text-gray-300 flex items-center justify-between gap-3 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors"
            >
              <span className="flex items-center gap-2 min-w-0">
                <BiFile className="text-cyan-700 dark:text-cyan-300 shrink-0" />
                <span className="truncate">
                  <span className="font-bold">CV:</span> {cvName}
                </span>
              </span>

              <span className="flex items-center gap-1 text-xs font-semibold shrink-0">
                View CV
                <BiLinkExternal />
              </span>
            </a>
          ) : (
            <p className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <BiFile className="text-cyan-700 dark:text-cyan-300" />
              <span>
                <span className="font-bold">CV:</span> {cvName}
              </span>
            </p>
          )}
        </div>
      )}

      <div className="mt-4">
        <Link
          href={`/jobs/${application.jobId}`}
          className="text-sm font-bold text-cyan-700 dark:text-cyan-300 hover:underline"
        >
          View Job Details
        </Link>
      </div>
    </article>
  );
}