<template>
  <transition name="fade">
    <div v-if="visible" class="enigme-splash">
      <!-- Particules d'ambiance -->
      <div class="glass-particles">
        <div class="glass-particle"></div>
        <div class="glass-particle"></div>
        <div class="glass-particle"></div>
        <div class="glass-particle"></div>
        <div class="glass-particle"></div>
        <div class="glass-particle"></div>
      </div>
      <div class="enigme-content glass-card">
        <div class="enigme-image">
          <!-- Image d'illustration selon le type d'énigme depuis le dossier public -->
          <img v-if="step.type === 'riddle'" src="../assets/images/pokemon/luv.png" alt="Énigme" />
          <img v-else-if="step.type === 'choice'" src="/images/pokemon/choice.svg" alt="Choix" />
          <img v-else src="/images/pokemon/pokeball.svg" alt="Étape" />
        </div>
        <div class="enigme-info">
          <h1 class="enigme-title">Énigme {{ step.id }}</h1>
          <div class="title-underline"></div>
          <h2 class="enigme-subtitle">{{ step.splash }}</h2>
        </div>
        <div class="progress-container">
          <div class="progress-bar glass-progress-bar">
            <div class="progress-fill glass-progress-fill" :style="{ width: progress + '%' }">
              <div class="progress-shine"></div>
            </div>
          </div>
        </div>
        
        <!-- Bouton pour passer l'animation -->
        <button @click="skipAnimation" class="skip-button glass-button">
          PASSER
        </button>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useFullscreenViewport } from '../composables/useFullscreenViewport';

const props = defineProps<{
  step: {
    id: string;
    type: string;
    title: string;
    [key: string]: any;
  };
  duration?: number; // Durée d'affichage en ms (3000 par défaut)
}>();

const emit = defineEmits(['complete']);

const visible = ref(true);
const progress = ref(0);
const animationInterval = ref<number | null>(null);

// Calcul de la durée (3 secondes par défaut)
const actualDuration = computed(() => props.duration || 3000);

// Fonction pour passer l'animation
const skipAnimation = () => {
  // Arrêter l'intervalle s'il est en cours
  if (animationInterval.value !== null) {
    clearInterval(animationInterval.value);
    animationInterval.value = null;
  }
  
  // Fermer le splash et émettre l'événement de fin
  visible.value = false;
  emit('complete');
};

// Utiliser le composable pour gérer l'affichage plein écran
const { setViewportHeight } = useFullscreenViewport({
  preventScroll: false,
  recalculateOnResize: true,
  recalculateDelays: [100, 500]
});

onMounted(() => {
  // Démarre l'animation de progression
  const duration = actualDuration.value;
  const steps = 100; // Nombre de pas pour l'animation
  const stepDuration = duration / steps;
  
  animationInterval.value = window.setInterval(() => {
    if (progress.value < 100) {
      progress.value += 1;
    } else {
      // Animation terminée
      if (animationInterval.value !== null) {
        clearInterval(animationInterval.value);
        animationInterval.value = null;
      }
      // Attendre un peu après que la barre soit pleine avant de fermer
      setTimeout(() => {
        visible.value = false;
        emit('complete');
      }, 200);
    }
  }, stepDuration);
});

// Nettoyage en cas de destruction prématurée du composant
onMounted(() => {
  // Les écouteurs d'événements sont nettoyés automatiquement par useFullscreenViewport
});

// Arrêter l'animation quand le composant est détruit
onUnmounted(() => {
  if (animationInterval.value !== null) {
    clearInterval(animationInterval.value);
    animationInterval.value = null;
  }
});
</script>

<style>
/* Variables CSS globales pour le thème Pokémon */
:root {
  --vh: 1vh;
  --pokemon-black: #212121;
  --pokemon-red: #E3350D;
  --pokemon-white: #FFFFFF;
  --pokemon-gray-100: #2a2a2a;
  --pokemon-gray-200: #3a3a3a;
  --pokemon-gray-300: #505050;
}

body, html {
  margin: 0;
  padding: 0;
  height: 100%;
  overscroll-behavior: contain;
}
</style>

<style scoped>
@import '../assets/glassmorphism.css';

.enigme-splash {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  /* Hauteur de base */
  height: 100vh;
  min-height: -webkit-fill-available; /* Support pour iOS */
  background-color: rgba(33, 33, 33, 0.9);
  background-image: radial-gradient(circle at center, rgba(50, 50, 50, 0.8) 0%, rgba(20, 20, 20, 0.95) 70%);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  padding: 0; /* Retirer le padding ici */
  box-sizing: border-box;
  overflow: hidden; /* Permettre le défilement si nécessaire */
  touch-action: auto; /* Permettre les gestes tactiles */
  pointer-events: auto !important;
  isolation: isolate;
  will-change: transform;
  backdrop-filter: blur(var(--glass-blur-light));
  -webkit-backdrop-filter: blur(var(--glass-blur-light));
}

