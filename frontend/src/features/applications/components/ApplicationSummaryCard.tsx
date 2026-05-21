import { BiBriefcase, BiCheckShield, BiFile, BiUser } from "react-icons/bi";
import { CandidateCV } from "@/shared/types/cv";
import { Job } from "@/shared/types/job";

type Props = {
  job: Job;
  selectedCV?: CandidateCV;
  candidateName: string;
  candidateEmail: string;
  submitting: boolean;
  disabled: boolean;
  onSubmit: () => void;
};

export default function ApplicationSummaryCard({
  job,
  selectedCV,
  candidateName,
  candidateEmail,
  submitting,
  disabled,
  onSubmit,
}: Props) {
  return (
    <aside className="space-y-5">
      <div className="rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm p-6 sticky top-24">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Application summary
        </h2>

        <div className="mt-5 space-y-4">
          <SummaryRow
            icon={<BiBriefcase />}
            label="Position"
            value={job.title}
          />

          <SummaryRow
            icon={<BiUser />}
            label="Candidate"
            value={candidateName || candidateEmail || "Current user"}
          />

          <SummaryRow
            icon={<BiFile />}
            label="Selected CV"
            value={selectedCV?.title || "No CV selected"}
            muted={!selectedCV}
          />

          <SummaryRow
            icon={<BiCheckShield />}
            label="Submission"
            value="Checked before sending"
          />
        </div>

        <button
          type="button"
          onClick={onSubmit}
          disabled={disabled || submitting}
          className="mt-6 w-full rounded-2xl bg-cyan-700 hover:bg-cyan-800 text-white py-3 font-bold transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {submitting ? "Submitting..." : "Submit Application"}
        </button>

        <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
          You can track the application status in My Jobs after submission.
        </p>
      </div>
    </aside>
  );
}

function SummaryRow({
  icon,
  label,
  value,
  muted,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 flex items-center justify-center flex-shrink-0 text-xl">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
        <p
          className={`font-semibold truncate ${
            muted
              ? "text-gray-400 dark:text-gray-500"
              : "text-gray-900 dark:text-white"
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}