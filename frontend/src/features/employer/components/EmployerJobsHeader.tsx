import { BiBriefcase, BiCheckCircle, BiTime } from "react-icons/bi";

type Props = {
  totalJobs: number;
  activeJobs: number;
  pendingJobs: number;
};

export default function EmployerJobsHeader({
  totalJobs,
  activeJobs,
  pendingJobs,
}: Props) {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-800 via-slate-900 to-gray-950 p-6 md:p-8 shadow-2xl mb-8">
      <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="absolute -left-20 bottom-0 h-56 w-56 rounded-full bg-blue-500/20 blur-3xl" />

      <div className="relative">
        <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
          Employer Jobs
        </h1>
        <p className="mt-3 text-cyan-50/80 max-w-2xl">
          Manage your job postings and review applications submitted by
          candidates.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <Stat icon={<BiBriefcase />} label="Total Jobs" value={totalJobs} />
          <Stat icon={<BiCheckCircle />} label="Active Jobs" value={activeJobs} />
          <Stat icon={<BiTime />} label="Pending Review" value={pendingJobs} />
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
  value: number;
}) {
  return (
    <div className="rounded-2xl bg-white/10 border border-white/10 p-4 backdrop-blur">
      <div className="text-cyan-100 text-2xl">{icon}</div>
      <p className="mt-3 text-3xl font-extrabold text-white">{value}</p>
      <p className="text-sm text-cyan-50/70">{label}</p>
    </div>
  );
}