import api from '@/shared/api/http';

export const communityPostApi = {
  getPosts: async (page: number, limit: number) => {
    const response = await api.get('/community-posts', { params: { page, limit } });
    return response.data;
  },

  getPostById: async (id: string) => {
    const response = await api.get(`/community-posts/${id}`);
    return response.data;
  },

  createPost: async (data: {title: string; content: string}) => {
    const response = await api.post('/community-posts', data);
    return response.data;
  },

  updatePost: async (id: string, data: {title: string; content: string}) => {
    const response = await api.put(`/community-posts/${id}`, data);
    return response.data;
  },

  deletePost: async (id: string) => {
    const response = await api.delete(`/community-posts/${id}`);
    return response.data;
  },
};
