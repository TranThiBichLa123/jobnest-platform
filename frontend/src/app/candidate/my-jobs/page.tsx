"use client";

import { useState, useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthContext } from "@/context/AuthContext";
import { applicationApi, savedJobApi, jobViewApi } from "@/lib/api";
import { BiBriefcase, BiMoney, BiTime, BiTrash } from "react-icons/bi";
import { BsBookmark, BsEye } from "react-icons/bs";
import { GrLocation } from "react-icons/gr";

type TabType = "applied" | "saved" | "viewed";

// Format salary
const formatSalary = (min?: number, max?: number) => {
  if (!min && !max) return "Competitive";
  const formatNum = (num: number) => {
    if (num >= 1000) return `$${(num / 1000).toFixed(0)}k`;
    return `$${num}`;
  };
  if (min && max) return `${formatNum(min)} - ${formatNum(max)}`;
  if (min) return `From ${formatNum(min)}`;
  if (max) return `Up to ${formatNum(max)}`;
  return "Competitive";
};

// Format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

// Get status badge color
const getStatusColor = (status: string) => {
  const colors: { [key: string]: string } = {
    'PENDING': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
    'REVIEWED': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    'SHORTLISTED': 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
    'ACCEPTED': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    'REJECTED': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
    'WITHDRAWN': 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300', // add gray for withdrawn
  };
  return colors[status] || colors['PENDING'];
};

