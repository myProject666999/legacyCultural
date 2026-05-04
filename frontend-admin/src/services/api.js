import request from '../utils/request';

export const adminApi = {
  login: (data) => request.post('/api/admin/login', data),
  getAdminList: (params) => request.get('/api/admin/admins', { params }),
  createAdmin: (data) => request.post('/api/admin/admins', data),
  updateAdmin: (id, data) => request.put(`/api/admin/admins/${id}`, data),
  deleteAdmin: (id) => request.delete(`/api/admin/admins/${id}`),
  updatePassword: (data) => request.put('/api/admin/change-password', data),
};

export const userApi = {
  getList: (params) => request.get('/api/admin/users', { params }),
  getDetail: (id) => request.get(`/api/admin/users/${id}`),
  updateStatus: (id, status) => request.put(`/api/admin/users/${id}/status`, { status }),
};

export const productApi = {
  getList: (params) => request.get('/api/admin/products', { params }),
  getDetail: (id) => request.get(`/api/product/${id}`),
  create: (data) => request.post('/api/admin/products', data),
  update: (id, data) => request.put(`/api/admin/products/${id}`, data),
  delete: (id) => request.delete(`/api/admin/products/${id}`),
};

export const productTypeApi = {
  getList: (params) => request.get('/api/product-type', { params }),
  getAll: () => request.get('/api/product-type'),
  create: (data) => request.post('/api/admin/product-types', data),
  update: (id, data) => request.put(`/api/admin/product-types/${id}`, data),
  delete: (id) => request.delete(`/api/admin/product-types/${id}`),
};

export const orderApi = {
  getList: (params) => request.get('/api/admin/orders', { params }),
  getDetail: (id) => request.get(`/api/admin/orders/${id}`),
  updateStatus: (id, status) => request.put(`/api/admin/orders/${id}/status`, { status }),
  getStatistics: () => request.get('/api/admin/statistics'),
};

export const announcementApi = {
  getList: (params) => request.get('/api/admin/announcements', { params }),
  getAll: () => request.get('/api/announcement'),
  getDetail: (id) => request.get(`/api/announcement/${id}`),
  create: (data) => request.post('/api/admin/announcements', data),
  update: (id, data) => request.put(`/api/admin/announcements/${id}`, data),
  delete: (id) => request.delete(`/api/admin/announcements/${id}`),
};

export const newsApi = {
  getList: (params) => request.get('/api/admin/news', { params }),
  getAll: () => request.get('/api/news'),
  getDetail: (id) => request.get(`/api/news/${id}`),
  create: (data) => request.post('/api/admin/news', data),
  update: (id, data) => request.put(`/api/admin/news/${id}`, data),
  delete: (id) => request.delete(`/api/admin/news/${id}`),
};

export const forumApi = {
  getList: (params) => request.get('/api/admin/forums', { params }),
  getDetail: (id) => request.get(`/api/forum/${id}`),
  create: (data) => request.post('/api/forum', data),
  update: (id, data) => request.put(`/api/admin/forums/${id}`, data),
  delete: (id) => request.delete(`/api/admin/forums/${id}`),
  getReplies: (forumId) => request.get(`/api/forum/${forumId}`),
  deleteReply: (id) => request.delete(`/api/admin/forum-replies/${id}`),
};

export const carouselApi = {
  getList: (params) => request.get('/api/admin/carousels', { params }),
  getAll: () => request.get('/api/carousel'),
  create: (data) => request.post('/api/admin/carousels', data),
  update: (id, data) => request.put(`/api/admin/carousels/${id}`, data),
  delete: (id) => request.delete(`/api/admin/carousels/${id}`),
};

export const statsApi = {
  getDashboard: () => request.get('/api/admin/statistics'),
  getSales: (params) => request.get('/api/admin/sales-statistics', { params }),
  getUsers: (params) => request.get('/api/admin/statistics', { params }),
};
