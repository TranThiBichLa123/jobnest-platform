import {
  BiBuilding,
  BiCheck,
  BiFile,
  BiMap,
  BiRefresh,
  BiX,
} from "react-icons/bi";
import AdminStatusBadge from "@/features/admin/components/AdminStatusBadge";
import { resolveAdminFileUrl } from "@/features/admin/utils/admin-file-url";
import { Company } from "@/shared/types/employer";

type Props = {
  company: Company;
  loadingId: number | null;
  onApprove: (company: Company) => void;
  onReject: (company: Company) => void;
};

function getCompanyLogo(company: Company) {
  return (
    resolveAdminFileUrl(company.logoUrl) || "/images/default-company.jpg"
  );
}

function canModerate(company: Company) {
  const status = String(company.status || "").toUpperCase();
  return status === "PENDING_REVIEW" || status === "PENDING";
}

export default function AdminCompanyCard({
  company,
  loadingId,
  onApprove,
  onReject,
}: Props) {
  const status = String(company.status || "PENDING_REVIEW").toUpperCase();
  const verificationUrl = resolveAdminFileUrl(company.verificationDocumentPath);
  const isLoading = loadingId === company.id;

  return (
    <article className="rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5 shadow-sm hover:shadow-xl transition-all">
      <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-5">
        <div className="flex gap-4 min-w-0">
          <div className="h-16 w-16 rounded-2xl bg-cyan-50 dark:bg-cyan-900/30 overflow-hidden border border-cyan-100 dark:border-cyan-800 shrink-0">
            <img
              src={getCompanyLogo(company)}
              alt={`${company.name} logo`}
              className="h-full w-full object-cover"
              onError={(event) => {
                event.currentTarget.src = "/images/default-company.jpg";
              }}
            />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-extrabold text-gray-950 dark:text-white truncate">
                {company.name}
              </h2>

              <AdminStatusBadge value={status} />
            </div>

            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {company.industry || "No industry provided"}
            </p>

            <p className="mt-2 flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
              <BiMap />
              {company.address || "No address provided"}
            </p>

            {company.rejectionReason && (
              <div className="mt-4 rounded-2xl border border-red-100 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-700 dark:text-red-300">
                <span className="font-bold">Reject reason:</span>{" "}
                {company.rejectionReason}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap xl:flex-col gap-3 shrink-0">
          <a
            href={getCompanyLogo(company)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <BiBuilding />
            View Logo
          </a>

          {verificationUrl ? (
            <a
              href={verificationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <BiFile />
              View PDF
            </a>
          ) : (
            <button
              type="button"
              disabled
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-400 cursor-not-allowed"
            >
              <BiFile />
              No PDF
            </button>
          )}

          {canModerate(company) ? (
            <>
              <button
                type="button"
                onClick={() => onApprove(company)}
                disabled={isLoading}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-green-600 text-white text-sm font-bold hover:bg-green-700 disabled:opacity-60 transition-colors"
              >
                {isLoading ? <BiRefresh className="animate-spin" /> : <BiCheck />}
                Approve
              </button>

              <button
                type="button"
                onClick={() => onReject(company)}
                disabled={isLoading}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 disabled:opacity-60 transition-colors"
              >
                <BiX />
                Reject
              </button>
            </>
          ) : (
            <div className="rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
              No moderation action available.
            </div>
          )}
        </div>
      </div>
    </article>
  );
}