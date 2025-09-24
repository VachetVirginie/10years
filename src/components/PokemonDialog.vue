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
    <div class="dialog-frame">
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
.pokemon-dialog {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  cursor: pointer;
}

.dialog-frame {
  background-color: var(--pokemon-gray-100);
  border: 4px solid var(--pokemon-white);
  border-radius: 10px;
  padding: 16px;
  position: relative;
  display: flex;
  min-height: 120px;
  box-shadow: 0 0 0 4px var(--pokemon-black), 0 0 15px rgba(255, 61, 40, 0.5);
}

.dialog-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid var(--pokemon-red);
  margin-right: 16px;
  background: var(--pokemon-black);
  flex-shrink: 0;
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
  background-color: var(--pokemon-red);
  color: var(--pokemon-white);
  font-weight: bold;
  padding: 4px 12px;
  border-radius: 12px;
  display: inline-block;
  margin-bottom: 8px;
  font-size: 1rem;
  align-self: flex-start;
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
  color: var(--pokemon-red);
  font-size: 1.2rem;
  position: absolute;
  bottom: 8px;
  right: 16px;
  animation: bounce 1s infinite;
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
