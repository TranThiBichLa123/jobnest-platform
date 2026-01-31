import api from '@/shared/api/http';
import { CandidateProfile, CandidateProfileRequest } from '@/shared/types/profile';

export const candidateProfileApi = {
  // Get current user's profile
  getMyProfile: async (): Promise<CandidateProfile> => {
    const response = await api.get('/candidate/profile');
    return response.data;
  },

  // Create or update profile
  updateMyProfile: async (data: CandidateProfileRequest): Promise<CandidateProfile> => {
    const response = await api.put('/candidate/profile', data);
    return response.data;
  },

  // Upload avatar
  uploadAvatar: async (file: File): Promise<{ avatarUrl: string; message: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/candidate/profile/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export const cvApi = {
  // Get all my CVs
  getMyCVs: async () => {
    const response = await api.get('/candidate/cvs');
    return response.data;
  },

  // Get CV by ID
  getCVById: async (cvId: number) => {
    const response = await api.get(`/candidate/cvs/${cvId}`);
    return response.data;
  },

  // Get default CV
  getDefaultCV: async () => {
    const response = await api.get('/candidate/cvs/default');
    return response.data;
  },

  // Create new CV
  createCV: async (data: {
    title: string;
    fileUrl: string;
    fileName: string;
    fileSize: number;
    isDefault?: boolean;
  }) => {
    const response = await api.post('/candidate/cvs', data);
    return response.data;
  },

  // Update CV
  updateCV: async (cvId: number, data: {
    title: string;
    fileUrl: string;
    fileName: string;
    fileSize: number;
    isDefault?: boolean;
  }) => {
    const response = await api.put(`/candidate/cvs/${cvId}`, data);
    return response.data;
  },

  // Delete CV
  deleteCV: async (cvId: number) => {
    const response = await api.delete(`/candidate/cvs/${cvId}`);
    return response.data;
  },

  // Set CV as default
  setDefaultCV: async (cvId: number) => {
    const response = await api.put(`/candidate/cvs/${cvId}/set-default`);
    return response.data;
  },
};
