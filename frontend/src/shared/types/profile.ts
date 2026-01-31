export interface CandidateProfile {
  id?: number;
  userId?: number;
  fullName?: string;
  phoneNumber?: string;
  dateOfBirth?: string; // ISO date string
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  currentPosition?: string;
  yearsOfExperience?: string;
  skills?: string[];
  aboutMe?: string;
  avatarUrl?: string;
}

export interface CandidateProfileRequest {
  fullName?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: string;
  currentPosition?: string;
  yearsOfExperience?: string;
  skills?: string[];
  aboutMe?: string;
}
