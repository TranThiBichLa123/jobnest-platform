import {
  BiBriefcase,
  BiDetail,
  BiEnvelope,
  BiFile,
  BiTime,
  BiUser,
} from "react-icons/bi";
import AdminStatusBadge from "@/features/admin/components/AdminStatusBadge";
import { resolveAdminFileUrl } from "@/features/admin/utils/admin-file-url";
import { ApplicationResponse } from "@/shared/types/applications";

type Props = {
  application: ApplicationResponse;
  onViewDetail: (application: ApplicationResponse) => void;
};

function formatDate(value?: string) {
  if (!value) return "N/A";

  try {
    return new Date(value).toLocaleDateString();
  } catch {
    return value;
  }
}

function getCvUrl(application: ApplicationResponse) {
  return resolveAdminFileUrl(application.cvFileUrl || application.resumeUrl);
}

export default function AdminApplicationCard({
  application,
  onViewDetail,
}: Props) {
  const cvUrl = getCvUrl(application);
  const cvName =
    application.cvTitle || application.cvFileName || `CV #${application.cvId || "N/A"}`;

  return (
    <article className="rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5 shadow-sm hover:shadow-xl transition-all">
      <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <AdminStatusBadge value={application.status} />

            <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300">
              Application #{application.id}
            </span>
          </div>

          <h2 className="text-xl font-extrabold text-gray-950 dark:text-white">
            {application.jobTitle || "Unknown job"}
          </h2>

          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 text-sm text-gray-600 dark:text-gray-400">
            <span className="flex items-center gap-2">
              <BiUser className="text-cyan-700 dark:text-cyan-300" />
              {application.candidateName || "Unknown candidate"}
            </span>

            <span className="flex items-center gap-2">
              <BiEnvelope className="text-cyan-700 dark:text-cyan-300" />
              {application.candidateEmail || "No email"}
            </span>

            <span className="flex items-center gap-2">
              <BiBriefcase className="text-cyan-700 dark:text-cyan-300" />
              {application.companyName || "Unknown company"}
            </span>

            <span className="flex items-center gap-2">
              <BiTime className="text-cyan-700 dark:text-cyan-300" />
              Applied {formatDate(application.appliedAt)}
            </span>
          </div>

          {application.coverLetter && (
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
              {application.coverLetter}
            </p>
          )}

          <div className="mt-4 rounded-2xl bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 p-3">
            {cvUrl ? (
              <a
                href={cvUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-bold text-cyan-700 dark:text-cyan-300 hover:underline"
              >
                <BiFile />
                View submitted CV: {cvName}
              </a>
            ) : (
              <span className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <BiFile />
                No CV file available
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap xl:flex-col gap-3 shrink-0">
          <button
            type="button"
            onClick={() => onViewDetail(application)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <BiDetail />
            Detail
          </button>

          {cvUrl ? (
            <a
              href={cvUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-cyan-700 text-white text-sm font-bold hover:bg-cyan-900 transition-colors"
            >
              <BiFile />
              Open CV
            </a>
          ) : (
            <button
              type="button"
              disabled
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gray-200 dark:bg-gray-800 text-gray-400 text-sm font-bold cursor-not-allowed"
            >
              <BiFile />
              No CV
            </button>
          )}
        </div>
      </div>
    </article>
  );
}