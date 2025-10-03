import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(() => {
    return {
      server: {
        port: 5000,
        host: '0.0.0.0',
        allowedHosts: [
          '8701b24c-61b5-48c4-85f5-593f15e99d8e-00-2mtsicz9sc19h.sisko.replit.dev'
        ],
        hmr: {
          clientPort: 443,
        },
        proxy: {
          '/api/': {
            target: 'http://localhost:8080',
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api\//, '/')
          }
        }
      },
      plugins: [react()],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});