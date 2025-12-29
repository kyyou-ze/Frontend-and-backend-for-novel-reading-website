import { api } from './api';

export const commentService = {
  async getComments(chapterId) {
    const response = await api.get(`/comments/chapter/${chapterId}`);
    return response;
  },

  async addComment(chapterId, content) {
    const response = await api.post('/comments', { chapter: chapterId, content });
    return response;
  },

  async likeComment(commentId) {
    const response = await api.post(`/comments/${commentId}/like`);
    return response;
  },

  async deleteComment(commentId) {
    const response = await api.delete(`/comments/${commentId}`);
    return response;
  }
};