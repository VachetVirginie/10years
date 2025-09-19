<script setup lang="ts">
import { onMounted, ref, watch, computed } from 'vue'
import { useHunt } from '../composables/useHunt'
import { useProgress } from '../store/progress'
import { useGeolocation } from '../composables/useGeolocation'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const { steps } = useHunt()
const store = useProgress()
store.load()
const { position } = useGeolocation()
const mapEl = ref<HTMLDivElement|null>(null)
let map: any = null
let userMarker: any = null

const geoSteps = computed(() => steps.filter(s => s.type === 'geo'))
const completedSteps = computed(() => geoSteps.value.filter(s => store.done.has(s.id)).length)
const totalGeoSteps = computed(() => geoSteps.value.length)

const updateUserPosition = () => {
  if (!map || !position.value) return
  
  // Supprimer l'ancien marqueur utilisateur s'il existe
  if (userMarker) {
    map.removeLayer(userMarker)
  }
  
  // Créer un nouveau marqueur pour la position de l'utilisateur avec style Pokémon
  userMarker = L.circleMarker([position.value.latitude, position.value.longitude], {
    radius: 12,
    fillColor: '#3b82f6',
    color: '#fbbf24',
    weight: 4,
    opacity: 1,
    fillOpacity: 0.9
  }).addTo(map).bindPopup('🎯 Position du Dresseur')
}

onMounted(() => {
  if (!mapEl.value) return
  const geoStepsArray = geoSteps.value as any[]
  
  const center = geoStepsArray.length ? [geoStepsArray[0].lat, geoStepsArray[0].lng] : [48.8566, 2.3522]
  map = L.map(mapEl.value).setView(center as any, 14)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
  }).addTo(map)
  
  geoStepsArray.forEach(gs => {
    const isCompleted = store.done.has(gs.id)
    const isCurrent = (store.currentIndex + 1).toString() === gs.id
    
    // Ne montrer que les étapes terminées ou l'étape actuelle
    if (isCompleted || isCurrent) {
      let markerColor = '#3b82f6' // Bleu par défaut
      let borderColor = '#fbbf24' // Jaune Pokémon
      let popupText = gs.title
      let emoji = '⚡'
      
      if (isCompleted) {
        markerColor = '#10b981' // Vert Pokémon
        borderColor = '#059669'
        popupText = `✅ ${gs.title} - Capturé!`
        emoji = '🏆'
      } else if (isCurrent) {
        markerColor = '#f59e0b' // Jaune Pokémon
        borderColor = '#d97706'
        popupText = `🎯 ${gs.title} - Pokémon sauvage détecté!`
        emoji = '🔥'
      }
      
      // Créer un marqueur personnalisé avec style Pokémon
      const marker = L.circleMarker([gs.lat, gs.lng], {
        radius: 15,
        fillColor: markerColor,
        color: borderColor,
        weight: 4,
        opacity: 1,
        fillOpacity: 0.9
      }).addTo(map).bindPopup(`${emoji} ${popupText}`)
      
      // Ajouter le cercle de géofence seulement pour l'étape actuelle
      if (isCurrent) {
        L.circle([gs.lat, gs.lng], { 
          radius: gs.radius,
          color: markerColor,
          fillColor: markerColor,
          fillOpacity: 0.15,
          weight: 3,
          dashArray: '10, 10'
        }).addTo(map)
      }
    }
  })
  
  // Mettre à jour la position utilisateur si elle est déjà disponible
  updateUserPosition()
})

// Surveiller les changements de position
watch(position, () => {
  updateUserPosition()
}, { deep: true })
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
            <div class="legend-marker captured"></div>
            <span class="text-caption ml-2">Pokémon capturé</span>
          </div>
          <div class="legend-item d-flex align-center">
            <div class="legend-marker current"></div>
            <span class="text-caption ml-2">Pokémon sauvage</span>
          </div>
          <div class="legend-item d-flex align-center">
            <div class="legend-marker trainer"></div>
            <span class="text-caption ml-2">Votre position</span>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </main>
</template>

<style scoped>
.pokemon-map {
  background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
  min-height: 100vh;
  position: relative;
}

.map-header {
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
  padding: 24px;
}

.map-title {
  color: #1e293b;
  font-weight: 700;
  font-size: 1.875rem;
  margin-bottom: 16px;
  letter-spacing: -0.025em;
  text-align: center;
}

.stats-container {
  gap: 1rem;
}

.stat-card {
  background: #ffffff;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
  min-width: 100px;
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
  color: #1e293b;
  font-weight: 600;
}

.stat-label {
  color: #64748b;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.map-container {
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.pokemon-map-view {
  height: 60vh;
  width: 100%;
  position: relative;
}

.legend {
  background: linear-gradient(90deg, #f8fafc, #ffffff);
  border-top: 2px solid #e2e8f0;
}

.legend-title {
  color: #1e293b;
  font-weight: 600;
}

.legend-items {
  gap: 1.5rem;
}

.legend-item {
  align-items: center;
}

.legend-marker {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.legend-marker.captured {
  background: #10b981;
  border-color: #059669;
}

.legend-marker.current {
  background: #f59e0b;
  border-color: #d97706;
}

.legend-marker.trainer {
  background: #3b82f6;
  border-color: #fbbf24;
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

/* Animation pour les cartes de statistiques */
@keyframes statPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.stat-card:hover .stat-icon {
  animation: statPulse 1s ease-in-out infinite;
}
</style>
