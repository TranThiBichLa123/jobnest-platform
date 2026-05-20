"use client";

import Link from "next/link";
import { BiMoney } from "react-icons/bi";
import { FiArrowUpRight, FiBriefcase, FiMapPin } from "react-icons/fi";
import { Job } from "@/shared/types/job";
import { getSafeCompanyLogoSrc } from "@/shared/utils/image";
import {
  formatJobType,
  formatSalary,
  getTimeAgo,
} from "@/shared/utils/job-format";

export default function JobCard({ job }: { job: Job }) {
  return (
    <Link href={`/jobs/${job.id}`} className="group block h-full">
      <article className="h-full rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-5 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 min-w-0">
            <img
              src={getSafeCompanyLogoSrc(job.companyLogo)}
              alt={job.companyName || "Company"}
              className="w-14 h-14 rounded-2xl object-cover border dark:border-gray-700"
            />

            <div className="min-w-0">
              <h2 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-1 group-hover:text-cyan-700 dark:group-hover:text-cyan-300">
                {job.title}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1 mt-1">
                {job.companyName || "Company"} · {getTimeAgo(job.postedAt)}
              </p>
            </div>
          </div>

          <div className="rounded-full bg-cyan-50 dark:bg-cyan-900/30 p-2 text-cyan-700 dark:text-cyan-300 group-hover:bg-cyan-700 group-hover:text-white transition-colors">
            <FiArrowUpRight />
          </div>
        </div>

        <p className="mt-5 text-sm text-gray-600 dark:text-gray-300 line-clamp-3 leading-6">
          {job.description}
        </p>

        <div className="flex flex-wrap gap-2 mt-5">
          <Badge>{formatJobType(String(job.type))}</Badge>
          {job.isUrgent && <Badge intent="danger">Urgent</Badge>}
          {job.experienceLevel && <Badge intent="purple">{job.experienceLevel}</Badge>}
        </div>

        <div className="mt-5 pt-5 border-t dark:border-gray-700 space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <FiMapPin className="text-cyan-700 dark:text-cyan-300" />
            <span className="line-clamp-1">{job.location}</span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <FiBriefcase className="text-cyan-700 dark:text-cyan-300" />
              {job.categoryName || "General"}
            </span>

            <span className="text-sm font-bold text-green-600 dark:text-green-400 flex items-center gap-1">
              <BiMoney />
              {formatSalary(job.minSalary, job.maxSalary)}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

function Badge({
  children,
  intent = "default",
}: {
  children: React.ReactNode;
  intent?: "default" | "danger" | "purple";
}) {
  const className =
    intent === "danger"
      ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
      : intent === "purple"
      ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
      : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300";

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${className}`}>
      {children}
    </span>
  );
}