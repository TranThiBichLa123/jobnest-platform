export type JobType = "FULLTIME" | "PARTTIME" | "INTERNSHIP" | "CONTRACT";

export type JobStatus =
  | "PENDING_REVIEW"
  | "ACTIVE"
  | "REJECTED"
  | "HIDDEN"
  | "EXPIRED";

export interface Job {
  id: number;
  employerId: number;
  employerName?: string;
  companyId?: number;
  companyName?: string;
  companyLogo?: string;
  title: string;
  description: string;
  categoryId: number;
  categoryName?: string;
  categorySlug?: string;
  location: string;
  type: JobType | string;
  minSalary?: number;
  maxSalary?: number;
  experience?: string;
  experienceLevel?: string;
  education?: string;
  skills?: string;
  isUrgent?: boolean;
  status: JobStatus | string;
  postedAt?: string;
  updatedAt?: string;
  expiresAt?: string;
  viewCount?: number;
  isSaved?: boolean;
}

export interface JobCategory {
  id: number;
  name: string;
  slug?: string;
  iconUrl?: string;
  description?: string;
  openPositions?: number;
}

export interface JobRequest {
  companyId?: number;
  title: string;
  description: string;
  categoryId: number;
  location: string;
  type: JobType;
  minSalary?: number;
  maxSalary?: number;
  experience?: string;
  experienceLevel?: string;
  education?: string;
  skills?: string;
  isUrgent?: boolean;
}