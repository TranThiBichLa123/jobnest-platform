import Link from "next/link";
import { BiArrowBack, BiBriefcase, BiUserCheck } from "react-icons/bi";
import { Job } from "@/shared/types/job";

type Props = {
  job: Job | null;
  totalApplications: number;
};

export default function EmployerApplicationsHeader({
  job,
  totalApplications,
}: Props) {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-800 via-slate-900 to-gray-950 p-6 md:p-8 shadow-2xl mb-8">
      <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-cyan-400/20 blur-3xl" />

      <div className="relative">
        <Link
          href="/employer/jobs"
          className="inline-flex items-center gap-2 text-cyan-100 hover:text-white transition-colors mb-5"
        >
          <BiArrowBack />
          Back to employer jobs
        </Link>

        <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
          Job Applications
        </h1>

        <p className="mt-3 text-cyan-50/80 max-w-2xl">
          {job?.title || "Review candidates who applied to this job."}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          <Stat icon={<BiBriefcase />} label="Job" value={job?.status || "N/A"} />
          <Stat
            icon={<BiUserCheck />}
            label="Applications"
            value={totalApplications}
          />
        </div>
      </div>
    </section>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl bg-white/10 border border-white/10 p-4 backdrop-blur">
      <div className="text-cyan-100 text-2xl">{icon}</div>
      <p className="mt-3 text-3xl font-extrabold text-white">{value}</p>
      <p className="text-sm text-cyan-50/70">{label}</p>
    </div>
  );
}