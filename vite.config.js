import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // PWA: permite "Añadir a pantalla de inicio" y abrirla a pantalla completa
    VitePWA({
      registerType: 'autoUpdate', // cuando subimos una versión nueva, se actualiza sola
      includeAssets: ['icono.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'FutStat',
        short_name: 'FutStat',
        description: 'Tu carta de jugador para pachangas y partidos con amigos.',
        lang: 'es',
        start_url: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#05080f',
        theme_color: '#05080f',
        icons: [
          { src: '/icono-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icono-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icono-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Guarda la web en el móvil para que abra rápido (los datos siempre vienen de internet)
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        navigateFallback: '/index.html',
      },
    }),
  ],
})
