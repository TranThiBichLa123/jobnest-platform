"use client";

import { useContext, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AuthContext } from "@/features/auth/context/AuthContext";
import { applicationApi } from "@/features/applications/api";
import EmployerAccessDenied from "@/features/employer/components/EmployerAccessDenied";
import EmployerApplicationCard from "@/features/employer/components/EmployerApplicationCard";
import EmployerApplicationsHeader from "@/features/employer/components/EmployerApplicationsHeader";
import EmployerStatusDialog from "@/features/employer/components/EmployerStatusDialog";
import { jobApi } from "@/features/jobs/api";
import { getApiErrorMessage } from "@/shared/api/http";
import { ApplicationResponse, ApplicationStatus } from "@/shared/types/applications";
import { Job } from "@/shared/types/job";

export default function EmployerJobApplicationsPage() {
  const auth = useContext(AuthContext);
  const router = useRouter();
  const params = useParams();

  const jobId = Number(params?.id);

  const [job, setJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<ApplicationResponse[]>([]);
  const [selectedApplication, setSelectedApplication] =
    useState<ApplicationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
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

    if (auth.user.role !== "EMPLOYER") {
      setLoading(false);
      return;
    }

    if (!jobId || Number.isNaN(jobId)) {
      setMessage({ type: "error", text: "Invalid job id." });
      setLoading(false);
      return;
    }

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth?.isLoading, auth?.user?.id, auth?.user?.role, jobId]);

  const loadData = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const [jobResponse, applicationsResponse] = await Promise.all([
        jobApi.getJobById(jobId),
        applicationApi.getJobApplications(jobId, 0, 50),
      ]);

      setJob(jobResponse);
      setApplications(applicationsResponse.content || []);
    } catch (err) {
      setMessage({
        type: "error",
        text: getApiErrorMessage(
          err,
          "Failed to load applications. You may not own this job."
        ),
      });
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (
    status: ApplicationStatus,
    notes: string
  ) => {
    if (!selectedApplication) return;

    setActionLoading(true);
    setMessage(null);

    try {
      const updated = await applicationApi.updateApplicationStatus(
        selectedApplication.id,
        {
          status,
          notes,
        }
      );

      setApplications((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item))
      );

      setSelectedApplication(null);
      setMessage({
        type: "success",
        text: "Application status updated successfully.",
      });
    } catch (err) {
      setMessage({
        type: "error",
        text: getApiErrorMessage(err, "Failed to update application status."),
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
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-52 rounded-3xl bg-gray-200 dark:bg-gray-800 animate-pulse"
              />
            ))}
          </div>
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
        <EmployerApplicationsHeader
          job={job}
          totalApplications={applications.length}
        />

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

        {applications.length > 0 ? (
          <div className="space-y-4">
            {applications.map((application) => (
              <EmployerApplicationCard
                key={application.id}
                application={application}
                onUpdateStatus={setSelectedApplication}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-10 text-center shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              No applications yet
            </h2>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Candidate applications for this job will appear here.
            </p>
          </div>
        )}
      </div>

      <EmployerStatusDialog
        open={Boolean(selectedApplication)}
        application={selectedApplication}
        loading={actionLoading}
        onCancel={() => setSelectedApplication(null)}
        onConfirm={handleUpdateStatus}
      />
    </div>
  );
}