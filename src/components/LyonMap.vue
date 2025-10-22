<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useProgress } from '../store/progress'
import { useHunt } from '../composables/useHunt'
import L from 'leaflet'

// Références pour la carte et les éléments DOM
const mapContainer = ref<HTMLElement>()
const map = ref<any>(null)
let fogLayers: any[] = []

// Store et données de chasse
const store = useProgress()
const { steps } = useHunt()
store.load()

// État de la carte
const isMapReady = ref(false)

// Étapes complétées
const completedSteps = computed(() => Array.from(store.done))

// Coordonnées du centre de Lyon
const LYON_CENTER: [number, number] = [45.764043, 4.835659]

// Fonction pour créer une couche de brouillard
function createFogLayer(bounds: any, opacity: number = 0.8): any {
  return L.rectangle(bounds, {
    color: 'transparent',
    fillColor: 'black',
    fillOpacity: opacity,
    weight: 0,
    interactive: false
  })
}

// Fonction pour calculer les limites d'une zone circulaire
function calculateZoneBounds(center: [number, number], radius: number): any {
  const centerPoint = L.latLng(center[0], center[1])
  const radiusInDegrees = (radius / 1000) / 111.32 // Conversion approximative mètres -> degrés
  return L.latLngBounds([
    [center[0] - radiusInDegrees, center[1] - radiusInDegrees],
    [center[0] + radiusInDegrees, center[1] + radiusInDegrees]
  ])
}

// Fonction pour déterminer quelles zones sont visibles
function getVisibleZones(): string[] {
  const visibleZones: string[] = ['0'] // Zone 0 (point de départ) toujours visible

  completedSteps.value.forEach(stepId => {
    if (stepId !== '0' && !stepId.endsWith('b')) {
      // Ajouter la zone de cette étape si elle n'est pas déjà visible
      const stepNumber = stepId.replace('b', '')
      if (!visibleZones.includes(stepNumber)) {
        visibleZones.push(stepNumber)
      }
    }
  })

  return visibleZones
}

// Fonction pour créer les marqueurs d'étapes
function createStepMarkers(map: any) {
  const markers: any[] = []

  steps.forEach(step => {
    // Vérifier que l'étape a des coordonnées géographiques
    if ('lat' in step && 'lng' in step && step.lat && step.lng && !step.id.endsWith('b')) {
      const isVisible = getVisibleZones().includes(step.id)

      // N'ajouter le marqueur que s'il est visible
      if (isVisible) {
        const isCompleted = completedSteps.value.includes(step.id)

        let iconUrl = ''
        let iconSize: [number, number] = [25, 41]
        let iconAnchor: [number, number] = [12, 41]

        if (isCompleted) {
          iconUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png'
        } else {
          iconUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png'
        }

        const customIcon = L.icon({
          iconUrl,
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
          iconSize,
          iconAnchor,
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        })

        const marker = L.marker([step.lat, step.lng], { icon: customIcon })

        // Contenu du popup
        let popupContent = `
          <div class="map-popup">
            <h4>${step.title}</h4>
            <p><strong>Type:</strong> ${getStepTypeLabel(step.type)}</p>
            <p><strong>Status:</strong> ${isCompleted ? '✅ Terminé' : '🔓 Débloqué'}</p>
        `

        if (step.type === 'bonus' && step.bonusType) {
          popupContent += `<p><strong>Défi:</strong> ${getBonusTypeLabel(step.bonusType)}</p>`
        }

        popupContent += '</div>'

        marker.bindPopup(popupContent)
        markers.push(marker)
      }
    }
  })

  // Ajouter tous les marqueurs à la carte
  markers.forEach(marker => marker.addTo(map))
}

// Fonction pour obtenir le label du type d'étape
function getStepTypeLabel(type: string): string {
  switch (type) {
    case 'riddle': return 'Énigme'
    case 'choice': return 'Combat'
    case 'bonus': return 'Bonus'
    default: return 'Étape'
  }
}

// Fonction pour obtenir le label du type de bonus
function getBonusTypeLabel(bonusType: string): string {
  switch (bonusType) {
    case 'photo_challenge': return 'Défi Photo'
    case 'creative_challenge': return 'Défi Créatif'
    case 'nature_challenge': return 'Défi Nature'
    case 'memory_challenge': return 'Défi Mémoire'
    case 'movement_challenge': return 'Défi Mouvement'
    case 'balance_challenge': return 'Défi Équilibre'
    default: return 'Défi Bonus'
  }
}

// Fonction pour créer et gérer les couches de brouillard
function updateFogLayers() {
  if (!map.value) return

  // Supprimer les anciennes couches de brouillard
  fogLayers.forEach((layer: any) => {
    map.value!.removeLayer(layer)
  })
  fogLayers = []

  // Créer les nouvelles couches de brouillard
  steps.forEach(step => {
    // Vérifier que l'étape a des coordonnées géographiques
    if ('lat' in step && 'lng' in step && 'radius' in step && step.lat && step.lng && step.radius && !step.id.endsWith('b')) {
      const isVisible = getVisibleZones().includes(step.id)

      if (!isVisible) {
        const zoneBounds = calculateZoneBounds([step.lat as number, step.lng as number], step.radius as number)
        const fogLayer = createFogLayer(zoneBounds, 0.7)
        fogLayer.addTo(map.value!)
        fogLayers.push(fogLayer)
      }
    }
  })
}

