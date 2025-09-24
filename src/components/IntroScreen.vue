<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useTypingAnimation } from '../composables/useTypingAnimation'
import { useFullscreenViewport } from '../composables/useFullscreenViewport'

const props = defineProps({
  duration: {
    type: Number,
    default: 10000 // 10 secondes par défaut pour lire le texte
  }
})

const emit = defineEmits(['complete'])

// État pour gérer la visibilité
const visible = ref(true)

// Texte complet de l'introduction
const fullText = `
Bonjour, Soso ! Enfin te voilà… Je savais que je pouvais compter sur toi.
Une étrange énigme a surgi dans les rues de Lyon. 
Comme des Pokémon rares, des indices se sont éparpillés aux quatre coins de la ville.

Pour réussir ta mission, tu devras faire preuve de courage, de stratégie et d’un esprit affûté, comme lors d’un combat d’arène.

Ta quête commence maintenant. Le destin de cette aventure est entre tes mains… »

⚡️ Alors, jeune dresseuse… es-tu prête à partir à l’aventure ?
`

// Utiliser notre composable pour gérer l'affichage plein écran avec correction de hauteur
const { setViewportHeight } = useFullscreenViewport({
  preventScroll: true,            // Bloquer le scroll
  recalculateOnResize: true,       // Recalculer sur redimensionnement/orientation
  recalculateDelays: [100, 500]    // Recalculer après des délais pour stabilité
});

// Observer les changements de texte pour recalculer la hauteur
onMounted(() => {
  // Délai pour permettre au DOM de se stabiliser
  setTimeout(() => {
    const textElement = document.querySelector('.typing-text');
    if (textElement) {
      const observer = new MutationObserver(setViewportHeight);
      observer.observe(textElement, {
        childList: true,
        characterData: true,
        subtree: true
      });
    }
  }, 100);
});

// Utiliser notre nouveau composable pour l'animation de texte
const { 
  displayedText, 
  isAnimating,
  start: startTyping
} = useTypingAnimation(fullText, {
  speed: 50,
  onComplete: () => {
    // Recalculer la hauteur une fois l'animation terminée
    setViewportHeight()
  }
})

// Démarrer l'animation au montage du composant
onMounted(startTyping)

// Fonction pour fermer l'écran d'intro avec une transition fluide
const closeIntro = () => {
  // Léger délai avant de masquer l'élément pour permettre une transition fluide
  setTimeout(() => {
    visible.value = false
    emit('complete')
  }, 300)
}

// Les nettoyages sont gérés automatiquement par les composables
</script>

<template>
  <transition name="fade">
    <div v-if="visible" class="intro-container" @touchmove.prevent @wheel.prevent @scroll.prevent>
      <div class="intro-text-wrapper" :class="{ 'animating': isAnimating }">
        <pre class="typing-text">{{ displayedText }}</pre>
        
        <div class="skip-button-container" v-if="displayedText.includes('⚡️')">
          <button @click="closeIntro" class="skip-button">
            COMMENCER L'AVENTURE
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<style>
/* Ces styles doivent être globaux pour affecter tout le document */
:root {
  --vh: 1vh;
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

.intro-container {
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
  .intro-container {
    height: 100vh;
  }
}

@supports (height: -webkit-fill-available) {
  .intro-container {
    height: -webkit-fill-available;
  }
}

@supports (height: calc(var(--vh) * 100)) {
  .intro-container {
    height: calc(var(--vh) * 100);
  }
}

.intro-text-wrapper {
  position: relative;
  max-width: 600px;
  width: 90%;
  overflow-y: auto;
  overflow-x: hidden;
  overscroll-behavior: contain; /* Empêcher le scroll en cascade */
  -webkit-overflow-scrolling: touch; /* Pour un défilement fluide sur iOS */
  background-color: rgba(0, 0, 0, 0.98); /* Fond très opaque */
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 0 20px rgba(227, 53, 13, 0.5);
  margin: 20px; /* Ajouter une marge pour éviter les bords de l'écran */
  
  /* Hauteur de base */
  max-height: 80%;
  z-index: 10000; /* S'assurer qu'il est au-dessus de tout */
  
  /* Empêcher le scroll pendant l'animation */
  &.animating {
    overflow-y: hidden;
    overflow: hidden !important;
  }
}

/* Ajustements de hauteur selon le support */
@supports (max-height: 80vh) {
  .intro-text-wrapper {
    max-height: 80vh;
  }
}

@supports (max-height: calc(var(--vh) * 80)) {
  .intro-text-wrapper {
    max-height: calc(var(--vh) * 80);
  }
}

.typing-text {
  color: var(--pokemon-red, #E3350D);
  font-family: 'Courier New', monospace;
  font-size: 1.1rem;
  line-height: 1.6;
  white-space: pre-wrap;
  margin: 0;
  text-shadow: 0 0 5px rgba(227, 53, 13, 0.5);
}

.skip-button-container {
  margin-top: 30px;
  display: flex;
  justify-content: center;
}

.skip-button {
  background-color: var(--pokemon-red, #E3350D);
  color: white;
  border: none;
  padding: 10px 20px;
  font-family: 'Courier New', monospace;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  animation: pulse 1.5s infinite;
}

.skip-button:hover {
  background-color: var(--pokemon-red-dark, #B71C1C);
  transform: scale(1.05);
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

/* Animation de transition */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
