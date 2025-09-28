<script setup lang="ts">
import { ref, inject, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProgress } from '../store/progress'
import '../assets/quest-components.css'
import pokeballImg from '../assets/images/pokemon/pokeball.svg'
import SuccessPopup from './SuccessPopup.vue'
import PhotoBonus from './PhotoBonus.vue'

const props = defineProps<{ step: { id:string; prompt:string; answer:string; success?:string; hint?:string; photo?:string } }>()
const emit = defineEmits(['navigate'])

const answer = ref('')
const feedback = ref('')
const showHint = ref(false)
const isFeedbackSuccess = ref(false)
const showSuccessPopup = ref(false)
const showPhotoBonus = ref(false)
const router = useRouter()
const store = useProgress()
store.load()

// Déterminer si l'étape actuelle a une étape précédente
const hasPreviousStep = Number(props.step.id) > 1

// Réinitialiser les données chaque fois que l'étape change
function resetStepData() {
  answer.value = ''
  feedback.value = ''
  showHint.value = false
  isFeedbackSuccess.value = false
  showSuccessPopup.value = false
  showPhotoBonus.value = false
}

// Réinitialiser les données au montage du composant
onMounted(() => {
  resetStepData()
})

// Surveiller les changements d'étape et réinitialiser les données
watch(() => props.step.id, (newId, oldId) => {
  if (newId !== oldId) {
    resetStepData()
  }
})

// Récupérer la fonction de navigation du parent
const navigateToStep = inject('navigateToStep', (stepId: string | number) => {
  // Fallback si l'injection n'est pas disponible
  console.warn('navigateToStep not provided by parent')
  router.push(`/step/${stepId}`)
})

// Fonctions pour normaliser les textes et rendre la validation permissive
function normalizeText(text: string): string {
  // Conversion en minuscules
  let normalized = text.toLowerCase();
  
  // Suppression des accents
  normalized = normalized.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  
  // Suppression des caractères spéciaux et de ponctuation
  normalized = normalized.replace(/[^a-z0-9]/g, '');
  
  return normalized;
}

function calculateSimilarity(str1: string, str2: string): number {
  // Algorithme de distance de Levenshtein simplifié
  const s1 = normalizeText(str1);
  const s2 = normalizeText(str2);
  
  // Si les chaînes normalisées sont identiques, c'est un match parfait
  if (s1 === s2) return 1.0;
  
  // Si l'une est contenue dans l'autre, c'est probablement une réponse valide
  if (s1.includes(s2) || s2.includes(s1)) return 0.9;
  
  // Si la longueur est très différente, c'est probablement incorrect
  if (Math.abs(s1.length - s2.length) > 3) return 0.0;
  
  // Compteur de caractères identiques
  let matches = 0;
  for (let i = 0; i < s1.length; i++) {
    if (s2.includes(s1[i])) matches++;
  }
  
  // Calcul du ratio de similarité
  return matches / Math.max(s1.length, s2.length);
}

// Fonction pour vérifier la réponse
function check() {
  // Vérifier d'abord si une réponse a été saisie
  if (!answer.value || answer.value.trim() === '') {
    isFeedbackSuccess.value = false
    feedback.value = 'Tu dois saisir une réponse.'
    return
  }
  
  // Validation directe en cas d'égalité exacte (insensible à la casse)
  const exactMatch = answer.value.trim().toLowerCase() === props.step.answer.toLowerCase();
  
  // Validation permissive basée sur la similarité
  const similarity = calculateSimilarity(answer.value.trim(), props.step.answer);
  const similarityThreshold = 0.7; // 70% de similarité est considéré comme correct
  
  // Log pour débogage (peut être retiré en production)
  console.log(`Réponse: ${answer.value}, Attendue: ${props.step.answer}, Similarité: ${similarity}`);
  
  // La réponse est correcte si exacte ou suffisamment similaire
  const ok = exactMatch || similarity >= similarityThreshold;
  
  if (ok) {
    // Si la réponse est correcte
    isFeedbackSuccess.value = true
    feedback.value = props.step.success ?? 'Bravo ! Tu as trouvé la bonne réponse !'
    store.markDone(props.step.id)
    
    // Afficher le pop-in de succès
    showSuccessPopup.value = true
  } else {
    // Si la réponse est incorrecte
    isFeedbackSuccess.value = false
    feedback.value = 'Mauvaise réponse. Essaie encore.'
  }
}

// Fonction pour passer à l'étape suivante
function goToNextStep() {
  // Fermer la pop-in avant de naviguer
  showSuccessPopup.value = false
  
  // Réinitialiser le champ de réponse et le feedback
  answer.value = ''
  feedback.value = ''
  isFeedbackSuccess.value = false
  
  // Petit délai avant la navigation pour permettre à la transition de se terminer
  setTimeout(() => {
    const currentId = Number(props.step.id)
    
    // Vérifier si c'est la dernière étape (id=7) pour afficher l'écran de fin
    if (currentId === 7) {
      // Naviguer vers l'écran de fin de mission
      emit('navigate', 'end')
    } else {
      // Sinon passer à l'étape suivante normalement
      const nextId = currentId + 1
      emit('navigate', nextId)
    }
  }, 300)
}

