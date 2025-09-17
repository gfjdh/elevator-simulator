// vite.config.ts
import { defineConfig } from 'vite';
import legacy from '@vitejs/plugin-legacy';

export default defineConfig(() => {
  return {
    base: '/elevator-simulator/',
    build: {
      outDir: 'build'
    },
    plugins: [
      legacy({
        targets: ['defaults', 'not IE 11'],
      }),
    ],
  };
});