<script setup lang="ts">
import { computed, ref, provide, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useHunt } from '../composables/useHunt'
import { useGeolocation } from '../composables/useGeolocation'
import { useProgress } from '../store/progress'
import RiddleStep from '../components/RiddleStep.vue'
import ChoiceStep from '../components/ChoiceStep.vue'
import EnigmeSplash from '../components/EnigmeSplash.vue'
import MissionComplete from '../components/MissionComplete.vue'

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

// Gestion de l'écran de fin de mission
const showMissionComplete = ref(false)

// Fonction pour naviguer vers la prochaine étape avec splash
function navigateToStep(stepId: string | number) {
  // Vérifier si c'est la fin de la chasse au trésor (après l'étape 7)
  if (stepId.toString() === 'end') {
    // Afficher l'écran de fin de mission
    showMissionComplete.value = true
    return
  }
  
  // Réinitialiser l'état du splash avant la navigation
  showSplash.value = true
  splashComplete.value = false
  
  // Mettre à jour l'index courant dans le store
  const stepIndex = steps.findIndex(s => s.id === stepId.toString())
  if (stepIndex !== -1) {
    // Mise à jour du currentIndex pour que la reprise fonctionne correctement
    store.goToStep(stepIndex)
  }
  
  // Navigation vers l'étape suivante après un court délai pour permettre la mise à jour des refs
  setTimeout(() => {
    router.push(`/step/${stepId}`)
  }, 50)
}

// Exposer la fonction de navigation aux composants enfants
provide('navigateToStep', navigateToStep)

const step = computed(() => {
  const id = route.params.id as string
  return steps.find(s => s.id === id)
})

// Mettre à jour l'index courant lors du chargement d'une étape directement par URL
watch(() => step.value, (newStep: any) => {
  if (newStep) {
    const stepIndex = steps.findIndex(s => s.id === newStep.id)
    if (stepIndex !== -1) {
      store.goToStep(stepIndex)
    }
  }
}, { immediate: true })

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
    case 'riddle': return '🧩'
    case 'choice': return '🎯'
    default: return '⚡'
  }
}

const getStepTypeLabel = (type: string) => {
  switch (type) {
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
    
    // Mise à jour du currentIndex dans le store
    store.goToStep(currentIndex + 1)
    
    // Navigation vers l'étape suivante
    router.push(`/step/${nextStep.id}`)
  }
}

