import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Important for electron – loads from local filesystem
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        // Main app window
        main:  resolve(__dirname, 'index.html'),
        // Login window
        login: resolve(__dirname, 'login.html'),
      },
    },
  },
});
