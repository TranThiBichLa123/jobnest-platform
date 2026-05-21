"use client";

import { useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/features/auth/context/AuthContext";
import { applicationApi } from "@/features/applications/api";
import MyJobsAccessDenied from "@/features/applications/components/MyJobsAccessDenied";
import MyJobsConfirmDialog from "@/features/applications/components/MyJobsConfirmDialog";
import MyJobsHeader from "@/features/applications/components/MyJobsHeader";
import MyJobsMessage, {
  MyJobsMessageState,
} from "@/features/applications/components/MyJobsMessage";
import MyJobsSkeleton from "@/features/applications/components/MyJobsSkeleton";
import MyJobsTabContent from "@/features/applications/components/MyJobsTabContent";
import MyJobsTabs, {
  MyJobsTab,
} from "@/features/applications/components/MyJobsTabs";
import {
  normalizeApplications,
  normalizeJobs,
  unwrapPageContent,
} from "@/features/applications/utils/my-jobs-mapper";
import { jobViewApi, savedJobApi } from "@/features/jobs/api";
import { getApiErrorMessage } from "@/shared/api/http";
import { ApplicationResponse } from "@/shared/types/applications";
import { Job } from "@/shared/types/job";

type ConfirmState =
  | {
      type: "withdraw";
      application: ApplicationResponse;
    }
  | {
      type: "unsave";
      job: Job;
    }
  | null;

export default function MyJobsPage() {
  const auth = useContext(AuthContext);
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<MyJobsTab>("applied");
  const [applications, setApplications] = useState<ApplicationResponse[]>([]);
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  const [viewedJobs, setViewedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmState, setConfirmState] = useState<ConfirmState>(null);
  const [message, setMessage] = useState<MyJobsMessageState | null>(null);

  useEffect(() => {
    if (auth?.isLoading) return;

    if (!auth?.user) {
      router.push("/");
      return;
    }

    if (auth.user.role !== "CANDIDATE") {
      setMessage({
        type: "error",
        text: "Only Job Seekers can access this page.",
      });
      setLoading(false);
      return;
    }

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth?.isLoading, auth?.user?.id, auth?.user?.role]);

  const counts = useMemo(
    () => ({
      applied: applications.length,
      saved: savedJobs.length,
      viewed: viewedJobs.length,
    }),
    [applications.length, savedJobs.length, viewedJobs.length]
  );

  const loadData = async () => {
    setLoading(true);
    setMessage(null);

    const [appsResult, savedResult, viewedResult] = await Promise.allSettled([
      applicationApi.getMyApplications(0, 20),
      savedJobApi.getMySavedJobs(0, 20),
      jobViewApi.getMyViewedJobs(0, 20),
    ]);

    if (appsResult.status === "fulfilled") {
      setApplications(
        normalizeApplications(unwrapPageContent<ApplicationResponse>(appsResult.value))
      );
    } else {
      setApplications([]);
    }

    if (savedResult.status === "fulfilled") {
      setSavedJobs(normalizeJobs(unwrapPageContent<unknown>(savedResult.value)));
    } else {
      setSavedJobs([]);
    }

    if (viewedResult.status === "fulfilled") {
      setViewedJobs(normalizeJobs(unwrapPageContent<unknown>(viewedResult.value)));
    } else {
      setViewedJobs([]);
    }

    const hasAllFailed =
      appsResult.status === "rejected" &&
      savedResult.status === "rejected" &&
      viewedResult.status === "rejected";

    if (hasAllFailed) {
      const reason =
        appsResult.reason || savedResult.reason || viewedResult.reason;

      setMessage({
        type: "error",
        text: getApiErrorMessage(reason, "Failed to load your jobs."),
      });
    }

    setLoading(false);
  };

  const confirmAction = async () => {
    if (!confirmState) return;

    setActionLoading(true);
    setMessage(null);

    try {
      if (confirmState.type === "withdraw") {
        await applicationApi.withdrawApplication(confirmState.application.id);

        setApplications((prev) =>
          prev.map((item) =>
            item.id === confirmState.application.id
              ? { ...item, status: "WITHDRAWN" }
              : item
          )
        );

        setMessage({
          type: "success",
          text: "Application withdrawn successfully.",
        });
      }

      if (confirmState.type === "unsave") {
        await savedJobApi.unsaveJob(confirmState.job.id);

        setSavedJobs((prev) =>
          prev.filter((job) => job.id !== confirmState.job.id)
        );

        setMessage({
          type: "success",
          text: "Job removed from saved list.",
        });
      }

      setConfirmState(null);
    } catch (error) {
      setMessage({
        type: "error",
        text: getApiErrorMessage(error, "Action failed. Please try again."),
      });
    } finally {
      setActionLoading(false);
    }
  };

  if (auth?.isLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-28 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="h-72 rounded-3xl bg-gray-200 dark:bg-gray-800 animate-pulse mb-8" />
          <MyJobsSkeleton />
        </div>
      </div>
    );
  }

  if (!auth?.user) return null;

  if (auth.user.role !== "CANDIDATE") {
    return <MyJobsAccessDenied />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-28 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        <MyJobsHeader
          applicationsCount={applications.length}
          savedCount={savedJobs.length}
          viewedCount={viewedJobs.length}
        />

        <MyJobsMessage message={message} />

        <MyJobsTabs
          activeTab={activeTab}
          counts={counts}
          onChange={setActiveTab}
        />

        <MyJobsTabContent
          activeTab={activeTab}
          applications={applications}
          savedJobs={savedJobs}
          viewedJobs={viewedJobs}
          onWithdraw={(application) =>
            setConfirmState({ type: "withdraw", application })
          }
          onUnsave={(job) => setConfirmState({ type: "unsave", job })}
        />
      </div>

      <MyJobsConfirmDialog
        open={Boolean(confirmState)}
        title={
          confirmState?.type === "withdraw"
            ? "Withdraw application?"
            : "Remove saved job?"
        }
        description={
          confirmState?.type === "withdraw"
            ? "You can only withdraw applications that are still pending."
            : "This job will be removed from your saved list."
        }
        confirmLabel={confirmState?.type === "withdraw" ? "Withdraw" : "Remove"}
        loading={actionLoading}
        onCancel={() => setConfirmState(null)}
        onConfirm={confirmAction}
      />
    </div>
  );
}