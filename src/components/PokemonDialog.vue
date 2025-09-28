<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';

const props = defineProps({
  text: {
    type: String,
    required: true
  },
  speaker: {
    type: String,
    default: ''
  },
  avatar: {
    type: String,
    default: ''
  },
  autoplay: {
    type: Boolean,
    default: true
  },
  typing: {
    type: Boolean,
    default: true
  },
  speed: {
    type: Number,
    default: 50 // millisecondes entre chaque caractère
  }
});

const emit = defineEmits(['complete']);

const displayedText = ref('');
const showCursor = ref(true);
const isComplete = ref(false);
let typingInterval: number | null = null;

// Animation du curseur de texte
setInterval(() => {
  showCursor.value = !showCursor.value;
}, 500);

// Fonction pour afficher progressivement le texte
function typeText() {
  let currentIndex = 0;
  displayedText.value = '';
  isComplete.value = false;
  
  clearInterval(typingInterval as any);
  
  typingInterval = window.setInterval(() => {
    if (currentIndex < props.text.length) {
      displayedText.value += props.text[currentIndex];
      currentIndex++;
    } else {
      clearInterval(typingInterval as any);
      isComplete.value = true;
      emit('complete');
    }
  }, props.speed) as any;
}

// Afficher tout le texte immédiatement
function showAllText() {
  if (!isComplete.value) {
    clearInterval(typingInterval as any);
    displayedText.value = props.text;
    isComplete.value = true;
    emit('complete');
  }
}

// Observer les changements de texte
watch(() => props.text, () => {
  if (props.autoplay && props.typing) {
    typeText();
  } else {
    displayedText.value = props.text;
    isComplete.value = true;
  }
});

// Initialisation
onMounted(() => {
  if (props.autoplay && props.typing) {
    typeText();
  } else {
    displayedText.value = props.text;
    isComplete.value = true;
  }
});
</script>

<template>
  <div class="pokemon-dialog glass-card" @click="showAllText">
    <div class="dialog-frame glass-dialogue-box">
      <!-- Avatar si fourni -->
      <div v-if="avatar" class="dialog-avatar">
        <img :src="avatar" :alt="speaker" class="avatar-image">
      </div>
      
      <div class="dialog-content">
        <!-- Nom du personnage si fourni -->
        <div v-if="speaker" class="dialog-speaker">
          {{ speaker }}
        </div>
        
        <!-- Texte avec effet de machine à écrire -->
        <div class="dialog-text">
          {{ displayedText }}<span v-if="!isComplete && showCursor" class="text-cursor">▶</span>
        </div>
        
        <!-- Indicateur pour continuer -->
        <div v-if="isComplete" class="dialog-continue-indicator">
          ▼
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import '../assets/glassmorphism.css';
.pokemon-dialog {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  cursor: pointer;
  transition: var(--glass-transition);
}

.pokemon-dialog:hover {
  transform: translateY(-3px);
}

.dialog-frame {
  background-color: rgba(33, 33, 33, 0.7);
  border: 1px solid var(--glass-border-light);
  border-radius: 16px;
  padding: 20px;
  position: relative;
  display: flex;
  min-height: 120px;
  box-shadow: 0 8px 32px var(--glass-shadow-strong);
  transition: var(--glass-transition);
  backdrop-filter: blur(var(--glass-blur-medium));
  -webkit-backdrop-filter: blur(var(--glass-blur-medium));
}

.dialog-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid var(--glass-border-light);
  margin-right: 16px;
  background: rgba(0, 0, 0, 0.4);
  flex-shrink: 0;
  box-shadow: 0 4px 12px var(--glass-shadow-medium);
  transition: var(--glass-transition);
  transform: translateZ(0);
}

.dialog-avatar:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 15px var(--glass-shadow-strong);
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.dialog-content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.dialog-speaker {
  background: var(--glass-pokemon-red);
  color: var(--pokemon-white);
  font-weight: bold;
  padding: 6px 14px;
  border-radius: 20px;
  display: inline-block;
  margin-bottom: 10px;
  font-size: 1rem;
  align-self: flex-start;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 2px 10px rgba(255, 0, 0, 0.2);
  backdrop-filter: blur(var(--glass-blur-light));
  -webkit-backdrop-filter: blur(var(--glass-blur-light));
  letter-spacing: 0.02em;
}

.dialog-text {
  color: var(--pokemon-white);
  font-size: 1rem;
  line-height: 1.5;
  font-family: 'Press Start 2P', 'Courier New', monospace;
  font-weight: 400;
  min-height: 3em;
}

.text-cursor {
  animation: blink 0.8s infinite;
  color: var(--pokemon-red);
  font-size: 0.8em;
  vertical-align: middle;
}

.dialog-continue-indicator {
  color: white;
  font-size: 1.2rem;
  position: absolute;
  bottom: 10px;
  right: 20px;
  animation: bounce 1s infinite;
  opacity: 0.8;
  text-shadow: 0 0 5px rgba(255, 255, 255, 0.5);
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(4px); }
}

/* Style pour les appareils mobiles */
@media (max-width: 480px) {
  .dialog-frame {
    padding: 12px;
    min-height: 100px;
  }
  
  .dialog-avatar {
    width: 60px;
    height: 60px;
  }
  
  .dialog-text {
    font-size: 0.9rem;
  }
}
</style>
