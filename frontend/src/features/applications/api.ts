import api from "@/shared/api/http";
import {
  ApplicationRequest,
  ApplicationResponse,
} from "@/shared/types/applications";

export const applicationApi = {
  applyForJob: async (
    jobId: number,
    data: ApplicationRequest
  ): Promise<ApplicationResponse> => {
    const response = await api.post(`/applications/apply/${jobId}`, data);
    return response.data;
  },

  checkIfApplied: async (
    jobId: number
  ): Promise<{ hasApplied: boolean; status?: string }> => {
    const response = await api.get(`/applications/check/${jobId}`);
    return response.data;
  },

  getMyApplications: async (page = 0, size = 10) => {
    const response = await api.get("/applications/my-applications", {
      params: { page, size },
    });
    return response.data;
  },

  withdrawApplication: async (
    applicationId: number
  ): Promise<{ message: string }> => {
    const response = await api.delete(`/applications/${applicationId}`);
    return response.data;
  },
};