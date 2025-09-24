<template>
  <transition name="fade">
    <div v-if="visible" class="enigme-splash">
      <div class="enigme-content">
        <div class="enigme-image">
          <!-- Image d'illustration selon le type d'énigme depuis le dossier public -->
          <img v-if="step.type === 'riddle'" src="../assets/images/pokemon/luv.png" alt="Énigme" />
          <img v-else-if="step.type === 'choice'" src="/images/pokemon/choice.svg" alt="Choix" />
          <img v-else src="/images/pokemon/pokeball.svg" alt="Étape" />
        </div>
        <h1 class="enigme-title">Énigme {{ step.id }}</h1>
        <h2 class="enigme-subtitle">{{ step.splash }}</h2>
        <div class="progress-container">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: progress + '%' }"></div>
          </div>
        </div>
        
        <!-- Bouton pour passer l'animation -->
        <button @click="skipAnimation" class="skip-button">
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
  
  // Approche simple pour iOS
  document.documentElement.classList.remove('splash-active');
  document.body.classList.remove('splash-active');
};

// Utiliser le composable pour gérer l'affichage plein écran
const { setViewportHeight } = useFullscreenViewport({
  preventScroll: true,
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
        
        // Approche simple pour iOS
        document.documentElement.classList.remove('splash-active');
        document.body.classList.remove('splash-active');
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
  height: 100% !important;
  overflow: hidden !important;
  overscroll-behavior: none;
}
</style>

<style scoped>

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
  background-color: var(--pokemon-black, #212121);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  padding: 0; /* Retirer le padding ici */
  box-sizing: border-box;
  
  /* Style amélioré pour iOS */
  overflow: auto;
  -webkit-overflow-scrolling: touch; /* Crucial pour iOS */
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
  max-height: 90vh;
  overflow-y: auto; /* Permettre le défilement vertical si nécessaire */
  -webkit-overflow-scrolling: touch; /* Défilement fluide sur iOS */
  scrollbar-width: none; /* Cacher la barre de défilement sur Firefox */
}

/* Cacher la barre de défilement pour Chrome, Safari et Edge */
.enigme-content::-webkit-scrollbar {
  display: none;
}

.enigme-image {
  margin-bottom: 30px;
  animation: bounce 1s infinite alternate ease-in-out;
}

.enigme-image img {
  width: 100px;
  height: 100px;
  filter: drop-shadow(0 0 10px rgba(255, 69, 58, 0.6));
}

.enigme-title {
  font-size: 2.5rem;
  color: var(--pokemon-red, #E3350D);
  margin: 0 0 10px;
  text-shadow: 0 0 10px rgba(255, 69, 58, 0.5);
  font-weight: bold;
}

.enigme-subtitle {
  font-size: 1.5rem;
  color: var(--pokemon-white, #FFFFFF);
  margin: 0 0 30px;
  opacity: 0.9;
}

.progress-container {
  width: 80%;
  max-width: 300px;
  margin-top: 20px;
}

.progress-bar {
  height: 8px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: var(--pokemon-red, #E3350D);
  width: 0%;
  transition: width 0.1s linear;
}

.skip-button {
  margin-top: 20px;
  padding: 8px 16px;
  background-color: var(--pokemon-red, #E3350D);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  font-weight: bold;
  opacity: 0.8;
  transition: opacity 0.3s ease;
}

.skip-button:hover {
  opacity: 1;
}

/* Animations */
@keyframes bounce {
  0% { transform: translateY(0); }
  100% { transform: translateY(-10px); }
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