// Initialisation de la carte
function initMap() {
  if (!mapContainer.value || map.value) return

  // Créer la carte
  map.value = L.map(mapContainer.value, {
    center: LYON_CENTER,
    zoom: 13,
    zoomControl: true,
    attributionControl: true
  })

  // Ajouter les tuiles OpenStreetMap avec un thème plus sombre
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: 'OpenStreetMap contributors CARTO',
    subdomains: 'abcd',
    maxZoom: 19
  }).addTo(map.value)

  // Créer les marqueurs
  createStepMarkers(map.value)

  // Créer les couches de brouillard
  updateFogLayers()

  isMapReady.value = true
}

// Nettoyage lors de la destruction du composant
onUnmounted(() => {
  if (map.value) {
    map.value.remove()
    map.value = null
  }
})

// Surveiller les changements de progression pour mettre à jour la carte
watch(completedSteps, () => {
  if (map.value) {
    // Supprimer tous les marqueurs existants
    map.value.eachLayer((layer: any) => {
      if (layer instanceof L.Marker) {
        map.value!.removeLayer(layer)
      }
    })

    // Recréer les marqueurs avec les nouvelles couleurs
    createStepMarkers(map.value)
    updateFogLayers()
  }
})

// Initialisation au montage
onMounted(() => {
  // Petit délai pour s'assurer que le DOM est prêt
  setTimeout(initMap, 100)
})
</script>

<template>
  <div class="map-container">
    <!-- Éléments décoratifs en arrière-plan -->
    <div class="map-bg-particles">
      <div class="particle particle-1"></div>
      <div class="particle particle-2"></div>
      <div class="particle particle-3"></div>
      <div class="particle particle-4"></div>
      <div class="particle particle-5"></div>
    </div>

    <div class="map-header">
      <h2 class="map-title">🗺️ Carte de Lyon - Chasse au Trésor</h2>
      <div class="map-subtitle">Explorez la ville étape par étape</div>
      <div class="map-legend">
        <div class="legend-item">
          <div class="legend-icon green"></div>
          <span>Étape terminée</span>
        </div>
        <div class="legend-item">
          <div class="legend-icon red"></div>
          <span>Étape débloquée</span>
        </div>
        <div class="legend-item">
          <div class="legend-icon grey"></div>
          <span>Étape verrouillée</span>
        </div>
        <div class="legend-item">
          <div class="legend-icon fog"></div>
          <span>Zone masquée</span>
        </div>
      </div>
    </div>

    <div class="map-wrapper">
      <div ref="mapContainer" class="leaflet-map"></div>

      <div v-if="!isMapReady" class="map-loading">
        <div class="loading-spinner"></div>
        <p>Chargement de la carte...</p>
        <div class="loading-dots">
          <span>.</span><span>.</span><span>.</span>
        </div>
      </div>
    </div>

    <div class="map-progress">
      <div class="progress-info">
        <div class="progress-details">
          <span class="progress-text">
            Progression: {{ completedSteps.length }}/{{ steps.filter(s => !s.id.endsWith('b')).length }} étapes
          </span>
          <div class="progress-bar">
            <div
              class="progress-fill"
              :style="{ width: `${Math.round((completedSteps.length / steps.filter(s => !s.id.endsWith('b')).length) * 100)}%` }"
            ></div>
          </div>
        </div>
        <span class="progress-percentage">
          {{ Math.round((completedSteps.length / steps.filter(s => !s.id.endsWith('b')).length) * 100) }}%
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import 'leaflet/dist/leaflet.css';

.map-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  color: var(--pokemon-white);
  position: relative;
  overflow: hidden;
}

.map-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255, 61, 40, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(120, 119, 198, 0.05) 0%, transparent 50%);
  pointer-events: none;
  z-index: 0;
}

.map-header {
  padding: 20px;
  background: rgba(33, 33, 33, 0.95);
  backdrop-filter: blur(15px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
  z-index: 1000;
  position: relative;
}

.map-title {
  margin: 0 0 15px 0;
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--pokemon-white);
  text-shadow: 0 0 15px rgba(255, 61, 40, 0.8);
  text-align: center;
  letter-spacing: 1px;
}

.map-legend {
  display: flex;
  gap: 25px;
  flex-wrap: wrap;
  justify-content: center;
  padding: 15px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 15px;
  border: 1px solid rgba(255, 61, 40, 0.3);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.9rem;
  font-weight: 500;
}

.legend-icon {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.4);
  position: relative;
  overflow: hidden;
}

