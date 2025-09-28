import { ref, onMounted, onUnmounted } from 'vue'

export interface Position {
  latitude: number
  longitude: number
  accuracy: number
}

export function useGeolocation() {
  const position = ref<Position | null>(null)
  const error = ref<string | null>(null)
  const isLoading = ref(false)
  let watchId: number | null = null
  let intervalId: number | null = null

  const getCurrentPosition = () => {
    if (!navigator.geolocation) {
      error.value = 'La géolocalisation n\'est pas supportée par ce navigateur'
      return
    }

    isLoading.value = true
    error.value = null

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        position.value = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy
        }
        isLoading.value = false
      },
      (err) => {
        error.value = `Erreur de géolocalisation: ${err.message}`
        isLoading.value = false
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    )
  }

  const startTracking = () => {
    // Obtenir la position immédiatement
    getCurrentPosition()
    
    // Puis la mettre à jour toutes les 10 secondes
    intervalId = window.setInterval(() => {
      getCurrentPosition()
    }, 30000)
  }

  const stopTracking = () => {
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
  }

  onMounted(() => {
    startTracking()
  })

  onUnmounted(() => {
    stopTracking()
  })

  return {
    position,
    error,
    isLoading,
    getCurrentPosition,
    startTracking,
    stopTracking
  }
}