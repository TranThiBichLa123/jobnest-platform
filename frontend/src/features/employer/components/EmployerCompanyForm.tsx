"use client";

import { FormEvent, useState } from "react";
import { CreateCompanyRequest } from "@/shared/types/employer";

type Props = {
  loading: boolean;
  onSubmit: (data: CreateCompanyRequest) => Promise<void>;
};

const inputClass =
  "w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-600";

export default function EmployerCompanyForm({ loading, onSubmit }: Props) {
  const [form, setForm] = useState<CreateCompanyRequest>({
    name: "",
    industry: "",
    address: "",
    logoUrl: "",
  });

  const [error, setError] = useState("");

  const updateField = <K extends keyof CreateCompanyRequest>(
    field: K,
    value: CreateCompanyRequest[K]
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!form.name.trim()) {
      setError("Company name is required.");
      return;
    }

    await onSubmit({
      name: form.name.trim(),
      industry: form.industry?.trim() || undefined,
      address: form.address?.trim() || undefined,
      logoUrl: form.logoUrl?.trim() || undefined,
    });

    setForm({
      name: "",
      industry: "",
      address: "",
      logoUrl: "",
    });
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
          Admin must verify your company before you can post jobs.
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
        placeholder="Logo URL"
      />

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