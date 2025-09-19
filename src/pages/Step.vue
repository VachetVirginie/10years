<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useHunt } from '../composables/useHunt'
import { useGeolocation } from '../composables/useGeolocation'
import { useProgress } from '../store/progress'
import GeoStep from '../components/GeoStep.vue'
import QrStep from '../components/QrStep.vue'
import RiddleStep from '../components/RiddleStep.vue'
import ChoiceStep from '../components/ChoiceStep.vue'
import EnigmeSplash from '../components/EnigmeSplash.vue'

// Activer le suivi de géolocalisation
const { getCurrentPosition } = useGeolocation()
getCurrentPosition()

const route = useRoute()
const router = useRouter()
const { steps } = useHunt()
const store = useProgress()
store.load()

// Gestion du splash d'énigme
const showSplash = ref(true)
const splashComplete = ref(false)

const step = computed(() => {
  const id = route.params.id as string
  return steps.find(s => s.id === id)
})

const stepNumber = computed(() => {
  if (!step.value) return 0
  return steps.findIndex(s => s.id === step.value!.id) + 1
})

const totalSteps = computed(() => steps.length)
const isCompleted = computed(() => step.value ? store.done.has(step.value.id) : false)
const progressPercentage = computed(() => Math.round((stepNumber.value / totalSteps.value) * 100))

const canGoNext = computed(() => {
  const currentIndex = stepNumber.value - 1
  return currentIndex < steps.length - 1 && isCompleted.value
})

const canGoPrevious = computed(() => {
  return stepNumber.value > 1
})

const getStepTypeIcon = (type: string) => {
  switch (type) {
    case 'geo': return '🗺️'
    case 'qr': return '📱'
    case 'riddle': return '🧩'
    case 'choice': return '🎯'
    default: return '⚡'
  }
}

const getStepTypeLabel = (type: string) => {
  switch (type) {
    case 'geo': return 'Exploration'
    case 'qr': return 'Scan QR'
    case 'riddle': return 'Énigme'
    case 'choice': return 'Choix'
    default: return 'Défi'
  }
}

function goNext() {
  if (!canGoNext.value) return
  const currentIndex = stepNumber.value - 1
  const nextStep = steps[currentIndex + 1]
  if (nextStep) {
    // Réinitialiser l'état du splash avant la navigation
    showSplash.value = true
    splashComplete.value = false
    
    // Navigation vers l'étape suivante
    router.push(`/step/${nextStep.id}`)
  }
}

function goPrevious() {
  if (!canGoPrevious.value) return
  const currentIndex = stepNumber.value - 1
  const prevStep = steps[currentIndex - 1]
  if (prevStep) {
    router.push(`/step/${prevStep.id}`)
  }
}

function resetHunt() {
  if (confirm('Êtes-vous sûr de vouloir recommencer la chasse au trésor ? Toutes les données seront supprimées.')) {
    try {
      // Réinitialiser le store en premier
      store.reset()
      
      // Forcer l'expiration de session avant suppression
      document.cookie = 'vue-session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      
      // Supprimer explicitement chaque élément du localStorage
      for (const key of Object.keys(localStorage)) {
        localStorage.removeItem(key);
      }
      
      // Assurer spécifiquement la suppression de hasSeenSplash
      localStorage.removeItem('hasSeenSplash');
      
      // Vérifier que hasSeenSplash est bien supprimé
      if (localStorage.getItem('hasSeenSplash')) {
        console.error("Impossible de supprimer hasSeenSplash!");
      }
      
      // Pour s'assurer que tout est supprimé
      localStorage.clear();
      
      // Définir explicitement les valeurs comme false
      localStorage.setItem('hasSeenSplash', 'false');
      localStorage.setItem('hasSeenIntro', 'false');
      
      
      // Message visible dans l'interface
      alert('Réinitialisation terminée. La page va être rechargée.');
      
      // Délai plus long pour voir les logs (3 secondes)
      setTimeout(() => {
        // Force une redirection complète (pas de routage interne)
        window.location.replace('/');
      }, 1000);
    } catch (error) {
      alert("Une erreur est survenue lors de la réinitialisation. Veuillez rafraîchir la page.");
    }
  }
}
</script>

