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
  type: string;
  minSalary?: number;
  maxSalary?: number;
  experience?: string;
  experienceLevel?: string;
  education?: string;
  skills?: string;
  isUrgent?: boolean;
  status: string;
  postedAt?: string;
  updatedAt?: string;
  expiresAt?: string;
  viewCount?: number;
  isSaved?: boolean;
}
