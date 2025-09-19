<script setup lang="ts">
import { ref, onMounted } from 'vue'

const props = defineProps({
  duration: {
    type: Number,
    default: 10000 // 10 secondes par défaut pour lire le texte
  }
})

const emit = defineEmits(['complete'])

// État pour gérer la visibilité et le texte progressif
const visible = ref(true)
const displayedText = ref('')

// Texte complet de l'introduction
const fullText = `
Bonjour, Soso ! Enfin te voilà… Je savais que je pouvais compter sur toi.
Une étrange énigme a surgi dans les rues de Lyon. Comme des Pokémon rares, des indices se sont éparpillés aux quatre coins de la ville.

Pour réussir ta mission, tu devras faire preuve de courage, de stratégie et d’un esprit affûté, comme lors d’un combat d’arène.
Chaque indice que tu découvriras sera comme un Pokémon à capturer, et chaque énigme résolue te rapprochera du trésor caché.

Souviens-toi, Soso :
👉 Une grande dresseuse observe toujours son environnement.
👉 Une aventurière déterminée ne recule jamais devant le défi.

Ta quête commence maintenant. Le destin de cette aventure est entre tes mains… Et qui sait ? Peut-être qu’au bout de cette route se cache un Pokémon légendaire ! »

⚡️ Alors, jeune dresseuse… es-tu prête à partir à l’aventure ?
`

// Effet de frappe progressive du texte
onMounted(() => {
  const textArray = fullText.split('')
  let currentIndex = 0
  
  // Vitesse d'affichage des caractères (en ms)
  const typingSpeed = 50
  
  const typingInterval = setInterval(() => {
    if (currentIndex < textArray.length) {
      displayedText.value += textArray[currentIndex]
      currentIndex++
    } else {
      clearInterval(typingInterval)
      // L'animation est terminée, mais on attend que l'utilisateur clique sur le bouton
      // Ne rien faire ici, la fermeture se fait via le bouton
    }
  }, typingSpeed)
})

// Fonction pour fermer l'écran d'intro
const closeIntro = () => {
  visible.value = false
  emit('complete')
}
</script>

<template>
  <transition name="fade">
    <div v-if="visible" class="intro-container">
      <div class="intro-text-wrapper">
        <pre class="typing-text">{{ displayedText }}</pre>
        
        <div v-if="displayedText.includes('Prépare-toi')" class="skip-button-container">
          <button @click="closeIntro" class="skip-button">
            COMMENCER LA MISSION
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.intro-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: black;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9998;
  padding: 20px;
}

.intro-text-wrapper {
  max-width: 600px;
  width: 90%;
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
