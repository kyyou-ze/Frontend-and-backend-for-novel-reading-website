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
      
      // Handle non-JSON responses
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = { message: text || 'Server error' };
      }

      if (!response.ok) {
        // Handle specific error codes
        if (response.status === 401) {
          // Unauthorized - clear token
          localStorage.removeItem('token');
          throw new Error('Sesi berakhir, silakan login kembali');
        }
        
        throw new Error(data.message || `HTTP Error: ${response.status}`);
      }

      return data;
    } catch (error) {
      // Network errors
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        throw new Error('Tidak dapat terhubung ke server. Pastikan backend berjalan di http://localhost:5000');
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

  // Test connection
  async testConnection() {
    try {
      const response = await fetch(`${API_URL.replace('/api', '')}/api/health`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

export const api = new ApiService();