export default function MyJobsPage() {
  const auth = useContext(AuthContext);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("applied");
  const [applications, setApplications] = useState<any[]>([]);
  const [savedJobs, setSavedJobs] = useState<any[]>([]);
  const [viewedJobs, setViewedJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth?.user) {
      router.push("/");
      return;
    }
    loadData();
  }, [auth?.user, router]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    let hasProfileError = false;

    // Load applied jobs
    try {
      const appsResponse = await applicationApi.getMyApplications();
      setApplications(appsResponse.content || appsResponse || []);
    } catch (error: any) {
      if (error?.response?.status === 403 || error?.response?.status === 401) {
        hasProfileError = true;
        setApplications([]);
      } else {
        console.error("Error loading applications:", error);
      }
    }

    // Load saved jobs
    try {
      const savedResponse = await savedJobApi.getMySavedJobs();
      setSavedJobs(savedResponse.content || savedResponse || []);
    } catch (error: any) {
      if (error?.response?.status === 403 || error?.response?.status === 401) {
        hasProfileError = true;
        setSavedJobs([]);
      } else {
        console.error("Error loading saved jobs:", error);
      }
    }

    // Load viewed jobs and remove duplicates
    try {
      const viewedResponse = await jobViewApi.getMyViewedJobs();
      const allViewedJobs = viewedResponse.content || viewedResponse || [];
      
      // Remove duplicate jobs using a Set to keep only first occurrence (most recent)
      const seenJobIds = new Set();
      const uniqueViewedJobs = allViewedJobs.filter((job: any) => {
        if (seenJobIds.has(job.id)) {
          return false;
        }
        seenJobIds.add(job.id);
        return true;
      });
      
      setViewedJobs(uniqueViewedJobs);
    } catch (error: any) {
      if (error?.response?.status === 403 || error?.response?.status === 401) {
        hasProfileError = true;
        setViewedJobs([]);
      } else {
        console.error("Error loading viewed jobs:", error);
      }
    }

    // Set error state if profile is required
    if (hasProfileError) {
      setError("profile_required");
    }

    setLoading(false);
  };

  const handleWithdrawApplication = async (id: number) => {
    if (!confirm("Are you sure you want to withdraw this application?")) return;
    
    try {
      await applicationApi.withdrawApplication(id);
      setApplications(applications.filter(app => app.id !== id));
      alert("Application withdrawn successfully");
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to withdraw application");
    }
  };

  const handleUnsaveJob = async (jobId: number) => {
    try {
      await savedJobApi.unsaveJob(jobId);
      setSavedJobs(savedJobs.filter(job => job.id !== jobId));
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to unsave job");
    }
  };

  if (!auth?.user) {
    return null;
  }

  // Show profile creation prompt if needed
  if (error === "profile_required") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 pb-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
            <div className="mb-6">
              <div className="w-20 h-20 bg-cyan-100 dark:bg-cyan-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <BiBriefcase className="text-4xl text-cyan-600 dark:text-cyan-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Complete Your Profile First
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                To apply for jobs and track your applications, you need to complete your candidate profile.
              </p>
            </div>
            <div className="flex gap-4 justify-center">
              <Link
                href="/profile"
                className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors font-medium"
              >
                Complete Profile
              </Link>
              <Link
                href="/"
                className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors font-medium"
              >
                Go to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show general error
  if (error === "general") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 pb-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Something went wrong
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              We couldn't load your jobs. Please try again.
            </p>
            <button
              onClick={loadData}
              className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            My Jobs
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track and manage your job applications, saved jobs, and viewing history
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg mb-6">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab("applied")}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === "applied"
                  ? "text-cyan-600 dark:text-cyan-400 border-b-2 border-cyan-600 dark:border-cyan-400"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <BiBriefcase className="text-lg" />
                <span>Jobs Applied</span>
                <span className="ml-1 px-2 py-0.5 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 rounded-full text-xs">
                  {applications.length}
                </span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab("saved")}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === "saved"
                  ? "text-cyan-600 dark:text-cyan-400 border-b-2 border-cyan-600 dark:border-cyan-400"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <BsBookmark className="text-lg" />
                <span>Jobs Saved</span>
                <span className="ml-1 px-2 py-0.5 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 rounded-full text-xs">
                  {savedJobs.length}
                </span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab("viewed")}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === "viewed"
                  ? "text-cyan-600 dark:text-cyan-400 border-b-2 border-cyan-600 dark:border-cyan-400"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <BsEye className="text-lg" />
                <span>Jobs Viewed</span>
                <span className="ml-1 px-2 py-0.5 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 rounded-full text-xs">
                  {viewedJobs.length}
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {loading ? (
            // Loading skeleton
            Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 animate-pulse"
              >
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            ))
          ) : (
            <>
              {/* Jobs Applied Tab */}
              {activeTab === "applied" && (
                <>
                  {applications.length > 0 ? (
                    applications.map((app, index) => (
                      <div
                        key={`app-${app.id}-${index}`}
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <Link
                                  href={`/jobs/${app.jobId}`}
                                  className="text-xl font-semibold text-gray-900 dark:text-white hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                                >
                                  {app.jobTitle}
                                </Link>
                                <div className="flex items-center gap-2 mt-2">
                                  <span
                                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                      app.status
                                    )}`}
                                  >
                                    {app.status}
                                  </span>
                                  <span className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                                    <BiTime />
                                    Applied {formatDate(app.appliedAt)}
                                  </span>
                                </div>
                                {/* Show withdrawn info if status is WITHDRAWN */}
                                {app.status === "WITHDRAWN" && (
                                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 italic">
                                    You withdrew this application on {formatDate(app.updatedAt || app.withdrawnAt || app.appliedAt)}
                                  </div>
                                )}
                              </div>
                              {/* Only show withdraw button if status is PENDING */}
                              {app.status === "PENDING" && (
                                <button
                                  onClick={() => handleWithdrawApplication(app.id)}
                                  className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                  title="You can only withdraw applications that are still pending."
                                >
                                  <BiTrash className="text-xl" />
                                </button>
                              )}
                              {/* No button for WITHDRAWN or other statuses */}
                            </div>

                            {app.coverLetter && (
                              <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                                {app.coverLetter}
                              </p>
                            )}

                            {app.cvTitle && (
                              <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                  <span className="font-medium">CV Used:</span> {app.cvTitle}
                                  {app.cvFileName && (
                                    <span className="text-gray-500 dark:text-gray-400"> ({app.cvFileName})</span>
                                  )}
                                </p>
                              </div>
                            )}

                            <div className="flex items-center gap-4 text-sm">
                              {app.resumeUrl && (
                                <a
                                  href={app.resumeUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-cyan-600 dark:text-cyan-400 hover:underline"
                                >
                                  View Resume
                                </a>
                              )}
                              <Link
                                href={`/jobs/${app.jobId}`}
                                className="text-cyan-600 dark:text-cyan-400 hover:underline"
                              >
                                View Job Details
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
                      <BiBriefcase className="mx-auto text-6xl text-gray-400 mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        No Applications Yet
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Start applying to jobs that match your skills
                      </p>
                      <Link
                        href="/jobs"
                        className="inline-block px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors"
                      >
                        Browse Jobs
                      </Link>
                    </div>
                  )}
                </>
              )}

              {/* Jobs Saved Tab */}
              {activeTab === "saved" && (
                <>
                  {savedJobs.length > 0 ? (
                    savedJobs.map((job, index) => (
                      <div
                        key={`saved-${job.id}-${index}`}
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <Link
                              href={`/jobs/${job.id}`}
                              className="text-xl font-semibold text-gray-900 dark:text-white hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                            >
                              {job.title}
                            </Link>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                              <span className="flex items-center gap-1">
                                <BiBriefcase />
                                {job.companyName}
                              </span>
                              <span className="flex items-center gap-1">
                                <GrLocation />
                                {job.location}
                              </span>
                              <span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-medium">
                                <BiMoney />
                                {formatSalary(job.minSalary, job.maxSalary)}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleUnsaveJob(job.id)}
                            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Remove from Saved"
                          >
                            <BiTrash className="text-xl" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
                      <BsBookmark className="mx-auto text-6xl text-gray-400 mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        No Saved Jobs
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Save jobs to review them later
                      </p>
                      <Link
                        href="/jobs"
                        className="inline-block px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors"
                      >
                        Browse Jobs
                      </Link>
                    </div>
                  )}
                </>
              )}

              {/* Jobs Viewed Tab */}
              {activeTab === "viewed" && (
                <>
                  {viewedJobs.length > 0 ? (
                    viewedJobs.map((job) => (
                      <div
                        key={job.id}
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
                      >
                        <Link
                          href={`/jobs/${job.id}`}
                          className="text-xl font-semibold text-gray-900 dark:text-white hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                        >
                          {job.title}
                        </Link>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <BiBriefcase />
                            {job.companyName}
                          </span>
                          <span className="flex items-center gap-1">
                            <GrLocation />
                            {job.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <BiTime />
                            Viewed {formatDate(job.viewedAt)}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
                      <BsEye className="mx-auto text-6xl text-gray-400 mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        No Viewing History
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Jobs you view will appear here
                      </p>
                      <Link
                        href="/jobs"
                        className="inline-block px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors"
                      >
                        Browse Jobs
                      </Link>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
