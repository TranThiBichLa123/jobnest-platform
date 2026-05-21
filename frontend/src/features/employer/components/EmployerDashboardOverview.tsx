import Link from "next/link";
import {
  BiBarChartAlt2,
  BiBriefcase,
  BiBuilding,
  BiCheckCircle,
  BiPlus,
  BiTime,
  BiUserCheck,
} from "react-icons/bi";
import { Company, isCompanyVerified } from "@/shared/types/employer";
import { Job } from "@/shared/types/job";

type Props = {
  jobs: Job[];
  companies: Company[];
  totalApplications: number;
};

export default function EmployerDashboardOverview({
  jobs,
  companies,
  totalApplications,
}: Props) {
  const activeJobs = jobs.filter(
    (job) => String(job.status).toUpperCase() === "ACTIVE"
  ).length;

  const pendingJobs = jobs.filter((job) =>
    ["PENDING", "PENDING_REVIEW"].includes(String(job.status).toUpperCase())
  ).length;

  const rejectedJobs = jobs.filter(
    (job) => String(job.status).toUpperCase() === "REJECTED"
  ).length;

  const verifiedCompanies = companies.filter(isCompanyVerified).length;
  const pendingCompanies = companies.length - verifiedCompanies;

  const maxValue = Math.max(activeJobs, pendingJobs, rejectedJobs, 1);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
      <section className="xl:col-span-2 rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
              <BiBarChartAlt2 className="text-cyan-700 dark:text-cyan-300" />
              Recruitment Overview
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Summary of your companies, jobs, and applications.
            </p>
          </div>

          <Link
            href="/employer/jobs/create"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-cyan-700 text-white font-bold hover:bg-cyan-900 transition-colors"
          >
            <BiPlus />
            Post Job
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Metric icon={<BiBriefcase />} label="Total Jobs" value={jobs.length} />
          <Metric icon={<BiCheckCircle />} label="Active Jobs" value={activeJobs} />
          <Metric icon={<BiTime />} label="Pending Jobs" value={pendingJobs} />
          <Metric icon={<BiUserCheck />} label="Applications" value={totalApplications} />
        </div>

        <div className="space-y-4">
          <Bar label="Active" value={activeJobs} maxValue={maxValue} />
          <Bar label="Pending Review" value={pendingJobs} maxValue={maxValue} />
          <Bar label="Rejected" value={rejectedJobs} maxValue={maxValue} />
        </div>
      </section>

      <section className="rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
        <h2 className="text-xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
          <BiBuilding className="text-cyan-700 dark:text-cyan-300" />
          Company Status
        </h2>

        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Only verified companies can post jobs.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <Metric
            icon={<BiCheckCircle />}
            label="Verified"
            value={verifiedCompanies}
          />
          <Metric icon={<BiTime />} label="Pending" value={pendingCompanies} />
        </div>

        <div className="mt-6 rounded-2xl bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-100 dark:border-cyan-800 p-4 text-sm text-cyan-800 dark:text-cyan-200">
          This rule supports the Admin moderation flow: Employer creates company
          → Admin verifies company → Employer can post job.
        </div>
      </section>
    </div>
  );
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 p-4">
      <div className="text-xl text-cyan-700 dark:text-cyan-300">{icon}</div>
      <p className="mt-3 text-2xl font-extrabold text-gray-900 dark:text-white">
        {value}
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
    </div>
  );
}

function Bar({
  label,
  value,
  maxValue,
}: {
  label: string;
  value: number;
  maxValue: number;
}) {
  const width = `${Math.max((value / maxValue) * 100, value > 0 ? 10 : 3)}%`;

  return (
    <div>
      <div className="flex justify-between text-sm mb-2">
        <span className="font-semibold text-gray-700 dark:text-gray-300">
          {label}
        </span>
        <span className="text-gray-500 dark:text-gray-400">{value}</span>
      </div>

      <div className="h-3 rounded-full bg-gray-100 dark:bg-gray-900 overflow-hidden">
        <div
          className="h-full rounded-full bg-cyan-700 dark:bg-cyan-400 transition-all"
          style={{ width }}
        />
      </div>
    </div>
  );
}