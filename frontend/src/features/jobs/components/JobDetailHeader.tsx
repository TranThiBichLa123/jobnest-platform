import { BiBriefcase, BiMap, BiTime } from "react-icons/bi";
import { Job } from "@/shared/types/job";
import { getSafeCompanyLogoSrc } from "@/shared/utils/image";
import { getTimeAgo } from "@/shared/utils/job-format";
import JobInfoGrid from "./JobInfoGrid";

type Props = {
  job: Job;
  isOpen: boolean;
};

export default function JobDetailHeader({ job, isOpen }: Props) {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 p-6">
      <div className="absolute right-0 top-0 h-40 w-40 bg-cyan-500/10 blur-3xl" />

      <div className="relative flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="flex items-start gap-5">
          <img
            src={getSafeCompanyLogoSrc(job.companyLogo)}
            alt={job.companyName || "Company"}
            className="w-20 h-20 rounded-3xl object-cover border dark:border-gray-700 shadow-sm"
          />

          <div>
            <div className="flex flex-wrap gap-2 mb-3">
              {job.isUrgent && (
                <Badge className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                  Urgent
                </Badge>
              )}

              <Badge
                className={
                  isOpen
                    ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                }
              >
                {isOpen ? "Active" : "Closed"}
              </Badge>
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">
              {job.title}
            </h1>

            <div className="flex flex-wrap gap-4 mt-4 text-gray-600 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <BiBriefcase />
                {job.companyName || "Company"}
              </span>
              <span className="flex items-center gap-1">
                <BiMap />
                {job.location}
              </span>
              <span className="flex items-center gap-1">
                <BiTime />
                {getTimeAgo(job.postedAt)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <JobInfoGrid job={job} />
    </section>
  );
}

function Badge({
  children,
  className,
}: {
  children: React.ReactNode;
  className: string;
}) {
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold ${className}`}>
      {children}
    </span>
  );
}