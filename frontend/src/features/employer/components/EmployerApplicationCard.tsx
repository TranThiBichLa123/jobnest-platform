import { BiEnvelope, BiFile, BiLinkExternal, BiTime } from "react-icons/bi";
import { server } from "@/config/env";
import { ApplicationResponse } from "@/shared/types/applications";
import {
  formatDate,
  getApplicationStatusClass,
  getApplicationStatusLabel,
} from "@/shared/utils/application-format";

type Props = {
  application: ApplicationResponse;
  onUpdateStatus: (application: ApplicationResponse) => void;
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

  return rawUrl;
}

export default function EmployerApplicationCard({
  application,
  onUpdateStatus,
}: Props) {
  const cvUrl = getCvUrl(application);
  const cvName = application.cvTitle || application.cvFileName || "Candidate CV";

  return (
    <article className="rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-5 shadow-sm hover:shadow-xl transition-all">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-3">
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

          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {application.candidateName || "Candidate"}
          </h2>

          <p className="mt-1 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <BiEnvelope />
            {application.candidateEmail || "No email"}
          </p>

          {application.coverLetter && (
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
              {application.coverLetter}
            </p>
          )}

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
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No CV link available
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => onUpdateStatus(application)}
          disabled={application.status === "WITHDRAWN"}
          className="px-4 py-2 rounded-xl bg-cyan-700 text-white text-sm font-bold hover:bg-cyan-900 disabled:bg-gray-300 disabled:text-gray-500 dark:disabled:bg-gray-700 transition-colors"
        >
          Update Status
        </button>
      </div>
    </article>
  );
}