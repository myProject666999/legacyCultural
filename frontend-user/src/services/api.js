import request from '../utils/request';

export const userApi = {
  register: (data) => request.post('/user/register', data),
  login: (data) => request.post('/user/login', data),
  getInfo: () => request.get('/user/info'),
  updateInfo: (data) => request.put('/user/info', data),
  updatePassword: (data) => request.put('/user/password', data),
  recharge: (data) => request.post('/user/recharge', data),
};

export const addressApi = {
  getList: () => request.get('/address'),
  create: (data) => request.post('/address', data),
  update: (id, data) => request.put(`/address/${id}`, data),
  delete: (id) => request.delete(`/address/${id}`),
};

export const productTypeApi = {
  getList: () => request.get('/product-type'),
};

export const productApi = {
  getList: (params) => request.get('/product', { params }),
  getDetail: (id) => request.get(`/product/${id}`),
  addFavorite: (data) => request.post('/favorite', data),
};

export const orderApi = {
  getList: (params) => request.get('/order', { params }),
  getDetail: (id) => request.get(`/order/${id}`),
  create: (data) => request.post('/order', data),
  updateStatus: (id, status) => request.put(`/order/${id}/status`, { status }),
};

export const favoriteApi = {
  getList: (params) => request.get('/favorite', { params }),
  add: (data) => request.post('/favorite', data),
  remove: (id) => request.delete(`/favorite/${id}`),
};

export const reviewApi = {
  getList: (params) => request.get('/review', { params }),
  create: (data) => request.post('/review', data),
};

export const announcementApi = {
  getList: () => request.get('/announcement'),
};

export const newsApi = {
  getList: (params) => request.get('/news', { params }),
  getDetail: (id) => request.get(`/news/${id}`),
};

export const forumApi = {
  getList: (params) => request.get('/forum', { params }),
  getDetail: (id) => request.get(`/forum/${id}`),
  create: (data) => request.post('/forum', data),
  createReply: (id, data) => request.post(`/forum/${id}/reply`, data),
};

export const carouselApi = {
  getList: () => request.get('/carousel'),
};
