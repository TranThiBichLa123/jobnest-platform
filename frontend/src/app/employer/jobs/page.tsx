"use client";

import { useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/features/auth/context/AuthContext";
import { applicationApi } from "@/features/applications/api";
import { companyApi } from "@/features/company/api";
import EmployerAccessDenied from "@/features/employer/components/EmployerAccessDenied";
import EmployerCompanyCard from "@/features/employer/components/EmployerCompanyCard";
import EmployerDashboardOverview from "@/features/employer/components/EmployerDashboardOverview";
import EmployerJobCard from "@/features/employer/components/EmployerJobCard";
import EmployerJobsHeader from "@/features/employer/components/EmployerJobsHeader";
import { employerJobApi } from "@/features/jobs/api";
import { getApiErrorMessage } from "@/shared/api/http";
import { Company } from "@/shared/types/employer";
import { Job } from "@/shared/types/job";

export default function EmployerJobsPage() {
  const auth = useContext(AuthContext);
  const router = useRouter();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [applicationCounts, setApplicationCounts] = useState<Record<number, number>>({});
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

    loadDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth?.isLoading, auth?.user?.id, auth?.user?.role]);

  const totalApplications = useMemo(
    () => Object.values(applicationCounts).reduce((sum, count) => sum + count, 0),
    [applicationCounts]
  );

  const loadDashboardData = async () => {
    setLoading(true);
    setError("");

    try {
      const [jobsResponse, companiesResponse] = await Promise.all([
        employerJobApi.getMyJobs(0, 50),
        companyApi.getMyCompanies(0, 20),
      ]);

      const nextJobs = jobsResponse.content || [];
      const nextCompanies = companiesResponse.content || [];

      setJobs(nextJobs);
      setCompanies(nextCompanies);

      const countEntries = await Promise.allSettled(
        nextJobs.map(async (job) => {
          const response = await applicationApi.getJobApplications(job.id, 0, 1);
          return [job.id, response.totalElements ?? response.content?.length ?? 0] as const;
        })
      );

      const nextCounts: Record<number, number> = {};

      countEntries.forEach((entry) => {
        if (entry.status === "fulfilled") {
          const [jobId, count] = entry.value;
          nextCounts[jobId] = count;
        }
      });

      setApplicationCounts(nextCounts);
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to load employer dashboard."));
      setJobs([]);
      setCompanies([]);
      setApplicationCounts({});
    } finally {
      setLoading(false);
    }
  };

  if (auth?.isLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-28 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="h-72 rounded-3xl bg-gray-200 dark:bg-gray-800 animate-pulse mb-8" />
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
            <div className="xl:col-span-2 h-80 rounded-3xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
            <div className="h-80 rounded-3xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
          </div>
          <div className="space-y-4">
            {[1, 2].map((item) => (
              <div
                key={item}
                className="h-44 rounded-3xl bg-gray-200 dark:bg-gray-800 animate-pulse"
              />
            ))}
          </div>
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
        <EmployerJobsHeader />

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4 text-sm text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        <EmployerDashboardOverview
          jobs={jobs}
          companies={companies}
          totalApplications={totalApplications}
        />

        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">
                Company Profiles
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Admin verification controls whether a company can post jobs.
              </p>
            </div>
          </div>

          {companies.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {companies.slice(0, 4).map((company) => (
                <EmployerCompanyCard key={company.id} company={company} />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-8 text-center shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                No company profile yet
              </h3>
              <p className="mt-2 text-gray-500 dark:text-gray-400">
                Create a company profile from My Profile before posting jobs.
              </p>
            </div>
          )}
        </section>

        <section id="job-list">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">
                Job Postings
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Pending jobs require Admin approval before becoming public.
              </p>
            </div>
          </div>

          {jobs.length > 0 ? (
            <div className="space-y-4">
              {jobs.map((job) => (
                <EmployerJobCard
                  key={job.id}
                  job={job}
                  applicationsCount={applicationCounts[job.id] || 0}
                />
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
        </section>
      </div>
    </div>
  );
}