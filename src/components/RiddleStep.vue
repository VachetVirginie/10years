<script setup lang="ts">
import { ref } from 'vue'
import { useProgress } from '../store/progress'
import '../assets/quest-components.css'

const props = defineProps<{ step: { id:string; prompt:string; answer:string; success?:string; hint?:string } }>()

const answer = ref('')
const feedback = ref('')
const showHint = ref(false)
const isFeedbackSuccess = ref(false)
const store = useProgress()
store.load()

function check() {
  const ok = answer.value.trim().toLowerCase() === props.step.answer.toLowerCase()
  feedback.value = ok ? (props.step.success ?? 'Correct !') : 'Mauvaise réponse.'
  isFeedbackSuccess.value = ok
  if (ok) store.markDone(props.step.id)
}
</script>

<template>
  <section aria-labelledby="riddle-title" class="riddle-container">
    <div class="quest-header">
      <img src="https://archives.bulbagarden.net/media/upload/7/79/Dream_Pok%C3%A9_Ball_Sprite.png" alt="Poké Ball" class="pokeball-icon animate-float" />
      <h2 class="quest-title">Énigme Pokémon</h2>
      <img src="https://archives.bulbagarden.net/media/upload/7/79/Dream_Pok%C3%A9_Ball_Sprite.png" alt="Poké Ball" class="pokeball-icon animate-float" />
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
</style>
