import { api } from './api';
export const reviewService = {
  async getReviews(novelId) {
    const response = await api.get(`/reviews/novel/${novelId}`);
    return response;
  },

  async addReview(novelId, reviewData) {
    const response = await api.post('/reviews', { novel: novelId, ...reviewData });
    return response;
  },

  async updateReview(reviewId, reviewData) {
    const response = await api.put(`/reviews/${reviewId}`, reviewData);
    return response;
  },

  async markHelpful(reviewId) {
    const response = await api.post(`/reviews/${reviewId}/helpful`);
    return response;
  }
};