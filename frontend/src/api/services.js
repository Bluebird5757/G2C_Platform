import api from './client';

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
};

export const profileApi = {
  getGrowerProfile: () => api.get('/growers/profile'),
  updateGrowerProfile: (data) => api.put('/growers/profile', data),
  uploadGrowerAvatar: (formData) =>
    api.post('/growers/profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getConsumerProfile: () => api.get('/consumers/profile'),
  updateConsumerProfile: (data) => api.put('/consumers/profile', data),
  getPublicGrower: (userId) => api.get(`/growers/public/${userId}`),
};

export const reviewApi = {
  add: (growerId, data) => api.post(`/growers/${growerId}/reviews`, data),
  get: (growerId) => api.get(`/growers/${growerId}/reviews`),
};

export const orderApi = {
  create: (data) => api.post('/orders', data),
  getConsumer: () => api.get('/orders/consumer'),
  getGrower: () => api.get('/orders/grower'),
  updateStatus: (orderId, status) => api.patch(`/orders/${orderId}/status`, { status }),
};

export const chatApi = {
  getConversations: () => api.get('/chat/conversations'),
  getHistory: (otherUserId) => api.get(`/chat/history/${otherUserId}`),
};

export const listingApi = {
  getMeta: () => api.get('/listings/meta'),
  getCities: () => api.get('/listings/cities'),
  search: (data) => api.post('/listings/search', data),
  create: (data) => api.post('/listings', data),
  getMine: () => api.get('/listings/mine'),
  delete: (id) => api.delete(`/listings/${id}`),
  removeItem: (id, item) => api.patch(`/listings/${id}/items`, { item }),
};
