"use client";

import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/features/auth/context/AuthContext";
import EmployerAccessDenied from "@/features/employer/components/EmployerAccessDenied";
import EmployerJobCreateHeader from "@/features/employer/components/EmployerJobCreateHeader";
import EmployerJobForm from "@/features/employer/components/EmployerJobForm";
import { companyApi } from "@/features/company/api";
import { employerJobApi } from "@/features/jobs/api";
import { getApiErrorMessage } from "@/shared/api/http";
import { Company, isCompanyVerified } from "@/shared/types/employer";
import { JobCategory, JobRequest } from "@/shared/types/job";

export default function EmployerCreateJobPage() {
  const auth = useContext(AuthContext);
  const router = useRouter();

  const [companies, setCompanies] = useState<Company[]>([]);
  const [categories, setCategories] = useState<JobCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  useEffect(() => {
    if (auth?.isLoading) return;

    if (!auth?.user) {
      router.push("/");
      return;
    }

    if (auth.user.role !== "EMPLOYER") {
      setLoading(false);
      return;
    }

    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth?.isLoading, auth?.user?.id, auth?.user?.role]);

  const loadInitialData = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const [companiesResponse, categoriesResponse] = await Promise.all([
        companyApi.getMyCompanies(0, 20),
        employerJobApi.getCategoriesForPosting(),
      ]);

      const nextCompanies = companiesResponse.content || [];

      setCompanies(nextCompanies);
      setCategories(categoriesResponse || []);

      if (nextCompanies.length === 0) {
        setMessage({
          type: "info",
          text: "Create a company profile first, then wait for Admin approval before posting jobs.",
        });
        return;
      }

      if (!nextCompanies.some(isCompanyVerified)) {
        setMessage({
          type: "info",
          text: "Your company profile is waiting for Admin approval. You can post jobs after verification.",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: getApiErrorMessage(error, "Failed to load job posting data."),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: JobRequest) => {
    setSubmitting(true);
    setMessage(null);

    try {
      await employerJobApi.createJob(data);

      setMessage({
        type: "success",
        text: "Job posted successfully and sent to Admin for review.",
      });

      setTimeout(() => {
        router.push("/employer/jobs");
      }, 700);
    } catch (error) {
      setMessage({
        type: "error",
        text: getApiErrorMessage(error, "Failed to post job."),
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (auth?.isLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-28 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="h-72 rounded-3xl bg-gray-200 dark:bg-gray-800 animate-pulse mb-8" />
          <div className="h-[520px] rounded-3xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!auth?.user) return null;

  if (auth.user.role !== "EMPLOYER") {
    return <EmployerAccessDenied />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-28 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        <EmployerJobCreateHeader />

        {message && (
          <div
            className={`mb-6 rounded-2xl border p-4 text-sm ${
              message.type === "success"
                ? "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                : message.type === "info"
                ? "border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                : "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300"
            }`}
          >
            {message.text}
          </div>
        )}

        {companies.length === 0 ? (
          <div className="rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-10 text-center shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Company profile required
            </h2>

            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Create your company profile first. Admin approval is required
              before posting jobs.
            </p>

            <button
              onClick={() => router.push("/employer/profile")}
              className="mt-5 px-5 py-3 rounded-2xl bg-cyan-700 text-white font-bold hover:bg-cyan-900 transition-colors"
            >
              Go to My Profile
            </button>
          </div>
        ) : (
          <EmployerJobForm
            companies={companies}
            categories={categories}
            loading={submitting}
            onSubmit={handleSubmit}
          />
        )}
      </div>
    </div>
  );
}