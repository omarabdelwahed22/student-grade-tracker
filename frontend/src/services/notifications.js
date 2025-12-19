import api from './api';

export const getNotifications = async (unreadOnly = false) => {
  const response = await api.get('/notifications', {
    params: { unreadOnly: unreadOnly ? 'true' : 'false' }
  });
  return response.data;
};

export const getUnreadCount = async () => {
  const response = await api.get('/notifications/unread/count');
  return response.data;
};

export const markAsRead = async (id) => {
  const response = await api.put(`/notifications/${id}/read`);
  return response.data;
};

export const markAllAsRead = async () => {
  const response = await api.put('/notifications/read-all');
  return response.data;
};

export const deleteNotification = async (id) => {
  const response = await api.delete(`/notifications/${id}`);
  return response.data;
};
