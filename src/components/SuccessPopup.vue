<template>
  <div v-if="show" class="success-popup-overlay">
    <div class="success-popup">
      <div class="success-popup-header">
        <h2 class="success-title">{{ title }}</h2>
      </div>
      
      <div class="success-popup-content">
        <div class="success-icon">✅</div>
        <p class="success-message whitespace-pre-line">{{ message }}</p>
      </div>
      
      <div class="success-popup-footer">
        <div class="nav-buttons">
          <v-btn 
            color="var(--pokemon-gray-300)" 
            variant="outlined" 
            @click="previousStep" 
            class="nav-btn prev-btn"
            :disabled="!props.hasPreviousStep"
          >
            <v-icon start>mdi-arrow-left</v-icon>
            Précédente
          </v-btn>
          
          <v-btn 
            color="var(--pokemon-red)" 
            variant="elevated" 
            @click="nextStep" 
            class="nav-btn next-btn"
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
import { ref, watch } from 'vue';

const props = defineProps<{
  show: boolean;
  title: string;
  message: string;
  currentStepId: string; // ID de l'étape actuelle
  hasPreviousStep: boolean; // S'il existe une étape précédente
}>();

const emit = defineEmits(['next', 'previous', 'close']);

// Observer les changements de visibilité du popup
watch(() => props.show, (isVisible) => {
  // Si le popup est fermé, s'assurer que le scroll est restauré
  if (!isVisible) {
    document.documentElement.classList.remove('splash-active');
    document.body.classList.remove('splash-active');
  }
});

const nextStep = () => {
  emit('next');
};

const previousStep = () => {
  emit('previous');
};
</script>

<style scoped>
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
  overflow: auto; /* Important pour iOS */
  -webkit-overflow-scrolling: touch; /* Crucial pour iOS */
}

.success-popup {
  background-color: var(--pokemon-gray-100);
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 0 20px rgba(227, 53, 13, 0.5);
  border: 2px solid var(--pokemon-red);
  overflow: hidden;
  animation: popup-appear 0.3s ease-out;
}

.success-popup-header {
  background-color: var(--pokemon-red);
  color: white;
  padding: 15px 20px;
  text-align: center;
}

.success-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: bold;
}

.success-popup-content {
  padding: 20px;
  text-align: center;
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
  border-top: 1px solid var(--pokemon-gray-300);
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
}

.next-btn {
  font-weight: bold;
}

.prev-btn {
  opacity: 0.8;
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
