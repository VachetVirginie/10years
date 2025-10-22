import { ref, computed } from 'vue'

// Cache des images préchargées avec métadonnées
interface ImageMetadata {
  url: string
  loaded: boolean
  loading: boolean
  error?: string
  size?: number
  format?: string
}

// Configuration des images du jeu avec optimisations
interface LocalImageConfig {
  path: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  format: 'jpg' | 'jpeg' | 'png' | 'svg' | 'webp'
  maxWidth?: number
}

interface ExternalImageConfig {
  path: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  format: 'jpg' | 'jpeg' | 'png' | 'svg' | 'webp'
  external: true
}

type ImageConfig = LocalImageConfig | ExternalImageConfig

const gameImages: Record<string, ImageConfig> = {
  prof: {
    path: '/images/prof.jpg',
    priority: 'critical',
    format: 'jpg',
    maxWidth: 400
  },
  pokeball: {
    path: '/images/pokemon/pokeball.svg',
    priority: 'high',
    format: 'svg',
    maxWidth: 64
  },
  // Badges Pokémon (URLs externes optimisées)
  badgeRock: {
    path: 'https://www.pokepedia.fr/images/a/ab/Badge_Roche_Kanto_LGPE.png',
    priority: 'medium',
    format: 'png',
    external: true
  },
  badgeCascade: {
    path: 'https://www.pokepedia.fr/images/6/67/Badge_Cascade_Kanto_LGPE.png',
    priority: 'medium',
    format: 'png',
    external: true
  },
  badgeThunder: {
    path: 'https://www.pokepedia.fr/images/9/97/Badge_Foudre_Kanto_LGPE.png',
    priority: 'medium',
    format: 'png',
    external: true
  }
} as const

export type GameImageKey = keyof typeof gameImages

