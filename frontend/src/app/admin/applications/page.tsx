"use client";

import { useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BiFile,
  BiRefresh,
  BiTime,
  BiUserCheck,
  BiXCircle,
} from "react-icons/bi";
import { AuthContext } from "@/features/auth/context/AuthContext";
import { adminApplicationApi } from "@/features/admin/api";
import AdminAccessDenied from "@/features/admin/components/AdminAccessDenied";
import AdminDonutChart from "@/features/admin/components/AdminDonutChart";
import AdminMetricCard from "@/features/admin/components/AdminMetricCard";
import AdminShell from "@/features/admin/components/AdminShell";
import AdminApplicationCard from "@/features/admin/components/applications/AdminApplicationCard";
import AdminApplicationDetailModal from "@/features/admin/components/applications/AdminApplicationDetailModal";
import AdminApplicationFilters from "@/features/admin/components/applications/AdminApplicationFilters";
import { getApiErrorMessage } from "@/shared/api/http";
import { ApplicationResponse } from "@/shared/types/applications";

export default function AdminApplicationsPage() {
  const auth = useContext(AuthContext);
  const router = useRouter();

  const [applications, setApplications] = useState<ApplicationResponse[]>([]);
  const [activeStatus, setActiveStatus] = useState("");
  const [keyword, setKeyword] = useState("");
  const [selectedApplication, setSelectedApplication] =
    useState<ApplicationResponse | null>(null);
  const [loading, setLoading] = useState(true);
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

    loadApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth?.isLoading, auth?.user?.id, auth?.user?.role, activeStatus]);

  const stats = useMemo(() => {
    const byStatus = (status: string) =>
      applications.filter(
        (application) =>
          String(application.status).toUpperCase() === status.toUpperCase()
      ).length;

    return {
      total: applications.length,
      pending: byStatus("PENDING"),
      reviewed: byStatus("REVIEWED"),
      shortlisted: byStatus("SHORTLISTED"),
      accepted: byStatus("ACCEPTED"),
      rejected: byStatus("REJECTED"),
      withdrawn: byStatus("WITHDRAWN"),
    };
  }, [applications]);

  const filteredApplications = useMemo(() => {
    const q = keyword.trim().toLowerCase();

    if (!q) return applications;

    return applications.filter((application) => {
      return (
        application.candidateName?.toLowerCase().includes(q) ||
        application.candidateEmail?.toLowerCase().includes(q) ||
        application.jobTitle?.toLowerCase().includes(q) ||
        application.companyName?.toLowerCase().includes(q) ||
        application.status?.toLowerCase().includes(q)
      );
    });
  }, [applications, keyword]);

  const loadApplications = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await adminApplicationApi.getApplications(
        activeStatus || undefined,
        0,
        100
      );

      setApplications(response.content || []);
    } catch (error) {
      setMessage({
        type: "error",
        text: getApiErrorMessage(error, "Failed to load applications."),
      });
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  if (auth?.isLoading || loading) {
    return (
      <AdminShell
        title="Applications"
        description="Loading application monitoring data..."
      >
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
      title="Application Monitoring"
      description="Audit candidate applications and attached CVs without breaking employer ownership."
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
          title="Applications"
          value={stats.total}
          description="Total submitted applications"
          icon={<BiFile />}
          iconClassName="bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300"
          sparklineClassName="text-cyan-700 dark:text-cyan-300"
          sparkline={[1, 2, 1.5, 3, 2.5, 4, stats.total]}
        />

        <AdminMetricCard
          title="Pending"
          value={stats.pending}
          description="Waiting for employer review"
          icon={<BiTime />}
          trend="+6.3%"
          iconClassName="bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-300"
          sparklineClassName="text-amber-500 dark:text-amber-300"
          sparkline={[1, 1.3, 1.1, 2, 1.6, 2.2, stats.pending]}
        />

        <AdminMetricCard
          title="Accepted"
          value={stats.accepted}
          description="Successful applications"
          icon={<BiUserCheck />}
          trend="+8.2%"
          iconClassName="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-300"
          sparklineClassName="text-emerald-600 dark:text-emerald-300"
          sparkline={[1, 1.2, 1.4, 2, 2.2, 2.6, stats.accepted]}
        />

        <AdminMetricCard
          title="Rejected / Withdrawn"
          value={stats.rejected + stats.withdrawn}
          description={`${stats.rejected} rejected, ${stats.withdrawn} withdrawn`}
          icon={<BiXCircle />}
          trend="-2.1%"
          trendColor="text-red-600"
          iconClassName="bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-300"
          sparklineClassName="text-rose-500 dark:text-rose-300"
          sparkline={[
            1,
            0.8,
            1.2,
            1,
            1.4,
            1.1,
            stats.rejected + stats.withdrawn,
          ]}
        />
      </div>

      <AdminDonutChart
        title="Applications by Status"
        items={[
          {
            label: "Pending",
            value: stats.pending,
            className: "text-amber-500 bg-amber-500",
          },
          {
            label: "Reviewed",
            value: stats.reviewed,
            className: "text-blue-500 bg-blue-500",
          },
          {
            label: "Shortlisted",
            value: stats.shortlisted,
            className: "text-violet-500 bg-violet-500",
          },
          {
            label: "Accepted",
            value: stats.accepted,
            className: "text-emerald-500 bg-emerald-500",
          },
          {
            label: "Rejected",
            value: stats.rejected,
            className: "text-rose-500 bg-rose-500",
          },
        ]}
      />

      <div className="mt-6">
        <AdminApplicationFilters
          keyword={keyword}
          activeStatus={activeStatus}
          onKeywordChange={setKeyword}
          onStatusChange={setActiveStatus}
          onRefresh={loadApplications}
        />
      </div>

      {filteredApplications.length > 0 ? (
        <div className="space-y-4">
          {filteredApplications.map((application) => (
            <AdminApplicationCard
              key={application.id}
              application={application}
              onViewDetail={setSelectedApplication}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-10 text-center shadow-sm">
          <h2 className="text-xl font-extrabold text-gray-950 dark:text-white">
            No applications found
          </h2>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Candidate applications will appear here after submission.
          </p>
        </div>
      )}

      <AdminApplicationDetailModal
        application={selectedApplication}
        onClose={() => setSelectedApplication(null)}
      />
    </AdminShell>
  );
}