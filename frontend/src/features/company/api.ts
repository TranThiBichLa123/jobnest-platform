import api from '@/shared/api/http';

export const companyApi = {
  // Get top companies with active job counts
  getTopCompanies: async () => {
    const response = await api.get('/companies/top');
    return response.data;
  },
};
