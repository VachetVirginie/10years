<template>
  <div v-if="show" class="success-popup-overlay">
    <div class="success-popup glass-card">
      <div class="success-popup-header">
        <h2 class="success-title">{{ title }}</h2>
      </div>
      
      <div class="success-popup-content">
        <div class="success-icon">✅</div>
        <p class="success-message whitespace-pre-line">{{ message }}</p>
      </div>
      
      <div v-if="photoInstruction" class="photo-bonus-button-container">
        <v-btn
          color="var(--pokemon-blue)"
          variant="elevated"
          @click="showPhotoBonus"
          class="photo-bonus-btn glass-button"
          rounded="pill"
        >
          <v-icon start>mdi-camera</v-icon>
          Bonus photo
        </v-btn>
      </div>
      
      <div class="success-popup-footer">
        <div class="nav-buttons">
          <v-btn 
            color="var(--pokemon-gray-300)" 
            variant="outlined" 
            @click="previousStep" 
            class="nav-btn prev-btn glass-button"
            :disabled="!props.hasPreviousStep"
          >
            <v-icon start>mdi-arrow-left</v-icon>
            Précédente
          </v-btn>
          
          <v-btn 
            color="var(--pokemon-red)" 
            variant="elevated" 
            @click="nextStep" 
            class="nav-btn next-btn glass-button"
          >
            <v-icon start>mdi-arrow-right</v-icon>
            Suivante
          </v-btn>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  show: boolean;
  title: string;
  message: string;
  currentStepId: string; // ID de l'étape actuelle
  hasPreviousStep: boolean; // S'il existe une étape précédente
  photoInstruction?: string; // Instruction pour le bonus photo (optionnel)
}>();

// Debug pour vérifier la valeur de hasPreviousStep
console.log('SuccessPopup - hasPreviousStep:', props.hasPreviousStep);

const emit = defineEmits(['next', 'previous', 'close', 'photo-bonus']);

const nextStep = () => {
  emit('next');
};

const previousStep = () => {
  emit('previous');
};

const showPhotoBonus = () => {
  emit('photo-bonus');
};
</script>

<style scoped>
@import '../assets/glassmorphism.css';
/* Variables CSS pour le thème Pokémon */
:root {
  --pokemon-blue: #2196F3;
}

.success-popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  padding: 20px;
}

.success-popup {
  background: rgba(33, 33, 33, 0.7);
  border-radius: 20px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 8px 32px var(--glass-shadow-strong);
  border: 1px solid var(--glass-border-light);
  overflow: hidden;
  animation: popup-appear 0.3s ease-out;
  backdrop-filter: blur(var(--glass-blur-medium));
  -webkit-backdrop-filter: blur(var(--glass-blur-medium));
  transition: var(--glass-transition);
  position: relative;
}

.success-popup::before {
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

.success-popup-header {
  background: var(--glass-pokemon-red);
  color: white;
  padding: 18px 20px;
  text-align: center;
  border-bottom: 1px solid var(--glass-border-light);
  position: relative;
  backdrop-filter: blur(var(--glass-blur-light));
  -webkit-backdrop-filter: blur(var(--glass-blur-light));
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.success-popup-header::after {
  content: '';
  position: absolute;
  top: -10px;
  left: -10px;
  right: -10px;
  bottom: -10px;
  background: radial-gradient(circle at 30% 40%, rgba(255, 255, 255, 0.15), transparent 70%);
  pointer-events: none;
}

.success-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: bold;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  letter-spacing: 0.5px;
}

.success-popup-content {
  padding: 25px;
  text-align: center;
  position: relative;
  z-index: 1;
}

.success-icon {
  font-size: 3rem;
  margin-bottom: 15px;
  animation: bounce 1s infinite alternate ease-in-out;
}

.success-message {
  color: var(--pokemon-white);
  font-size: 1.1rem;
  margin: 0 0 15px;
  line-height: 1.5;
}

.success-popup-footer {
  padding: 15px 20px;
  display: flex;
  justify-content: center;
  border-top: 1px solid var(--glass-border-light);
  background: rgba(40, 40, 40, 0.3);
  backdrop-filter: blur(var(--glass-blur-light));
  -webkit-backdrop-filter: blur(var(--glass-blur-light));
}

.nav-buttons {
  display: flex;
  gap: 15px;
  width: 100%;
  justify-content: center;
}

.nav-btn {
  min-width: 120px;
  margin: 0 5px;
  border-radius: 30px;
  backdrop-filter: blur(var(--glass-blur-light));
  -webkit-backdrop-filter: blur(var(--glass-blur-light));
  border: 1px solid var(--glass-border-light);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  position: relative;
  overflow: hidden;
  transition: var(--glass-transition);
}

.nav-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
}

.next-btn {
  font-weight: bold;
}

.prev-btn {
  opacity: 0.8;
}

.photo-bonus-button-container {
  padding: 0 20px 15px;
  display: flex;
  justify-content: center;
}

.photo-bonus-btn {
  width: 100%;
  margin-bottom: 8px;
  background: rgba(33, 150, 243, 0.7) !important;
  color: white !important;
  font-weight: bold;
  transition: var(--glass-transition);
  border-radius: 30px;
  backdrop-filter: blur(var(--glass-blur-light)) !important;
  -webkit-backdrop-filter: blur(var(--glass-blur-light)) !important;
  border: 1px solid rgba(255, 255, 255, 0.15) !important;
  box-shadow: 0 4px 15px rgba(33, 150, 243, 0.3) !important;
  position: relative;
  overflow: hidden;
}

.photo-bonus-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(33, 150, 243, 0.5) !important;
}

.photo-bonus-btn::before {
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

.photo-bonus-btn:hover::before {
  opacity: 1;
}

@keyframes popup-appear {
  0% {
    transform: scale(0.7);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes bounce {
  0% { transform: translateY(0); }
  100% { transform: translateY(-10px); }
}

/* Styles responsifs pour mobile */
@media (max-width: 480px) {
  .success-popup {
    width: 95%;
    max-width: 350px;
  }
  
  .success-popup-footer {
    padding: 15px 10px;
  }
  
  .nav-buttons {
    flex-direction: column;
    gap: 10px;
  }
  
  .nav-btn {
    width: 100%;
    min-width: unset;
    margin: 0;
  }
  
  .success-title {
    font-size: 1.3rem;
  }
  
  .success-message {
    font-size: 1rem;
  }
}
</style>
