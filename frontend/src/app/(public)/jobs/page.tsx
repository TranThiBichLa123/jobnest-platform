"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { jobApi, PageResponse } from "@/features/jobs/api";
import JobCard from "@/features/jobs/components/JobCard";
import JobEmptyState from "@/features/jobs/components/JobEmptyState";
import JobListSkeleton from "@/features/jobs/components/JobListSkeleton";
import JobSearchPanel from "@/features/jobs/components/JobSearchPanel";
import { getApiErrorMessage } from "@/shared/api/http";
import { Job } from "@/shared/types/job";

function JobsContent() {
  const searchParams = useSearchParams();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [keyword, setKeyword] = useState(searchParams.get("keyword") || "");
  const [location, setLocation] = useState(searchParams.get("location") || "");
  const [type, setType] = useState(searchParams.get("type") || "");
  const [page, setPage] = useState(0);
  const [meta, setMeta] = useState<Pick<
    PageResponse<Job>,
    "totalPages" | "totalElements"
  >>({
    totalPages: 0,
    totalElements: 0,
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const loadJobs = async (nextPage = page) => {
    setLoading(true);
    setMessage(null);

    try {
      const hasSearch = keyword.trim() || location.trim() || type;

      const response = hasSearch
        ? await jobApi.searchJobs({
            keyword: keyword.trim(),
            location: location.trim(),
            type: type || undefined,
            page: nextPage,
            size: 9,
          })
        : await jobApi.getJobs({
            page: nextPage,
            size: 9,
          });

      setJobs(response.content || []);
      setMeta({
        totalPages: response.totalPages || 0,
        totalElements: response.totalElements || 0,
      });
      setPage(response.number || nextPage);
    } catch (error) {
      setJobs([]);
      setMeta({ totalPages: 0, totalElements: 0 });
      setMessage(getApiErrorMessage(error, "Failed to load jobs."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadJobs(0);
  };

  const clearFilters = () => {
    setKeyword("");
    setLocation("");
    setType("");
    setTimeout(() => loadJobs(0), 0);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-28 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        <JobSearchPanel
          keyword={keyword}
          location={location}
          type={type}
          onKeywordChange={setKeyword}
          onLocationChange={setLocation}
          onTypeChange={setType}
          onSubmit={handleSearch}
          onClear={clearFilters}
        />

        <div className="mb-5 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Recommended Jobs
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {loading
                ? "Loading active job posts..."
                : `${meta.totalElements} active job(s) found`}
            </p>
          </div>
        </div>

        {message && (
          <div className="mb-6 rounded-2xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 p-4">
            {message}
          </div>
        )}

        {loading ? (
          <JobListSkeleton />
        ) : jobs.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>

            {meta.totalPages > 1 && (
              <div className="flex justify-center items-center gap-3 mt-10">
                <button
                  disabled={page <= 0}
                  onClick={() => loadJobs(page - 1)}
                  className="px-5 py-2.5 rounded-xl border dark:border-gray-700 disabled:opacity-50 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800"
                >
                  Previous
                </button>

                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Page {page + 1} / {meta.totalPages}
                </span>

                <button
                  disabled={page >= meta.totalPages - 1}
                  onClick={() => loadJobs(page + 1)}
                  className="px-5 py-2.5 rounded-xl border dark:border-gray-700 disabled:opacity-50 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <JobEmptyState />
        )}
      </div>
    </div>
  );
}

export default function JobsPage() {
  return (
    <Suspense fallback={<div className="pt-28 text-center">Loading jobs...</div>}>
      <JobsContent />
    </Suspense>
  );
}