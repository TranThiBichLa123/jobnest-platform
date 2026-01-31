import api from '@/shared/api/http';

export const jobApi = {
  // Get category statistics with full category info
  getCategoryStats: async () => {
    const response = await api.get('/jobs/categories/stats');
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
