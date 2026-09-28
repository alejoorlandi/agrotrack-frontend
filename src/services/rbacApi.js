import api from './api';

// ── USUARIOS ─────────────────────────────────────────────────────────────────

export const getUsers = () => api.get('/users');
export const getUserById = (id) => api.get(`/users/${id}`);
export const createUser = (data) => api.post('/users', data);
export const updateUser = (id, data) => api.put(`/users/${id}`, data);
export const deleteUser = (id) => api.delete(`/users/${id}`);
export const resetUserPassword = (id, newPassword) =>
  api.post(`/users/${id}/reset-password`, { newPassword });

// ── GRUPOS ────────────────────────────────────────────────────────────────────

export const getGroups = () => api.get('/groups');
export const getGroupById = (id) => api.get(`/groups/${id}`);
export const createGroup = (data) => api.post('/groups', data);
export const updateGroup = (id, data) => api.put(`/groups/${id}`, data);
export const deleteGroup = (id) => api.delete(`/groups/${id}`);

// ── PERMISOS ──────────────────────────────────────────────────────────────────

export const getPermissions = () => api.get('/permissions');

// ── AUTH EXTRA ────────────────────────────────────────────────────────────────

export const changePassword = (data) => api.post('/auth/change-password', data);
export const forgotPassword = (email) => api.post('/auth/forgot-password', { email });
