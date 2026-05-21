import Link from "next/link";

export default function MyJobsAccessDenied() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-32 px-4">
      <div className="max-w-3xl mx-auto rounded-3xl bg-white dark:bg-gray-800 border dark:border-gray-700 p-10 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Candidate only
        </h1>

        <p className="mt-2 text-gray-500 dark:text-gray-400">
          Only Job Seekers can manage job applications, saved jobs, and viewed
          jobs.
        </p>

        <Link
          href="/jobs"
          className="inline-block mt-5 text-cyan-700 dark:text-cyan-300 hover:underline"
        >
          Back to jobs
        </Link>
      </div>
    </div>
  );
}