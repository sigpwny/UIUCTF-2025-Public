import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://2025.uiuc.tf',
  cacheDir: './.cache',
  output: 'static',
  integrations: [svelte()],
  trailingSlash: 'never',
  build: {
    format: 'file',
  },
  vite: {
    plugins: [
      tailwindcss()
    ]
  }
});