// vite.config.ts
import { defineConfig } from 'vite';
import legacy from '@vitejs/plugin-legacy';

export default defineConfig(() => {
  return {
    plugins: [
      legacy({
        targets: ['defaults', 'not IE 11'],
      }),
    ],
  };
});