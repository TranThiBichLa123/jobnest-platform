"use client";

import { useContext, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import ApplyConfirmDialog from "@/features/applications/components/ApplyConfirmDialog";
import ApplyJobHeader from "@/features/applications/components/ApplyJobHeader";
import ApplicationSummaryCard from "@/features/applications/components/ApplicationSummaryCard";
import CoverLetterPanel from "@/features/applications/components/CoverLetterPanel";
import CVSelectPanel from "@/features/applications/components/CVSelectPanel";
import { applicationApi } from "@/features/applications/api";
import { cvApi, candidateProfileApi } from "@/features/candidate/api";
import { jobApi } from "@/features/jobs/api";
import { AuthContext } from "@/features/auth/context/AuthContext";
import { getApiErrorMessage } from "@/shared/api/http";
import { CandidateCV } from "@/shared/types/cv";
import { Job } from "@/shared/types/job";
import { isJobOpen } from "@/shared/utils/job-format";

type MessageState = {
  type: "success" | "error" | "info";
  text: string;
};

export default function ApplyJobPage() {
  const params = useParams();
  const router = useRouter();
  const auth = useContext(AuthContext);

  const jobId = Number(params?.id);

  const [job, setJob] = useState<Job | null>(null);
  const [cvs, setCvs] = useState<CandidateCV[]>([]);
  const [selectedCvId, setSelectedCvId] = useState<number | null>(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [candidateName, setCandidateName] = useState("");
  const [message, setMessage] = useState<MessageState | null>(null);

  const [loadingJob, setLoadingJob] = useState(true);
  const [loadingCVs, setLoadingCVs] = useState(true);
  const [checkingApplied, setCheckingApplied] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  const selectedCV = useMemo(
    () => cvs.find((cv) => cv.id === selectedCvId),
    [cvs, selectedCvId]
  );

  const jobIsOpen = isJobOpen(job);

  useEffect(() => {
    if (auth?.isLoading) return;

    if (!auth?.user) {
      router.push("/");
      return;
    }

    if (auth.user.role !== "CANDIDATE") {
      setMessage({
        type: "error",
        text: "Only Job Seekers can apply for jobs.",
      });
      return;
    }

    if (!jobId || Number.isNaN(jobId)) {
      setMessage({ type: "error", text: "Invalid job id." });
      return;
    }

    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth?.isLoading, auth?.user?.id, auth?.user?.role, jobId]);

  const loadInitialData = async () => {
    await Promise.all([loadJob(), loadCandidateData(), checkApplied()]);
  };

  const loadJob = async () => {
    setLoadingJob(true);

    try {
      const data = await jobApi.getJobById(jobId);
      setJob(data);

      if (!isJobOpen(data)) {
        setMessage({
          type: "error",
          text: "This job is no longer accepting applications.",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: getApiErrorMessage(error, "Failed to load job information."),
      });
    } finally {
      setLoadingJob(false);
    }
  };

  const loadCandidateData = async () => {
    setLoadingCVs(true);

    try {
      const [profileResult, cvsResult] = await Promise.allSettled([
        candidateProfileApi.getMyProfile(),
        cvApi.getMyCVs(),
      ]);

      if (profileResult.status === "fulfilled") {
        setCandidateName(
          profileResult.value.fullName || auth?.user?.username || ""
        );

        if (profileResult.value.aboutMe) {
          setCoverLetter(profileResult.value.aboutMe);
        }
      } else {
        setCandidateName(auth?.user?.username || "");
      }

      if (cvsResult.status === "fulfilled") {
        const list = Array.isArray(cvsResult.value) ? cvsResult.value : [];
        setCvs(list);

        const defaultCV = list.find((cv) => cv.isDefault);
        setSelectedCvId(defaultCV?.id || list[0]?.id || null);
      } else {
        setCvs([]);
        setSelectedCvId(null);
        setMessage({
          type: "error",
          text: getApiErrorMessage(
            cvsResult.reason,
            "Failed to load your CVs."
          ),
        });
      }
    } finally {
      setLoadingCVs(false);
    }
  };

  const checkApplied = async () => {
    setCheckingApplied(true);

    try {
      const result = await applicationApi.checkIfApplied(jobId);

      if (result.hasApplied) {
        setHasApplied(true);
        setMessage({
          type: "info",
          text: result.status
            ? `You already applied for this job. Current status: ${result.status}.`
            : "You already applied for this job.",
        });
      }
    } catch (error: any) {
      if (error?.response?.status !== 401 && error?.response?.status !== 403) {
        setMessage({
          type: "error",
          text: getApiErrorMessage(
            error,
            "Failed to check application status."
          ),
        });
      }
    } finally {
      setCheckingApplied(false);
    }
  };

  const openConfirmDialog = () => {
    setMessage(null);

    if (!auth?.user) {
      router.push("/");
      return;
    }

    if (auth.user.role !== "CANDIDATE") {
      setMessage({
        type: "error",
        text: "Only Job Seekers can apply for jobs.",
      });
      return;
    }

    if (!job || !jobIsOpen) {
      setMessage({
        type: "error",
        text: "This job is no longer accepting applications.",
      });
      return;
    }

    if (hasApplied) {
      setMessage({
        type: "info",
        text: "You already applied for this job.",
      });
      return;
    }

    if (!selectedCvId) {
      setMessage({
        type: "error",
        text: "Please upload and select a CV before applying.",
      });
      return;
    }

    setConfirmOpen(true);
  };

  const submitApplication = async () => {
    if (!job || !selectedCvId) return;

    setSubmitting(true);
    setMessage(null);

    try {
      await applicationApi.applyForJob(job.id, {
        cvId: selectedCvId,
        coverLetter: coverLetter.trim() || undefined,
      });

      setConfirmOpen(false);
      setMessage({
        type: "success",
        text: "Application submitted successfully.",
      });

      router.push("/candidate/my-jobs");
    } catch (error) {
      setMessage({
        type: "error",
        text: getApiErrorMessage(error, "Failed to submit application."),
      });
    } finally {
      setSubmitting(false);
    }
  };

  const messageClass =
    message?.type === "success"
      ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800"
      : message?.type === "info"
      ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800"
      : "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800";

  if (auth?.isLoading || loadingJob) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-32 px-4">
        <div className="max-w-7xl mx-auto h-96 rounded-3xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
      </div>
    );
  }

  if (!auth?.user) return null;

  if (auth.user.role !== "CANDIDATE") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-32 px-4">
        <div className="max-w-3xl mx-auto rounded-3xl bg-white dark:bg-gray-800 border dark:border-gray-700 p-10 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Candidate only
          </h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Only Job Seekers can submit job applications.
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

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-32 px-4">
        <div className="max-w-3xl mx-auto rounded-3xl bg-white dark:bg-gray-800 border dark:border-gray-700 p-10 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Job not found
          </h1>
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

  const disabled =
    submitting ||
    checkingApplied ||
    loadingCVs ||
    hasApplied ||
    !jobIsOpen ||
    !selectedCvId;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-28 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        <ApplyJobHeader job={job} />

        {message && (
          <div className={`mt-6 rounded-2xl border p-4 text-sm ${messageClass}`}>
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <div className="lg:col-span-2 space-y-6">
            <CVSelectPanel
              cvs={cvs}
              loading={loadingCVs}
              selectedCvId={selectedCvId}
              onSelect={setSelectedCvId}
            />

            <CoverLetterPanel
              coverLetter={coverLetter}
              onChange={setCoverLetter}
            />
          </div>

          <ApplicationSummaryCard
            job={job}
            selectedCV={selectedCV}
            candidateName={candidateName}
            candidateEmail={auth.user.email}
            submitting={submitting}
            disabled={disabled}
            onSubmit={openConfirmDialog}
          />
        </div>
      </div>

      <ApplyConfirmDialog
        open={confirmOpen}
        job={job}
        selectedCV={selectedCV}
        submitting={submitting}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={submitApplication}
      />
    </div>
  );
}