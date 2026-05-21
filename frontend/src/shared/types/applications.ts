export type ApplicationStatus =
  | "PENDING"
  | "SUBMITTED"
  | "REVIEWED"
  | "SHORTLISTED"
  | "INTERVIEW"
  | "INTERVIEWED"
  | "HIRED"
  | "ACCEPTED"
  | "REJECTED"
  | "WITHDRAWN";

export interface ApplicationRequest {
  cvId?: number;
  coverLetter?: string;
  resumeUrl?: string;
}

export interface ApplicationResponse {
  id: number;
  jobId: number;
  jobTitle: string;
  companyName?: string;
  location?: string;
  candidateId: number;
  candidateName: string;
  candidateEmail: string;
  cvId?: number;
  cvTitle?: string;
  cvFileName?: string;
  cvFileUrl?: string;
  coverLetter?: string;
  resumeUrl?: string;
  status: ApplicationStatus;
  appliedAt: string;
  reviewedAt?: string;
  updatedAt?: string;
  withdrawnAt?: string;
  notes?: string;
}