"use client";

import {
  BiBriefcase,
  BiEnvelope,
  BiFile,
  BiMap,
  BiTime,
  BiUser,
  BiX,
} from "react-icons/bi";
import AdminStatusBadge from "@/features/admin/components/AdminStatusBadge";
import { resolveAdminFileUrl } from "@/features/admin/utils/admin-file-url";
import { ApplicationResponse } from "@/shared/types/applications";

type Props = {
  application: ApplicationResponse | null;
  onClose: () => void;
};

function formatDate(value?: string) {
  if (!value) return "N/A";

  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

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

export default function AdminApplicationDetailModal({
  application,
  onClose,
}: Props) {
  if (!application) return null;

  const cvUrl = resolveAdminFileUrl(
    application.cvFileUrl || application.resumeUrl
  );

  const cvName =
    application.cvTitle ||
    application.cvFileName ||
    `CV #${application.cvId || "N/A"}`;

  return (
    <div className="fixed inset-0 z-[30000] bg-black/50 flex items-center justify-center px-4">
      <div className="w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-2xl">
        <div className="sticky top-0 z-10 bg-white/95 dark:bg-gray-900/95 backdrop-blur border-b border-gray-100 dark:border-gray-800 p-6 flex items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <AdminStatusBadge value={application.status} />

              <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300">
                Application #{application.id}
              </span>
            </div>

            <h2 className="mt-3 text-2xl font-extrabold text-gray-950 dark:text-white">
              {application.jobTitle || "Application detail"}
            </h2>

            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Admin monitoring view. Status updates are controlled by Employer
              ownership flow.
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
          <section>
            <h3 className="mb-4 text-lg font-extrabold text-gray-950 dark:text-white">
              Candidate Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field label="Candidate Name" value={application.candidateName} />
              <Field label="Candidate Email" value={application.candidateEmail} />
              <Field label="Candidate ID" value={application.candidateId} />
            </div>
          </section>

          <section>
            <h3 className="mb-4 text-lg font-extrabold text-gray-950 dark:text-white">
              Job Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field label="Job Title" value={application.jobTitle} />
              <Field label="Company" value={application.companyName} />
              <Field label="Job ID" value={application.jobId} />
            </div>
          </section>

          <section className="rounded-3xl bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 p-5">
            <h3 className="font-extrabold text-gray-950 dark:text-white">
              Cover Letter
            </h3>

            <p className="mt-3 whitespace-pre-line text-gray-600 dark:text-gray-300 leading-relaxed">
              {application.coverLetter || "No cover letter submitted."}
            </p>
          </section>

          <section className="rounded-3xl bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 p-5">
            <h3 className="font-extrabold text-gray-950 dark:text-white">
              Submitted CV
            </h3>

            {cvUrl ? (
              <a
                href={cvUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-cyan-700 px-5 py-3 text-white font-bold hover:bg-cyan-900 transition-colors"
              >
                <BiFile />
                Open CV PDF — {cvName}
              </a>
            ) : (
              <p className="mt-3 text-gray-500 dark:text-gray-400">
                No CV file available.
              </p>
            )}
          </section>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4">
              <BiTime className="text-cyan-700 dark:text-cyan-300" />
              Applied {formatDate(application.appliedAt)}
            </div>

            <div className="flex items-center gap-2 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4">
              <BiTime className="text-cyan-700 dark:text-cyan-300" />
              Reviewed {formatDate(application.reviewedAt)}
            </div>

            <div className="flex items-center gap-2 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4">
              <BiBriefcase className="text-cyan-700 dark:text-cyan-300" />
              Status: {application.status}
            </div>
          </div>

          <div className="rounded-3xl bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-100 dark:border-cyan-800 p-5 text-sm text-cyan-800 dark:text-cyan-200">
            <div className="flex items-center gap-2 font-bold">
              <BiUser />
              Security note
            </div>

            <p className="mt-2">
              Admin can audit application data and attached CVs, but does not
              update application status. Status changes remain under Employer
              ownership to preserve actor responsibility.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}