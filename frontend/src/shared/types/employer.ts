export type CompanyStatus = "PENDING_REVIEW" | "VERIFIED" | "REJECTED";

export interface Company {
  id: number;
  employerId: number;
  name: string;
  logoUrl?: string;
  industry?: string;
  address?: string;
  verified?: boolean;
  status?: CompanyStatus | string;
  verificationDocumentPath?: string;
  rejectionReason?: string;
  reviewedAt?: string;
  reviewedBy?: number;
  openPositions?: number;
}

export interface CreateCompanyRequest {
  name: string;
  logoUrl?: string;
  industry?: string;
  address?: string;
}

export function isCompanyVerified(company: Company) {
  return (
    company.verified === true ||
    String(company.status || "").toUpperCase() === "VERIFIED"
  );
}