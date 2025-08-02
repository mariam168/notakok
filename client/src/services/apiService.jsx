import api from '../api/axios';
export const authService = {
  loadUser: () => api.get('/auth/me'),
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post(`/auth/reset-password?token=${token}`, { password }),
  verifyEmail: (token) => api.get(`/auth/verify-email?token=${token}`),
};

export const contentService = {
  getSidebar: () => api.get('/content/sidebar'),
  getAllFoldersForNav: () => api.get('/content/folders/nav'),
  getContent: (folderId, params) => api.get(`/content/folders/${folderId}`, { params }),
  createFolder: (data) => api.post('/content/folders', data),
  updateFolder: (id, data) => api.put(`/content/folders/${id}`, data),
  softDeleteFolder: (id) => api.post(`/content/folders/${id}/delete`),
  restoreFolder: (id) => api.post(`/content/folders/${id}/restore`),
  addCollaborator: (folderId, data) => api.post(`/content/folders/${folderId}/collaborators`, data),
  removeCollaborator: (folderId, collaboratorId) => api.delete(`/content/folders/${folderId}/collaborators/${collaboratorId}`),
  uploadMedia: (formData) => api.post('/content/media/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  updateMedia: (id, data) => api.put(`/content/media/${id}`, data),
  toggleFavorite: (id) => api.put(`/content/media/${id}/favorite`),
  softDeleteMedia: (id) => api.post(`/content/media/${id}/delete`),
  restoreMedia: (id) => api.post(`/content/media/${id}/restore`),
  deleteMediaPermanently: (id) => api.delete(`/content/media/${id}/permanent`),
};

export const dashboardService = {
  getStats: () => api.get('/dashboard/stats'),
};

export const getStaticUrl = (path) => {
  return `${import.meta.env.VITE_API_BASE_URL}/${path}`;
};

export const formatFileSize = (bytes) => {
  if (bytes === undefined || bytes === null || bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const formatDate = (dateString) => {
  if (!dateString) return '--';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};