function goPrevious() {
  if (!canGoPrevious.value) return
  const currentIndex = stepNumber.value - 1
  const prevStep = steps[currentIndex - 1]
  if (prevStep) {
    // Mise à jour du currentIndex dans le store
    store.goToStep(currentIndex - 1)
    
    // Navigation vers l'étape précédente
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
  <!-- Écran de fin de mission -->
  <MissionComplete v-if="showMissionComplete" />
  
  <!-- Splash d'énigme au chargement de l'étape -->
  <EnigmeSplash 
    v-if="step && showSplash && !splashComplete && !showMissionComplete" 
    :step="step" 
    @complete="splashComplete = true; showSplash = false"
  />
  
  <main class="pokemon-step" v-if="step && !showMissionComplete">
    <!-- Particules d'ambiance -->
    <div class="glass-particles">
      <div class="glass-particle"></div>
      <div class="glass-particle"></div>
      <div class="glass-particle"></div>
      <div class="glass-particle"></div>
      <div class="glass-particle"></div>
    </div>
    
    <!-- En-tête de l'étape -->
    <div class="step-header pa-4 glass-card">
      <div class="step-progress mb-4">
        <div class="progress-info d-flex justify-space-between align-center mb-2">
          <span class="progress-text text-caption">Étape {{ stepNumber }} sur {{ totalSteps }}</span>
          <span class="progress-percentage text-caption">{{ progressPercentage }}%</span>
        </div>
        <div class="progress-bar glass-progress-bar">
          <div class="progress-fill glass-progress-fill" :style="{ width: progressPercentage + '%' }">
            <div class="progress-shine"></div>
          </div>
        </div>
      </div>
      
      <!-- <div class="step-info d-flex align-center justify-center mb-4">
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
      </div> -->
    </div>
    
    <!-- Contenu de l'étape -->
    <div class="step-content">
      <v-card class="content-card glass-dialog" elevation="0">
        <div class="">
          <component :is="step.type==='riddle' ? RiddleStep
                     : ChoiceStep"
                     :step="step as any"
                     @navigate="navigateToStep" />
        </div>
      </v-card>
    </div>    
  </main>
</template>

<style scoped>
@import '../assets/glassmorphism.css';
.pokemon-step {
  background: var(--pokemon-black);
  min-height: 100vh;
  position: relative;
  color: var(--pokemon-white);
  padding: 10px;
  background-image: radial-gradient(circle at center, rgba(50, 50, 50, 0.8) 0%, rgba(20, 20, 20, 0.95) 70%);
}

.step-header {
  background: rgba(33, 33, 33, 0.7);
  border-radius: 20px;
  border: 1px solid var(--glass-border-light);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  margin-bottom: 24px;
  backdrop-filter: blur(var(--glass-blur-medium));
  -webkit-backdrop-filter: blur(var(--glass-blur-medium));
  transition: var(--glass-transition);
}

.step-header:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
}

.progress-text, .progress-percentage {
  color: #ffffff;
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  letter-spacing: 0.5px;
  font-size: 0.85rem;
}

.step-badge {
  background: rgba(40, 40, 40, 0.7);
  border-radius: 16px;
  border: 1px solid var(--glass-border-light);
  transition: var(--glass-transition);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(var(--glass-blur-light));
  -webkit-backdrop-filter: blur(var(--glass-blur-light));
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
  border-radius: 20px;
  background: rgba(33, 33, 33, 0.7);
  transition: var(--glass-transition);
  box-shadow: 0 8px 32px var(--glass-shadow-strong);
  border: 1px solid var(--glass-border-light);
  backdrop-filter: blur(var(--glass-blur-medium));
  -webkit-backdrop-filter: blur(var(--glass-blur-medium));
  overflow: hidden;
  position: relative;
}

.content-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
}

.content-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0) 80%);
  pointer-events: none;
  border-radius: 20px;
}

.step-navigation {
  position: relative;
  z-index: 1;
}

.nav-card {
  background: rgba(33, 33, 33, 0.7);
  border-radius: 20px;
  border: 1px solid var(--glass-border-light);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(var(--glass-blur-medium));
  -webkit-backdrop-filter: blur(var(--glass-blur-medium));
  transition: var(--glass-transition);
}

.nav-buttons {
  gap: 1rem;
}

.nav-btn {
  border-radius: 30px;
  font-weight: 500;
  text-transform: none;
  letter-spacing: 0.5px;
  transition: var(--glass-transition);
  min-width: 140px;
  background: var(--glass-bg-medium);
  backdrop-filter: blur(var(--glass-blur-light));
  -webkit-backdrop-filter: blur(var(--glass-blur-light));
  border: 1px solid var(--glass-border-light);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  position: relative;
  overflow: hidden;
}

.nav-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.25);
}

.nav-btn::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 70%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.nav-btn:hover::before {
  opacity: 1;
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

/* Animations */
@keyframes badgePulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

@keyframes shine {
  0% { left: -100%; }
  100% { left: 100%; }
}

.step-badge:hover .step-icon {
  animation: badgePulse 1s ease-in-out infinite;
}

/* Ajout des styles pour la barre de progression */
.progress-bar {
  height: 10px;
  background-color: rgba(30, 30, 30, 0.6);
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid var(--glass-border-light);
  position: relative;
  margin-bottom: 5px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(to right, rgba(255, 165, 0, 0.8), rgba(255, 200, 0, 0.8));
  border-radius: 20px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 0 10px rgba(255, 165, 0, 0.5);
}

.progress-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    to right,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.6) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  animation: shine 2s infinite;
}
</style>
