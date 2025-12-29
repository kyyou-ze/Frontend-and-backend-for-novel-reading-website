import { api } from './api';
export const novelService = {
  async getNovels(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/novels?${queryString}`);
    return response;
  },

  async getNovelBySlug(slug) {
    const response = await api.get(`/novels/${slug}`);
    return response;
  },

  async createNovel(novelData) {
    const response = await api.post('/novels', novelData);
    return response;
  },

  async updateNovel(slug, novelData) {
    const response = await api.put(`/novels/${slug}`, novelData);
    return response;
  },

  async deleteNovel(slug) {
    const response = await api.delete(`/novels/${slug}`);
    return response;
  },

  async getAuthorNovels() {
    const response = await api.get('/novels/author/me');
    return response;
  },

  async getNovelStats(slug) {
    const response = await api.get(`/novels/${slug}/stats`);
    return response;
  },

  async searchNovels(query) {
    const response = await api.get(`/search?q=${encodeURIComponent(query)}`);
    return response;
  }
};