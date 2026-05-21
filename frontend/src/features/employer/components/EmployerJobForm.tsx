"use client";

import { FormEvent, useMemo, useState } from "react";
import { Company, isCompanyVerified } from "@/shared/types/employer";
import { JobCategory, JobRequest, JobType } from "@/shared/types/job";
import {
  EmployerJobFormField,
  inputClass,
  textareaClass,
} from "@/features/employer/components/EmployerJobFormField";

type Props = {
  companies: Company[];
  categories: JobCategory[];
  loading: boolean;
  onSubmit: (data: JobRequest) => Promise<void>;
};

type FormState = {
  companyId: string;
  title: string;
  description: string;
  categoryId: string;
  location: string;
  type: JobType;
  minSalary: string;
  maxSalary: string;
  experience: string;
  experienceLevel: string;
  education: string;
  skills: string;
  isUrgent: boolean;
};

const initialState: FormState = {
  companyId: "",
  title: "",
  description: "",
  categoryId: "",
  location: "",
  type: "FULLTIME",
  minSalary: "",
  maxSalary: "",
  experience: "",
  experienceLevel: "",
  education: "",
  skills: "",
  isUrgent: false,
};

export default function EmployerJobForm({
  companies,
  categories,
  loading,
  onSubmit,
}: Props) {
  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const verifiedCompanies = useMemo(
    () => companies.filter(isCompanyVerified),
    [companies]
  );

  const updateField = <K extends keyof FormState>(
    field: K,
    value: FormState[K]
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));

    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (verifiedCompanies.length === 0) {
      nextErrors.companyId = "You need a verified company before posting jobs.";
    }

    if (!form.companyId) {
      nextErrors.companyId = "Please select a verified company.";
    }

    if (!form.title.trim()) {
      nextErrors.title = "Job title is required.";
    }

    if (!form.categoryId) {
      nextErrors.categoryId = "Please select a category.";
    }

    if (!form.location.trim()) {
      nextErrors.location = "Location is required.";
    }

    if (!form.description.trim()) {
      nextErrors.description = "Description is required.";
    } else if (form.description.trim().length < 50) {
      nextErrors.description = "Description should contain at least 50 characters.";
    }

    const minSalary = form.minSalary ? Number(form.minSalary) : undefined;
    const maxSalary = form.maxSalary ? Number(form.maxSalary) : undefined;

    if (minSalary !== undefined && minSalary < 0) {
      nextErrors.minSalary = "Minimum salary cannot be negative.";
    }

    if (maxSalary !== undefined && maxSalary < 0) {
      nextErrors.maxSalary = "Maximum salary cannot be negative.";
    }

    if (
      minSalary !== undefined &&
      maxSalary !== undefined &&
      minSalary > maxSalary
    ) {
      nextErrors.maxSalary = "Maximum salary must be greater than minimum salary.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!validate()) return;

    const payload: JobRequest = {
      companyId: Number(form.companyId),
      title: form.title.trim(),
      description: form.description.trim(),
      categoryId: Number(form.categoryId),
      location: form.location.trim(),
      type: form.type,
      minSalary: form.minSalary ? Number(form.minSalary) : undefined,
      maxSalary: form.maxSalary ? Number(form.maxSalary) : undefined,
      experience: form.experience.trim() || undefined,
      experienceLevel: form.experienceLevel.trim() || undefined,
      education: form.education.trim() || undefined,
      skills: form.skills.trim() || undefined,
      isUrgent: form.isUrgent,
    };

    await onSubmit(payload);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-6 shadow-sm space-y-6"
    >
      {verifiedCompanies.length === 0 && (
        <div className="rounded-2xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-800 p-4 text-sm text-yellow-700 dark:text-yellow-300">
          You cannot post a job yet. Your company profile must be verified by
          Admin first.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <EmployerJobFormField label="Verified Company" error={errors.companyId}>
          <select
            value={form.companyId}
            onChange={(event) => updateField("companyId", event.target.value)}
            className={inputClass}
            disabled={verifiedCompanies.length === 0}
          >
            <option value="">Select verified company</option>
            {verifiedCompanies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
        </EmployerJobFormField>

        <EmployerJobFormField label="Job Category" error={errors.categoryId}>
          <select
            value={form.categoryId}
            onChange={(event) => updateField("categoryId", event.target.value)}
            className={inputClass}
          >
            <option value="">Select category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </EmployerJobFormField>

        <EmployerJobFormField label="Job Title" error={errors.title}>
          <input
            value={form.title}
            onChange={(event) => updateField("title", event.target.value)}
            className={inputClass}
            placeholder="Backend Java Intern"
          />
        </EmployerJobFormField>

        <EmployerJobFormField label="Location" error={errors.location}>
          <input
            value={form.location}
            onChange={(event) => updateField("location", event.target.value)}
            className={inputClass}
            placeholder="Ho Chi Minh City"
          />
        </EmployerJobFormField>

        <EmployerJobFormField label="Job Type">
          <select
            value={form.type}
            onChange={(event) => updateField("type", event.target.value as JobType)}
            className={inputClass}
          >
            <option value="FULLTIME">Full-time</option>
            <option value="PARTTIME">Part-time</option>
            <option value="INTERNSHIP">Internship</option>
            <option value="CONTRACT">Contract</option>
          </select>
        </EmployerJobFormField>

        <EmployerJobFormField label="Experience Level">
          <input
            value={form.experienceLevel}
            onChange={(event) => updateField("experienceLevel", event.target.value)}
            className={inputClass}
            placeholder="Intern / Junior / Middle / Senior"
          />
        </EmployerJobFormField>

        <EmployerJobFormField label="Minimum Salary" error={errors.minSalary}>
          <input
            type="number"
            value={form.minSalary}
            onChange={(event) => updateField("minSalary", event.target.value)}
            className={inputClass}
            placeholder="500"
          />
        </EmployerJobFormField>

        <EmployerJobFormField label="Maximum Salary" error={errors.maxSalary}>
          <input
            type="number"
            value={form.maxSalary}
            onChange={(event) => updateField("maxSalary", event.target.value)}
            className={inputClass}
            placeholder="1000"
          />
        </EmployerJobFormField>

        <EmployerJobFormField label="Experience">
          <input
            value={form.experience}
            onChange={(event) => updateField("experience", event.target.value)}
            className={inputClass}
            placeholder="0-1 year"
          />
        </EmployerJobFormField>

        <EmployerJobFormField label="Education">
          <input
            value={form.education}
            onChange={(event) => updateField("education", event.target.value)}
            className={inputClass}
            placeholder="Bachelor degree or equivalent"
          />
        </EmployerJobFormField>
      </div>

      <EmployerJobFormField label="Skills">
        <input
          value={form.skills}
          onChange={(event) => updateField("skills", event.target.value)}
          className={inputClass}
          placeholder="Java, Spring Boot, PostgreSQL, Docker"
        />
      </EmployerJobFormField>

      <EmployerJobFormField label="Job Description" error={errors.description}>
        <textarea
          value={form.description}
          onChange={(event) => updateField("description", event.target.value)}
          rows={7}
          className={textareaClass}
          placeholder="Describe responsibilities, requirements, benefits, and working conditions..."
        />
      </EmployerJobFormField>

      <label className="flex items-center gap-3 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 cursor-pointer">
        <input
          type="checkbox"
          checked={form.isUrgent}
          onChange={(event) => updateField("isUrgent", event.target.checked)}
          className="h-5 w-5 accent-cyan-700"
        />

        <div>
          <p className="font-bold text-gray-900 dark:text-white">
            Mark as urgent
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Urgent jobs still require Admin approval before becoming public.
          </p>
        </div>
      </label>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="submit"
          disabled={loading || verifiedCompanies.length === 0}
          className="px-6 py-3 rounded-2xl bg-cyan-700 text-white font-bold hover:bg-cyan-900 disabled:opacity-60 transition-colors"
        >
          {loading ? "Posting..." : "Post Job"}
        </button>
      </div>
    </form>
  );
}