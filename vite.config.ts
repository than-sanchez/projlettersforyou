import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(() => {
    return {
      server: {
        port: 5000,
        host: '0.0.0.0',
        allowedHosts: [
          '0e25dfcc-a180-4928-ac18-797f974f3e4e-00-2dh8xsjowhvi4.pike.replit.dev'
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