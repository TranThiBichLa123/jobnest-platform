"use client";

import { useState, useEffect, useContext } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { BiBookmark, BiCircle, BiShareAlt, BiBriefcase, BiTime, BiMoney, BiMap } from "react-icons/bi";
import { FaBookmark } from "react-icons/fa";
import { AuthContext } from "@/context/AuthContext";
import { useAuthModal } from "@/context/AuthModalContext";
import { applicationApi, savedJobApi, jobViewApi } from "@/lib/api";
import { server } from "@/lib/config";
import useFetch from "@/hooks/useFetch";
import { Job } from "@/types/job";

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params?.id as string;
  
  const auth = useContext(AuthContext);
  const { openLoginModal } = useAuthModal();
  
  const [hasApplied, setHasApplied] = useState(false);
  const [appliedStatus, setAppliedStatus] = useState<string | null>(null); // track status
  const [isSaved, setIsSaved] = useState(false);

  const { data: job, loading } = useFetch<Job>(`${server}/api/jobs/${jobId}`);

  // Record view when job loads
  useEffect(() => {
    if (jobId) {
      jobViewApi.recordView(Number(jobId)).catch((error) => {
        // Silently ignore auth errors (403/401) - anonymous views are optional
        if (error?.response?.status !== 403 && error?.response?.status !== 401) {
          console.error('Error recording view:', error);
        }
      });
    }
  }, [jobId]);

  // Check if user already applied
  useEffect(() => {
    if (auth?.user && jobId) {
      applicationApi.checkIfApplied(Number(jobId))
        .then((res: any) => {
          setHasApplied(res.hasApplied);
          setAppliedStatus(res.status || null); // status may be undefined
        })
        .catch((error) => {
          // Silently ignore auth errors
          if (error.response?.status !== 401 && error.response?.status !== 403) {
            console.error('Error checking applied status:', error);
          }
        });

      savedJobApi.checkIfSaved(Number(jobId))
        .then(res => setIsSaved(res.isSaved))
        .catch((error) => {
          // Silently ignore auth errors
          if (error.response?.status !== 401 && error.response?.status !== 403) {
            console.error('Error checking saved status:', error);
          }
        });
    }
  }, [auth?.user, jobId]);

  const handleSaveJob = async () => {
    if (!auth?.user) {
      openLoginModal();
      return;
    }

    try {
      if (isSaved) {
        await savedJobApi.unsaveJob(Number(jobId));
        setIsSaved(false);
      } else {
        await savedJobApi.saveJob(Number(jobId));
        setIsSaved(true);
      }
    } catch (error: any) {
      console.error("Error saving job:", error);
      alert(error.response?.data?.message || "Failed to save job");
    }
  };

  // Helper for Apply button logic
  const renderApplyButton = () => {
    if (appliedStatus === "WITHDRAWN") {
      return (
        <Link
          href={auth?.user ? `/jobs/${jobId}/apply` : "#"}
          onClick={(e) => {
            if (!auth?.user) {
              e.preventDefault();
              openLoginModal();
            }
          }}
          className="block w-full bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors text-center"
        >
          Apply Again
        </Link>
      );
    }
    if (hasApplied) {
      return (
        <div className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-6 py-3 rounded-lg font-semibold text-center">
          ✓ Already Applied
        </div>
      );
    }
    return (
      <Link
        href={auth?.user ? `/jobs/${jobId}/apply` : "#"}
        onClick={(e) => {
          if (!auth?.user) {
            e.preventDefault();
            openLoginModal();
          }
        }}
        className="block w-full bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors text-center"
      >
        Apply Now
      </Link>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Job Not Found</h1>
          <Link href="/jobs" className="text-cyan-600 hover:underline">
            Back to Jobs
          </Link>
        </div>
      </div>
    );
  }

  const skills = job.skills ? job.skills.split(',').map((s: string) => s.trim()) : [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 pb-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Job Header Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-6">
          {/* Banner Image */}
          <div className="relative h-40 bg-gradient-to-r from-cyan-500 to-blue-600">
            {job.companyLogo && (
              <div className="absolute -bottom-12 left-8">
                <img
                  src={job.companyLogo}
                  alt={job.companyName || "Company"}
                  className="w-24 h-24 rounded-xl bg-white border-4 border-white object-cover"
                />
              </div>
            )}
          </div>

          {/* Job Info */}
          <div className="pt-16 px-8 pb-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {job.title}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-gray-600 dark:text-gray-400">
                  <span className="text-lg text-cyan-600 font-semibold">
                    {job.companyName}
                  </span>
                  <span className="flex items-center gap-1">
                    <BiMap className="text-lg" />
                    {job.location}
                  </span>
                  <span className="px-3 py-1 bg-cyan-100 dark:bg-cyan-900 text-cyan-800 dark:text-cyan-200 rounded-full text-sm">
                    {job.type}
                  </span>
                  {job.isUrgent && (
                    <span className="px-3 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-full text-sm font-semibold">
                      URGENT
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button 
                  onClick={handleSaveJob}
                  className="p-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  title={isSaved ? "Unsave job" : "Save job"}
                >
                  {isSaved ? (
                    <FaBookmark className="text-xl text-cyan-600" />
                  ) : (
                    <BiBookmark className="text-xl text-gray-700 dark:text-gray-300" />
                  )}
                </button>
                <button className="p-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors">
                  <BiShareAlt className="text-xl text-gray-700 dark:text-gray-300" />
                </button>
              </div>
            </div>

            {/* Skills */}
            {skills.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {skills.map((skill: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="md:col-span-2">
            {/* Job Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 border dark:border-gray-700 rounded-lg">
                  <BiBriefcase className="text-2xl text-cyan-600 mx-auto mb-2" />
                  <p className="text-xs text-gray-600 dark:text-gray-400">Experience</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{job.experience || "N/A"}</p>
                </div>
                <div className="text-center p-3 border dark:border-gray-700 rounded-lg">
                  <BiTime className="text-2xl text-cyan-600 mx-auto mb-2" />
                  <p className="text-xs text-gray-600 dark:text-gray-400">Level</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{job.experienceLevel || "N/A"}</p>
                </div>
                <div className="text-center p-3 border dark:border-gray-700 rounded-lg">
                  <BiBriefcase className="text-2xl text-cyan-600 mx-auto mb-2" />
                  <p className="text-xs text-gray-600 dark:text-gray-400">Type</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{job.type}</p>
                </div>
                <div className="text-center p-3 border dark:border-gray-700 rounded-lg">
                  <BiMoney className="text-2xl text-cyan-600 mx-auto mb-2" />
                  <p className="text-xs text-gray-600 dark:text-gray-400">Salary</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {job.minSalary && job.maxSalary 
                      ? `$${job.minSalary.toLocaleString()} - $${job.maxSalary.toLocaleString()}`
                      : "Negotiable"}
                  </p>
                </div>
              </div>
            </div>

            {/* Job Description */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Job Description</h2>
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                  {job.description}
                </p>
              </div>
            </div>

            {/* Requirements */}
            {job.education && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Requirements</h2>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <BiCircle className="text-cyan-600 mt-1 flex-shrink-0" />
                    <p className="text-gray-700 dark:text-gray-300">Education: {job.education}</p>
                  </div>
                  {job.experience && (
                    <div className="flex items-start gap-2">
                      <BiCircle className="text-cyan-600 mt-1 flex-shrink-0" />
                      <p className="text-gray-700 dark:text-gray-300">Experience: {job.experience}</p>
                    </div>
                  )}
                  {skills.length > 0 && (
                    <div className="flex items-start gap-2">
                      <BiCircle className="text-cyan-600 mt-1 flex-shrink-0" />
                      <p className="text-gray-700 dark:text-gray-300">Skills: {skills.join(', ')}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="md:col-span-1">
            {/* Apply Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sticky top-24">
              <div className="text-center">
                {renderApplyButton()}
              </div>

              {/* Job Meta */}
              <div className="mt-6 pt-6 border-t dark:border-gray-700">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Posted</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {job.postedAt ? new Date(job.postedAt).toLocaleDateString() : "Recently"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Category</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {job.categoryName || "General"}
                    </span>
                  </div>
                  {job.viewCount !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Views</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{job.viewCount}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
