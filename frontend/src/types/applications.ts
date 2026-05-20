export interface ApplicationRequest {
  cvId?: number; // Selected CV ID
  coverLetter?: string;
  resumeUrl?: string; // For backward compatibility
}

export interface ApplicationResponse {
  id: number;
  jobId: number;
  jobTitle: string;
  candidateId: number;
  candidateName: string;
  candidateEmail: string;
  cvId?: number;
  cvTitle?: string;
  cvFileName?: string;
  coverLetter?: string;
  resumeUrl?: string;
  status: 'PENDING' | 'REVIEWED' | 'SHORTLISTED' | 'REJECTED' | 'ACCEPTED';
  appliedAt: string;
  reviewedAt?: string;
  notes?: string;
}
