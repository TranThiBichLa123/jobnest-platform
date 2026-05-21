import Link from "next/link";
import { BiBriefcase, BiMoney, BiTrash } from "react-icons/bi";
import { GrLocation } from "react-icons/gr";
import { Job } from "@/shared/types/job";
import { formatSalary } from "@/shared/utils/job-format";
import { getSafeCompanyLogoSrc } from "@/shared/utils/image";

type Props = {
  job: Job;
  onUnsave: (job: Job) => void;
};

export default function SavedJobCard({ job, onUnsave }: Props) {
  return (
    <article className="rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-5 shadow-sm hover:shadow-xl transition-all">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 min-w-0">
          <img
            src={getSafeCompanyLogoSrc(job.companyLogo)}
            alt={job.companyName || "Company"}
            className="w-14 h-14 rounded-2xl object-cover border dark:border-gray-700"
          />

          <div className="min-w-0">
            <Link
              href={`/jobs/${job.id}`}
              className="text-xl font-bold text-gray-900 dark:text-white hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors"
            >
              {job.title}
            </Link>

            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-600 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <BiBriefcase />
                {job.companyName || "Company"}
              </span>

              <span className="flex items-center gap-1">
                <GrLocation />
                {job.location}
              </span>

              <span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-bold">
                <BiMoney />
                {formatSalary(job.minSalary, job.maxSalary)}
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onUnsave(job)}
          className="p-2 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          title="Remove from saved jobs"
        >
          <BiTrash className="text-xl" />
        </button>
      </div>
    </article>
  );
}