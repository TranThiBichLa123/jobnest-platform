import { BiMoney } from "react-icons/bi";
import { Job } from "@/shared/types/job";
import { formatJobType, formatSalary } from "@/shared/utils/job-format";

export default function JobInfoGrid({ job }: { job: Job }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
      <InfoCard label="Job Type" value={formatJobType(String(job.type))} />
      <InfoCard label="Salary" value={formatSalary(job.minSalary, job.maxSalary)} icon={<BiMoney />} />
      <InfoCard label="Experience" value={job.experience || job.experienceLevel || "Not specified"} />
      <InfoCard label="Education" value={job.education || "Not specified"} />
    </div>
  );
}

function InfoCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-gray-50 dark:bg-gray-900 p-4 border dark:border-gray-700">
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className="mt-1 font-bold text-gray-900 dark:text-white flex items-center gap-1">
        {icon}
        {value}
      </p>
    </div>
  );
}