export const cacheManager = {
  saveChapter(slug, chapter, data) {
    try {
      const cache = JSON.parse(localStorage.getItem('chapterCache') || '{}');
      const key = `${slug}-${chapter}`;
      cache[key] = {
        data,
        timestamp: Date.now()
      };
      
      // Keep only last 10 chapters
      const entries = Object.entries(cache);
      if (entries.length > 10) {
        entries.sort((a, b) => b[1].timestamp - a[1].timestamp);
        const newCache = Object.fromEntries(entries.slice(0, 10));
        localStorage.setItem('chapterCache', JSON.stringify(newCache));
      } else {
        localStorage.setItem('chapterCache', JSON.stringify(cache));
      }
    } catch (error) {
      console.error('Cache error:', error);
    }
  },

  getChapter(slug, chapter) {
    try {
      const cache = JSON.parse(localStorage.getItem('chapterCache') || '{}');
      const key = `${slug}-${chapter}`;
      return cache[key]?.data || null;
    } catch (error) {
      return null;
    }
  },

  clearCache() {
    localStorage.removeItem('chapterCache');
  }
};