export function useGameImages() {
  const loadedImages = ref(new Set<string>())
  const loadingImages = ref(new Set<string>())
  const imageMetadata = ref<Map<string, ImageMetadata>>(new Map())

  // Configuration selon l'environnement
  const isDevelopment = import.meta.env.DEV
  const enableImageOptimization = !isDevelopment

  // Vérifier si une image est disponible localement
  const isImageLoaded = (imageKey: GameImageKey) => {
    return loadedImages.value.has(imageKey)
  }

  // Obtenir les métadonnées d'une image
  const getImageMetadata = (imageKey: GameImageKey): ImageMetadata | undefined => {
    return imageMetadata.value.get(imageKey)
  }

  // Générer une URL optimisée pour une image
  const getOptimizedImageUrl = (imageKey: GameImageKey): string => {
    const config = gameImages[imageKey]

    // Vérifier si c'est une image externe
    if ('external' in config) {
      return config.path
    }

    // Image locale - ajouter des paramètres d'optimisation
    if (enableImageOptimization && config.format !== 'svg') {
      const separator = config.path.includes('?') ? '&' : '?'
      return `${config.path}${separator}format=${config.format}&width=${config.maxWidth}&quality=85`
    }

    return config.path
  }

  // Précharger une image avec suivi des performances
  const preloadImage = async (imageKey: GameImageKey): Promise<string> => {
    const config = gameImages[imageKey]
    const url = getOptimizedImageUrl(imageKey)

    // Vérifier si déjà chargé
    if (loadedImages.value.has(imageKey)) {
      return url
    }

    // Vérifier si en cours de chargement
    if (loadingImages.value.has(imageKey)) {
      return new Promise((resolve) => {
        const checkLoaded = () => {
          if (loadedImages.value.has(imageKey)) {
            resolve(url)
          } else {
            setTimeout(checkLoaded, 10)
          }
        }
        checkLoaded()
      })
    }

    loadingImages.value.add(imageKey)

    return new Promise((resolve, reject) => {
      const img = new Image()
      const startTime = performance.now()

      img.onload = () => {
        const loadTime = performance.now() - startTime

        // Mettre à jour les métadonnées
        imageMetadata.value.set(imageKey, {
          url,
          loaded: true,
          loading: false,
          size: img.naturalWidth * img.naturalHeight,
          format: config.format
        })

        loadedImages.value.add(imageKey)
        loadingImages.value.delete(imageKey)

        console.log(`✅ Image ${imageKey} chargée en ${loadTime.toFixed(2)}ms`)
        resolve(url)
      }

      img.onerror = () => {
        loadingImages.value.delete(imageKey)

        // Mettre à jour les métadonnées avec l'erreur
        imageMetadata.value.set(imageKey, {
          url,
          loaded: false,
          loading: false,
          error: 'Failed to load'
        })

        reject(new Error(`Failed to load image: ${url}`))
      }

      img.src = url
    })
  }

  // Précharger toutes les images critiques
  const preloadCriticalImages = async (): Promise<void> => {
    const criticalImages: GameImageKey[] = ['prof', 'pokeball']

    try {
      await Promise.allSettled(
        criticalImages.map(preloadImage)
      )
    } catch (error) {
      console.warn('Erreur lors du préchargement des images critiques:', error)
    }
  }

  // Précharger les images selon la progression
  const preloadImagesForProgress = async (progress: number): Promise<void> => {
    const imagesToLoad: GameImageKey[] = []

    // Charger les badges selon la progression (10% par badge)
    if (progress > 10) imagesToLoad.push('badgeRock')
    if (progress > 20) imagesToLoad.push('badgeCascade')
    if (progress > 30) imagesToLoad.push('badgeThunder')

    if (imagesToLoad.length > 0) {
      await Promise.allSettled(
        imagesToLoad.map(preloadImage)
      )
    }
  }

  // Obtenir l'URL d'une image (avec préchargement automatique)
  const getImageUrl = async (imageKey: GameImageKey): Promise<string> => {
    await preloadImage(imageKey)
    return getOptimizedImageUrl(imageKey)
  }

  // Obtenir l'URL d'une image sans préchargement (pour les images non critiques)
  const getImageUrlSync = (imageKey: GameImageKey): string => {
    return getOptimizedImageUrl(imageKey)
  }

  // Précharger en arrière-plan sans bloquer
  const preloadInBackground = (imageKey: GameImageKey): void => {
    if (!loadedImages.value.has(imageKey) && !loadingImages.value.has(imageKey)) {
      preloadImage(imageKey).catch(() => {
        // Silencieusement ignorer les erreurs en arrière-plan
      })
    }
  }

  // Statistiques des images
  const getImageStats = () => ({
    total: Object.keys(gameImages).length,
    loaded: loadedImages.value.size,
    loading: loadingImages.value.size,
    cacheSize: imageMetadata.value.size,
    errors: Array.from(imageMetadata.value.entries())
      .filter(([, meta]) => meta.error)
      .map(([key]) => key)
  })

  // Optimiser les images pour le WebP si supporté
  const supportsWebP = (): boolean => {
    const canvas = document.createElement('canvas')
    return canvas.toDataURL('image/webp').startsWith('data:image/webp')
  }

  // Nettoyer le cache des images (pour la mémoire)
  const clearImageCache = (olderThanMinutes: number = 30): void => {
    const cutoff = Date.now() - (olderThanMinutes * 60 * 1000)

    imageMetadata.value.forEach((metadata, key) => {
      if (metadata.loaded && (!metadata.size || metadata.size < cutoff)) {
        loadedImages.value.delete(key)
        imageMetadata.value.delete(key)
      }
    })
  }

  return {
    isImageLoaded,
    getImageMetadata,
    preloadImage,
    preloadCriticalImages,
    preloadImagesForProgress,
    getImageUrl,
    getImageUrlSync,
    preloadInBackground,
    getImageStats,
    clearImageCache,
    supportsWebP,
    gameImages
  }
}
