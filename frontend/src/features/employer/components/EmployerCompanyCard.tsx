import { BiBuilding, BiCheckCircle, BiMap, BiTime, BiXCircle } from "react-icons/bi";
import { Company, isCompanyVerified } from "@/shared/types/employer";

type Props = {
  company: Company;
};

function getStatus(company: Company) {
  if (isCompanyVerified(company)) return "VERIFIED";
  return String(company.status || "PENDING_REVIEW").toUpperCase();
}

function getStatusClass(status: string) {
  if (status === "VERIFIED") {
    return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300";
  }

  if (status === "REJECTED") {
    return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300";
  }

  return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300";
}

function getStatusIcon(status: string) {
  if (status === "VERIFIED") return <BiCheckCircle />;
  if (status === "REJECTED") return <BiXCircle />;
  return <BiTime />;
}

export default function EmployerCompanyCard({ company }: Props) {
  const status = getStatus(company);

  return (
    <article className="rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="h-14 w-14 rounded-2xl bg-cyan-50 dark:bg-cyan-900/30 flex items-center justify-center shrink-0">
          {company.logoUrl ? (
            <img
              src={company.logoUrl}
              alt={company.name}
              className="h-full w-full object-cover rounded-2xl"
            />
          ) : (
            <BiBuilding className="text-2xl text-cyan-700 dark:text-cyan-300" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-extrabold text-gray-900 dark:text-white truncate">
              {company.name}
            </h3>

            <span
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${getStatusClass(
                status
              )}`}
            >
              {getStatusIcon(status)}
              {status}
            </span>
          </div>

          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {company.industry || "No industry provided"}
          </p>

          <p className="mt-2 flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
            <BiMap />
            {company.address || "No address provided"}
          </p>

          {status === "REJECTED" && company.rejectionReason && (
            <div className="mt-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 p-3 text-sm text-red-700 dark:text-red-300">
              {company.rejectionReason}
            </div>
          )}

          {status !== "VERIFIED" && status !== "REJECTED" && (
            <div className="mt-4 rounded-2xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-800 p-3 text-sm text-yellow-700 dark:text-yellow-300">
              This company is waiting for Admin approval. You cannot post jobs
              with this company yet.
            </div>
          )}
        </div>
      </div>
    </article>
  );
}