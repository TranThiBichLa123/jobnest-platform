import Link from "next/link";
import { BiBriefcase, BiTime } from "react-icons/bi";
import { GrLocation } from "react-icons/gr";
import { Job } from "@/shared/types/job";
import { getSafeCompanyLogoSrc } from "@/shared/utils/image";
import { formatDate } from "@/shared/utils/application-format";

type ViewedJob = Job & {
  viewedAt?: string;
};

export default function ViewedJobCard({ job }: { job: ViewedJob }) {
  return (
    <article className="rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-5 shadow-sm hover:shadow-xl transition-all">
      <div className="flex items-start gap-4">
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

            {job.viewedAt && (
              <span className="flex items-center gap-1">
                <BiTime />
                Viewed {formatDate(job.viewedAt)}
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}