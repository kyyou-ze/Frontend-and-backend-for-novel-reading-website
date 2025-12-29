import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import eruda from 'vite-plugin-eruda';

export default defineConfig({
  plugins: [
    react(),
    eruda()
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
});
