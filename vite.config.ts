import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

const isDev = process.env.NODE_ENV !== 'production';

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Buy a Buddy',
        short_name: 'BuddyGame',
        description: 'An immersive 2D RPG with mini-games',
        theme_color: '#0d0d1a',
        background_color: '#0d0d1a',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp}'],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024, // 3MB
      },
    }),
  ],
  build: {
    outDir: 'dist',
    sourcemap: isDev,
  },
  server: {
    port: 5173,
    host: true,
  },
});