// Fonction pour afficher le bonus photo
function displayPhotoBonus() {
  showSuccessPopup.value = false
  showPhotoBonus.value = true
}

// Fonction appelée lorsque le bonus photo est terminé
function onPhotoCompleted() {
  showPhotoBonus.value = false
  // Si l'utilisateur a pris une photo, on pourrait la sauvegarder ici
  // Puis on continue vers l'étape suivante
  goToNextStep()
}

// Fonction appelée lorsque le bonus photo est ignoré
function onPhotoSkipped() {
  showPhotoBonus.value = false
  goToNextStep()
}

// Fonction pour revenir à l'étape précédente
function goToPreviousStep() {
  // Fermer la pop-in avant de naviguer
  showSuccessPopup.value = false
  
  // Réinitialiser le champ de réponse et le feedback
  answer.value = ''
  feedback.value = ''
  isFeedbackSuccess.value = false
  
  // Petit délai avant la navigation pour permettre à la transition de se terminer
  setTimeout(() => {
    const currentId = Number(props.step.id)
    if (currentId > 1) {
      const prevId = currentId - 1
      
      // Utiliser la fonction injectée pour naviguer avec le splash
      emit('navigate', prevId)
    }
  }, 300)
}
</script>

<template>
  <section aria-labelledby="riddle-title" class="riddle-container">
    <div class="quest-header">
      <img :src="pokeballImg" alt="Poké Ball" class="pokeball-icon animate-float" />
      <h2 class="quest-title">Énigme Pokémon</h2>
      <img :src="pokeballImg" alt="Poké Ball" class="pokeball-icon animate-float" />
    </div>

    <div class="riddle-content">
      <div class="riddle-prompt">
        <h3 id="riddle-title" class="mb-4 text-pokemon-white whitespace-pre-line">{{ props.step.prompt }}</h3>
      </div>
      
      <div class="riddle-input">
        <v-text-field
          v-model="answer"
          label="Ta réponse"
          variant="outlined"
          color="var(--pokemon-red)"
          bg-color="var(--pokemon-gray-200)"
          class="pokemon-input"
          :error-messages="feedback && !isFeedbackSuccess ? feedback : ''"
          :success="isFeedbackSuccess"
          :success-messages="isFeedbackSuccess ? feedback : ''"
          @keyup.enter="check"
          aria-describedby="hint"
          persistent-placeholder
        >
          <!-- <template v-slot:prepend-inner>
            <v-icon color="var(--pokemon-red)">mdi-head-question</v-icon>
          </template> -->
        </v-text-field>
      </div>
      
      <div class="riddle-actions">
        <v-btn 
          @click="check"
          class="quest-button glass-button"
          rounded="pill"
          elevation="0"
          min-width="120"
        >
          <v-icon start>mdi-check</v-icon>
          Valider
        </v-btn>
        
        <v-btn 
          v-if="props.step.hint" 
          :aria-controls="'hint'"
          @click="showHint = !showHint"
          variant="outlined"
          color="var(--pokemon-gray-300)"
          class="hint-button"
          size="small"
        >
          {{ showHint ? 'Cacher l\'indice' : 'Voir l\'indice' }}
        </v-btn>
      </div>
      
      <div v-if="showHint && props.step.hint" class="hint-box">
        <div class="hint-icon">💡</div>
        <p id="hint" class="hint-text">{{ props.step.hint }}</p>
      </div>
      
      <!-- Pop-in de succès -->
      <SuccessPopup 
        :show="showSuccessPopup"
        title="Bravo !"
        :message="feedback"
        :current-step-id="props.step.id"
        :hasPreviousStep="hasPreviousStep"
        :photoInstruction="props.step.photo"
        @next="goToNextStep"
        @previous="goToPreviousStep"
        @photo-bonus="displayPhotoBonus"
      />
      
      <!-- Bonus photo -->
      <PhotoBonus
        :show="showPhotoBonus"
        :photoInstruction="props.step.photo || 'Prenez une photo souvenir de cette étape !'"
        @confirm="onPhotoCompleted"
        @skip="onPhotoSkipped"
      />
      
      <!-- Pas besoin du feedback séparé puisqu'il est intégré au champ texte -->
    </div>
  </section>
</template>

<style scoped>
@import '../assets/glassmorphism.css';
.riddle-container {
  max-width: 600px;
  margin: 0 auto;
}

