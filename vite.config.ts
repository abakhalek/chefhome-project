import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    define: {
      __APP_ENV__: env.APP_ENV,
    },
    server: {
      host: '0.0.0.0', // Permet l'accès depuis l'extérieur
      port: 5173,
      open: false,
      allowedHosts: [
        'chefathome-app.fr',
        'www.chefathome-app.fr',
      ],
      // Proxy config pour le développement
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
          secure: false,
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  };
});