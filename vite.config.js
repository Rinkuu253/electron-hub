import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: './', // Important for electron since it loads files from local file system
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  }
});
