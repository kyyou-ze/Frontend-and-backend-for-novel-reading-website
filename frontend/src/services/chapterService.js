import { api } from './api';

export const chapterService = {
  async getChapter(novelSlug, chapterNumber) {
    const response = await api.get(`/chapters/${novelSlug}/${chapterNumber}`);
    return response;
  },

  async createChapter(chapterData) {
    const response = await api.post('/chapters', chapterData);
    return response;
  },

  async updateChapter(chapterId, chapterData) {
    const response = await api.put(`/chapters/${chapterId}`, chapterData);
    return response;
  },

  async deleteChapter(chapterId) {
    const response = await api.delete(`/chapters/${chapterId}`);
    return response;
  }
};