.legend-icon.green {
  background: linear-gradient(135deg, #10b981, #059669);
  box-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
}

.legend-icon.red {
  background: var(--pokemon-red);
  box-shadow: 0 0 10px var(--pokemon-red);
}

.legend-icon.grey {
  background: linear-gradient(135deg, #6b7280, #4b5563);
  box-shadow: 0 0 10px rgba(107, 114, 128, 0.5);
}

.legend-icon.fog {
  background: repeating-linear-gradient(
    45deg,
    rgba(0, 0, 0, 0.9) 0px,
    rgba(0, 0, 0, 0.9) 2px,
    rgba(255, 255, 255, 0.1) 2px,
    rgba(255, 255, 255, 0.1) 4px
  );
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.8);
}

.map-wrapper {
  flex: 1;
  position: relative;
  overflow: hidden;
  border-radius: 15px;
  margin: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.leaflet-map {
  width: 100%;
  height: 100%;
  z-index: 1;
  filter: contrast(1.1) brightness(0.9);
}

.map-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 100;
  color: var(--pokemon-white);
  border-radius: 15px;
}

.loading-spinner {
  width: 60px;
  height: 60px;
  border: 4px solid rgba(255, 61, 40, 0.3);
  border-radius: 50%;
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 20px;
  box-shadow: 0 0 20px rgba(255, 61, 40, 0.3);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.map-bg-particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.particle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.1;
  animation: float 6s ease-in-out infinite;
}

.particle-1 {
  width: 100px;
  height: 100px;
  background: radial-gradient(circle, rgba(255, 61, 40, 0.3), transparent);
  top: 20%;
  left: 10%;
  animation-delay: 0s;
}

.particle-2 {
  width: 150px;
  height: 150px;
  background: radial-gradient(circle, rgba(120, 119, 198, 0.2), transparent);
  top: 60%;
  right: 15%;
  animation-delay: 2s;
}

.particle-3 {
  width: 80px;
  height: 80px;
  background: radial-gradient(circle, rgba(245, 158, 11, 0.25), transparent);
  top: 40%;
  left: 70%;
  animation-delay: 4s;
}

.particle-4 {
  width: 120px;
  height: 120px;
  background: radial-gradient(circle, rgba(16, 185, 129, 0.2), transparent);
  top: 80%;
  left: 50%;
  animation-delay: 1s;
}

.particle-5 {
  width: 60px;
  height: 60px;
  background: radial-gradient(circle, rgba(139, 92, 246, 0.3), transparent);
  top: 30%;
  right: 40%;
  animation-delay: 3s;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
}

.map-subtitle {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.8);
  text-align: center;
  margin-bottom: 20px;
  font-style: italic;
}

.loading-dots {
  display: flex;
  gap: 5px;
  margin-top: 10px;
}

.loading-dots span {
  animation: bounce 1.4s ease-in-out infinite both;
}

.loading-dots span:nth-child(1) { animation-delay: -0.32s; }
.loading-dots span:nth-child(2) { animation-delay: -0.16s; }
.loading-dots span:nth-child(3) { animation-delay: 0s; }

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0);
  } 40% {
    transform: scale(1);
  }
}

.progress-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid rgba(255, 61, 40, 0.3);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--pokemon-red), #ff6b6b);
  border-radius: 10px;
  transition: width 0.5s ease;
  box-shadow: 0 0 10px rgba(255, 61, 40, 0.5);
}

/* Styles pour les popups de la carte */
:deep(.leaflet-popup-content-wrapper) {
  background: linear-gradient(135deg, rgba(33, 33, 33, 0.98), rgba(20, 20, 20, 0.98));
  color: var(--pokemon-white);
  border-radius: 15px;
  backdrop-filter: blur(15px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
}

:deep(.leaflet-popup-content) {
  margin: 20px;
}

:deep(.leaflet-popup-tip) {
  background: var(--pokemon-red);
  box-shadow: 0 4px 15px rgba(255, 61, 40, 0.5);
}

.map-popup h4 {
  margin: 0 0 15px 0;
  color: var(--pokemon-red);
  font-size: 1.2rem;
  font-weight: 700;
  text-shadow: 0 0 10px rgba(255, 61, 40, 0.5);
}

.map-popup p {
  margin: 8px 0;
  font-size: 0.9rem;
  line-height: 1.5;
}

.map-popup strong {
  color: var(--pokemon-red);
  text-shadow: 0 0 5px var(--pokemon-red);
}

/* Animations pour les éléments */
.legend-item {
  transition: all 0.3s ease;
}

.legend-item:hover {
  transform: translateY(-2px);
}

.legend-icon {
  transition: all 0.3s ease;
}

.legend-item:hover .legend-icon {
  transform: scale(1.2);
  box-shadow: 0 0 15px currentColor;
}

/* Styles pour les marqueurs personnalisés */
:deep(.leaflet-marker-icon) {
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.5));
  transition: all 0.3s ease;
}

:deep(.leaflet-marker-icon:hover) {
  transform: scale(1.2);
  filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.7));
}

/* Responsive */
@media (max-width: 768px) {
  .map-header {
    padding: 15px;
  }

  .map-title {
    font-size: 1.4rem;
  }

  .map-legend {
    gap: 15px;
    padding: 12px;
  }

  .legend-item {
    font-size: 0.8rem;
    gap: 8px;
  }

  .progress-info {
    flex-direction: column;
    gap: 10px;
    text-align: center;
    padding: 12px 20px;
  }

  .map-wrapper {
    margin: 10px;
  }
}
</style>
