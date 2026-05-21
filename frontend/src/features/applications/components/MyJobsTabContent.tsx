import ApplicationCard from "@/features/applications/components/ApplicationCard";
import MyJobsEmptyState from "@/features/applications/components/MyJobsEmptyState";
import { MyJobsTab } from "@/features/applications/components/MyJobsTabs";
import SavedJobCard from "@/features/applications/components/SavedJobCard";
import ViewedJobCard from "@/features/applications/components/ViewedJobCard";
import { ApplicationResponse } from "@/shared/types/applications";
import { Job } from "@/shared/types/job";

type Props = {
  activeTab: MyJobsTab;
  applications: ApplicationResponse[];
  savedJobs: Job[];
  viewedJobs: Job[];
  onWithdraw: (application: ApplicationResponse) => void;
  onUnsave: (job: Job) => void;
};

export default function MyJobsTabContent({
  activeTab,
  applications,
  savedJobs,
  viewedJobs,
  onWithdraw,
  onUnsave,
}: Props) {
  if (activeTab === "applied") {
    return applications.length > 0 ? (
      <div className="space-y-4">
        {applications.map((application) => (
          <ApplicationCard
            key={application.id}
            application={application}
            onWithdraw={onWithdraw}
          />
        ))}
      </div>
    ) : (
      <MyJobsEmptyState
        title="No applications yet"
        description="Start applying to jobs that match your skills and career goals."
      />
    );
  }

  if (activeTab === "saved") {
    return savedJobs.length > 0 ? (
      <div className="space-y-4">
        {savedJobs.map((job) => (
          <SavedJobCard key={job.id} job={job} onUnsave={onUnsave} />
        ))}
      </div>
    ) : (
      <MyJobsEmptyState
        title="No saved jobs"
        description="Save jobs you like and review them later."
      />
    );
  }

  return viewedJobs.length > 0 ? (
    <div className="space-y-4">
      {viewedJobs.map((job) => (
        <ViewedJobCard key={job.id} job={job} />
      ))}
    </div>
  ) : (
    <MyJobsEmptyState
      title="No viewing history"
      description="Jobs you view will appear here."
    />
  );
}