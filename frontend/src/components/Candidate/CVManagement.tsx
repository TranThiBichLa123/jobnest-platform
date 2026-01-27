"use client";

import { useState, useEffect } from "react";
import { BiUpload, BiTrash, BiStar, BiCheckCircle } from "react-icons/bi";
import { cvApi } from "@/lib/api";
import { CandidateCV } from "@/types/cv";
import axios from "axios";

export default function CVManagement() {
  const [cvs, setCvs] = useState<CandidateCV[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // New CV form
  const [showAddForm, setShowAddForm] = useState(false);
  const [cvTitle, setCvTitle] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);

  useEffect(() => {
    loadCVs();
  }, []);

  const loadCVs = async () => {
    setLoading(true);
    try {
      const data = await cvApi.getMyCVs();
      setCvs(data);
    } catch (error: any) {
      // Silently handle 403 (no candidate profile) or 401 (not authenticated)
      if (error?.response?.status !== 403 && error?.response?.status !== 401) {
        console.error("Error loading CVs:", error);
      }
      // If 403, user doesn't have candidate profile yet - keep empty array
      setCvs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        alert('Please upload a PDF file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      setCvFile(file);
    }
  };

  const handleUpload = async () => {
    if (!cvTitle.trim() || !cvFile) {
      alert("Please provide a title and select a file");
      return;
    }

    setUploading(true);
    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = reader.result as string;
        
        await cvApi.createCV({
          title: cvTitle,
          fileUrl: base64Data,
          fileName: cvFile!.name,
          fileSize: cvFile!.size,
          isDefault: cvs.length === 0 // First CV becomes default
        });

        alert("CV uploaded successfully!");
        setCvTitle("");
        setCvFile(null);
        setShowAddForm(false);
        loadCVs();
      };
      reader.readAsDataURL(cvFile);
    } catch (error: any) {
      console.error("Error uploading CV:", error);
      alert(error.response?.data?.message || "Failed to upload CV");
    } finally {
      setUploading(false);
    }
  };

  const handleSetDefault = async (cvId: number) => {
    try {
      await cvApi.setDefaultCV(cvId);
      alert("Default CV updated!");
      loadCVs();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to set default CV");
    }
  };

  const handleDelete = async (cvId: number) => {
    if (!confirm("Are you sure you want to delete this CV?")) return;

    try {
      await cvApi.deleteCV(cvId);
      alert("CV deleted successfully!");
      loadCVs();
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.message ?? "Once a CV has been submitted, it cannot be deleted.");
      } else {
        alert("Once a CV has been submitted, it cannot be deleted.");
      }
    }
  };

  const handleDownload = (cv: CandidateCV) => {
    // Create download link
    const link = document.createElement('a');
    link.href = cv.fileUrl;
    link.download = cv.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            My CVs
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">
            Manage your resumes
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="p-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors"
          title="Upload New CV"
        >
          <BiUpload className="text-xl" />
        </button>
      </div>

      {/* Add New CV Form */}
      {showAddForm && (
        <div className="mb-5 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">
            Upload New CV
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                CV Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={cvTitle}
                onChange={(e) => setCvTitle(e.target.value)}
                placeholder="e.g., Software Engineer CV"
                className="w-full px-3 py-2 text-sm border dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                PDF File <span className="text-red-500">*</span>
              </label>
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="cv-file-input"
                />
                <div className="flex items-center gap-2 px-3 py-2 border dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md hover:border-cyan-500 transition-colors">
                  <BiUpload className="text-gray-400 text-lg flex-shrink-0" />
                  <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {cvFile ? cvFile.name : 'Choose PDF (max 5MB)'}
                  </span>
                </div>
              </label>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleUpload}
                disabled={uploading || !cvTitle.trim() || !cvFile}
                className="flex-1 px-4 py-2 text-sm bg-cyan-600 hover:bg-cyan-700 text-white rounded-md transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
              >
                {uploading ? "Uploading..." : "Upload"}
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setCvTitle("");
                  setCvFile(null);
                }}
                className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-900 dark:text-white rounded-md transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CV List */}
      {loading ? (
        <div className="py-8 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-cyan-600 mx-auto"></div>
        </div>
      ) : cvs.length > 0 ? (
        <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
          {cvs.map((cv) => (
            <div
              key={cv.id}
              className="p-3 border dark:border-gray-600 rounded-lg hover:border-cyan-300 dark:hover:border-cyan-700 transition-colors bg-gray-50 dark:bg-gray-700/30"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                      {cv.title}
                    </h4>
                    {cv.isDefault && (
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded-full flex-shrink-0">
                        <BiCheckCircle className="text-xs" />
                        Default
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col gap-0.5 text-xs text-gray-600 dark:text-gray-400">
                    <span className="truncate">{cv.fileName}</span>
                    <div className="flex items-center gap-2">
                      <span>{(cv.fileSize / 1024).toFixed(0)} KB</span>
                      <span>•</span>
                      <span>
                        {new Date(cv.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => handleDownload(cv)}
                    className="p-1.5 text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 rounded-md transition-colors"
                    title="Download"
                  >
                    <BiUpload className="text-lg rotate-180" />
                  </button>
                  {!cv.isDefault && (
                    <button
                      onClick={() => handleSetDefault(cv.id)}
                      className="p-1.5 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-md transition-colors"
                      title="Set Default"
                    >
                      <BiStar className="text-lg" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(cv.id)}
                    className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                    title="Delete"
                  >
                    <BiTrash className="text-lg" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-10 text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
            <BiUpload className="text-3xl text-gray-400" />
          </div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
            No CVs uploaded
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
            Upload your first CV
          </p>
          <button
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
