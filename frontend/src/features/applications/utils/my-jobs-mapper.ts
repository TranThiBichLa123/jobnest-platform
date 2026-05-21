import { ApplicationResponse } from "@/shared/types/applications";
import { Job } from "@/shared/types/job";
import { normalizeApplicationStatus } from "@/shared/utils/application-format";

export function unwrapPageContent<T>(response: unknown): T[] {
  if (Array.isArray(response)) return response as T[];

  const value = response as { content?: T[]; data?: T[]; items?: T[] } | null;

  if (Array.isArray(value?.content)) return value.content;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.items)) return value.items;

  return [];
}

export function unwrapJob(record: unknown): Job | null {
  const value = record as
    | (Partial<Job> & {
        job?: Job;
        jobPost?: Job;
        viewedAt?: string;
        savedAt?: string;
      })
    | null;

  const job = value?.job || value?.jobPost || value;

  if (!job?.id) return null;

  return {
    ...(job as Job),
    viewedAt: value?.viewedAt || (job as Job & { viewedAt?: string }).viewedAt,
    savedAt: value?.savedAt || (job as Job & { savedAt?: string }).savedAt,
  } as Job;
}

export function normalizeApplications(records: unknown[]): ApplicationResponse[] {
  return records
    .map((record) => {
      const value = record as ApplicationResponse | null;

      if (!value?.id) return null;

      return {
        ...value,
        status: normalizeApplicationStatus(value.status),
      };
    })
    .filter(Boolean) as ApplicationResponse[];
}

export function normalizeJobs(records: unknown[]): Job[] {
  const seen = new Set<number>();

  return records
    .map(unwrapJob)
    .filter((job): job is Job => Boolean(job?.id))
    .filter((job) => {
      if (seen.has(job.id)) return false;
      seen.add(job.id);
      return true;
    });
}