.riddle-content {
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

.riddle-content::before {
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

.riddle-prompt {
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

.riddle-prompt::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  animation: shine 5s infinite;
}

.riddle-prompt h3 {
  color: var(--pokemon-white);
  margin: 0;
  font-size: 1.2rem;
  line-height: 1.5;
}

.riddle-input {
  margin-bottom: 20px;
  margin-top: 20px;
}

.pokemon-input {
  background-color: rgba(50, 50, 50, 0.6);
  border-radius: 16px;
  overflow: hidden;
  padding-top: 4px;
  border: 1px solid var(--glass-border-light);
  backdrop-filter: blur(var(--glass-blur-light));
  -webkit-backdrop-filter: blur(var(--glass-blur-light));
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  transition: var(--glass-transition);
}

.pokemon-input:focus-within {
  box-shadow: 0 6px 20px rgba(255, 61, 40, 0.3);
  transform: translateY(-2px);
}

.pokemon-input :deep(.v-field__outline) {
  color: var(--pokemon-red) !important;
}

.pokemon-input :deep(.v-field__input) {
  color: var(--pokemon-white);
  font-weight: 500;
}

.pokemon-input :deep(.v-label) {
  color: var(--pokemon-gray-800);
}

.riddle-actions {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.hint-button {
  font-size: 0.85rem;
}

.hint-box {
  background: rgba(50, 50, 50, 0.6);
  border-radius: 16px;
  padding: 15px 18px;
  margin: 18px 0;
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid var(--glass-border-light);
  backdrop-filter: blur(var(--glass-blur-light));
  -webkit-backdrop-filter: blur(var(--glass-blur-light));
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  position: relative;
  overflow: hidden;
}

.hint-box::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.hint-box:hover::after {
  opacity: 1;
}

.hint-icon {
  font-size: 1.2rem;
  color: var(--pokemon-red);
}

.hint-text {
  margin: 0;
  font-size: 0.95rem;
  color: var(--pokemon-white);
  font-style: italic;
}

.feedback-container {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 18px;
  padding: 15px 18px;
  border-radius: 16px;
  transition: var(--glass-transition);
}

.success-feedback {
  background: rgba(76, 175, 80, 0.2);
  border: 1px solid rgba(76, 175, 80, 0.4);
  backdrop-filter: blur(var(--glass-blur-light));
  -webkit-backdrop-filter: blur(var(--glass-blur-light));
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.15);
}

.error-feedback {
  background: rgba(244, 67, 54, 0.2);
  border: 1px solid rgba(244, 67, 54, 0.4);
  backdrop-filter: blur(var(--glass-blur-light));
  -webkit-backdrop-filter: blur(var(--glass-blur-light));
  box-shadow: 0 4px 15px rgba(244, 67, 54, 0.15);
}

.feedback-icon {
  font-size: 1.5rem;
}

.feedback-text {
  margin: 0;
  font-size: 1rem;
  color: var(--pokemon-white);
}

/* Animation de réussite */
.success-animation-container {
  height: 180px;
  margin: 20px 0;
  position: relative;
  overflow: hidden;
  background: var(--pokemon-gray-100);
  border-radius: 12px;
}

.pokemon-animation-area {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.pokemon-animation-area::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><path fill="%23E3350D10" d="M30,50 C30,40 40,30 50,30 C60,30 70,40 70,50 C70,60 60,70 50,70 C40,70 30,60 30,50 Z M50,47 C51.7,47 53,48.3 53,50 C53,51.7 51.7,53 50,53 C48.3,53 47,51.7 47,50 C47,48.3 48.3,47 50,47 Z"></path></svg>');
  background-size: 100px 100px;
  opacity: 0.15;
  z-index: 0;
}

.pokemon-appear {
  max-height: 140px;
  position: relative;
  z-index: 1;
  animation: bounce 2s infinite alternate ease-in-out;
  filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.5));
}

.animation-complete .pokemon-appear {
  animation: captured 1.5s forwards;
}

.pokeball-animation {
  position: absolute;
  z-index: 2;
}

.throwing-pokeball {
  width: 60px;
  height: 60px;
  position: absolute;
  top: 150px;
  left: calc(50% - 30px);
  animation: throwBall 2s forwards;
  z-index: 2;
}

.catch-complete {
  animation: catchShake 1s ease-in-out;
}

/* Animations */
@keyframes bounce {
  0% { transform: translateY(0) scale(1); }
  100% { transform: translateY(-10px) scale(1.05); }
}

@keyframes captured {
  0% { transform: translateY(0) scale(1); opacity: 1; }
  30% { transform: translateY(0) scale(0.8); opacity: 0.8; }
  60% { transform: translateY(-5px) scale(0.6); opacity: 0.6; }
  100% { transform: translateY(-10px) scale(0); opacity: 0; }
}

@keyframes throwBall {
  0% { transform: translateY(100px) scale(1); }
  50% { transform: translateY(-40px) scale(1.2); }
  80% { transform: translateY(-15px) scale(0.8); }
  100% { transform: translateY(0) scale(1); }
}

@keyframes catchShake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-5px); }
  40%, 80% { transform: translateX(5px); }
}
</style>
