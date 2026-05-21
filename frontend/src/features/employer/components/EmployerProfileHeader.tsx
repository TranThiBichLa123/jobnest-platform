import Link from "next/link";
import { BiBriefcase, BiBuilding, BiPlus } from "react-icons/bi";

export default function EmployerProfileHeader() {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-800 via-slate-900 to-gray-950 p-6 md:p-8 shadow-2xl mb-8">
      <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="absolute -left-20 bottom-0 h-56 w-56 rounded-full bg-blue-500/20 blur-3xl" />

      <div className="relative flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
            Employer Profile
          </h1>

          <p className="mt-3 text-cyan-50/80 max-w-2xl">
            Manage your employer account and company verification status.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/employer/jobs"
            className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white/10 border border-white/10 text-white font-bold hover:bg-white/20 transition-colors"
          >
            <BiBriefcase />
            Dashboard
          </Link>

          <Link
            href="/employer/jobs/create"
            className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-cyan-500 text-white font-bold hover:bg-cyan-600 transition-colors"
          >
            <BiPlus />
            Post Job
          </Link>

          <Link
            href="#companies"
            className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white text-cyan-900 font-bold hover:bg-cyan-50 transition-colors"
          >
            <BiBuilding />
            Companies
          </Link>
        </div>
      </div>
    </section>
  );
}