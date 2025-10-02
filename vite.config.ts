import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(() => {
    return {
      server: {
        port: 5000,
        host: '0.0.0.0',
        allowedHosts: [
          'd9eb2099-2421-461a-b754-1da31aa27558-00-1aealgsbk71gg.riker.replit.dev'
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