"use client";

import { FormEvent, useRef, useState } from "react";
import { BiFile, BiUpload, BiX } from "react-icons/bi";
import { CreateCompanyRequest } from "@/shared/types/employer";

type Props = {
  loading: boolean;
  onSubmit: (data: CreateCompanyRequest, verificationFile: File) => Promise<void>;
};

const inputClass =
  "w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-600";

export default function EmployerCompanyForm({ loading, onSubmit }: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [form, setForm] = useState<CreateCompanyRequest>({
    name: "",
    industry: "",
    address: "",
    logoUrl: "",
  });

  const [verificationFile, setVerificationFile] = useState<File | null>(null);
  const [error, setError] = useState("");

  const updateField = <K extends keyof CreateCompanyRequest>(
    field: K,
    value: CreateCompanyRequest[K]
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const handleFileChange = (file?: File) => {
    setError("");

    if (!file) {
      setVerificationFile(null);
      return;
    }

    if (file.type !== "application/pdf" || !file.name.toLowerCase().endsWith(".pdf")) {
      setError("Only PDF verification document is allowed.");
      setVerificationFile(null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Verification PDF must be <= 5MB.");
      setVerificationFile(null);
      return;
    }

    setVerificationFile(file);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.name.trim()) {
      setError("Company name is required.");
      return;
    }

    if (!verificationFile) {
      setError("Verification PDF is required for Admin approval.");
      return;
    }

    await onSubmit(
      {
        name: form.name.trim(),
        industry: form.industry?.trim() || undefined,
        address: form.address?.trim() || undefined,
        logoUrl: form.logoUrl?.trim() || undefined,
      },
      verificationFile
    );

    setForm({
      name: "",
      industry: "",
      address: "",
      logoUrl: "",
    });

    setVerificationFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-6 shadow-sm space-y-5"
    >
      <div>
        <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">
          Create Company Profile
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Upload company information and a verification PDF for Admin approval.
        </p>
      </div>

      {error && (
        <div className="rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      <input
        value={form.name}
        onChange={(event) => updateField("name", event.target.value)}
        className={inputClass}
        placeholder="Company name"
      />

      <input
        value={form.industry || ""}
        onChange={(event) => updateField("industry", event.target.value)}
        className={inputClass}
        placeholder="Industry"
      />

      <input
        value={form.address || ""}
        onChange={(event) => updateField("address", event.target.value)}
        className={inputClass}
        placeholder="Address"
      />

      <input
        value={form.logoUrl || ""}
        onChange={(event) => updateField("logoUrl", event.target.value)}
        className={inputClass}
        placeholder="Logo URL (optional)"
      />

      <div>
        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
          Verification Document PDF
        </label>

        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={(event) => handleFileChange(event.target.files?.[0])}
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full rounded-2xl border-2 border-dashed border-cyan-200 dark:border-cyan-800 bg-cyan-50/50 dark:bg-cyan-900/10 px-4 py-5 text-cyan-800 dark:text-cyan-200 font-bold hover:bg-cyan-50 dark:hover:bg-cyan-900/20 transition-colors flex items-center justify-center gap-2"
        >
          <BiUpload className="text-xl" />
          Choose verification PDF
        </button>

        {verificationFile && (
          <div className="mt-3 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 p-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <BiFile className="text-cyan-700 dark:text-cyan-300 shrink-0" />
              <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                {verificationFile.name}
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                setVerificationFile(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              className="text-red-600 hover:text-red-800"
            >
              <BiX className="text-xl" />
            </button>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-2xl bg-cyan-700 text-white font-bold py-3 hover:bg-cyan-900 disabled:opacity-60 transition-colors"
      >
        {loading ? "Creating..." : "Create Company"}
      </button>
    </form>
  );
}