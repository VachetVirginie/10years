<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';

const props = defineProps({
  active: {
    type: Boolean,
    default: false
  },
  duration: {
    type: Number,
    default: 2000
  },
  opponentImage: {
    type: String,
    default: ''
  },
  opponentName: {
    type: String,
    default: 'Challenger'
  }
});

const emit = defineEmits(['complete']);
const isAnimating = ref(false);
const phase = ref(0);

// Lancer l'animation lorsque active passe à true
watch(() => props.active, (newVal) => {
  if (newVal) {
    startAnimation();
  }
});

// Séquence d'animation
function startAnimation() {
  isAnimating.value = true;
  phase.value = 1;
  
  // Phase 2 - Les barres horizontales
  setTimeout(() => {
    phase.value = 2;
  }, 500);
  
  // Phase 3 - Flash blanc
  setTimeout(() => {
    phase.value = 3;
  }, 1200);
  
  // Phase 4 - Affichage de l'adversaire
  setTimeout(() => {
    phase.value = 4;
  }, 1500);
  
  // Fin de l'animation
  setTimeout(() => {
    isAnimating.value = false;
    emit('complete');
    // Approche simple pour iOS
    document.documentElement.classList.remove('splash-active');
    document.body.classList.remove('splash-active');
  }, props.duration);
}

// Lancer immédiatement l'animation si active est true au montage
onMounted(() => {
  if (props.active) {
    startAnimation();
  }
});
</script>

<template>
  <transition name="battle">
    <div v-if="isAnimating" class="battle-transition">
      <!-- Phase 1: Ondulations -->
      <div v-if="phase >= 1" class="battle-ripples">
        <div v-for="i in 5" :key="`ripple-${i}`" class="ripple" :style="{ animationDelay: `${i * 100}ms` }"></div>
      </div>
      
      <!-- Phase 2: Barres horizontales -->
      <div v-if="phase >= 2" class="battle-stripes">
        <div v-for="i in 10" :key="`stripe-${i}`" 
          class="stripe" 
          :class="i % 2 === 0 ? 'stripe-left' : 'stripe-right'"
          :style="{ 
            top: `${i * 10}%`, 
            animationDelay: `${i * 50}ms`,
            height: '10%'
          }"
        ></div>
      </div>
      
      <!-- Phase 3: Flash blanc -->
      <div v-if="phase >= 3" class="battle-flash"></div>
      
      <!-- Phase 4: Affichage de l'adversaire -->
      <div v-if="phase >= 4" class="battle-opponent">
        <div class="opponent-container">
          <img v-if="opponentImage" :src="opponentImage" :alt="opponentName" class="opponent-image">
          <div v-else class="opponent-placeholder"></div>
          
          <div class="opponent-info">
            <div class="opponent-appear">
              Un(e) {{ opponentName }} sauvage apparaît !
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.battle-transition {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: black;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: auto; /* Important pour iOS */
  -webkit-overflow-scrolling: touch; /* Crucial pour iOS */
}

/* Transition d'entrée et de sortie */
.battle-enter-active,
.battle-leave-active {
  transition: opacity 0.3s;
}
.battle-enter-from,
.battle-leave-to {
  opacity: 0;
}

/* Phase 1: Ondulations */
.battle-ripples {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.ripple {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: var(--pokemon-red);
  transform: translate(-50%, -50%);
  animation: ripple 0.8s ease-out forwards;
}

/* Phase 2: Barres horizontales */
.battle-stripes {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
}

.stripe {
  position: absolute;
  width: 0%;
  background-color: var(--pokemon-red);
  z-index: 3;
}

.stripe-left {
  left: 0;
  animation: stripe-left 0.5s ease-out forwards;
}

.stripe-right {
  right: 0;
  animation: stripe-right 0.5s ease-out forwards;
}

/* Phase 3: Flash blanc */
.battle-flash {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: white;
  z-index: 4;
  animation: flash 0.5s ease-out forwards;
}

/* Phase 4: Affichage de l'adversaire */
.battle-opponent {
  position: relative;
  z-index: 5;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.opponent-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: opponent-appear 0.6s ease-out;
}

.opponent-image {
  max-width: 180px;
  max-height: 180px;
  margin-bottom: 30px;
  filter: drop-shadow(0 0 10px var(--pokemon-red));
}

.opponent-placeholder {
  width: 150px;
  height: 150px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  margin-bottom: 30px;
}

.opponent-info {
  background-color: var(--pokemon-gray-100);
  border: 4px solid var(--pokemon-white);
  border-radius: 10px;
  padding: 16px 24px;
  box-shadow: 0 0 0 4px var(--pokemon-black);
  text-align: center;
  max-width: 80%;
}

.opponent-appear {
  color: var(--pokemon-white);
  font-family: 'Press Start 2P', 'Courier New', monospace;
  font-size: 1rem;
  animation: text-appear 1s steps(40, end);
  white-space: nowrap;
}

/* Animations */
@keyframes ripple {
  0% {
    width: 20px;
    height: 20px;
    opacity: 1;
  }
  100% {
    width: 500px;
    height: 500px;
    opacity: 0;
  }
}

@keyframes stripe-left {
  0% {
    width: 0%;
  }
  100% {
    width: 100%;
  }
}

@keyframes stripe-right {
  0% {
    width: 0%;
  }
  100% {
    width: 100%;
  }
}

@keyframes flash {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

@keyframes opponent-appear {
  0% {
    transform: scale(0.5);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes text-appear {
  0% {
    width: 0;
    overflow: hidden;
  }
  100% {
    width: 100%;
  }
}

/* Responsive */
@media (max-width: 480px) {
  .opponent-image {
    max-width: 140px;
    max-height: 140px;
  }
  
  .opponent-appear {
    font-size: 0.8rem;
  }
}
</style>
