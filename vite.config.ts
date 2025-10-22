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
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'ui-vendor': ['vuetify'],
          'map-vendor': ['leaflet'],

          // Game chunks
          'game-step': ['./src/pages/Step.vue'],
          'game-map': ['./src/pages/Map.vue'],
          'game-journal': ['./src/pages/TrainerJournal.vue'],
          'game-story': ['./src/pages/OurStory.vue'],
          'game-summary': ['./src/pages/Summary.vue'],

          // Components chunks
          'game-components': [
            './src/components/PokemonDialog.vue',
            './src/components/PokemonHealthBar.vue',
            './src/components/PokemonBadges.vue',
            './src/components/PokemonMenu.vue'
          ],

          // Utils chunks
          'game-utils': [
            './src/composables/useGeolocation.ts',
            './src/composables/useGeofence.ts',
            './src/composables/useHunt.ts'
          ]
        },
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    // Optimisations de performance
    target: 'es2020',
    minify: 'esbuild',
    cssCodeSplit: true,
    sourcemap: false
  },
  // Optimisation des dépendances
  optimizeDeps: {
    include: [
      'vue',
      'vue-router',
      'pinia',
      'vuetify',
      'leaflet'
    ]
  }
})
