"use client";

import { useContext, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AuthContext } from "@/features/auth/context/AuthContext";
import { useAuthModal } from "@/features/auth/context/AuthModalContext";
import { applicationApi } from "@/features/applications/api";
import { jobApi, jobViewApi, savedJobApi } from "@/features/jobs/api";
import JobDescriptionSection from "@/features/jobs/components/JobDescriptionSection";
import JobDetailHeader from "@/features/jobs/components/JobDetailHeader";
import JobDetailSidebar from "@/features/jobs/components/JobDetailSidebar";
import { getApiErrorMessage } from "@/shared/api/http";
import { Job } from "@/shared/types/job";
import { isJobOpen } from "@/shared/utils/job-format";

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = Number(params?.id);

  const auth = useContext(AuthContext);
  const { openLoginModal } = useAuthModal();

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingAction, setCheckingAction] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [appliedStatus, setAppliedStatus] = useState<string | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  const open = isJobOpen(job);

  useEffect(() => {
    if (!jobId || Number.isNaN(jobId)) return;

    loadJob();

    jobViewApi.recordView(jobId).catch(() => {
      // Best-effort: view tracking must not break job detail.
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  useEffect(() => {
    if (!jobId || Number.isNaN(jobId)) return;
    checkCandidateState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId, auth?.user?.id, auth?.user?.role]);

  const loadJob = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const data = await jobApi.getJobById(jobId);
      setJob(data);
    } catch (error) {
      setMessage({
        type: "error",
        text: getApiErrorMessage(error, "Failed to load job detail."),
      });
    } finally {
      setLoading(false);
    }
  };

  const checkCandidateState = async () => {
    setCheckingAction(true);

    try {
      if (!auth?.user || auth.user.role !== "CANDIDATE") {
        setIsSaved(false);
        setHasApplied(false);
        setAppliedStatus(null);
        return;
      }

      const [savedResult, appliedResult] = await Promise.allSettled([
        savedJobApi.checkIfSaved(jobId),
        applicationApi.checkIfApplied(jobId) as Promise<any>,
      ]);

      if (savedResult.status === "fulfilled") {
        setIsSaved(Boolean(savedResult.value.isSaved));
      }

      if (appliedResult.status === "fulfilled") {
        setHasApplied(Boolean(appliedResult.value.hasApplied));
        setAppliedStatus(appliedResult.value.status || null);
      }
    } finally {
      setCheckingAction(false);
    }
  };

  const handleSaveJob = async () => {
    if (!auth?.user) {
      openLoginModal();
      return;
    }

    if (auth.user.role !== "CANDIDATE") {
      setMessage({ type: "error", text: "Only Job Seekers can save jobs." });
      return;
    }

    setMessage(null);

    try {
      if (isSaved) {
        await savedJobApi.unsaveJob(jobId);
        setIsSaved(false);
        setMessage({ type: "success", text: "Job removed from saved list." });
      } else {
        await savedJobApi.saveJob(jobId);
        setIsSaved(true);
        setMessage({ type: "success", text: "Job saved successfully." });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: getApiErrorMessage(error, "Failed to update saved job."),
      });
    }
  };

  const handleApply = () => {
    if (!auth?.user) {
      openLoginModal();
      return;
    }

    if (auth.user.role !== "CANDIDATE") {
      setMessage({
        type: "error",
        text: "Only Job Seekers can apply for jobs. Employer/Admin are blocked by role-based access control.",
      });
      return;
    }

    if (!open) {
      setMessage({ type: "error", text: "This job is no longer active." });
      return;
    }

    if (hasApplied) {
      setMessage({
        type: "info",
        text: `You already applied for this job${
          appliedStatus ? ` with status ${appliedStatus}` : ""
        }.`,
      });
      return;
    }

    router.push(`/jobs/${jobId}/apply`);
  };

  const messageClass =
    message?.type === "success"
      ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800"
      : message?.type === "info"
      ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800"
      : "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800";

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-32 px-4">
        <div className="max-w-6xl mx-auto h-96 rounded-3xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-32 px-4">
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-3xl p-10 text-center">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Job not found
          </h1>
          <Link
            href="/jobs"
            className="inline-block mt-4 text-cyan-700 dark:text-cyan-300 hover:underline"
          >
            Back to jobs
          </Link>
        </div>
      </div>
    );
  }

  const applyButtonLabel = !auth?.user
    ? "Login to Apply"
    : auth.user.role !== "CANDIDATE"
    ? "Candidate Only"
    : hasApplied
    ? appliedStatus
      ? `Applied: ${appliedStatus}`
      : "Already Applied"
    : open
    ? "Apply Now"
    : "Job Closed";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-28 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        {message && (
          <div className={`mb-6 rounded-2xl border p-4 text-sm ${messageClass}`}>
            {message.text}
          </div>
        )}

        <JobDetailHeader job={job} isOpen={open} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <div className="lg:col-span-2">
            <JobDescriptionSection job={job} />
          </div>

          <JobDetailSidebar
            isSaved={isSaved}
            checkingAction={checkingAction}
            applyButtonLabel={applyButtonLabel}
            hasApplied={hasApplied}
            isOpen={open}
            isCandidate={auth?.user?.role === "CANDIDATE"}
            onSave={handleSaveJob}
            onApply={handleApply}
          />
        </div>
      </div>
    </div>
  );
}