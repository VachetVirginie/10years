<template>
  <div v-if="show" class="success-popup-overlay blur-bg">
    <div class="success-popup glass-dark depth-shadow animated-border">
      <!-- Background decoration with particles effect -->
      <div class="popup-background-decoration"></div>
      
      <div class="success-popup-header">
        <h2 class="success-title">{{ title }}</h2>
        <div class="glass-separator"></div>
      </div>
      
      <div class="success-popup-content glass-card">
        <div class="success-icon floating">✅</div>
        <p class="success-message whitespace-pre-line">{{ message }}</p>
      </div>
      
      <div v-if="photoInstruction" class="photo-bonus-button-container">
        <v-btn
          color="var(--pokemon-blue)"
          variant="elevated"
          @click="showPhotoBonus"
          class="photo-bonus-btn glass-btn hover-lift click-feedback touch-target"
          rounded="pill"
        >
          <v-icon start class="pulsing-icon">mdi-camera</v-icon>
          Bonus photo
        </v-btn>
      </div>
      
      <div class="success-popup-footer">
        <div class="glass-separator"></div>
        <div class="nav-buttons">
          <v-btn 
            color="var(--pokemon-gray-300)" 
            variant="outlined" 
            @click="previousStep" 
            class="nav-btn prev-btn hover-lift click-feedback touch-target"
            :disabled="!props.hasPreviousStep"
          >
            <v-icon start>mdi-arrow-left</v-icon>
            Précédente
          </v-btn>
          
          <v-btn 
            color="var(--pokemon-red)" 
            variant="elevated" 
            @click="nextStep" 
            class="nav-btn next-btn glass-btn-primary hover-lift click-feedback touch-target"
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
  z-index: var(--z-modal);
  padding: 20px;
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
}

/* Background decoration with particles effect */
.popup-background-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: radial-gradient(circle at 20% 80%, rgba(255, 61, 40, 0.1) 0%, transparent 50%),
                    radial-gradient(circle at 80% 20%, rgba(255, 215, 0, 0.1) 0%, transparent 50%);
  z-index: 0;
  pointer-events: none;
}

.success-popup {
  background: linear-gradient(135deg, rgba(20, 20, 20, 0.7), rgba(40, 40, 40, 0.7));
  border-radius: var(--border-radius-xl);
  width: 90%;
  max-width: 450px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
  animation: popup-appear 0.5s var(--transition-bounce);
  position: relative;
  box-shadow: var(--shadow-xl), 0 0 20px rgba(255, 61, 40, 0.2);
}

.success-popup-header {
  background: var(--gradient-primary);
  color: white;
  padding: 20px;
  text-align: center;
  position: relative;
  overflow: hidden;
}

/* Header shine effect */
.success-popup-header:after {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transform: rotate(30deg);
  animation: header-shine 3s infinite linear;
}

.success-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  letter-spacing: -0.01em;
  position: relative;
  z-index: 1;
}

.success-popup-content {
  padding: 25px;
  text-align: center;
  margin: 20px;
  border-radius: var(--border-radius-lg);
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  box-shadow: var(--shadow-md);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.success-icon {
  font-size: 3.5rem;
  margin-bottom: 20px;
  filter: drop-shadow(0 0 10px rgba(76, 175, 80, 0.5));
}

.success-message {
  color: var(--pokemon-white);
  font-size: 1.1rem;
  margin: 0 0 15px;
  line-height: 1.6;
}

.success-popup-footer {
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.nav-buttons {
  display: flex;
  gap: 15px;
  width: 100%;
  justify-content: center;
  margin-top: 15px;
}

.nav-btn {
  min-width: 140px;
  margin: 0 5px;
  padding: 12px 20px;
}

.next-btn {
  font-weight: 700;
  box-shadow: var(--shadow-md), 0 0 15px rgba(255, 61, 40, 0.3);
}

.prev-btn {
  opacity: 0.9;
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
}

.photo-bonus-button-container {
  padding: 5px 20px 20px;
  display: flex;
  justify-content: center;
  width: 100%;
}

.photo-bonus-btn {
  width: 80%;
  padding: 15px 0;
  font-weight: 600;
  position: relative;
  overflow: hidden;
  box-shadow: var(--shadow-md), 0 0 15px rgba(33, 150, 243, 0.3);
}

.photo-bonus-btn::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transform: translateX(-100%);
  transition: transform 0.5s ease;
}

.photo-bonus-btn:hover::after {
  transform: translateX(100%);
}

.pulsing-icon {
  animation: pulse 1.5s infinite ease-in-out;
}

@keyframes popup-appear {
  0% {
    transform: scale(0.95);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes header-shine {
  0% { transform: translateX(-100%) rotate(30deg); }
  100% { transform: translateX(100%) rotate(30deg); }
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.9; }
}

/* Styles responsifs pour mobile */
@media (max-width: 768px) {
  .success-popup {
    width: 90%;
    max-width: 500px;
  }
  
  .success-icon {
    font-size: 3rem;
  }
  
  .photo-bonus-btn {
    width: 90%;
  }
}

@media (max-width: 480px) {
  .success-popup {
    width: 95%;
    max-width: 350px;
    border-radius: var(--border-radius-lg);
  }
  
  .success-popup-footer {
    padding: 15px;
  }
  
  .nav-buttons {
    flex-direction: column;
    gap: 10px;
  }
  
  .nav-btn {
    width: 100%;
    min-width: unset;
    margin: 0;
    padding: 10px 15px;
  }
  
  .success-title {
    font-size: 1.3rem;
  }
  
  .success-message {
    font-size: 1rem;
  }
  
  .success-popup-content {
    padding: 15px;
    margin: 15px;
  }
  
  .success-icon {
    font-size: 2.5rem;
    margin-bottom: 15px;
  }
}
</style>
