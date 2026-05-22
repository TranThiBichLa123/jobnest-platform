"use client";

import { useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BiBriefcase, BiCheckCircle, BiHide, BiTime } from "react-icons/bi";
import { AuthContext } from "@/features/auth/context/AuthContext";
import { adminJobApi } from "@/features/admin/api";
import AdminAccessDenied from "@/features/admin/components/AdminAccessDenied";
import AdminDonutChart from "@/features/admin/components/AdminDonutChart";
import AdminMetricCard from "@/features/admin/components/AdminMetricCard";
import AdminShell from "@/features/admin/components/AdminShell";
import AdminJobCard from "@/features/admin/components/jobs/AdminJobCard";
import AdminJobDetailModal from "@/features/admin/components/jobs/AdminJobDetailModal";
import AdminJobFilters from "@/features/admin/components/jobs/AdminJobFilters";
import AdminJobRejectDialog from "@/features/admin/components/jobs/AdminJobRejectDialog";
import { getApiErrorMessage } from "@/shared/api/http";
import { Job } from "@/shared/types/job";

export default function AdminJobsPage() {
  const auth = useContext(AuthContext);
  const router = useRouter();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [activeStatus, setActiveStatus] = useState("");
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [rejectTarget, setRejectTarget] = useState<Job | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    if (auth?.isLoading) return;

    if (!auth?.user) {
      router.push("/");
      return;
    }

    if (auth.user.role !== "ADMIN") {
      setLoading(false);
      return;
    }

    loadJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth?.isLoading, auth?.user?.id, auth?.user?.role, activeStatus]);

  const stats = useMemo(() => {
    const pending = jobs.filter((job) =>
      ["PENDING", "PENDING_REVIEW"].includes(String(job.status).toUpperCase())
    ).length;

    const active = jobs.filter(
      (job) => String(job.status).toUpperCase() === "ACTIVE"
    ).length;

    const rejected = jobs.filter(
      (job) => String(job.status).toUpperCase() === "REJECTED"
    ).length;

    const hidden = jobs.filter(
      (job) => String(job.status).toUpperCase() === "HIDDEN"
    ).length;

    return {
      total: jobs.length,
      pending,
      active,
      rejected,
      hidden,
    };
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    const q = keyword.trim().toLowerCase();

    if (!q) return jobs;

    return jobs.filter((job) => {
      return (
        job.title?.toLowerCase().includes(q) ||
        job.companyName?.toLowerCase().includes(q) ||
        job.location?.toLowerCase().includes(q) ||
        job.type?.toLowerCase().includes(q) ||
        job.status?.toLowerCase().includes(q)
      );
    });
  }, [jobs, keyword]);

  const loadJobs = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await adminJobApi.getJobs(
        activeStatus || undefined,
        undefined,
        0,
        100
      );

      setJobs(response.content || []);
    } catch (error) {
      setMessage({
        type: "error",
        text: getApiErrorMessage(error, "Failed to load jobs."),
      });
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const updateJobInList = (jobId: number, nextStatus: string) => {
    setJobs((prev) =>
      prev.map((job) =>
        job.id === jobId
          ? {
              ...job,
              status: nextStatus,
            }
          : job
      )
    );
  };

  const handleApprove = async (job: Job) => {
    setActionLoadingId(job.id);
    setMessage(null);

    try {
      await adminJobApi.approveJob(job.id);
      updateJobInList(job.id, "ACTIVE");

      setMessage({
        type: "success",
        text: `${job.title} has been approved.`,
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: getApiErrorMessage(error, "Failed to approve job."),
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (reason: string) => {
    if (!rejectTarget) return;

    setActionLoadingId(rejectTarget.id);
    setMessage(null);

    try {
      await adminJobApi.rejectJob(rejectTarget.id);
      updateJobInList(rejectTarget.id, "REJECTED");

      setMessage({
        type: "success",
        text: `${rejectTarget.title} has been rejected.`,
      });

      setRejectTarget(null);
    } catch (error) {
      setMessage({
        type: "error",
        text: getApiErrorMessage(error, "Failed to reject job."),
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleHide = async (job: Job) => {
    setActionLoadingId(job.id);
    setMessage(null);

    try {
      await adminJobApi.hideJob(job.id);
      updateJobInList(job.id, "HIDDEN");

      setMessage({
        type: "success",
        text: `${job.title} has been hidden.`,
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: getApiErrorMessage(error, "Failed to hide job."),
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRestore = async (job: Job) => {
    setActionLoadingId(job.id);
    setMessage(null);

    try {
      await adminJobApi.restoreJob(job.id);
      updateJobInList(job.id, "ACTIVE");

      setMessage({
        type: "success",
        text: `${job.title} has been restored.`,
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: getApiErrorMessage(error, "Failed to restore job."),
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  if (auth?.isLoading || loading) {
    return (
      <AdminShell title="Jobs" description="Loading job moderation queue...">
        <div className="h-96 rounded-3xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
      </AdminShell>
    );
  }

  if (!auth?.user) return null;

  if (auth.user.role !== "ADMIN") {
    return <AdminAccessDenied />;
  }

  return (
    <AdminShell
      title="Job Moderation"
      description="Approve, reject, hide, or restore job postings across the platform."
    >
      {message && (
        <div
          className={`mb-6 rounded-2xl border p-4 text-sm ${
            message.type === "success"
              ? "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
              : "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <AdminMetricCard
          title="Total Jobs"
          value={stats.total}
          description={`${stats.pending} pending review`}
          icon={<BiBriefcase />}
          iconClassName="bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300"
          sparklineClassName="text-cyan-700 dark:text-cyan-300"
          sparkline={[1, 2, 2.5, 3, 2.8, 4, stats.total]}
        />

        <AdminMetricCard
          title="Pending"
          value={stats.pending}
          description="Needs admin review"
          icon={<BiTime />}
          trend="+6.3%"
          iconClassName="bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-300"
          sparklineClassName="text-amber-500 dark:text-amber-300"
          sparkline={[1, 1.5, 1.2, 2, 1.8, 2.4, stats.pending]}
        />

        <AdminMetricCard
          title="Active"
          value={stats.active}
          description="Visible to candidates"
          icon={<BiCheckCircle />}
          trend="+18.7%"
          iconClassName="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-300"
          sparklineClassName="text-emerald-600 dark:text-emerald-300"
          sparkline={[1, 1.2, 2, 2.3, 2, 3, stats.active]}
        />

        <AdminMetricCard
          title="Hidden"
          value={stats.hidden + stats.rejected}
          description={`${stats.rejected} rejected jobs`}
          icon={<BiHide />}
          trend="-2.1%"
          trendColor="text-red-600"
          iconClassName="bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-300"
          sparklineClassName="text-rose-500 dark:text-rose-300"
          sparkline={[1, 0.8, 1.1, 0.9, 1.2, 1, stats.hidden + stats.rejected]}
        />
      </div>

      <AdminDonutChart
        title="Jobs by Status"
        items={[
          {
            label: "Active",
            value: stats.active,
            className: "text-emerald-500 bg-emerald-500",
          },
          {
            label: "Pending",
            value: stats.pending,
            className: "text-amber-500 bg-amber-500",
          },
          {
            label: "Rejected",
            value: stats.rejected,
            className: "text-rose-500 bg-rose-500",
          },
          {
            label: "Hidden",
            value: stats.hidden,
            className: "text-gray-500 bg-gray-500",
          },
        ]}
      />

      <div className="mt-6">
        <AdminJobFilters
          keyword={keyword}
          activeStatus={activeStatus}
          onKeywordChange={setKeyword}
          onStatusChange={setActiveStatus}
          onRefresh={loadJobs}
        />
      </div>

      {filteredJobs.length > 0 ? (
        <div className="space-y-4">
          {filteredJobs.map((job) => (
            <AdminJobCard
              key={job.id}
              job={job}
              loadingId={actionLoadingId}
              onViewDetail={setSelectedJob}
              onApprove={handleApprove}
              onReject={setRejectTarget}
              onHide={handleHide}
              onRestore={handleRestore}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-10 text-center shadow-sm">
          <h2 className="text-xl font-extrabold text-gray-950 dark:text-white">
            No jobs found
          </h2>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Job moderation requests will appear here.
          </p>
        </div>
      )}

      <AdminJobDetailModal
        job={selectedJob}
        onClose={() => setSelectedJob(null)}
      />

      <AdminJobRejectDialog
        open={Boolean(rejectTarget)}
        job={rejectTarget}
        loading={Boolean(actionLoadingId)}
        onCancel={() => setRejectTarget(null)}
        onConfirm={handleReject}
      />
    </AdminShell>
  );
}