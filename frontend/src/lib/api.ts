import api from './axios';
import { API_URL } from './config';
import { CandidateProfile, CandidateProfileRequest } from '@/types/profile';
import { ApplicationRequest, ApplicationResponse } from '@/types/applications';

export { API_URL };

export const authApi = {
  // Get current user info
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export const jobApi = {
  // Get category statistics with full category info
  getCategoryStats: async () => {
    const response = await api.get('/jobs/categories/stats');
    return response.data;
  },
};

export const companyApi = {
  // Get top companies with active job counts
  getTopCompanies: async () => {
    const response = await api.get('/companies/top');
    return response.data;
  },
};

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

export const applicationApi = {
  // Apply for a job
  applyForJob: async (jobId: number, data: ApplicationRequest): Promise<ApplicationResponse> => {
    try {
      const response = await api.post(`/applications/apply/${jobId}`, data);
      return response.data;
    } catch (error: any) {
      // Hiển thị message lỗi rõ ràng khi bị 403 hoặc lỗi khác
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

export const savedJobApi = {
  // Save a job
  saveJob: async (jobId: number): Promise<{ message: string }> => {
    const response = await api.post(`/saved-jobs/${jobId}`);
    return response.data;
  },

  // Unsave a job
  unsaveJob: async (jobId: number): Promise<{ message: string }> => {
    const response = await api.delete(`/saved-jobs/${jobId}`);
    return response.data;
  },

  // Check if job is saved
  checkIfSaved: async (jobId: number): Promise<{ isSaved: boolean }> => {
    const response = await api.get(`/saved-jobs/check/${jobId}`);
    return response.data;
  },

  // Get my saved jobs
  getMySavedJobs: async (page = 0, size = 10) => {
    const response = await api.get('/saved-jobs/my-saved-jobs', {
      params: { page, size }
    });
    return response.data;
  },
};

export const jobViewApi = {
  // Record job view
  recordView: async (jobId: number): Promise<{ message: string }> => {
    const response = await api.post(`/job-views/${jobId}`);
    return response.data;
  },

  // Get my viewed jobs
  getMyViewedJobs: async (page = 0, size = 10) => {
    const response = await api.get('/job-views/my-viewed-jobs', {
      params: { page, size }
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

export const notificationApi = {
  // Lấy tất cả thông báo (có thể phân trang, lọc read/unread nếu backend hỗ trợ)
  getMyNotifications: async (params?: { page?: number; size?: number; unreadOnly?: boolean }) => {
    const response = await api.get('/notifications/all', { params });
    return response.data;
  },

  // Đánh dấu 1 thông báo là đã đọc
  markAsRead: (id: number) => api.post(`/notifications/${id}/read`),

  // Đánh dấu tất cả thông báo là đã đọc
  markAllAsRead: () => api.post(`/notifications/read-all`),

  // Xóa 1 thông báo
  deleteNotification: (id: number) => api.delete(`/notifications/${id}`),
};
