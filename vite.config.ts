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
      host: '0.0.0.0',
      port: 5173,
      open: false,
      // Ajoutez cette section pour autoriser le host
      allowedHosts: [
        'chefathome-app.fr', // Autorise le domaine principal
        'www.chefathome-app.fr', // Autorise la version www
      ],
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'https://chefathome-app.fr/api',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
    },
  };
});