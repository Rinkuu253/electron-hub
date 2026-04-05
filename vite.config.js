import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), vueJsx()],
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
