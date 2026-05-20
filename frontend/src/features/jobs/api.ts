import api from "@/shared/api/http";
import { Job } from "@/shared/types/job";

export type PageResponse<T> = {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
};

export type JobSearchParams = {
  keyword?: string;
  location?: string;
  type?: string;
  categoryId?: number;
  minSalary?: number;
  maxSalary?: number;
  experienceLevel?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
};

export const jobApi = {
  getJobs: async (params: JobSearchParams = {}): Promise<PageResponse<Job>> => {
    const response = await api.get("/jobs", {
      params: {
        page: params.page ?? 0,
        size: params.size ?? 9,
        sortBy: params.sortBy ?? "postedAt",
        sortDir: params.sortDir ?? "desc",
      },
    });

    return response.data;
  },

  searchJobs: async (
    params: JobSearchParams = {}
  ): Promise<PageResponse<Job>> => {
    const response = await api.get("/jobs/search", {
      params: {
        keyword: params.keyword || undefined,
        location: params.location || undefined,
        type: params.type || undefined,
        categoryId: params.categoryId || undefined,
        minSalary: params.minSalary || undefined,
        maxSalary: params.maxSalary || undefined,
        experienceLevel: params.experienceLevel || undefined,
        page: params.page ?? 0,
        size: params.size ?? 9,
        sortBy: params.sortBy ?? "postedAt",
        sortDir: params.sortDir ?? "desc",
      },
    });

    return response.data;
  },

  getJobById: async (jobId: number): Promise<Job> => {
    const response = await api.get(`/jobs/${jobId}`);
    return response.data;
  },

  getCategories: async () => {
    const response = await api.get("/jobs/categories");
    return response.data;
  },

  getCategoryStats: async () => {
    const response = await api.get("/jobs/categories/stats");
    return response.data;
  },
};

export const savedJobApi = {
  saveJob: async (jobId: number): Promise<{ message: string }> => {
    const response = await api.post(`/saved-jobs/${jobId}`);
    return response.data;
  },

  unsaveJob: async (jobId: number): Promise<{ message: string }> => {
    const response = await api.delete(`/saved-jobs/${jobId}`);
    return response.data;
  },

  checkIfSaved: async (jobId: number): Promise<{ isSaved: boolean }> => {
    const response = await api.get(`/saved-jobs/check/${jobId}`);
    return response.data;
  },

  getMySavedJobs: async (page = 0, size = 10) => {
    const response = await api.get("/saved-jobs/my-saved-jobs", {
      params: { page, size },
    });
    return response.data;
  },
};

export const jobViewApi = {
  recordView: async (jobId: number): Promise<{ message: string }> => {
    const response = await api.post(`/job-views/${jobId}`);
    return response.data;
  },

  getMyViewedJobs: async (page = 0, size = 10) => {
    const response = await api.get("/job-views/my-viewed-jobs", {
      params: { page, size },
    });
    return response.data;
  },
};