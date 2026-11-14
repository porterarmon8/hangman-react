import { defineConfig } from 'vite';

const proxy = {
  '/api': process.env.PLAYER_API_URL || 'http://127.0.0.1:3001',
};

export default defineConfig({
  server: { proxy, strictPort: true },
  preview: { proxy },
});
