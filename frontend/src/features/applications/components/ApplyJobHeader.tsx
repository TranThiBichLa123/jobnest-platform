import Link from "next/link";
import { BiArrowBack, BiBriefcase, BiMap, BiTime } from "react-icons/bi";
import { Job } from "@/shared/types/job";
import { getSafeCompanyLogoSrc } from "@/shared/utils/image";
import { formatJobType, getTimeAgo } from "@/shared/utils/job-format";

type Props = {
  job: Job;
};

export default function ApplyJobHeader({ job }: Props) {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-800 via-slate-900 to-gray-950 p-6 md:p-8 shadow-2xl">
      <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="absolute -left-20 bottom-0 h-56 w-56 rounded-full bg-blue-500/20 blur-3xl" />

      <div className="relative">
        <Link
          href={`/jobs/${job.id}`}
          className="inline-flex items-center gap-2 text-cyan-100 hover:text-white transition-colors text-sm mb-6"
        >
          <BiArrowBack />
          Back to job details
        </Link>

        <div className="flex flex-col md:flex-row md:items-center gap-5">
          <img
            src={getSafeCompanyLogoSrc(job.companyLogo)}
            alt={job.companyName || "Company"}
            className="w-20 h-20 rounded-3xl object-cover border border-white/20 shadow-lg"
          />

          <div className="min-w-0">
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-cyan-50 border border-white/10">
                {formatJobType(String(job.type))}
              </span>

              {job.isUrgent && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-100 border border-red-300/20">
                  Urgent
                </span>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Apply for {job.title}
            </h1>

            <div className="mt-4 flex flex-wrap gap-4 text-cyan-50/80">
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
    </section>
  );
}