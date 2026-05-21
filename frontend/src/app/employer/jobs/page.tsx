"use client";

import { useContext, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BiPlus } from "react-icons/bi";
import { AuthContext } from "@/features/auth/context/AuthContext";
import EmployerAccessDenied from "@/features/employer/components/EmployerAccessDenied";
import EmployerJobCard from "@/features/employer/components/EmployerJobCard";
import { employerJobApi } from "@/features/jobs/api";
import { getApiErrorMessage } from "@/shared/api/http";
import { Job } from "@/shared/types/job";

export default function EmployerJobsPage() {
  const auth = useContext(AuthContext);
  const router = useRouter();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (auth?.isLoading) return;

    if (!auth?.user) {
      router.push("/");
      return;
    }

    if (auth.user.role !== "EMPLOYER") {
      setLoading(false);
      return;
    }

    loadJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth?.isLoading, auth?.user?.id, auth?.user?.role]);

  const loadJobs = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await employerJobApi.getMyJobs(0, 50);
      setJobs(response.content || []);
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to load employer jobs."));
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  if (auth?.isLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-28 pb-12 px-4">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="h-48 rounded-3xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
          {[1, 2].map((item) => (
            <div
              key={item}
              className="h-44 rounded-3xl bg-gray-200 dark:bg-gray-800 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!auth?.user) return null;

  if (auth.user.role !== "EMPLOYER") {
    return <EmployerAccessDenied />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-28 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        <section className="rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-6 shadow-sm mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
              Employer Jobs
            </h1>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Manage your posted jobs. Pending jobs require Admin approval before
              becoming public.
            </p>
          </div>

          <Link
            href="/employer/jobs/create"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-cyan-700 text-white font-bold hover:bg-cyan-900 transition-colors"
          >
            <BiPlus />
            Post Job
          </Link>
        </section>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4 text-sm text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        {jobs.length > 0 ? (
          <div className="space-y-4">
            {jobs.map((job) => (
              <EmployerJobCard key={job.id} job={job} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-10 text-center shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              No jobs yet
            </h2>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Your job postings will appear here after they are created.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}