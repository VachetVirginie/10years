<script setup lang="ts">
import { onMounted, ref, watch, computed, onUnmounted } from 'vue'
import { useHunt } from '../composables/useHunt'
import { useProgress } from '../store/progress'
import { useGeolocation } from '../composables/useGeolocation'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const { steps } = useHunt()
const store = useProgress()
store.load()
// Activer le suivi de géolocalisation avec mise à jour fréquente
const { position, getCurrentPosition, startTracking, stopTracking } = useGeolocation()
const mapEl = ref<HTMLDivElement|null>(null)
let map: any = null
let userMarker: any = null
let rangeCircle: any = null
let positionUpdateInterval: number | null = null

const geoSteps = computed(() => steps.filter(s => s.type === 'geo'))
const completedSteps = computed(() => geoSteps.value.filter(s => store.done.has(s.id)).length)
const totalGeoSteps = computed(() => geoSteps.value.length)

const updateUserPosition = () => {
  if (!map || !position.value) return
  
  // Supprimer l'ancien marqueur utilisateur s'il existe
  if (userMarker) {
    map.removeLayer(userMarker)
  }
  
  // Créer une icône personnalisée pour le dresseur
  const trainerIcon = L.divIcon({
    html: `<div class="trainer-marker pulsing"><img src="../src/assets/images/pokeMarker.png" /></div>`,
    className: 'trainer-icon-container',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
  })
  
  // Créer un nouveau marqueur pour la position de l'utilisateur
  userMarker = L.marker([position.value.latitude, position.value.longitude], {
    icon: trainerIcon
  }).addTo(map).bindPopup('👨‍🏭 Votre position')
  
  // Cercle de portée autour de la position du dresseur
  rangeCircle = L.circle([position.value.latitude, position.value.longitude], { 
    radius: 100, // Rayon en mètres
    color: 'var(--pokemon-red)',
    fillColor: 'var(--pokemon-red)',
    fillOpacity: 0.1,
    weight: 2,
    dashArray: '5, 10'
  }).addTo(map)
}

onMounted(() => {
  // Force une mise à jour immédiate de la position
  getCurrentPosition()
  
  // Démarrer le suivi fréquent de la position pour la carte
  // Mise à jour plus fréquente que celle par défaut (toutes les 5 secondes au lieu de 10)
  startTracking()
  positionUpdateInterval = window.setInterval(() => {
    getCurrentPosition()
  }, 5000) // Intervalle plus court que celui par défaut
  
  if (!mapEl.value) return
  const geoStepsArray = geoSteps.value as any[]
  
  const center = geoStepsArray.length ? [geoStepsArray[0].lat, geoStepsArray[0].lng] : [48.8566, 2.3522]
  map = L.map(mapEl.value).setView(center as any, 14)
  // Utiliser un style de carte plus sombre qui correspond mieux au thème Pokémon
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19
  }).addTo(map)
  
  geoStepsArray.forEach(gs => {
    const isCompleted = store.done.has(gs.id)
    const isCurrent = (store.currentIndex + 1).toString() === gs.id
    
    // Ne montrer que les étapes complétées et la position actuelle
    if (isCompleted) {
      // Marqueur de Pokémon capturé
      const markerColor = '#10b981' // Vert Pokémon
      const borderColor = '#059669'
      const popupText = `✅ ${gs.title} - Capturé!`
      const emoji = '🏆'
      
      // Créer un marqueur de PokéBall pour les étapes complétées
      const pokeBallIcon = L.divIcon({
        html: `<div class="pokeball-marker completed"><img src="https://archives.bulbagarden.net/media/upload/7/79/Dream_Pok%C3%A9_Ball_Sprite.png" style="width: 60%; height: auto;" /></div>`,
        className: 'pokeball-icon-container',
        iconSize: [30, 30],
        iconAnchor: [15, 15],
        popupAnchor: [0, -15],
      });
      
      // Utiliser un marqueur PokéBall pour les points complétés
      const marker = L.marker([gs.lat, gs.lng], {
        icon: pokeBallIcon
      }).addTo(map).bindPopup(`${emoji} ${popupText}`)
    }
  })
  
  // Mettre à jour la position utilisateur si elle est déjà disponible
  updateUserPosition()
})

// Surveiller les changements de position
watch(position, () => {
  if (position.value) {
    updateUserPosition()
    
    // Centrer la carte sur la position de l'utilisateur
    if (map && userMarker) {
      map.setView([position.value.latitude, position.value.longitude], map.getZoom())
    }
  }
}, { deep: true })

// Arrêter le suivi de position lorsque le composant est démonté
onUnmounted(() => {
  stopTracking()
  if (positionUpdateInterval) {
    clearInterval(positionUpdateInterval)
  }
})
</script>

