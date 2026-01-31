import api from '@/shared/api/http';

export const authApi = {
  // Get current user info
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};
