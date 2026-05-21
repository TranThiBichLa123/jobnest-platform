import Link from "next/link";
import { BiArrowBack, BiBriefcase, BiShield } from "react-icons/bi";

export default function EmployerJobCreateHeader() {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-800 via-slate-900 to-gray-950 p-6 md:p-8 shadow-2xl mb-8">
      <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="absolute -left-20 bottom-0 h-56 w-56 rounded-full bg-blue-500/20 blur-3xl" />

      <div className="relative">
        <Link
          href="/employer/jobs"
          className="inline-flex items-center gap-2 text-cyan-100 hover:text-white transition-colors mb-5"
        >
          <BiArrowBack />
          Back to employer jobs
        </Link>

        <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
          Post a Job
        </h1>

        <p className="mt-3 text-cyan-50/80 max-w-2xl">
          Create a new job posting. New jobs are submitted as pending review so
          Admin can moderate them before they become public.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          <InfoCard
            icon={<BiBriefcase />}
            title="Employer Action"
            text="Employer creates a job under one of their companies."
          />

          <InfoCard
            icon={<BiShield />}
            title="Admin Moderation"
            text="Job starts as PENDING_REVIEW and becomes visible after approval."
          />
        </div>
      </div>
    </section>
  );
}

function InfoCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl bg-white/10 border border-white/10 p-4 backdrop-blur">
      <div className="text-cyan-100 text-2xl">{icon}</div>
      <p className="mt-3 font-extrabold text-white">{title}</p>
      <p className="text-sm text-cyan-50/70">{text}</p>
    </div>
  );
}