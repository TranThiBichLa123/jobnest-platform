export interface CandidateCV {
  id: number;
  candidateId: number;
  title: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CVRequest {
  title: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  isDefault?: boolean;
}
