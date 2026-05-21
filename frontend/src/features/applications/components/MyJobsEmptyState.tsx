import Link from "next/link";
import { BiBriefcase } from "react-icons/bi";

type Props = {
  title: string;
  description: string;
};

export default function MyJobsEmptyState({ title, description }: Props) {
  return (
    <div className="rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-12 text-center shadow-sm">
      <div className="mx-auto w-16 h-16 rounded-2xl bg-cyan-50 dark:bg-cyan-900/30 flex items-center justify-center">
        <BiBriefcase className="text-3xl text-cyan-700 dark:text-cyan-300" />
      </div>

      <h3 className="mt-5 text-xl font-bold text-gray-900 dark:text-white">
        {title}
      </h3>

      <p className="mt-2 text-gray-500 dark:text-gray-400">{description}</p>

      <Link
        href="/jobs"
        className="inline-block mt-6 px-6 py-3 rounded-2xl bg-cyan-700 hover:bg-cyan-800 text-white font-bold transition-colors"
      >
        Browse Jobs
      </Link>
    </div>
  );
}