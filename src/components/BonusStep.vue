<script setup lang="ts">
import { ref, inject, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useProgress } from '../store/progress'
import '../assets/quest-components.css'
import SuccessPopup from './SuccessPopup.vue'
import PhotoBonus from './PhotoBonus.vue'

const props = defineProps<{ step: { id:string; prompt:string; bonusType:string; targetColor?:string; targetTheme?:string; targetElement?:string; targetMemory?:string; targetAction?:string; targetConcept?:string; success?:string; hint?:string; photo?:string }, steps?: any[], id?: string }>()
const emit = defineEmits(['navigate'])

const router = useRouter()
const store = useProgress()
store.load()

// État du composant
const showSuccessPopup = ref(false)
const showPhotoBonus = ref(false)

// Récupérer la fonction de navigation du parent
const navigateToStep = inject('navigateToStep', (stepId: string | number) => {
  // Fallback si l'injection n'est pas disponible
  console.warn('navigateToStep not provided by parent')
  router.push(`/step/${stepId}`)
})

// Obtenir le type de défi bonus et ses paramètres
const bonusType = computed(() => props.step.bonusType || 'photo_challenge')
const targetColor = computed(() => props.step.targetColor)
const targetTheme = computed(() => props.step.targetTheme)
const targetElement = computed(() => props.step.targetElement)
const targetMemory = computed(() => props.step.targetMemory)
const targetAction = computed(() => props.step.targetAction)
const targetConcept = computed(() => props.step.targetConcept)

// Obtenir l'icône et le titre selon le type de bonus
const getBonusIcon = (type: string) => {
  switch (type) {
    case 'photo_challenge': return '📸'
    case 'creative_challenge': return '🎨'
    case 'nature_challenge': return '🌱'
    case 'memory_challenge': return '💭'
    case 'movement_challenge': return '🏃‍♀️'
    case 'balance_challenge': return '⚖️'
    default: return '🎯'
  }
}

const getBonusTitle = (type: string) => {
  switch (type) {
    case 'photo_challenge': return 'Défi Photo'
    case 'creative_challenge': return 'Défi Créatif'
    case 'nature_challenge': return 'Défi Nature'
    case 'memory_challenge': return 'Défi Mémoire'
    case 'movement_challenge': return 'Défi Mouvement'
    case 'balance_challenge': return 'Défi Équilibre'
    default: return 'Défi Bonus'
  }
}

// Obtenir les instructions spécifiques selon le type de défi
const getChallengeInstructions = (type: string) => {
  switch (type) {
    case 'photo_challenge':
      return `Trouve quelque chose de ${targetColor.value} autour de toi et prends-le en photo !`
    case 'creative_challenge':
      return `Crée ou représente "${targetTheme.value}" avec ce que tu as sous la main !`
    case 'nature_challenge':
      return `Observe et photographie quelque chose de ${targetElement.value} dans la nature !`
    case 'memory_challenge':
      return `Trouve quelque chose qui évoque "${targetMemory.value}" avec ton/ta partenaire !`
    case 'movement_challenge':
      return `Bouge ton corps pour représenter "${targetAction.value}" et capture ce mouvement !`
    case 'balance_challenge':
      return `Trouve quelque chose qui symbolise "${targetConcept.value}" et photographie-le !`
    default:
      return 'Accomplis ce défi bonus !'
  }
}

// Marquer l'étape bonus comme terminée et passer à l'étape suivante
function completeBonus() {
  console.log('Marquage de l\'étape bonus comme terminée:', props.step.id)

  // Marquer l'étape bonus comme terminée
  store.markDone(props.step.id)

  console.log('Étape bonus marquée comme terminée. Store actuel:', {
    done: Array.from(store.done),
    currentIndex: store.currentIndex
  })

  // Afficher le popup de succès
  showSuccessPopup.value = true
}

// Fonction pour passer à l'étape suivante après le succès
function goToNextStep() {
  // Fermer la pop-in avant de naviguer
  showSuccessPopup.value = false

  // Petit délai avant la navigation pour permettre à la transition de se terminer
  setTimeout(() => {
    const currentId = props.step.id
    // Extraire le numéro de l'étape (0, 1, 2, etc.) et passer à l'étape suivante
    const stepNumber = parseInt(currentId.replace('b', ''))
    const nextStepId = (stepNumber + 1).toString()

    emit('navigate', nextStepId)
  }, 300)
}

// Fonction pour afficher le bonus photo (optionnel)
function displayPhotoBonus() {
  showSuccessPopup.value = false
  showPhotoBonus.value = true
}

// Fonction appelée lorsque le bonus photo est terminé
function onPhotoCompleted() {
  showPhotoBonus.value = false
  goToNextStep()
}

// Fonction appelée lorsque le bonus photo est ignoré
function onPhotoSkipped() {
  showPhotoBonus.value = false
  goToNextStep()
}

// Réinitialiser les données au montage du composant
onMounted(() => {
  // L'étape bonus est déjà considérée comme "en cours" puisqu'elle vient d'être atteinte
})
</script>

