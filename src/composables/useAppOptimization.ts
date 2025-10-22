import { ref, onMounted, computed } from 'vue'
import { useGeolocation } from './useGeolocation'
import { useGameImages } from './useGameImages'
import { usePreloader } from './usePreloader'
import { useProgress } from '../store/progress'
import { useHunt } from './useHunt'

export function useAppOptimization() {
  const { position, cacheStats, forceUpdate } = useGeolocation()
  const { getImageStats, clearImageCache } = useGameImages()
  const { getPreloadStats } = usePreloader()
  const store = useProgress()
  const { steps } = useHunt()

  // Surveillance des performances
  const performanceMetrics = ref({
    geolocationUpdates: 0,
    imageLoadTime: 0,
    componentLoadTime: 0,
    cacheHits: 0,
    cacheMisses: 0
  })

  // Calcul de la progression
  const progressPercent = computed(() => {
    return Math.round((store.done.size / steps.length) * 100)
  })

  // Optimisation automatique selon la progression
  onMounted(() => {
    // Optimisation initiale après 2 secondes
    setTimeout(() => {
      optimizeForProgression()
    }, 2000)

    // Optimisation continue toutes les 30 secondes
    setInterval(() => {
      optimizeForProgression()
      cleanupOldCache()
    }, 30000)

    // Surveillance des performances
    monitorPerformance()
  })

  // Optimisation selon la progression du joueur
  const optimizeForProgression = async () => {
    const progress = progressPercent.value

    try {
      // Précharger les composants selon la progression
      const { preloadForProgression } = usePreloader()
      await preloadForProgression()

      // Précharger les images selon la progression
      const { preloadImagesForProgress } = useGameImages()
      await preloadImagesForProgress(progress)

    } catch (error) {
      throw error
    }
  }

  // Nettoyage du cache ancien
  const cleanupOldCache = () => {
    // Nettoyer le cache d'images toutes les 10 minutes
    clearImageCache(10)

    // Forcer une mise à jour GPS si nécessaire
    if (cacheStats.value.cacheSize > 5) {
      forceUpdate()
    }
  }

  // Surveillance des performances
  const monitorPerformance = () => {
    // Mesurer les performances du cache GPS
    if (cacheStats.value) {
      performanceMetrics.value.geolocationUpdates = cacheStats.value.cacheSize
    }

    // Mesurer les performances d'images
    const imageStats = getImageStats()
    performanceMetrics.value.imageLoadTime = Date.now() // Simulation

    // Log des métriques en développement
    if (import.meta.env.DEV) {
        ...performanceMetrics.value,
        imageStats,
        geolocationStats: cacheStats.value,
        progress: `${progressPercent.value}%`
      })
    }
  }

  // Obtenir un résumé des optimisations
  const getOptimizationSummary = () => ({
    performance: performanceMetrics.value,
    geolocation: cacheStats.value,
    images: getImageStats(),
    components: getPreloadStats(),
    progress: `${progressPercent.value}%`,
    timestamp: new Date().toISOString()
  })

  // Commandes de débogage pour le développement
  const debugCommands = {
    forceUpdateLocation: forceUpdate,
    clearAllCaches: () => {
      clearImageCache(0)
      localStorage.removeItem('geolocation_cache')
      localStorage.removeItem('progress')
    },
    getFullStats: getOptimizationSummary,
    preloadAll: async () => {
      const { preloadCriticalImages, preloadImagesForProgress } = useGameImages()
      const { preloadHighPriority } = usePreloader()

      await Promise.allSettled([
        preloadCriticalImages(),
        preloadImagesForProgress(100),
        preloadHighPriority()
      ])
    }
  }

  return {
    position,
    progressPercent,
    cacheStats,
    getImageStats,
    getOptimizationSummary,
    debugCommands
  }
}
