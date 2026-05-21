import api from "@/shared/api/http";
import { PageResponse } from "@/features/jobs/api";
import { ApplicationResponse } from "@/shared/types/applications";
import { AdminUser } from "@/shared/types/admin";
import { Company, CompanyStatus } from "@/shared/types/employer";
import { Job, JobStatus } from "@/shared/types/job";

export const adminUserApi = {
  getUsers: async (page = 0, size = 20): Promise<PageResponse<AdminUser>> => {
    const response = await api.get("/admin/users", {
      params: {
        page,
        size,
        sortBy: "createdAt",
        sortDir: "desc",
      },
    });

    return response.data;
  },

  blockUser: async (userId: number): Promise<{ message: string }> => {
    const response = await api.post(`/admin/users/${userId}/block`);
    return response.data;
  },

  unblockUser: async (userId: number): Promise<{ message: string }> => {
    const response = await api.post(`/admin/users/${userId}/unblock`);
    return response.data;
  },
};

export const adminJobApi = {
  getJobs: async (
    status?: JobStatus | string,
    keyword?: string,
    page = 0,
    size = 20
  ): Promise<PageResponse<Job>> => {
    const response = await api.get("/admin/jobs", {
      params: {
        status: status || undefined,
        keyword: keyword || undefined,
        page,
        size,
        sortBy: "postedAt",
        sortDir: "desc",
      },
    });

    return response.data;
  },

  approveJob: async (jobId: number): Promise<string> => {
    const response = await api.post(`/admin/jobs/${jobId}/approve`);
    return response.data;
  },

  rejectJob: async (jobId: number): Promise<string> => {
    const response = await api.post(`/admin/jobs/${jobId}/reject`);
    return response.data;
  },

  hideJob: async (jobId: number): Promise<string> => {
    const response = await api.post(`/admin/jobs/${jobId}/hide`);
    return response.data;
  },

  restoreJob: async (jobId: number): Promise<string> => {
    const response = await api.post(`/admin/jobs/${jobId}/restore`);
    return response.data;
  },
};

export const adminCompanyApi = {
  getCompanies: async (
    status?: CompanyStatus | string,
    page = 0,
    size = 20
  ): Promise<PageResponse<Company>> => {
    const response = await api.get("/companies/admin", {
      params: {
        status: status || undefined,
        page,
        size,
      },
    });

    return response.data;
  },

  approveCompany: async (companyId: number): Promise<Company> => {
    const response = await api.post(`/companies/admin/${companyId}/approve`);
    return response.data;
  },

  rejectCompany: async (
    companyId: number,
    reason?: string
  ): Promise<Company> => {
    const response = await api.post(`/companies/admin/${companyId}/reject`, {
      reason,
    });

    return response.data;
  },
};

export const adminApplicationApi = {
  getApplications: async (
    status?: string,
    page = 0,
    size = 20
  ): Promise<PageResponse<ApplicationResponse>> => {
    const response = await api.get("/applications/admin", {
      params: {
        status: status || undefined,
        page,
        size,
      },
    });

    return response.data;
  },

  getApplicationById: async (
    applicationId: number
  ): Promise<ApplicationResponse> => {
    const response = await api.get(`/applications/admin/${applicationId}`);
    return response.data;
  },
};