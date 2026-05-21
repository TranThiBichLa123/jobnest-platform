"use client";

import { useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BiBriefcase,
  BiBuilding,
  BiFile,
  BiUser,
  BiUserCheck,
} from "react-icons/bi";
import { AuthContext } from "@/features/auth/context/AuthContext";
import {
  adminApplicationApi,
  adminCompanyApi,
  adminJobApi,
  adminUserApi,
} from "@/features/admin/api";
import AdminAccessDenied from "@/features/admin/components/AdminAccessDenied";
import AdminAreaChart from "@/features/admin/components/AdminAreaChart";
import AdminDonutChart from "@/features/admin/components/AdminDonutChart";
import AdminMetricCard from "@/features/admin/components/AdminMetricCard";
import AdminShell from "@/features/admin/components/AdminShell";
import { AdminUser } from "@/shared/types/admin";
import { ApplicationResponse } from "@/shared/types/applications";
import { Company } from "@/shared/types/employer";
import { Job } from "@/shared/types/job";

export default function AdminDashboardPage() {
  const auth = useContext(AuthContext);
  const router = useRouter();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [applications, setApplications] = useState<ApplicationResponse[]>([]);
  const [loading, setLoading] = useState(true);

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

    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth?.isLoading, auth?.user?.id, auth?.user?.role]);

  const stats = useMemo(() => {
    const candidates = users.filter((user) => user.role === "CANDIDATE").length;
    const employers = users.filter((user) => user.role === "EMPLOYER").length;
    const admins = users.filter((user) => user.role === "ADMIN").length;

    const activeJobs = jobs.filter(
      (job) => String(job.status).toUpperCase() === "ACTIVE"
    ).length;

    const pendingJobs = jobs.filter(
      (job) => String(job.status).toUpperCase() === "PENDING_REVIEW"
    ).length;

    const rejectedJobs = jobs.filter(
      (job) => String(job.status).toUpperCase() === "REJECTED"
    ).length;

    const verifiedCompanies = companies.filter(
      (company) =>
        company.verified === true ||
        String(company.status).toUpperCase() === "VERIFIED"
    ).length;

    const pendingCompanies = companies.filter(
      (company) => String(company.status).toUpperCase() === "PENDING_REVIEW"
    ).length;

    return {
      candidates,
      employers,
      admins,
      activeJobs,
      pendingJobs,
      rejectedJobs,
      verifiedCompanies,
      pendingCompanies,
    };
  }, [users, jobs, companies]);

  const loadDashboard = async () => {
    setLoading(true);

    const [usersResult, jobsResult, companiesResult, applicationsResult] =
      await Promise.allSettled([
        adminUserApi.getUsers(0, 50),
        adminJobApi.getJobs(undefined, undefined, 0, 50),
        adminCompanyApi.getCompanies(undefined, 0, 50),
        adminApplicationApi.getApplications(undefined, 0, 50),
      ]);

    if (usersResult.status === "fulfilled") {
      setUsers(usersResult.value.content || []);
    }

    if (jobsResult.status === "fulfilled") {
      setJobs(jobsResult.value.content || []);
    }

    if (companiesResult.status === "fulfilled") {
      setCompanies(companiesResult.value.content || []);
    }

    if (applicationsResult.status === "fulfilled") {
      setApplications(applicationsResult.value.content || []);
    }

    setLoading(false);
  };

  if (auth?.isLoading || loading) {
    return (
      <AdminShell title="Dashboard" description="Loading admin overview...">
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((item) => (
            <div
              key={item}
              className="h-64 rounded-3xl bg-gray-200 dark:bg-gray-800 animate-pulse"
            />
          ))}
        </div>
      </AdminShell>
    );
  }

  if (!auth?.user) return null;

  if (auth.user.role !== "ADMIN") {
    return <AdminAccessDenied />;
  }

  return (
    <AdminShell
      title="Welcome back, Admin! 👋"
      description="Here’s what’s happening on JobNest today."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 mb-6">
        <AdminMetricCard
          title="Total Users"
          value={users.length}
          description={`${stats.candidates} candidates`}
          icon={<BiUser />}
          sparkline={[1, 2, 2, 3, 4, 3, users.length]}
        />

        <AdminMetricCard
          title="Employers"
          value={stats.employers}
          description="Recruiter accounts"
          icon={<BiUserCheck />}
          sparkline={[1, 1, 2, 1, 2, 2, stats.employers]}
        />

        <AdminMetricCard
          title="Companies"
          value={companies.length}
          description={`${stats.pendingCompanies} pending`}
          icon={<BiBuilding />}
          sparkline={[1, 2, 1, 3, 2, 4, companies.length]}
        />

        <AdminMetricCard
          title="Active Jobs"
          value={stats.activeJobs}
          description={`${stats.pendingJobs} pending`}
          icon={<BiBriefcase />}
          sparkline={[1, 1, 2, 2, 1, 3, stats.activeJobs]}
        />

        <AdminMetricCard
          title="Applications"
          value={applications.length}
          description="Submitted applications"
          icon={<BiFile />}
          sparkline={[1, 2, 3, 2, 4, 3, applications.length]}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        <AdminAreaChart
          title="User Growth"
          description="Platform account growth overview."
          label="Total Users"
          values={[1, 2, 2, 3, 3, 4, users.length]}
        />

        <AdminAreaChart
          title="Applications Trend"
          description="Recent application activity."
          label="Applications"
          values={[1, 2, 1, 3, 2, 4, applications.length]}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <AdminDonutChart
          title="Users by Role"
          items={[
            {
              label: "Candidates",
              value: stats.candidates,
              className: "text-cyan-600 bg-cyan-600",
            },
            {
              label: "Employers",
              value: stats.employers,
              className: "text-emerald-500 bg-emerald-500",
            },
            {
              label: "Admins",
              value: stats.admins,
              className: "text-violet-500 bg-violet-500",
            },
          ]}
        />

        <AdminDonutChart
          title="Jobs by Status"
          items={[
            {
              label: "Active",
              value: stats.activeJobs,
              className: "text-emerald-500 bg-emerald-500",
            },
            {
              label: "Pending Review",
              value: stats.pendingJobs,
              className: "text-amber-500 bg-amber-500",
            },
            {
              label: "Rejected",
              value: stats.rejectedJobs,
              className: "text-rose-500 bg-rose-500",
            },
          ]}
        />
      </div>
    </AdminShell>
  );
}