.enigme-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  max-width: 500px;
  width: 90%;
  /* Limitation de hauteur avec fallback */
  max-height: 100vh;
  overflow-y: auto; /* Permettre le défilement vertical si nécessaire */
  -webkit-overflow-scrolling: touch; /* Défilement fluide sur iOS */
  scrollbar-width: none; /* Cacher la barre de défilement sur Firefox */
  background-color: rgba(33, 33, 33, 0.7);
  padding: 30px;
  border-radius: 20px;
  border: 1px solid var(--glass-border-light);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(var(--glass-blur-medium));
  -webkit-backdrop-filter: blur(var(--glass-blur-medium));
  transition: var(--glass-transition);
  position: relative;
}

.enigme-content::before {
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

/* Cacher la barre de défilement pour Chrome, Safari et Edge */
.enigme-content::-webkit-scrollbar {
  display: none;
}

.enigme-image {
  margin-bottom: 30px;
  margin-top: 30px;
  animation: bounce 1s infinite alternate ease-in-out;
  background: rgba(0, 0, 0, 0.3);
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: 2px solid var(--glass-border-light);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  position: relative;
  overflow: hidden;
}

.enigme-image::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  animation: shine 3s infinite;
}

.enigme-image img {
  width: 80px;
  height: 80px;
  filter: drop-shadow(0 0 15px rgba(255, 69, 58, 0.8));
  z-index: 2;
  transform: scale(1.1);
}

.enigme-info {
  position: relative;
  margin-bottom: 25px;
}

.enigme-title {
  font-size: 2.5rem;
  color: white;
  margin: 0 0 15px;
  text-shadow: 0 0 10px var(--glass-pokemon-red), 0 0 20px rgba(255, 69, 58, 0.5);
  font-weight: bold;
  letter-spacing: 0.5px;
  position: relative;
  display: inline-block;
}

.title-underline {
  width: 80px;
  height: 3px;
  background: linear-gradient(to right, transparent, var(--glass-pokemon-red), transparent);
  margin: 0 auto 15px;
  border-radius: 3px;
}

.enigme-subtitle {
  font-size: 1.5rem;
  color: var(--pokemon-white, #FFFFFF);
  margin: 0;
  opacity: 0.9;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  line-height: 1.4;
}

.progress-container {
  width: 85%;
  max-width: 320px;
  margin-top: 35px;
  position: relative;
}

.progress-bar {
  height: 10px;
  background-color: rgba(30, 30, 30, 0.6);
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid var(--glass-border-light);
  position: relative;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(to right, rgba(255, 107, 107, 0.9), var(--glass-pokemon-red));
  width: 0%;
  transition: width 0.1s linear;
  border-radius: 20px;
  position: relative;
  box-shadow: 0 0 10px rgba(255, 61, 40, 0.7);
}

.skip-button {
  margin-top: 30px;
  padding: 12px 24px;
  background: var(--glass-pokemon-red);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 30px;
  font-size: 14px;
  cursor: pointer;
  font-weight: bold;
  letter-spacing: 0.5px;
  transition: var(--glass-transition);
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.skip-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(255, 0, 0, 0.3);
}

.skip-button::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 70%);
  transform: scale(0);
  opacity: 0;
  transition: transform 0.5s ease-out, opacity 0.3s ease;
}

.skip-button:hover::before {
  transform: scale(1);
  opacity: 1;
}

/* Animations */
@keyframes bounce {
  0% { transform: translateY(0); }
  100% { transform: translateY(-10px); }
}

@keyframes shine {
  0% { left: -100%; }
  100% { left: 100%; }
}

/* Transition d'entrée/sortie */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s ease;
  will-change: opacity; /* Optimisation pour les performances de rendu */
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 600px) {
  .enigme-splash {
    padding: 0; /* Important : pas de padding pour éviter les espaces blanc */
  }

  .enigme-title {
    font-size: 2rem;
    margin-bottom: 8px;
  }
  
  .enigme-subtitle {
    font-size: 1.2rem;
    margin-bottom: 20px;
  }
  
  .enigme-image img {
    width: 80px;
    height: 80px;
  }

  /* Ajustement spécifique pour éviter les problèmes de hauteur sur iOS */
  .enigme-content {
    padding-top: env(safe-area-inset-top);
    padding-bottom: env(safe-area-inset-bottom);
  }
}
</style>
