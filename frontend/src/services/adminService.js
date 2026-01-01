import { api } from './api';

export const adminService = {
  // Overview Stats
  async getOverviewStats() {
    const response = await api.get('/admin/stats');
    return response;
  },

  // Novel Management
  async getNovels(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/admin/novels?${queryString}`);
    return response;
  },

  async approveNovel(novelId) {
    const response = await api.post(`/admin/novels/${novelId}/approve`);
    return response;
  },

  async rejectNovel(novelId, reason) {
    const response = await api.post(`/admin/novels/${novelId}/reject`, { reason });
    return response;
  },

  async deleteNovel(novelId) {
    const response = await api.delete(`/admin/novels/${novelId}`);
    return response;
  },

  // Chapter Management
  async getPendingChapters() {
    const response = await api.get('/admin/chapters/pending');
    return response;
  },

  async approveChapter(chapterId) {
    const response = await api.post(`/admin/chapters/${chapterId}/approve`);
    return response;
  },

  async rejectChapter(chapterId, reason) {
    const response = await api.post(`/admin/chapters/${chapterId}/reject`, { reason });
    return response;
  },

  async deleteChapter(chapterId) {
    const response = await api.delete(`/admin/chapters/${chapterId}`);
    return response;
  },

  // User Management
  async getUsers(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/admin/users?${queryString}`);
    return response;
  },

  async banUser(userId, reason) {
    const response = await api.post(`/admin/users/${userId}/ban`, { reason });
    return response;
  },

  async unbanUser(userId) {
    const response = await api.post(`/admin/users/${userId}/unban`);
    return response;
  },

  async deleteUser(userId) {
    const response = await api.delete(`/admin/users/${userId}`);
    return response;
  },

  async updateUserRole(userId, role) {
    const response = await api.put(`/admin/users/${userId}/role`, { role });
    return response;
  },

  // Reports Management
  async getReports(status = 'pending') {
    const response = await api.get(`/admin/reports?status=${status}`);
    return response;
  },

  async resolveReport(reportId, action) {
    const response = await api.post(`/admin/reports/${reportId}/resolve`, { action });
    return response;
  },

  async deleteReport(reportId) {
    const response = await api.delete(`/admin/reports/${reportId}`);
    return response;
  },

  // Analytics
  async getAnalytics(period = '7d') {
    const response = await api.get(`/admin/analytics?period=${period}`);
    return response;
  },

  async getTrafficStats() {
    const response = await api.get('/admin/analytics/traffic');
    return response;
  },

  async getRevenueStats() {
    const response = await api.get('/admin/analytics/revenue');
    return response;
  },

  // Content Moderation
  async moderateContent(contentId, contentType, action, reason) {
    const response = await api.post('/admin/moderation', {
      contentId,
      contentType,
      action,
      reason
    });
    return response;
  },

  // Announcements
  async createAnnouncement(data) {
    const response = await api.post('/admin/announcements', data);
    return response;
  },

  async getAnnouncements() {
    const response = await api.get('/admin/announcements');
    return response;
  },

  async deleteAnnouncement(announcementId) {
    const response = await api.delete(`/admin/announcements/${announcementId}`);
    return response;
  },

  // Settings
  async getSettings() {
    const response = await api.get('/admin/settings');
    return response;
  },

  async updateSettings(settings) {
    const response = await api.put('/admin/settings', settings);
    return response;
  }
};