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

Pour réussir ta mission, tu devras faire preuve de courage, de stratégie et d'un esprit affûté, comme lors d'un combat d'arène.

Ta quête commence maintenant. Le destin de cette aventure est entre tes mains… »

⚡️ Alors, jeune dresseuse… es-tu prête à partir à l'aventure ?
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
    
    // S'assurer que les restrictions de scroll sont supprimées (approche simple)
    document.documentElement.classList.remove('splash-active')
    document.body.classList.remove('splash-active')
  }, 300)
}

// Les nettoyages sont gérés automatiquement par les composables
</script>

<template>
  <transition name="fade">
    <div v-if="visible" class="intro-container">
      <div class="intro-content">
        <!-- Particules d'ambiance -->
        <div class="glass-particles">
          <div class="glass-particle"></div>
          <div class="glass-particle"></div>
          <div class="glass-particle"></div>
          <div class="glass-particle"></div>
          <div class="glass-particle"></div>
          <div class="glass-particle"></div>
          <div class="glass-particle"></div>
          <div class="glass-particle"></div>
        </div>
        <!-- <div class="pokeball-top"></div> -->
        
        <div class="intro-text-wrapper" :class="{ 'animating': isAnimating }">
          <div class="professor-image"></div>
          <div class="dialogue-box glass-dialogue-box">
            <pre class="typing-text">{{ displayedText }}</pre>
            <div class="skip-button-container" v-if="displayedText.includes('⚡️')">
            <button @click="closeIntro" class="skip-button glass-button">
              <span class="btn-text">COMMENCER L'AVENTURE</span>
              <span class="btn-icon">→</span>
            </button>
          </div>
        </div>
          </div>
        
        <!-- <div class="pokeball-bottom"></div> -->
      </div>
    </div>
  </transition>
</template>

<style>
/* Ces styles doivent être globaux pour affecter tout le document */
:root {
  --vh: 1vh;
}

body.intro-active, html.intro-active {
  margin: 0;
  padding: 0;
  height: 100% !important;
  overflow: hidden !important;
  overscroll-behavior: none;
}
</style>

<style scoped>
/* Importation des variables du thème Pokémon et glassmorphisme */
@import '../assets/splash-screens.css';
@import '../assets/glassmorphism.css';

.intro-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  background-color: #111;
  background-image: radial-gradient(circle at center, #212121 0%, #111 70%);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  padding: 0;
  margin: 0;
  box-sizing: border-box;
  overflow: hidden;
  -webkit-overflow-scrolling: touch;
}

.intro-container::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  background-image: 
    radial-gradient(circle at 20% 30%, rgba(255, 61, 0, 0.15) 0%, transparent 20%),
    radial-gradient(circle at 80% 70%, rgba(255, 61, 0, 0.1) 0%, transparent 30%);
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

.intro-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  max-width: 800px;
  padding: 20px;
  position: relative;
}

/* Pokéball design elements */
/* .pokeball-top {
  position: absolute;
  top: 5%;
  width: 120px;
  height: 60px;
  background-color: var(--pokemon-red);
  border-radius: 100px 100px 0 0;
  border: 4px solid white;
  border-bottom: none;
  z-index: 1;
  box-shadow: 0 0 15px rgba(227, 53, 13, 0.7);
  animation: float 6s ease-in-out infinite;
}

.pokeball-bottom {
  position: absolute;
  bottom: 5%;
  width: 120px;
  height: 60px;
  background-color: white;
  border-radius: 0 0 100px 100px;
  border: 4px solid white;
  border-top: none;
  z-index: 1;
  animation: float-inverse 6s ease-in-out infinite;
} */

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

@keyframes float-inverse {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(20px); }
}

.intro-text-wrapper {
  position: relative;
  width: 100%;
  max-width: 600px;
  margin: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 2;
  
  &.animating {
    overflow: hidden;
  }
}

.professor-image {
  width: 120px;
  height: 120px;
  background-image: url('/public/images/prof.png');
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  margin-bottom: 20px;
  filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.5));
  animation: professor-entrance 1s ease-out forwards;
  transform-origin: center bottom;
}

@keyframes professor-entrance {
  0% { 
    transform: translateY(-50px) scale(0.7); 
    opacity: 0; 
  }
  100% { 
    transform: translateY(0) scale(1); 
    opacity: 1; 
  }
}

.dialogue-box {
  width: 100%;
  padding: 40px;
  border: 1px solid var(--glass-border-light);
  scrollbar-color: var(--pokemon-black) var(--pokemon-black);
  scrollbar-width: thin;
  position: relative;
  overflow-y: auto;
  overflow-x: hidden;
  max-height: 60vh;
  backdrop-filter: blur(var(--glass-blur-medium));
  -webkit-backdrop-filter: blur(var(--glass-blur-medium));
  animation: dialogue-reveal 0.5s ease-out forwards;
  transform-origin: top center;
  transition: var(--glass-transition);
}

@keyframes dialogue-reveal {
  0% { 
    transform: scaleY(0.1); 
    opacity: 0; 
  }
  100% { 
    transform: scaleY(1); 
    opacity: 1; 
  }
}

.dialogue-box::before {
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

.typing-text {
  color: white;
  font-family: 'Courier New', monospace;
  font-size: 1.1rem;
  line-height: 1.6;
  white-space: pre-wrap;
  margin: 0;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.8);
}

.skip-button-container {
  margin-top: 42px;
  margin-bottom: 10px;
  width: 100%;
  display: flex;
  justify-content: center;
  animation: button-appear 0.5s ease-out forwards;
}

@keyframes button-appear {
  0% { 
    transform: translateY(20px); 
    opacity: 0; 
  }
  100% { 
    transform: translateY(0); 
    opacity: 1; 
  }
}

.skip-button {
  background: var(--glass-pokemon-red);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.15);
  padding: 15px 30px;
  font-family: 'Courier New', monospace;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: var(--glass-transition);
  border-radius: 30px;
  box-shadow: 0 4px 20px rgba(227, 53, 13, 0.4);
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  gap: 10px;
  backdrop-filter: blur(var(--glass-blur-light));
  -webkit-backdrop-filter: blur(var(--glass-blur-light));
}

.skip-button::before {
  content: '';
  position: absolute;
  top: -10px;
  left: -10px;
  right: -10px;
  bottom: -10px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transform: translateX(-100%);
  transition: transform 0.6s;
  pointer-events: none;
}

.skip-button:hover {
  transform: translateY(-3px) scale(1.03);
  box-shadow: 0 7px 20px rgba(227, 53, 13, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.skip-button:hover::before {
  transform: translateX(100%);
}

.skip-button:active {
  transform: translateY(1px);
  box-shadow: 0 3px 10px rgba(227, 53, 13, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.btn-text {
  position: relative;
  z-index: 2;
}

.btn-icon {
  display: inline-block;
  font-size: 20px;
  animation: arrow-pulse 1.5s infinite;
  position: relative;
  z-index: 2;
}

@keyframes arrow-pulse {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(5px); }
}

/* Animation de transition */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: scale(0.98);
}

.fade-leave-to {
  opacity: 0;
  transform: scale(1.02);
}

/* Styles spécifiques pour mobile */
@media (max-width: 600px) {
  .intro-content {
    padding: 15px;
  }
  
  .dialogue-box {
    padding: 15px;
    max-height: 60vh;
  }
  
  .typing-text {
    font-size: 1rem;
  }
  
  .pokeball-top, .pokeball-bottom {
    width: 80px;
    height: 40px;
  }
  
  .professor-image {
    width: 100px;
    height: 100px;
  }
}
</style>
