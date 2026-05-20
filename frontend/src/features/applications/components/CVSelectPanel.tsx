import Link from "next/link";
import { BiCheckCircle, BiFile, BiStar, BiUpload } from "react-icons/bi";
import { CandidateCV } from "@/shared/types/cv";

type Props = {
  cvs: CandidateCV[];
  loading: boolean;
  selectedCvId: number | null;
  onSelect: (cvId: number) => void;
};

function formatFileSize(size?: number) {
  if (!size) return "Unknown size";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

export default function CVSelectPanel({
  cvs,
  loading,
  selectedCvId,
  onSelect,
}: Props) {
  return (
    <div className="rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm p-6">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Select your CV
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Choose one uploaded CV for this application.
          </p>
        </div>

        <Link
          href="/candidate/profile"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 text-sm font-bold hover:bg-cyan-100 dark:hover:bg-cyan-900/50 transition-colors"
        >
          <BiUpload />
          Manage CVs
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, index) => (
            <div
              key={index}
              className="h-24 rounded-2xl bg-gray-100 dark:bg-gray-700 animate-pulse"
            />
          ))}
        </div>
      ) : cvs.length > 0 ? (
        <div className="space-y-3">
          {cvs.map((cv) => {
            const selected = selectedCvId === cv.id;

            return (
              <button
                key={cv.id}
                type="button"
                onClick={() => onSelect(cv.id)}
                className={`w-full text-left rounded-2xl border p-4 transition-all ${
                  selected
                    ? "border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20 shadow-sm"
                    : "border-gray-200 dark:border-gray-700 hover:border-cyan-400 bg-white dark:bg-gray-800"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        selected
                          ? "bg-cyan-600 text-white"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300"
                      }`}
                    >
                      <BiFile className="text-xl" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-gray-900 dark:text-white truncate">
                          {cv.title}
                        </h3>

                        {cv.isDefault && (
                          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300">
                            <BiStar />
                            Default
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">
                        {cv.fileName}
                      </p>

                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {formatFileSize(cv.fileSize)}
                      </p>
                    </div>
                  </div>

                  {selected && (
                    <BiCheckCircle className="text-2xl text-cyan-600 flex-shrink-0" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 p-8 text-center">
          <BiFile className="mx-auto text-4xl text-gray-400" />

          <h3 className="mt-3 text-lg font-bold text-gray-900 dark:text-white">
            No CV uploaded yet
          </h3>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Upload at least one PDF CV before applying for jobs.
          </p>

          <Link
            href="/candidate/profile"
            className="inline-flex mt-5 items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white font-bold transition-colors"
          >
            <BiUpload />
            Upload CV
          </Link>
        </div>
      )}
    </div>
  );
}