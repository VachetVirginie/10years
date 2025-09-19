<script setup lang="ts">
import { ref } from 'vue'
import { useProgress } from '../store/progress'
import '../assets/quest-components.css'
import pokeballImg from '../assets/images/pokemon/pokeball.svg'
// Import d'une image Pokémon pour l'animation
import charizardImg from '../assets/images/pokemon/charizard.svg'

const props = defineProps<{ step: { id:string; prompt:string; answer:string; success?:string; hint?:string } }>()

const answer = ref('')
const feedback = ref('')
const showHint = ref(false)
const isFeedbackSuccess = ref(false)
const showSuccessAnimation = ref(false)
const animationStep = ref(0) // 0: rien, 1: Pokémon apparaît, 2: Pokémon capturé
const showPokeball = ref(false)
const animationComplete = ref(false)
const store = useProgress()
store.load()

// Fonction pour vérifier la réponse
function check() {
  const ok = answer.value.trim().toLowerCase() === props.step.answer.toLowerCase()
  
  if (ok) {
    // Si la réponse est correcte, démarrer l'animation
    isFeedbackSuccess.value = true
    showSuccessAnimation.value = true
    animationStep.value = 1
    feedback.value = 'Un Pokémon sauvage apparaît!'
    
    // Après un délai, afficher la Poké Ball
    setTimeout(() => {
      showPokeball.value = true
      animationStep.value = 2
      
      // Après un autre délai, afficher le message de succès
      setTimeout(() => {
        animationStep.value = 3
        animationComplete.value = true
        feedback.value = props.step.success ?? 'Bravo ! Tu as trouvé la bonne réponse !'
        store.markDone(props.step.id)
      }, 2000)
    }, 1500)
  } else {
    // Si la réponse est incorrecte
    isFeedbackSuccess.value = false
    feedback.value = 'Mauvaise réponse. Essaie encore.'
  }
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
        <h3 id="riddle-title" class="mb-4 text-pokemon-white">{{ props.step.prompt }}</h3>
      </div>
      
      <div class="riddle-input">
        <v-text-field
          v-model="answer"
          label="Votre réponse"
          variant="outlined"
          color="var(--pokemon-red)"
          bg-color="var(--pokemon-gray-200)"
          class="pokemon-input"
          hide-details="auto"
          @keyup.enter="check"
          aria-describedby="hint"
          persistent-placeholder
        >
          <template v-slot:prepend-inner>
            <v-icon color="var(--pokemon-red)">mdi-head-question</v-icon>
          </template>
        </v-text-field>
      </div>
      
      <div class="riddle-actions">
        <v-btn 
          color="var(--pokemon-red)" 
          @click="check"
          class="quest-button"
          rounded="pill"
          elevation="3"
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
      
      <!-- Animation de succès avec Pokémon -->
      <div v-if="showSuccessAnimation" class="success-animation-container">
        <div class="pokemon-animation-area" :class="{'animation-complete': animationComplete}">
          <img v-if="animationStep >= 1" :src="charizardImg" alt="Pokémon apparu" class="pokemon-appear" />
          
          <!-- Animation de Poké Ball -->
          <div v-if="showPokeball" class="pokeball-animation">
            <img 
              :src="pokeballImg" 
              alt="Poké Ball Animation" 
              class="throwing-pokeball" 
              :class="{ 'catch-complete': animationComplete }" 
            />
          </div>
        </div>
      </div>
      
      <!-- Feedback text -->
      <div v-if="feedback" class="feedback-container" :class="{ 'success-feedback': isFeedbackSuccess, 'error-feedback': !isFeedbackSuccess }">
        <v-icon :color="isFeedbackSuccess ? 'success' : 'error'" class="feedback-icon">
          {{ isFeedbackSuccess ? 'mdi-check-circle' : 'mdi-alert-circle' }}
        </v-icon>
        <p aria-live="polite" class="feedback-text">{{ feedback }}</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.riddle-container {
  max-width: 600px;
  margin: 0 auto;
}

.riddle-content {
  background: var(--pokemon-gray-100);
  border: 2px solid var(--pokemon-red);
  border-radius: 12px;
  padding: 20px;
  margin-top: 20px;
  box-shadow: 0 0 15px rgba(255, 61, 40, 0.3);
}

.riddle-prompt {
  margin-bottom: 20px;
  background: var(--pokemon-gray-200);
  border-radius: 8px;
  padding: 15px;
  border-left: 4px solid var(--pokemon-red);
}

.riddle-prompt h3 {
  color: var(--pokemon-white);
  margin: 0;
  font-size: 1.2rem;
  line-height: 1.5;
}

.riddle-input {
  margin-bottom: 20px;
}

.pokemon-input {
  background-color: var(--pokemon-gray-200);
  border-radius: 8px;
  overflow: hidden;
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
  background: var(--pokemon-gray-200);
  border: 1px solid var(--pokemon-red);
  border-radius: 10px;
  padding: 12px 15px;
  margin: 15px 0;
  display: flex;
  align-items: center;
  gap: 10px;
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
  margin-top: 15px;
  padding: 10px 15px;
  border-radius: 8px;
}

.success-feedback {
  background: rgba(76, 175, 80, 0.2);
  border: 1px solid #4CAF50;
}

.error-feedback {
  background: rgba(244, 67, 54, 0.2);
  border: 1px solid #F44336;
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
  border: 2px solid var(--pokemon-red);
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
