"use client";

import { useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BiBuilding, BiRefresh, BiSearch, BiShield } from "react-icons/bi";
import { AuthContext } from "@/features/auth/context/AuthContext";
import { adminCompanyApi } from "@/features/admin/api";
import AdminAccessDenied from "@/features/admin/components/AdminAccessDenied";
import AdminCompanyCard from "@/features/admin/components/AdminCompanyCard";
import AdminCompanyRejectDialog from "@/features/admin/components/AdminCompanyRejectDialog";
import AdminDonutChart from "@/features/admin/components/AdminDonutChart";
import AdminMetricCard from "@/features/admin/components/AdminMetricCard";
import AdminShell from "@/features/admin/components/AdminShell";
import { getApiErrorMessage } from "@/shared/api/http";
import { Company } from "@/shared/types/employer";

const statusTabs = [
  { label: "All", value: "" },
  { label: "Pending", value: "PENDING_REVIEW" },
  { label: "Verified", value: "VERIFIED" },
  { label: "Rejected", value: "REJECTED" },
];

export default function AdminCompaniesPage() {
  const auth = useContext(AuthContext);
  const router = useRouter();

  const [companies, setCompanies] = useState<Company[]>([]);
  const [activeStatus, setActiveStatus] = useState("");
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [rejectTarget, setRejectTarget] = useState<Company | null>(null);
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

    loadCompanies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth?.isLoading, auth?.user?.id, auth?.user?.role, activeStatus]);

  const stats = useMemo(() => {
    const pending = companies.filter((company) =>
      ["PENDING", "PENDING_REVIEW"].includes(
        String(company.status).toUpperCase()
      )
    ).length;

    const verified = companies.filter(
      (company) =>
        company.verified === true ||
        String(company.status).toUpperCase() === "VERIFIED"
    ).length;

    const rejected = companies.filter(
      (company) => String(company.status).toUpperCase() === "REJECTED"
    ).length;

    return {
      total: companies.length,
      pending,
      verified,
      rejected,
    };
  }, [companies]);

  const filteredCompanies = useMemo(() => {
    const q = keyword.trim().toLowerCase();

    if (!q) return companies;

    return companies.filter((company) => {
      return (
        company.name?.toLowerCase().includes(q) ||
        company.industry?.toLowerCase().includes(q) ||
        company.address?.toLowerCase().includes(q) ||
        company.status?.toLowerCase().includes(q)
      );
    });
  }, [companies, keyword]);

  const loadCompanies = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await adminCompanyApi.getCompanies(
        activeStatus || undefined,
        0,
        100
      );

      setCompanies(response.content || []);
    } catch (error) {
      setMessage({
        type: "error",
        text: getApiErrorMessage(error, "Failed to load companies."),
      });
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (company: Company) => {
    setActionLoadingId(company.id);
    setMessage(null);

    try {
      const updated = await adminCompanyApi.approveCompany(company.id);

      setCompanies((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item))
      );

      setMessage({
        type: "success",
        text: `${company.name} has been verified.`,
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: getApiErrorMessage(error, "Failed to approve company."),
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
      const updated = await adminCompanyApi.rejectCompany(
        rejectTarget.id,
        reason
      );

      setCompanies((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item))
      );

      setMessage({
        type: "success",
        text: `${rejectTarget.name} has been rejected.`,
      });

      setRejectTarget(null);
    } catch (error) {
      setMessage({
        type: "error",
        text: getApiErrorMessage(error, "Failed to reject company."),
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  if (auth?.isLoading || loading) {
    return (
      <AdminShell
        title="Companies"
        description="Loading company moderation queue..."
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
      title="Company Moderation"
      description="Verify employer companies before they can post public jobs."
    >
      {message && (
        <div
          className={`mb-6 rounded-2xl border p-4 text-sm ${message.type === "success"
              ? "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
              : "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300"
            }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <AdminMetricCard
          title="Companies"
          value={stats.total}
          description={`${stats.pending} waiting for review`}
          icon={<BiBuilding />}
          iconClassName="bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300"
          sparklineClassName="text-cyan-700 dark:text-cyan-300"
          sparkline={[1, 2, 1.5, 3, 2.6, 4, stats.total]}
        />

        <AdminMetricCard
          title="Verified"
          value={stats.verified}
          description="Companies allowed to post jobs"
          icon={<BiShield />}
          trend="+10.2%"
          iconClassName="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-300"
          sparklineClassName="text-emerald-600 dark:text-emerald-300"
          sparkline={[1, 1.2, 1.4, 1.7, 2, 2.6, stats.verified]}
        />

        <AdminMetricCard
          title="Rejected"
          value={stats.rejected}
          description="Companies failed verification"
          icon={<BiBuilding />}
          trend="-2.1%"
          trendColor="text-red-600"
          iconClassName="bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-300"
          sparklineClassName="text-rose-500 dark:text-rose-300"
          sparkline={[1, 1.1, 0.8, 1.3, 1, 1.2, stats.rejected]}
        />
      </div>

      <div className="mb-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="flex flex-1 items-center gap-3 rounded-2xl bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 px-4 py-3">
            <BiSearch className="text-2xl text-cyan-700 dark:text-cyan-300 shrink-0" />

            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="Search company by name, industry, address, or status..."
              className="w-full bg-transparent outline-none text-gray-900 dark:text-white placeholder:text-gray-400"
            />
          </div>

          <button
            type="button"
            onClick={loadCompanies}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-cyan-700 text-white font-bold hover:bg-cyan-900 transition-colors"
          >
            <BiRefresh />
            Refresh
          </button>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        {statusTabs.map((tab) => (
          <button
            key={tab.value || "all"}
            type="button"
            onClick={() => setActiveStatus(tab.value)}
            className={`px-4 py-2 rounded-2xl text-sm font-bold transition-colors ${activeStatus === tab.value
                ? "bg-cyan-700 text-white shadow-lg shadow-cyan-900/20"
                : "bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filteredCompanies.length > 0 ? (
        <div className="space-y-4">
          {filteredCompanies.map((company) => (
            <AdminCompanyCard
              key={company.id}
              company={company}
              loadingId={actionLoadingId}
              onApprove={handleApprove}
              onReject={setRejectTarget}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-10 text-center shadow-sm">
          <h2 className="text-xl font-extrabold text-gray-950 dark:text-white">
            No companies found
          </h2>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Company verification requests will appear here.
          </p>
        </div>
      )}

      <AdminCompanyRejectDialog
        open={Boolean(rejectTarget)}
        company={rejectTarget}
        loading={Boolean(actionLoadingId)}
        onCancel={() => setRejectTarget(null)}
        onConfirm={handleReject}
      />
    </AdminShell>
  );
}