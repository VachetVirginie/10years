<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  duration: {
    type: Number,
    default: 3000 // 3 secondes par défaut
  }
})

const emit = defineEmits(['complete'])

// État pour gérer la visibilité du splash screen
const visible = ref(true)

// Fonction pour calculer et appliquer la hauteur correcte pour les mobiles
const setViewportHeight = () => {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
  
  // Forcer une mise à jour immédiate
  document.body.style.height = `${window.innerHeight}px`;
  document.documentElement.style.height = `${window.innerHeight}px`;
};

// Gestionnaire d'événement pour le scroll - bloque le défilement du corps
const preventScroll = (e: Event) => {
  if (visible.value) {
    e.preventDefault();
  }
};

// Déclencher l'événement après la durée spécifiée
onMounted(() => {
  // Appliquer immédiatement
  setViewportHeight();
  
  // Recalculer lors des événements qui peuvent changer la hauteur de l'écran
  window.addEventListener('resize', setViewportHeight);
  window.addEventListener('orientationchange', setViewportHeight);
  window.addEventListener('scroll', preventScroll, { passive: false });
  
  // Forcer un recalcul après un court délai pour s'assurer que tout est correctement affiché
  setTimeout(setViewportHeight, 100);
  // Et à nouveau après un délai plus long pour assurer la stabilité complète
  setTimeout(setViewportHeight, 500);

  setTimeout(() => {
    visible.value = false
    emit('complete')
  }, props.duration)
})

// Nettoyage des événements lors du démontage du composant
onUnmounted(() => {
  window.removeEventListener('resize', setViewportHeight);
  window.removeEventListener('orientationchange', setViewportHeight);
  window.removeEventListener('scroll', preventScroll);
})
</script>

<template>
  <transition name="fade">
    <div v-if="visible" class="splash-container" @touchmove.prevent @wheel.prevent @scroll.prevent>
      <div class="splash-image-wrapper">
        <img 
          src="https://archives.bulbagarden.net/media/upload/7/79/Dream_Pok%C3%A9_Ball_Sprite.png" 
          alt="Pokéball" 
          class="splash-image"
        />
      </div>
    </div>
  </transition>
</template>

<style>
/* Styles globaux nécessaires */
:root {
  --vh: 1vh;
  --pokemon-black: #000000;
  --pokemon-red: #E3350D;
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

.splash-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  background-color: var(--pokemon-black, #000);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  overflow: hidden !important; /* Empêcher tout défilement */
  padding: 0;
  margin: 0;
  box-sizing: border-box;
  touch-action: none; /* Désactiver les gestes tactiles comme le zoom */
  pointer-events: auto !important;
  isolation: isolate;
  will-change: transform;
  
  /* Gestion multi-plateforme de la hauteur */
  height: 100vh;
}

/* Appliquer différentes hauteurs pour assurer la compatibilité multi-navigateurs */
@supports (height: 100vh) {
  .splash-container {
    height: 100vh;
  }
}

@supports (height: -webkit-fill-available) {
  .splash-container {
    height: -webkit-fill-available;
  }
}

@supports (height: calc(var(--vh) * 100)) {
  .splash-container {
    height: calc(var(--vh) * 100);
  }
}

.splash-image-wrapper {
  width: 150px;
  height: 150px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.splash-image {
  width: 100%;
  height: auto;
  animation: float-pulse 3s ease-in-out infinite;
}

/* Animation combinant flottaison et pulsation */
@keyframes float-pulse {
  0% {
    transform: translateY(0) scale(1);
    filter: drop-shadow(0 5px 15px rgba(227, 53, 13, 0.7));
  }
  50% {
    transform: translateY(-20px) scale(1.1);
    filter: drop-shadow(0 20px 25px rgba(227, 53, 13, 0.5));
  }
  100% {
    transform: translateY(0) scale(1);
    filter: drop-shadow(0 5px 15px rgba(227, 53, 13, 0.7));
  }
}

/* Animation de transition */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
  will-change: opacity; /* Optimisation pour les performances de rendu */
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* Styles spécifiques pour mobile */
@media (max-width: 600px) {
  .splash-image-wrapper {
    width: 120px;
    height: 120px;
  }
}
</style>