<template>
  <main class="pokemon-map pa-4">
    <!-- En-tête avec statistiques -->
    <div class="map-header mb-6">
      <h1 class="map-title text-h4 mb-4">
        🗺️ Carte des Pokémon
      </h1>
      
      <div class="stats-container d-flex flex-wrap gap-3 mb-4">
        <v-card class="stat-card flex-grow-1" elevation="3">
          <v-card-text class="text-center pa-3">
            <div class="stat-icon mb-2">🏆</div>
            <div class="stat-value text-h6">{{ completedSteps }}</div>
            <div class="stat-label text-caption">Capturés</div>
          </v-card-text>
        </v-card>
        
        <v-card class="stat-card flex-grow-1" elevation="3">
          <v-card-text class="text-center pa-3">
            <div class="stat-icon mb-2">🎯</div>
            <div class="stat-value text-h6">{{ totalGeoSteps }}</div>
            <div class="stat-label text-caption">Total</div>
          </v-card-text>
        </v-card>
        
        <v-card class="stat-card flex-grow-1" elevation="3">
          <v-card-text class="text-center pa-3">
            <div class="stat-icon mb-2">⚡</div>
            <div class="stat-value text-h6">{{ Math.round((completedSteps / totalGeoSteps) * 100) || 0 }}%</div>
            <div class="stat-label text-caption">Progression</div>
          </v-card-text>
        </v-card>
      </div>
    </div>
    
    <!-- Carte interactive -->
    <v-card class="map-container" elevation="8">
      <div ref="mapEl" class="pokemon-map-view"></div>
      
      <!-- Légende -->
      <v-card-text class="legend pa-3">
        <div class="legend-title text-subtitle2 mb-2">🔍 Légende</div>
        <div class="legend-items d-flex flex-wrap gap-4">
          <div class="legend-item d-flex align-center">
            <div class="legend-icon">
              <img src="https://archives.bulbagarden.net/media/upload/7/79/Dream_Pok%C3%A9_Ball_Sprite.png" alt="PokéBall" class="legend-img" />
            </div>
            <span class="text-caption ml-2 text-pokemon-white">Pokémon capturé</span>
          </div>
          <div class="legend-item d-flex align-center">
            <div class="legend-icon">
              <img src="../assets/images/pokeMarker.png" alt="Dresseur" class="legend-img" />
            </div>
            <span class="text-caption ml-2 text-pokemon-white">Votre position</span>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </main>
</template>

<style scoped>
.pokemon-map {
  background: var(--pokemon-black);
  min-height: 100vh;
  position: relative;
  color: var(--pokemon-white);
}

.map-header {
  background: var(--pokemon-gray-100);
  border-radius: 12px;
  border: 2px solid var(--pokemon-red);
  box-shadow: 0 0 15px rgba(227, 53, 13, 0.3);
  margin-bottom: 24px;
  padding: 24px;
}

.map-title {
  color: var(--pokemon-red);
  font-weight: 700;
  font-size: 1.875rem;
  margin-bottom: 16px;
  letter-spacing: -0.025em;
  text-align: center;
  text-shadow: 0 0 10px rgba(255, 61, 40, 0.5);
}

.stats-container {
  gap: 1rem;
}

.stat-card {
  background: var(--pokemon-gray-100);
  border-radius: 8px;
  border: 1px solid var(--pokemon-red);
  transition: all 0.2s ease;
  min-width: 100px;
  box-shadow: 0 0 10px rgba(227, 53, 13, 0.2);
}

.stat-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  font-size: 1.5rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.stat-value {
  color: var(--pokemon-white);
  font-weight: 600;
}

.stat-label {
  color: var(--pokemon-gray-800);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.map-container {
  background: var(--pokemon-gray-100);
  border-radius: 12px;
  border: 2px solid var(--pokemon-red);
  box-shadow: 0 0 15px rgba(227, 53, 13, 0.3);
  overflow: hidden;
}

.pokemon-map-view {
  height: 60vh;
  width: 100%;
  position: relative;
}

.legend {
  background: var(--pokemon-black);
  border-top: 2px solid var(--pokemon-red);
}

.legend-title {
  color: var(--pokemon-red);
  font-weight: 600;
}

.legend-items {
  gap: 1.5rem;
}

.legend-item {
  align-items: center;
}

.legend-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid var(--pokemon-red);
  background-color: var(--pokemon-gray-100);
  overflow: hidden;
  box-shadow: 0 0 5px rgba(255, 61, 40, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2px;
}

.legend-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* Responsive design */
@media (max-width: 768px) {
  .stats-container {
    flex-direction: column;
  }
  
  .stat-card {
    min-width: unset;
  }
  
  .pokemon-map-view {
    height: 50vh;
  }
  
  .legend-items {
    flex-direction: column;
    gap: 0.5rem;
  }
}

/* Styles pour les marqueurs personnalisés */
.pokeball-marker {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 0 0 2px var(--pokemon-black), 0 0 10px rgba(255, 61, 40, 0.6);
}

.pokeball-marker img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transform-origin: center;
  animation: rotate 6s linear infinite;
}

.pokeball-marker.completed img {
  animation: bounce 2s ease-in-out infinite;
}

.trainer-marker {
  width: 40px;
  height: 40px;
  filter: drop-shadow(0 0 8px var(--pokemon-red));
}

.trainer-marker.pulsing {
  animation: pulse 1.5s ease-in-out infinite;
}

.trainer-marker img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* Animation pour les cartes de statistiques */
@keyframes statPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.stat-card:hover .stat-icon {
  animation: statPulse 1s ease-in-out infinite;
}

/* Animation pour les marqueurs */
@keyframes rotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

@keyframes pulse {
  0% { opacity: 0.8; filter: drop-shadow(0 0 5px var(--pokemon-red)); }
  50% { opacity: 1; filter: drop-shadow(0 0 15px var(--pokemon-red)); }
  100% { opacity: 0.8; filter: drop-shadow(0 0 5px var(--pokemon-red)); }
}
</style>
