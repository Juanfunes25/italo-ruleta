import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Nombre del repositorio en GitHub. La app se publicará en:
//   https://TU-USUARIO.github.io/italo-ruleta/
// ⚠️ El repositorio en GitHub DEBE llamarse exactamente así.
const REPO = 'italo-ruleta'

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  // En desarrollo se sirve en la raíz; al publicar, bajo /italo-ruleta/
  const base = command === 'build' ? `/${REPO}/` : '/'

  return {
    base,
    server: { port: 3300, host: true }, // host:true => accesible desde la tablet por IP
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
        workbox: {
          // Cachea toda la app para que funcione sin wifi en el mostrador
          globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
          navigateFallback: `${base}index.html`,
          cleanupOutdatedCaches: true,
        },
        manifest: {
          name: 'Ítalo Ruleta de Premios',
          short_name: 'Ítalo Ruleta',
          description: 'Ruleta de premios para clientes de Ítalo Gelateria — kiosco táctil de mostrador.',
          lang: 'es',
          // Rutas relativas => funcionan tanto en la raíz como bajo /italo-ruleta/
          start_url: '.',
          scope: '.',
          display: 'fullscreen',
          orientation: 'landscape',
          background_color: '#FAF3E7',
          theme_color: '#C1592B',
          icons: [
            { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
            { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
            { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          ],
        },
        devOptions: { enabled: true }, // permite probar la PWA en modo dev
      }),
    ],
  }
})
