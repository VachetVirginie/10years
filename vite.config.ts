import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'

export default defineConfig({
  plugins: [
    vue(),
    vuetify({ autoImport: true })
  ],
  server: { port: 5173 },
  build: {
    // Optimisation du bundle initial
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks plus granulaire
          if (id.includes('node_modules')) {
            if (id.includes('vue') || id.includes('vue-router')) return 'vue-vendor'
            if (id.includes('vuetify')) return 'ui-vendor'
            if (id.includes('leaflet')) return 'map-vendor'
            if (id.includes('pinia')) return 'state-vendor'
            if (id.includes('@zxing') || id.includes('jspdf') || id.includes('html2canvas')) return 'utils-vendor'
            return 'vendor'
          }

          // Code splitting plus intelligent pour le code source
          if (id.includes('/src/')) {
            // Pages - chunks séparés pour un chargement à la demande
            if (id.includes('/pages/')) {
              if (id.includes('Step.vue')) return 'game-step'
              if (id.includes('Map.vue')) return 'game-map'
              if (id.includes('TrainerJournal.vue')) return 'game-journal'
              if (id.includes('Summary.vue')) return 'game-summary'
              return 'game-pages'
            }

            // Composants - chunk par fonctionnalité
            if (id.includes('/components/')) {
              if (id.includes('Pokemon')) return 'game-components-pokemon'
              if (id.includes('Riddle') || id.includes('Choice') || id.includes('Bonus')) return 'game-components-steps'
              if (id.includes('LyonMap') || id.includes('Map')) return 'game-components-map'
              return 'game-components'
            }

            // Composables - chunk par domaine fonctionnel
            if (id.includes('/composables/')) {
              if (id.includes('Geolocation') || id.includes('Geofence')) return 'game-utils-location'
              if (id.includes('Hunt') || id.includes('Progress')) return 'game-utils-game'
              if (id.includes('Preloader') || id.includes('GameImages')) return 'game-utils-optimization'
              return 'game-utils'
            }

            // Store
            if (id.includes('/store/')) return 'game-store'

            // Assets et styles
            if (id.includes('/assets/')) return 'game-assets'
          }

          // Fallback pour les gros modules
          if (id.includes('large-module')) return 'large-modules'
        },
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
            ? chunkInfo.facadeModuleId.split('/').pop()?.replace('.vue', '').replace('.ts', '')
            : 'chunk'

          return `js/${facadeModuleId}-[hash].js`
        },
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.')
          const ext = info?.[info.length - 1]

          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext || '')) {
            return `images/[name]-[hash].${ext}`
          }
          if (/css/i.test(ext || '')) {
            return `css/[name]-[hash].${ext}`
          }
          if (/woff2?|eot|ttf|otf/i.test(ext || '')) {
            return `fonts/[name]-[hash].${ext}`
          }
          return `assets/[name]-[hash].${ext}`
        }
      }
    },
    // Optimisations avancées
    target: 'es2020',
    minify: 'esbuild',
    cssCodeSplit: true,
    cssMinify: 'esbuild',
    sourcemap: false,
    chunkSizeWarningLimit: 500,
    modulePreload: {
      polyfill: false
    }
  },
  // Préchargement optimisé des dépendances
  optimizeDeps: {
    include: [
      'vue',
      'vue-router',
      'pinia',
      'vuetify',
      'leaflet'
    ],
    // Exclure les grosses dépendances du prébundle pour qu'elles soient chargées à la demande
    exclude: ['@zxing/browser', 'jspdf', 'html2canvas']
  },
  // Optimisation des assets
  assetsInclude: ['**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif', '**/*.svg', '**/*.webp']
})
