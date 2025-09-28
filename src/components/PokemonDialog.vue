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
  <div class="pokemon-dialog" @click="showAllText">
    <div class="dialog-frame glass-dark depth-shadow">
      <!-- Avatar si fourni -->
      <div v-if="avatar" class="dialog-avatar">
        <img :src="avatar" :alt="speaker" class="avatar-image">
      </div>
      
      <div class="dialog-content">
        <!-- Nom du personnage si fourni -->
        <div v-if="speaker" class="dialog-speaker glass-light">
          {{ speaker }}
        </div>
        
        <!-- Texte avec effet de machine à écrire -->
        <div class="dialog-text glass-card">
          {{ displayedText }}<span v-if="!isComplete && showCursor" class="text-cursor">▶</span>
        </div>
        
        <!-- Indicateur pour continuer -->
        <div v-if="isComplete" class="dialog-continue-indicator glow-red">
          ▼
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pokemon-dialog {
  width: 100%;
  max-width: 650px;
  margin: 0 auto;
  cursor: pointer;
  position: relative;
}

/* Dialog frame with glassmorphism */
.dialog-frame {
  background: linear-gradient(135deg, rgba(20, 20, 20, 0.7), rgba(40, 40, 40, 0.7));
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--border-radius-xl);
  padding: 20px;
  position: relative;
  display: flex;
  min-height: 140px;
  box-shadow: var(--shadow-xl), 0 0 15px rgba(255, 61, 40, 0.3);
  overflow: hidden;
}

/* Shine effect for dialog */
.dialog-frame::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.1),
    transparent
  );
  z-index: 0;
  animation: frame-shine 8s infinite linear;
}

@keyframes frame-shine {
  0% { left: -100%; }
  50% { left: 100%; }
  100% { left: 100%; }
}

/* Avatar styling */
.dialog-avatar {
  width: 85px;
  height: 85px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid var(--pokemon-red);
  margin-right: 20px;
  background: rgba(0, 0, 0, 0.5);
  flex-shrink: 0;
  position: relative;
  box-shadow: var(--shadow-md), 0 0 15px rgba(255, 61, 40, 0.3);
  z-index: 1;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.3));
}

.dialog-content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
}

/* Speaker name with glassmorphism */
.dialog-speaker {
  background: rgba(255, 61, 40, 0.7);
  color: var(--pokemon-white);
  font-weight: 700;
  padding: 5px 15px;
  border-radius: var(--border-radius-full);
  display: inline-block;
  margin-bottom: 12px;
  font-size: 1rem;
  align-self: flex-start;
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  box-shadow: var(--shadow-md);
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

/* Dialog text with glass effect */
.dialog-text {
  color: var(--pokemon-white);
  font-size: 1.05rem;
  line-height: 1.6;
  font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
  font-weight: 400;
  min-height: 3em;
  padding: 15px;
  border-radius: var(--border-radius-lg);
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  box-shadow: var(--shadow-sm);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

/* Typing cursor animation */
.text-cursor {
  animation: blink 0.8s infinite;
  color: var(--pokemon-red);
  font-size: 0.8em;
  vertical-align: middle;
  filter: drop-shadow(0 0 5px rgba(255, 61, 40, 0.5));
}

/* Continue indicator with glow effect */
.dialog-continue-indicator {
  color: var(--pokemon-red);
  font-size: 1.3rem;
  position: absolute;
  bottom: 12px;
  right: 20px;
  animation: bounce 1s infinite;
  text-shadow: 0 0 10px var(--pokemon-red);
}

.glow-red {
  filter: drop-shadow(0 0 5px rgba(255, 61, 40, 0.7));
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(6px); }
}

/* Style pour les appareils mobiles */
@media (max-width: 768px) {
  .dialog-frame {
    padding: 18px;
  }
}

@media (max-width: 480px) {
  .dialog-frame {
    padding: 15px;
    min-height: 120px;
    border-radius: var(--border-radius-lg);
  }
  
  .dialog-avatar {
    width: 65px;
    height: 65px;
    margin-right: 15px;
  }
  
  .dialog-text {
    font-size: 0.95rem;
    padding: 12px;
  }
  
  .dialog-speaker {
    padding: 4px 12px;
    font-size: 0.9rem;
    margin-bottom: 10px;
  }
  
  .dialog-continue-indicator {
    font-size: 1.1rem;
    bottom: 10px;
    right: 15px;
  }
}
</style>