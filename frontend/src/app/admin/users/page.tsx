"use client";

import { useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BiRefresh, BiSearch, BiUser } from "react-icons/bi";
import { AuthContext } from "@/features/auth/context/AuthContext";
import { adminUserApi } from "@/features/admin/api";
import AdminAccessDenied from "@/features/admin/components/AdminAccessDenied";
import AdminAreaChart from "@/features/admin/components/AdminAreaChart";
import AdminDonutChart from "@/features/admin/components/AdminDonutChart";
import AdminMetricCard from "@/features/admin/components/AdminMetricCard";
import AdminShell from "@/features/admin/components/AdminShell";
import AdminUsersTable from "@/features/admin/components/AdminUsersTable";
import { getApiErrorMessage } from "@/shared/api/http";
import { AdminUser } from "@/shared/types/admin";

export default function AdminUsersPage() {
  const auth = useContext(AuthContext);
  const router = useRouter();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [keyword, setKeyword] = useState("");
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

    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth?.isLoading, auth?.user?.id, auth?.user?.role]);

  const filteredUsers = useMemo(() => {
    const q = keyword.trim().toLowerCase();

    if (!q) return users;

    return users.filter(
      (user) =>
        user.username?.toLowerCase().includes(q) ||
        user.email?.toLowerCase().includes(q) ||
        user.role?.toLowerCase().includes(q) ||
        user.status?.toLowerCase().includes(q)
    );
  }, [users, keyword]);

  const stats = useMemo(() => {
    const blocked = users.filter((user) =>
      ["BLOCKED", "SUSPENDED"].includes(String(user.status).toUpperCase())
    ).length;

    return {
      total: users.length,
      candidates: users.filter((user) => user.role === "CANDIDATE").length,
      employers: users.filter((user) => user.role === "EMPLOYER").length,
      admins: users.filter((user) => user.role === "ADMIN").length,
      active: users.filter(
        (user) => String(user.status).toUpperCase() === "ACTIVE"
      ).length,
      blocked,
    };
  }, [users]);

  const loadUsers = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await adminUserApi.getUsers(0, 100);
      setUsers(response.content || []);
    } catch (error) {
      setMessage({
        type: "error",
        text: getApiErrorMessage(error, "Failed to load users."),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBlock = async (user: AdminUser) => {
    setActionLoadingId(user.id);
    setMessage(null);

    try {
      await adminUserApi.blockUser(user.id);

      setUsers((prev) =>
        prev.map((item) =>
          item.id === user.id ? { ...item, status: "BLOCKED" } : item
        )
      );

      setMessage({
        type: "success",
        text: `${user.username} has been blocked.`,
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: getApiErrorMessage(error, "Failed to block user."),
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleUnblock = async (user: AdminUser) => {
    setActionLoadingId(user.id);
    setMessage(null);

    try {
      await adminUserApi.unblockUser(user.id);

      setUsers((prev) =>
        prev.map((item) =>
          item.id === user.id ? { ...item, status: "ACTIVE" } : item
        )
      );

      setMessage({
        type: "success",
        text: `${user.username} has been unblocked.`,
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: getApiErrorMessage(error, "Failed to unblock user."),
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  if (auth?.isLoading || loading) {
    return (
      <AdminShell title="Users" description="Loading users...">
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
      title="User Management"
      description="Monitor platform users and control blocked accounts."
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <AdminMetricCard
          title="Total Users"
          value={stats.total}
          description={`${stats.active} active accounts`}
          icon={<BiUser />}
        />

        <AdminMetricCard
          title="Candidates"
          value={stats.candidates}
          description="Job seeker accounts"
          icon={<BiUser />}
        />

        <AdminMetricCard
          title="Blocked"
          value={stats.blocked}
          description="Restricted accounts"
          icon={<BiUser />}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        <AdminAreaChart
          title="User Activity"
          description="Account status trend overview."
          label="Users"
          values={[1, 2, 2, 3, 4, 3, stats.total]}
        />

        <AdminDonutChart
          title="Role Distribution"
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
      </div>

      <div className="mb-5 flex flex-col md:flex-row gap-3">
        <div className="flex-1 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <BiSearch className="text-2xl text-cyan-700 dark:text-cyan-300" />

            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="Search by username, email, role, or status..."
              className="w-full bg-transparent outline-none text-gray-900 dark:text-white placeholder:text-gray-400"
            />
          </div>
        </div>

        <button
          onClick={loadUsers}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-cyan-700 text-white font-bold hover:bg-cyan-900 transition-colors"
        >
          <BiRefresh />
          Refresh
        </button>
      </div>

      <AdminUsersTable
        users={filteredUsers}
        loadingId={actionLoadingId}
        onBlock={handleBlock}
        onUnblock={handleUnblock}
      />
    </AdminShell>
  );
}