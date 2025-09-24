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
// Ne PAS bloquer le scroll pour éviter les problèmes d'interaction
const { setViewportHeight } = useFullscreenViewport({
  preventScroll: false,           // Ne PAS bloquer le scroll
  recalculateOnResize: true,       // Recalculer sur redimensionnement/orientation
  recalculateDelays: [100, 500]    // Recalculer après des délais pour stabilité
});

// SUPPRESSION DE L'OBSERVER QUI CAUSE DES PROBLÈMES

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
  console.log('BOUTON CLIQUÉ - FERMETURE INTRO')
  
  // D'abord masquer l'écran pour empêcher toute interaction supplémentaire
  visible.value = false
  
  // SUPER IMPORTANT: Débloquer le scroll immédiatement pour iOS
  setTimeout(() => {
    // Réinitialiser TOUS les styles qui pourraient bloquer le scroll
    const elements = [document.documentElement, document.body]
    elements.forEach(el => {
      el.classList.remove('splash-active', 'no-scroll')
      el.style.overflow = ''
      el.style.height = ''
      el.style.position = ''
      el.style.touchAction = ''
      // Ne pas utiliser webkitOverflowScrolling qui n'est pas reconnu par TypeScript
      // Utiliser une classe CSS à la place
      el.classList.add('ios-scroll')
    })
    
    // Notifier l'application parent
    emit('complete')
  }, 10)
}

// Les nettoyages sont gérés automatiquement par les composables
</script>

<template>
  <transition name="fade">
    <div v-if="visible" class="intro-container">
      <div class="intro-text-wrapper scroll-hidden" :class="{ 'animating': isAnimating }">
        <pre class="typing-text" v-html="displayedText"></pre>
        
        <div class="skip-button-container" v-if="displayedText.includes('⚡️')">
          <button 
            @click="closeIntro" 
            @touchend="closeIntro" 
            class="skip-button"
            style="z-index: 20000; position: relative;"
          >
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
</style>

<style scoped>

.intro-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh; /* Hauteur de base */
  background-color: rgba(0, 0, 0, 1); /* Fond 100% opaque */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999; /* Augmenter le z-index pour être sûr */
  padding: 0;
  margin: 0;
  box-sizing: border-box;
  overflow: auto; /* Important pour iOS - permet le défilement */
  -webkit-overflow-scrolling: touch; /* Crucial pour iOS - défilement fluide */
  /* Retrait de touch-action: none et autres propriétés qui bloquent les interactions */
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
  position: fixed; /* Fixer la position pour éviter qu'elle remonte */
  max-width: 600px;
  width: 90%;
  background-color: rgba(0, 0, 0, 0.98); /* Fond très opaque */
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 0 20px rgba(227, 53, 13, 0.5);
  
  /* Position bien centrée et fixe */
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10000; /* S'assurer qu'il est au-dessus de tout */
  
  /* Permettre le défilement mais masquer la barre de défilement */
  max-height: 70vh;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE et Edge */
  
  /* S'assurer que le contenu ne cause pas de sauts de layout pendant l'animation */
  will-change: contents;
  overscroll-behavior: contain;
  -webkit-font-smoothing: antialiased;
  transition: contents 0.1s ease-in-out;
}

/* Ajustements de hauteur selon le support */
@supports (max-height: 80vh) {
  .intro-text-wrapper {
    max-height: 70vh;
  }
}

@supports (max-height: calc(var(--vh) * 80)) {
  .intro-text-wrapper {
    max-height: calc(var(--vh) * 70);
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
  overflow-wrap: break-word;
}

/* Masquer la barre de défilement pour Webkit (Chrome, Safari, navigateurs iOS) */
.intro-text-wrapper::-webkit-scrollbar {
  width: 0 !important;
  height: 0 !important;
  display: none !important;
  background: transparent !important;
  -webkit-appearance: none !important;
}

.skip-button-container {
  margin-top: 40px; /* Plus d'espace au-dessus du bouton */
  margin-bottom: 20px; /* Espace en dessous */
  display: flex;
  justify-content: center;
  width: 100%;
  padding: 10px;
}

.skip-button {
  background-color: var(--pokemon-red, #E3350D);
  color: white;
  border: none;
  padding: 15px 30px; /* Bouton plus grand pour faciliter le clic sur mobile */
  font-family: 'Courier New', monospace;
  font-size: 18px; /* Texte encore plus grand */
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  animation: pulse 1.5s infinite;
  border-radius: 10px; /* Coins plus arrondis */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5); /* Ombre plus prononcée */
  -webkit-tap-highlight-color: transparent; /* Supprimer le highlight iOS */
  margin: 15px auto; /* Marges supplémentaires */
  width: 80%; /* Plus large */
  max-width: 300px;
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
