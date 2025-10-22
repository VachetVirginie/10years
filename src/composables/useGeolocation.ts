import { ref, onMounted, onUnmounted, computed } from 'vue'

export interface Position {
  latitude: number
  longitude: number
  accuracy: number
  timestamp?: number
}

export interface CachedPosition extends Position {
  timestamp: number
  distanceFromLast?: number
}

export function useGeolocation() {
  const position = ref<Position | null>(null)
  const error = ref<string | null>(null)
  const isLoading = ref(false)
  let watchId: number | null = null
  let intervalId: number | null = null

  // Configuration du cache
  const CACHE_KEY = 'geolocation_cache'
  const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
  const MIN_DISTANCE_THRESHOLD = 10 // mètres minimum pour déclencher une mise à jour
  const UPDATE_INTERVAL = 30000 // 30 secondes

  // Cache des positions
  const positionCache = ref<CachedPosition[]>([])

  // Charger le cache depuis le localStorage
  const loadCache = (): void => {
    try {
      const cached = localStorage.getItem(CACHE_KEY)
      if (cached) {
        const parsed = JSON.parse(cached)
        positionCache.value = parsed.filter((pos: CachedPosition) =>
          Date.now() - pos.timestamp < CACHE_DURATION
        )
      }
    } catch (e) {
      throw e
    }
  }

  // Sauvegarder le cache
  const saveCache = (): void => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(positionCache.value))
    } catch (e) {
      throw e
    }
  }

  // Calculer la distance entre deux positions (formule de Haversine)
  const calculateDistance = (pos1: Position, pos2: Position): number => {
    const R = 6371000 // Rayon de la Terre en mètres
    const toRad = (deg: number) => deg * Math.PI / 180

    const dLat = toRad(pos2.latitude - pos1.latitude)
    const dLng = toRad(pos2.longitude - pos1.longitude)
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(toRad(pos1.latitude)) * Math.cos(toRad(pos2.latitude)) *
              Math.sin(dLng/2) * Math.sin(dLng/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  // Vérifier si la position a significativement changé
  const hasSignificantMovement = (newPos: Position): boolean => {
    if (positionCache.value.length === 0) return true

    const lastPos = positionCache.value[positionCache.value.length - 1]
    const distance = calculateDistance(lastPos, newPos)
    return distance > MIN_DISTANCE_THRESHOLD
  }

  // Obtenir la position depuis le cache si elle est récente
  const getCachedPosition = (): Position | null => {
    if (positionCache.value.length === 0) return null

    const lastPos = positionCache.value[positionCache.value.length - 1]
    const now = Date.now()

    // Si la position a moins de 2 minutes et une précision acceptable
    if (now - lastPos.timestamp < 2 * 60 * 1000 && lastPos.accuracy < 50) {
      return {
        latitude: lastPos.latitude,
        longitude: lastPos.longitude,
        accuracy: lastPos.accuracy
      }
    }

    return null
  }

  const getCurrentPosition = () => {
    if (!navigator.geolocation) {
      error.value = 'La géolocalisation n\'est pas supportée par ce navigateur'
      return
    }

    // Vérifier d'abord le cache
    const cachedPos = getCachedPosition()
    if (cachedPos) {
      position.value = cachedPos
      return
    }

    isLoading.value = true
    error.value = null

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newPosition: Position = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          timestamp: Date.now()
        }

        // Vérifier si le mouvement est significatif
        if (!hasSignificantMovement(newPosition)) {
          isLoading.value = false
          return // Pas de mise à jour nécessaire
        }

        position.value = newPosition

        // Ajouter au cache
        const cachedPosition: CachedPosition = {
          ...newPosition,
          timestamp: Date.now(),
          distanceFromLast: positionCache.value.length > 0
            ? calculateDistance(positionCache.value[positionCache.value.length - 1], newPosition)
            : 0
        }

        positionCache.value.push(cachedPosition)

        // Limiter la taille du cache
        if (positionCache.value.length > 10) {
          positionCache.value = positionCache.value.slice(-10)
        }

        saveCache()
        isLoading.value = false
      },
      (err) => {
        error.value = `Erreur de géolocalisation: ${err.message}`
        isLoading.value = false
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 120000 // Accepter les positions jusqu'à 2 minutes
      }
    )
  }

  // Position intelligente avec cache
  const smartPosition = computed(() => {
    if (position.value) return position.value
    return getCachedPosition()
  })

  // Statistiques du cache
  const cacheStats = computed(() => ({
    cacheSize: positionCache.value.length,
    lastUpdate: positionCache.value.length > 0
      ? positionCache.value[positionCache.value.length - 1].timestamp
      : null,
    totalDistance: positionCache.value.reduce((sum, pos) => sum + (pos.distanceFromLast || 0), 0)
  }))

  const startTracking = () => {
    loadCache()

    // Obtenir la position immédiatement
    getCurrentPosition()

    // Puis la mettre à jour de manière intelligente
    intervalId = window.setInterval(() => {
      getCurrentPosition()
    }, UPDATE_INTERVAL)
  }

  const stopTracking = () => {
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
    if (watchId) {
      navigator.geolocation.clearWatch(watchId)
      watchId = null
    }
  }

  // Forcer une mise à jour de la position
  const forceUpdate = () => {
    positionCache.value = [] // Vider le cache
    saveCache()
    getCurrentPosition()
  }

  onMounted(() => {
    startTracking()
  })

  onUnmounted(() => {
    stopTracking()
  })

  return {
    position: smartPosition,
    error,
    isLoading,
    getCurrentPosition,
    startTracking,
    stopTracking,
    forceUpdate,
    cacheStats,
    positionCache: positionCache.value
  }
}