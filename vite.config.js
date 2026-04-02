import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), vueJsx()],
  base: './', // Important for electron since it loads files from local file system
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  }
});
