"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BiCheckCircle,
  BiDownload,
  BiErrorCircle,
  BiShieldQuarter,
  BiStar,
  BiTrash,
  BiUpload,
} from "react-icons/bi";
import { cvApi } from "@/features/candidate/api";
import { CandidateCV } from "@/shared/types/cv";
import { getApiErrorMessage } from "@/shared/api/http";
import { server } from "@/config/env";

function formatFileSize(size?: number) {
  if (!size) return "Unknown size";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

function getFileUrl(fileUrl?: string | null) {
  if (!fileUrl) return "#";
  if (fileUrl.startsWith("/uploads")) return `${server}${fileUrl}`;
  return fileUrl;
}

export default function CVManagement() {
  const [cvs, setCvs] = useState<CandidateCV[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const [showAddForm, setShowAddForm] = useState(false);
  const [cvTitle, setCvTitle] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  const defaultCv = useMemo(() => cvs.find((cv) => cv.isDefault), [cvs]);

  useEffect(() => {
    loadCVs();
  }, []);

  const loadCVs = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const data = await cvApi.getMyCVs();
      setCvs(Array.isArray(data) ? data : []);
    } catch (error: any) {
      setCvs([]);

      if (error?.response?.status === 401) {
        setMessage({
          type: "error",
          text: "Your session has expired. Please login again.",
        });
      } else if (error?.response?.status === 403) {
        setMessage({
          type: "info",
          text: "Only Job Seekers can manage CVs. Backend protects this area with JWT + RBAC.",
        });
      } else {
        setMessage({
          type: "error",
          text: getApiErrorMessage(error, "Failed to load CVs."),
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCvTitle("");
    setCvFile(null);
    setShowAddForm(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(null);

    const file = e.target.files?.[0];
    if (!file) return;

    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      setMessage({ type: "error", text: "Only PDF CV files are allowed." });
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage({
        type: "error",
        text: "CV PDF file must be less than or equal to 5MB.",
      });
      e.target.value = "";
      return;
    }

    setCvFile(file);

    if (!cvTitle.trim()) {
      setCvTitle(file.name.replace(/\.pdf$/i, ""));
    }
  };

  const handleUpload = async () => {
    if (!cvFile) {
      setMessage({ type: "error", text: "Please select a PDF file." });
      return;
    }

    setUploading(true);
    setMessage(null);

    try {
      await cvApi.uploadCV({
        file: cvFile,
        title: cvTitle,
        isDefault: cvs.length === 0,
      });

      setMessage({
        type: "success",
        text: "CV uploaded successfully.",
      });

      resetForm();
      await loadCVs();
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : getApiErrorMessage(error, "Failed to upload CV."),
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSetDefault = async (cvId: number) => {
    setActionLoadingId(cvId);
    setMessage(null);

    try {
      await cvApi.setDefaultCV(cvId);
      setMessage({ type: "success", text: "Default CV updated." });
      await loadCVs();
    } catch (error) {
      setMessage({
        type: "error",
        text: getApiErrorMessage(error, "Failed to set default CV."),
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (cvId: number) => {
    if (!confirm("Are you sure you want to delete this CV?")) return;

    setActionLoadingId(cvId);
    setMessage(null);

    try {
      await cvApi.deleteCV(cvId);
      setMessage({ type: "success", text: "CV deleted successfully." });
      await loadCVs();
    } catch (error) {
      setMessage({
        type: "error",
        text: getApiErrorMessage(
          error,
          "CV has been used in an application, so it cannot be deleted."
        ),
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDownload = (cv: CandidateCV) => {
    const href = getFileUrl(cv.fileUrl);
    if (href === "#") return;
    window.open(href, "_blank", "noopener,noreferrer");
  };

  const messageClass =
    message?.type === "success"
      ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800"
      : message?.type === "info"
        ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800"
        : "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            My CVs
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">
            Upload PDF CVs through secured backend APIs
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setShowAddForm((prev) => !prev);
            setMessage(null);
          }}
          className="p-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors"
          title="Upload New CV"
        >
          <BiUpload className="text-xl" />
        </button>
      </div>

      <div className="mb-4 rounded-lg border border-cyan-200 dark:border-cyan-800 bg-cyan-50 dark:bg-cyan-900/20 p-3 flex gap-2 text-xs text-cyan-800 dark:text-cyan-200">
        <BiShieldQuarter className="text-lg flex-shrink-0" />
        <p>
          Only PDF files are allowed. Maximum file size: 5MB. Please upload a clear
          and updated CV before applying for jobs.
        </p>
      </div>

      {message && (
        <div className={`mb-4 rounded-lg border p-3 text-xs ${messageClass}`}>
          <div className="flex items-start gap-2">
            {message.type === "success" ? (
              <BiCheckCircle className="text-lg flex-shrink-0" />
            ) : (
              <BiErrorCircle className="text-lg flex-shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        </div>
      )}

      {showAddForm && (
        <div className="mb-5 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">
            Upload New CV
          </h3>

          <div className="space-y-3">
            <input
              type="text"
              value={cvTitle}
              onChange={(e) => setCvTitle(e.target.value)}
              placeholder="e.g., Software Engineer CV"
              className="w-full px-3 py-2 text-sm border dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />

            <label className="cursor-pointer">
              <input
                type="file"
                accept="application/pdf,.pdf"
                onChange={handleFileSelect}
                className="hidden"
              />

              <div className="flex items-center gap-2 px-3 py-2 border dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md hover:border-cyan-500 transition-colors">
                <BiUpload className="text-gray-400 text-lg flex-shrink-0" />
                <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {cvFile
                    ? `${cvFile.name} • ${formatFileSize(cvFile.size)}`
                    : "Choose PDF file (max 5MB)"}
                </span>
              </div>
            </label>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleUpload}
                disabled={uploading || !cvFile}
                className="flex-1 px-4 py-2 text-sm bg-cyan-600 hover:bg-cyan-700 text-white rounded-md transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
              >
                {uploading ? "Uploading..." : "Upload CV"}
              </button>

              <button
                type="button"
                onClick={resetForm}
                disabled={uploading}
                className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-900 dark:text-white rounded-md transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="py-8 text-center text-sm text-gray-500">
          Loading CVs...
        </div>
      ) : cvs.length > 0 ? (
        <div className="space-y-3">
          {defaultCv && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Default CV:{" "}
              <span className="font-semibold text-cyan-700 dark:text-cyan-300">
                {defaultCv.title}
              </span>
            </p>
          )}

          {cvs.map((cv) => {
            const isBusy = actionLoadingId === cv.id;

            return (
              <div
                key={cv.id}
                className="p-4 border dark:border-gray-700 rounded-lg hover:border-cyan-500 dark:hover:border-cyan-500 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                        {cv.title}
                      </h3>

                      {cv.isDefault && (
                        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300">
                          <BiStar />
                          Default
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                      {cv.fileName}
                    </p>

                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {formatFileSize(cv.fileSize)}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => handleDownload(cv)}
                      className="p-1.5 text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 rounded-md transition-colors"
                      title="View / Download"
                    >
                      <BiDownload className="text-lg" />
                    </button>

                    {!cv.isDefault && (
                      <button
                        type="button"
                        onClick={() => handleSetDefault(cv.id)}
                        disabled={isBusy}
                        className="p-1.5 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-md transition-colors disabled:opacity-50"
                        title="Set as default"
                      >
                        <BiStar className="text-lg" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleDelete(cv.id)}
                      disabled={isBusy}
                      className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors disabled:opacity-50"
                      title="Delete"
                    >
                      <BiTrash className="text-lg" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-10 text-center">
          <BiUpload className="text-4xl text-gray-400 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
            No CVs uploaded
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
            Upload your first PDF CV before applying for jobs.
          </p>
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 text-sm bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors font-medium"
          >
            Upload CV
          </button>
        </div>
      )}
    </div>
  );
}