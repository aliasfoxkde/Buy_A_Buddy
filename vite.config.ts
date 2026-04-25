import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/icon-192.png', 'icons/icon-512.png'],
      manifest: {
        name: 'Buy a Buddy',
        short_name: 'BuddyGame',
        description: 'An idle tycoon game where you buy and manage buddies that generate passive income',
        theme_color: '#6B21A8',
        background_color: '#1a0a2e',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff2}'],
        navigateFallback: '/index.html',
      },
    }),
  ],
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
  server: {
    port: 5173,
    host: true,
  },
});