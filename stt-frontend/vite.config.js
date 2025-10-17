import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    proxy: {
      '/api': 'https://speech-to-text-backend-one.vercel.app'
    }
  }
});