<template>
  <section aria-labelledby="bonus-title" class="bonus-container">
    <div class="quest-header">
      <div class="bonus-icon">{{ getBonusIcon(bonusType) }}</div>
      <h2 class="quest-title">{{ getBonusTitle(bonusType) }}</h2>
      <div class="bonus-icon">{{ getBonusIcon(bonusType) }}</div>
    </div>

    <div class="bonus-content">
      <div class="bonus-prompt">
        <h3 id="bonus-title" class="mb-4 text-pokemon-white whitespace-pre-line">{{ props.step.prompt }}</h3>
      </div>

      <div class="challenge-card glass-card">
        <div class="challenge-header">
          <div class="challenge-icon">{{ getBonusIcon(bonusType) }}</div>
          <h4 class="challenge-title">{{ getChallengeInstructions(bonusType) }}</h4>
        </div>

        <div class="challenge-details">
          <div class="challenge-tip">
            <div class="tip-icon">💡</div>
            <p class="tip-text">
              Prends ton temps pour trouver le bon élément ou réaliser le défi.
              Cette activité est conçue pour t'aider à interagir avec ton environnement !
            </p>
          </div>
        </div>

        <div class="challenge-actions">
          <v-btn
            @click="completeBonus"
            class="quest-button glass-button"
            rounded="pill"
            elevation="0"
            min-width="160"
            color="var(--pokemon-red)"
          >
            <v-icon start>mdi-check</v-icon>
            J'ai terminé le défi !
          </v-btn>

          <v-btn
            variant="outlined"
            color="var(--pokemon-gray-300)"
            class="skip-button"
            size="small"
            @click="goToNextStep"
          >
            Passer ce défi
          </v-btn>
        </div>
      </div>

      <!-- Pop-in de succès -->
      <SuccessPopup
        :show="showSuccessPopup"
        title="Défi Bonus Réussi !"
        :message="props.step.success || 'Bravo ! Tu as relevé ce défi avec brio. Continuons l\'aventure !'"
        :current-step-id="props.step.id"
        :hasPreviousStep="true"
        :photoInstruction="props.step.photo"
        @next="goToNextStep"
        @previous="goToNextStep"
        @photo-bonus="displayPhotoBonus"
      />

      <!-- Bonus photo (optionnel) -->
      <PhotoBonus
        :show="showPhotoBonus"
        :photoInstruction="props.step.photo || 'Prenez une photo souvenir de ce défi bonus !'"
        @confirm="onPhotoCompleted"
        @skip="onPhotoSkipped"
      />
    </div>
  </section>
</template>

<style scoped>
@import '../assets/glassmorphism.css';

.bonus-container {
  max-width: 600px;
  margin: 0 auto;
}

.bonus-content {
  background: rgba(33, 33, 33, 0.7);
  border-radius: 20px;
  margin-top: 20px;
  box-shadow: 0 8px 32px var(--glass-shadow-strong);
  border: 1px solid var(--glass-border-light);
  backdrop-filter: blur(var(--glass-blur-medium));
  -webkit-backdrop-filter: blur(var(--glass-blur-medium));
  position: relative;
  transition: var(--glass-transition);
}

.bonus-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0) 80%);
  border-radius: 20px;
  pointer-events: none;
}

.bonus-prompt {
  margin-bottom: 25px;
  background: rgba(50, 50, 50, 0.6);
  border-radius: 16px;
  padding: 20px;
  border: 1px solid var(--glass-border-light);
  backdrop-filter: blur(var(--glass-blur-light));
  -webkit-backdrop-filter: blur(var(--glass-blur-light));
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  position: relative;
  overflow: hidden;
}

.bonus-prompt h3 {
  color: var(--pokemon-white);
  margin: 0;
  font-size: 1.1rem;
  line-height: 1.5;
}

.challenge-card {
  background: rgba(40, 40, 40, 0.8);
  border-radius: 16px;
  padding: 20px;
  border: 1px solid var(--glass-border-light);
  backdrop-filter: blur(var(--glass-blur-light));
  -webkit-backdrop-filter: blur(var(--glass-blur-light));
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  position: relative;
  overflow: hidden;
}

.challenge-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
}

.challenge-icon {
  font-size: 2rem;
  background: rgba(255, 61, 40, 0.2);
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--pokemon-red);
}

.challenge-title {
  color: var(--pokemon-white);
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  flex: 1;
}

.challenge-details {
  margin-bottom: 25px;
}

.challenge-tip {
  background: rgba(50, 50, 50, 0.6);
  border-radius: 12px;
  padding: 15px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  border: 1px solid var(--glass-border-light);
}

.tip-icon {
  font-size: 1.2rem;
  color: var(--pokemon-red);
  flex-shrink: 0;
}

.tip-text {
  margin: 0;
  color: var(--pokemon-white);
  font-size: 0.95rem;
  line-height: 1.4;
}

.challenge-actions {
  display: flex;
  flex-direction: column;
  gap: 15px;
  align-items: center;
}

.quest-button {
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.skip-button {
  font-size: 0.85rem;
}

/* Animations */
@keyframes bonusPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.challenge-icon {
  animation: bonusPulse 2s infinite ease-in-out;
}

/* Responsive */
@media (max-width: 600px) {
  .bonus-prompt {
    padding: 15px;
  }

  .challenge-card {
    padding: 15px;
  }

  .challenge-header {
    flex-direction: column;
    text-align: center;
    gap: 10px;
  }

  .challenge-title {
    font-size: 1rem;
  }

  .challenge-actions {
    gap: 12px;
  }
}
</style>