<template>
  <!-- Splash d'énigme au chargement de l'étape -->
  <EnigmeSplash 
    v-if="step && showSplash && !splashComplete" 
    :step="step" 
    @complete="splashComplete = true; showSplash = false"
  />
  
  <main class="pokemon-step" v-if="step">
    <!-- En-tête de l'étape -->
    <div class="step-header pa-4">
      <div class="step-progress mb-4">
        <div class="progress-info d-flex justify-space-between align-center mb-2">
          <span class="progress-text text-caption">Étape {{ stepNumber }} sur {{ totalSteps }}</span>
          <span class="progress-percentage text-caption">{{ progressPercentage }}%</span>
        </div>
        <v-progress-linear 
          :model-value="progressPercentage" 
          color="#fbbf24" 
          bg-color="rgba(255,255,255,0.3)"
          height="8"
          rounded
        ></v-progress-linear>
      </div>
      
      <div class="step-info d-flex align-center justify-center mb-4">
        <v-card class="step-badge" elevation="6">
          <v-card-text class="text-center pa-3">
            <div class="step-icon mb-2">{{ getStepTypeIcon(step.type) }}</div>
            <div class="step-type text-subtitle2">{{ getStepTypeLabel(step.type) }}</div>
            <div class="step-status mt-1">
              <v-chip 
                :color="isCompleted ? '#10b981' : '#f59e0b'" 
                size="small" 
                variant="flat"
              >
                {{ isCompleted ? '✅ Terminé' : '🔥 En cours' }}
              </v-chip>
            </div>
          </v-card-text>
        </v-card>
      </div>
    </div>
    
    <!-- Contenu de l'étape -->
    <div class="step-content pa-4">
      <v-card class="content-card" elevation="8">
        <div class="pa-4">
          <component :is="step.type==='riddle' ? RiddleStep
                           : step.type==='qr' ? QrStep
                           : step.type==='geo' ? GeoStep
                           : ChoiceStep"
                     :step="step as any" />
        </div>
      </v-card>
    </div>
    
    <!-- Navigation -->
    <div class="step-navigation pa-4">
      <v-card class="nav-card" elevation="4">
        <v-card-text class="pa-4">
          <div class="nav-buttons d-flex flex-wrap gap-3 justify-center">
            <v-btn 
              v-if="canGoPrevious"
              @click="goPrevious"
              color="#6b7280"
              variant="outlined"
              size="large"
              class="nav-btn"
            >
              <v-icon start>mdi-arrow-left</v-icon>
              Précédent
            </v-btn>
            
            <v-btn 
              v-if="canGoNext"
              @click="goNext"
              color="#fbbf24"
              variant="elevated"
              size="large"
              class="nav-btn"
            >
              <v-icon start>mdi-arrow-right</v-icon>
              Suivant
            </v-btn>
            
            <v-btn 
              v-if="!isCompleted"
              disabled
              color="#9ca3af"
              variant="outlined"
              size="large"
              class="nav-btn"
            >
              <v-icon start>mdi-lock</v-icon>
              Terminez cette étape
            </v-btn>
            
            <v-btn 
              to="/summary" 
              color="#3b82f6"
              variant="outlined"
              size="large"
              class="nav-btn"
            >
              <v-icon start>mdi-chart-line</v-icon>
              Résumé
            </v-btn>
            
            <v-btn 
              to="/map" 
              color="#10b981"
              variant="outlined"
              size="large"
              class="nav-btn"
            >
              <v-icon start>mdi-map</v-icon>
              Carte
            </v-btn>
            
            <v-btn 
              @click="resetHunt"
              color="#ef4444"
              variant="outlined"
              size="large"
              class="nav-btn"
            >
              <v-icon start>mdi-restart</v-icon>
              Recommencer
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </div>
  </main>
</template>

<style scoped>
.pokemon-step {
  background: var(--pokemon-black);
  min-height: 100vh;
  position: relative;
  color: var(--pokemon-white);
}

.step-header {
  background: var(--pokemon-gray-100);
  border-radius: 12px;
  border: 2px solid var(--pokemon-red);
  box-shadow: 0 0 15px rgba(255, 61, 40, 0.3);
  margin-bottom: 24px;
}

.progress-text, .progress-percentage {
  color: #ffffff;
  font-weight: 600;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}

.step-badge {
  background: var(--pokemon-gray-200);
  border-radius: 12px;
  border: 2px solid var(--pokemon-red);
  transition: all 0.2s ease;
  box-shadow: 0 0 10px rgba(255, 61, 40, 0.3);
}

.step-badge:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.step-icon {
  font-size: 2rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.step-type {
  color: var(--pokemon-white);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 0.875rem;
}

.step-content {
  position: relative;
  z-index: 1;
}

.content-card {
  border-radius: 12px;
  border: 2px solid var(--pokemon-red);
  background: var(--pokemon-gray-100);
  transition: all 0.2s ease;
  box-shadow: 0 0 15px rgba(255, 61, 40, 0.3);
}

.content-card:hover {
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
}

.step-navigation {
  position: relative;
  z-index: 1;
}

.nav-card {
  background: var(--pokemon-gray-100);
  border-radius: 16px;
  border: 2px solid var(--pokemon-red);
  box-shadow: 0 0 15px rgba(255, 61, 40, 0.3);
}

.nav-buttons {
  gap: 1rem;
}

.nav-btn {
  border-radius: 8px;
  font-weight: 500;
  text-transform: none;
  letter-spacing: -0.025em;
  transition: all 0.2s ease;
  min-width: 140px;
}

.nav-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

/* Responsive design */
@media (max-width: 768px) {
  .nav-buttons {
    flex-direction: column;
    align-items: stretch;
  }
  
  .nav-btn {
    min-width: unset;
    width: 100%;
  }
}

/* Animation pour le badge d'étape */
@keyframes badgePulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.step-badge:hover .step-icon {
  animation: badgePulse 1s ease-in-out infinite;
}
</style>
