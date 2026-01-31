/* eslint-disable @typescript-eslint/no-explicit-any */
import api from '@/shared/api/http';
import { ApplicationRequest, ApplicationResponse } from '@/shared/types/applications';

export const applicationApi = {
  // Apply for a job
  applyForJob: async (jobId: number, data: ApplicationRequest): Promise<ApplicationResponse> => {
    try {
      const response = await api.post(`/applications/apply/${jobId}`, data);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 403) {
        throw new Error(error.response?.data?.message || "You are not allowed to apply for this job.");
      }
      throw error;
    }
  },

  // Check if already applied
  checkIfApplied: async (jobId: number): Promise<{ hasApplied: boolean }> => {
    const response = await api.get(`/applications/check/${jobId}`);
    return response.data;
  },

  // Get my applications
  getMyApplications: async (page = 0, size = 10) => {
    const response = await api.get('/applications/my-applications', {
      params: { page, size }
    });
    return response.data;
  },

  // Withdraw application
  withdrawApplication: async (applicationId: number): Promise<{ message: string }> => {
    const response = await api.delete(`/applications/${applicationId}`);
    return response.data;
  },
};
