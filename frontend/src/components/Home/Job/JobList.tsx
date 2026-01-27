/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { FiBookmark } from "react-icons/fi";
import { FaBookmark } from "react-icons/fa";
import { motion } from "framer-motion";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "@/context/AuthContext";
import { useAuthModal } from "@/context/AuthModalContext";
import { savedJobApi } from "@/lib/api";

// Format salary to display (e.g., 80000 -> $80k)
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

// Format job type (e.g., "fulltime" -> "Full Time")
const formatJobType = (type?: string) => {
  if (!type) return "Not specified";
  const typeMap: { [key: string]: string } = {
    'fulltime': 'Full Time',
    'parttime': 'Part Time',
    'remote': 'Remote',
    'contract': 'Contract',
    'freelance': 'Freelance',
    'internship': 'Internship',
  };
  return typeMap[type.toLowerCase()] || type;
};

// Calculate time ago (e.g., "3 days ago")
const getTimeAgo = (dateString?: string) => {
  if (!dateString) return "Recently";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  
  if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffMinutes > 0) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  return 'Just now';
};

const JobList = ({ jobs, loading }: any) => {
  const auth = useContext(AuthContext);
  const { openLoginModal } = useAuthModal();
  const [savedJobs, setSavedJobs] = useState<Set<number>>(new Set());

  useEffect(() => {
    // Check which jobs are saved
    if (auth?.user && jobs?.length > 0) {
      jobs.forEach((job: any) => {
        savedJobApi.checkIfSaved(job.id)
          .then(res => {
            if (res.isSaved) {
              setSavedJobs(prev => new Set(prev).add(job.id));
            }
          })
          .catch((error) => {
            // Silently ignore auth errors (user not logged in or token expired)
            if (error.response?.status !== 401 && error.response?.status !== 403) {
              console.error('Error checking saved status:', error);
            }
          });
      });
    }
  }, [auth?.user, jobs]);

  const handleApplyClick = (e: React.MouseEvent) => {
    if (!auth?.user) {
      e.preventDefault();
      openLoginModal();
    }
  };

  const handleSaveJob = async (e: React.MouseEvent, jobId: number) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (!auth?.user) {
      openLoginModal();
      return;
    }

    try {
      const isSaved = savedJobs.has(jobId);
      if (isSaved) {
        await savedJobApi.unsaveJob(jobId);
        setSavedJobs(prev => {
          const newSet = new Set(prev);
          newSet.delete(jobId);
          return newSet;
        });
      } else {
        await savedJobApi.saveJob(jobId);
        setSavedJobs(prev => new Set(prev).add(jobId));
      }
    } catch (error: any) {
      console.error("Error saving job:", error);
      alert(error.response?.data?.message || "Failed to save job");
    }
  };

  return !loading ? (
    <>
      {jobs?.length > 0 ? (
        <>
          {jobs.map((job: any) => {
            const salaryRange = formatSalary(job.minSalary, job.maxSalary);
            const jobType = formatJobType(job.type);
            const timeAgo = getTimeAgo(job.postedAt);

            return (
            <motion.div
              key={job.id}
              className="
                bg-white dark:bg-[var(--dark-card)]
                border border-slate-200 dark:border-slate-700
                rounded-xl shadow-sm p-5 mt-5 transition-colors hover:shadow-md
              "
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              {/* Top Row */}
              <div className="flex justify-between items-start gap-4">
                {/* Logo + Info */}
                <div className="flex items-start gap-4 flex-1">
                  <img
                    src={job.companyLogo || "/images/a.png"}
                    alt="logo"
                    className="w-12 h-12 rounded-lg object-cover"
                  />

                  <div className="flex-1">
                    <Link
                      href={`/jobs/${job.id}`}
                      className="group"
                    >
                      <h1 className="text-base font-semibold dark:text-white hover:text-cyan-700 dark:hover:text-blue-400 transition-colors cursor-pointer line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        {job.title}
                      </h1>
                    </Link>

                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      {job.companyName || 'Company'} <span className="mx-2">·</span> {timeAgo}
                    </p>

                    {/* Tags */}
                    <div className="flex items-center gap-2 mt-3 flex-wrap text-sm">
                      <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-md text-blue-700 dark:text-blue-300 font-medium">
                        {jobType}
                      </span>
                      {job.experience && (
                        <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 rounded-md text-purple-700 dark:text-purple-300">
                          {job.experience}
                        </span>
                      )}
                      {job.experienceLevel && (
                        <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 rounded-md text-orange-700 dark:text-orange-300">
                          {job.experienceLevel}
                        </span>
                      )}
                      {job.isUrgent && (
                        <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 rounded-md text-red-700 dark:text-red-300 font-semibold">
                          🔥 Urgent
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Save Job */}
                <button
                  onClick={(e) => handleSaveJob(e, job.id)}
                  className="
                    flex items-center gap-2 bg-slate-100 
                    dark:bg-[var(--hover-color)]
                    text-gray-600 dark:text-gray-200
                    px-3 py-1.5 rounded-md hover:bg-slate-200
                    dark:hover:bg-[#2f3442] transition text-sm
                  "
                >
                  {savedJobs.has(job.id) ? (
                    <>
                      <FaBookmark className="text-cyan-600" /> Saved
                    </>
                  ) : (
                    <>
                      <FiBookmark /> Save
                    </>
                  )}
                </button>
              </div>

              {/* Description */}
              <p className="mt-4 text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-2">
                {job.description}
              </p>

              {/* Bottom Section */}
              <div className="flex flex-wrap justify-between items-center mt-6 gap-4">
                {/* Salary & Location */}
                <div className="flex items-center gap-6 flex-wrap">
                  <p className="text-gray-800 dark:text-white font-semibold text-lg">
                    {salaryRange}
                    <span className="text-sm text-gray-500 dark:text-gray-400 font-normal">
                      {" "}
                      / month
                    </span>
                  </p>

                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    📍 {job.location}
                  </p>
                </div>

                {/* Buttons */}
                <div className="flex items-center gap-3">
                  <Link
                    href={`/jobs/${job.id}`}
                    className="
                      bg-slate-100 dark:bg-[var(--hover-color)]
                      text-gray-700 dark:text-gray-200
                      px-5 py-2 rounded-md
                      hover:bg-slate-200 dark:hover:bg-[#2f3442]
                      transition
                    "
                  >
                    View Details
                  </Link>

                  <Link
                    href={`/jobs/${job.id}/apply`}
                    onClick={handleApplyClick}
                    className="
                      bg-cyan-700 hover:bg-cyan-800 text-white
                      px-6 py-2 rounded-md transition font-medium
                    "
                  >
                    Apply Now
                  </Link>
                </div>
              </div>
            </motion.div>
          )})}
        </>
      ) : (
        <div className="flex-center-center mt-5">
          <div className="image-wrapper">
            <img
              src="/images/a.png"
              alt="no results"
              className="mx-auto object-contain h-[350px] w-[350px]"
            />
            <h1 className="text-center mt-5 text-5xl opacity-60">
              Oops! No jobs found
            </h1>
          </div>
        </div>
      )}
    </>
  ) : (
    <>
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl bg-slate-200 dark:bg-[var(--hover-color)] h-40 mt-4 animate-pulse"
        />
      ))}
    </>
  );
};

export default JobList;
