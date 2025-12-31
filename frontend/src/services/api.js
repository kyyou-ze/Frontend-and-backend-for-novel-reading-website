// ============================================
// FIX: src/services/api.js - CORRECT VERSION
// ============================================

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers
      }
    };

    try {
      const response = await fetch(`${API_URL}${endpoint}`, config);
      
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        try {
          data = JSON.parse(text);
        } catch {
          data = { message: text || 'Server error' };
        }
      }

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
          throw new Error('Sesi berakhir, silakan login kembali');
        }
        
        if (response.status === 403) {
          throw new Error('Anda tidak memiliki akses untuk melakukan ini');
        }
        
        if (response.status === 404) {
          throw new Error('Data tidak ditemukan');
        }
        
        if (response.status === 500) {
          throw new Error('Terjadi kesalahan server. Silakan coba lagi nanti');
        }
        
        throw new Error(data.message || `Error: ${response.status}`);
      }

      return data;
    } catch (error) {
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        throw new Error('Tidak dapat terhubung ke server. Pastikan backend berjalan');
      }
      
      if (error.name === 'AbortError') {
        throw new Error('Request timeout. Silakan coba lagi');
      }
      
      throw error;
    }
  }

  get(endpoint) {
    return this.request(endpoint);
  }

  post(endpoint, body) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  }

  put(endpoint, body) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body)
    });
  }

  delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE'
    });
  }

  async testConnection() {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      
      // FIX: Remove /api from base URL for health check
      const healthUrl = `${API_URL.replace('/api', '')}/api/health`;
      
      const response = await fetch(healthUrl, {
        signal: controller.signal
      });
      
      clearTimeout(timeout);
      return response.ok;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }
}

export const api = new ApiService();