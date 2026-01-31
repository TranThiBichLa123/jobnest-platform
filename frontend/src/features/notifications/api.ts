import api from '@/shared/api/http';

export const notificationApi = {
  // Get all notifications (with pagination/filtering if supported)
  getMyNotifications: async (params?: { page?: number; size?: number; unreadOnly?: boolean }) => {
    const response = await api.get('/notifications/all', { params });
    return response.data;
  },

  // Mark 1 notification as read
  markAsRead: (id: number) => api.post(`/notifications/${id}/read`),

  // Mark all notifications as read
  markAllAsRead: () => api.post(`/notifications/read-all`),

  // Delete 1 notification
  deleteNotification: (id: number) => api.delete(`/notifications/${id}`),
};
