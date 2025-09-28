<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';

const props = defineProps({
  earned: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    default: 8
  },
  showAnimation: {
    type: Boolean,
    default: false
  },
  modelValue: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue', 'badge-click']);

// Pour gérer l'état du dialog
const dialogOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

// Liste des badges officiels Pokémon de Kanto
const badgeImages = [
  { 
    name: 'Badge Roche', 
    image: 'https://www.pokepedia.fr/images/a/ab/Badge_Roche_Kanto_LGPE.png',
    description: 'Pour avoir surmonté les premiers obstacles du parcours',
    color: '#b69e31'
  },
  { 
    name: 'Badge Cascade', 
    image: 'https://www.pokepedia.fr/images/6/67/Badge_Cascade_Kanto_LGPE.png',
    description: 'Pour avoir parcouru la ville avec fluidité',
    color: '#5698c4'
  },
  { 
    name: 'Badge Foudre', 
    image: 'https://www.pokepedia.fr/images/9/97/Badge_Foudre_Kanto_LGPE.png',
    description: 'Pour avoir résolu les énigmes avec un esprit éclair',
    color: '#e0bb38'
  },
  { 
    name: 'Badge Prisme', 
    image: 'https://www.pokepedia.fr/images/7/74/Badge_Prisme_Kanto_LGPE.png',
    description: 'Pour avoir découvert les multiples facettes de l\'aventure',
    color: '#c46a97'
  },
  { 
    name: 'Badge Âme', 
    image: 'https://www.pokepedia.fr/images/1/10/Badge_Marais_Kanto_LGPE.png',
    description: 'Pour avoir avancé avec passion et détermination',
    color: '#8d58a3'
  },
  { 
    name: 'Badge Marais', 
    image: 'https://www.pokepedia.fr/images/3/33/Badge_Volcan_Kanto_LGPE.png',
    description: 'Pour avoir traversé les moments difficiles',
    color: '#5292a4'
  },
  { 
    name: 'Badge Volcan', 
    image: 'https://www.pokepedia.fr/images/1/15/Badge_Terre_Kanto_LGPE.png',
    description: 'Pour avoir fait preuve d\'une énergie ardente',
    color: '#e05c3d'
  },
  { 
    name: 'Badge Terre', 
    image: 'https://www.pokepedia.fr/images/e/eb/Badge_%C3%82me_Kanto_LGPE.png',
    description: 'Pour avoir conquis tous les territoires de la chasse',
    color: '#7ab255'
  }
];

// Animation de badge nouvellement obtenu
const animateBadgeIndex = ref(-1);
const selectedBadge = ref(-1);
const showBadgeDetails = ref(false);
const badgeAnimationPlaying = ref(false);
const badgeObtainedSound = new Audio('https://www.myinstants.com/media/sounds/pokemon-level-up.mp3');

// Gérer les clics sur les badges
function handleBadgeClick(index: number) {
  // Seulement pour les badges déjà gagnés
  if (index < props.earned) {
    selectedBadge.value = index;
    showBadgeDetails.value = true;
    emit('badge-click', displayBadges.value[index]);
  }
}

// Fermer les détails du badge
function closeBadgeDetails() {
  showBadgeDetails.value = false;
  // Reset après une courte transition
  setTimeout(() => {
    selectedBadge.value = -1;
  }, 300);
}

// Animation séquentielle pour les badges nouvellement obtenus
function playBadgeObtainedAnimation() {
  if (!props.showAnimation || props.earned === 0 || badgeAnimationPlaying.value) return;
  
  badgeAnimationPlaying.value = true;
  animateBadgeIndex.value = props.earned - 1;
  
  // Jouer le son
  try {
    badgeObtainedSound.currentTime = 0;
    badgeObtainedSound.play();
  } catch (err) {
    console.log('Audio playback error:', err);
  }
  
  setTimeout(() => {
    animateBadgeIndex.value = -1;
    badgeAnimationPlaying.value = false;
  }, 3000);
}

// Calculer les badges à afficher
const displayBadges = computed(() => {
  return badgeImages.slice(0, props.total);
});

// Observer les changements de earned pour déclencher l'animation
watch(() => props.earned, (newVal, oldVal) => {
  if (newVal > oldVal && props.showAnimation && dialogOpen.value) {
    playBadgeObtainedAnimation();
  }
});

// Déclencher l'animation au montage
onMounted(() => {
  if (props.showAnimation && props.earned > 0) {
    setTimeout(() => {
      playBadgeObtainedAnimation();
    }, 800); // Délai pour laisser le temps au dialog de s'ouvrir
  }
});

// Observer l'ouverture du dialogue pour potentiellement jouer l'animation
watch(() => dialogOpen.value, (isOpen) => {
  if (isOpen && props.showAnimation && props.earned > 0 && !badgeAnimationPlaying.value) {
    setTimeout(() => {
      playBadgeObtainedAnimation();
    }, 500);
  }
});
</script>

<template>
  <v-dialog
    v-model="dialogOpen"
    max-width="600px"
    content-class="badge-dialog"
    transition="dialog-bottom-transition"
  >
    <v-card class="pokemon-badges">
      <v-card-title>
        <h3 class="badges-title">Badges</h3>
      </v-card-title>
      
      <v-card-text>
        <div class="badges-container">
          <div 
            v-for="(badge, index) in displayBadges" 
            :key="index"
            class="badge-item"
            :class="{
              'badge-earned': index < earned,
              'badge-animate': index === animateBadgeIndex,
              'badge-selected': index === selectedBadge && showBadgeDetails
            }"
            @click="handleBadgeClick(index)"
          >
            <div class="badge-wrapper">
              <img 
                :src="badge.image" 
                :alt="badge.name" 
                class="badge-image"
              />
              <div v-if="index === animateBadgeIndex" class="badge-shine"></div>
              <div v-if="index < earned" class="badge-glow" :style="{ '--badge-color': badge.color }"></div>
            </div>
            <span class="badge-name">{{ badge.name }}</span>
            
            <!-- Indicateur cliquable pour badges obtenus -->
            <div v-if="index < earned" class="badge-click-indicator">
              <v-icon size="x-small" color="white">mdi-information-outline</v-icon>
            </div>
          </div>
        </div>
        
        <div class="badges-progress">
          <div class="progress-header">
            <span class="progress-title">Progression</span>
            <span class="progress-text">{{ earned }}/{{ displayBadges.length }}</span>
          </div>
          <div class="progress-bar">
            <div 
              class="progress-fill"
              :style="{ width: `${(earned / displayBadges.length) * 100}%` }"
            >
              <div class="progress-shine"></div>
            </div>
            <div 
              v-for="index in displayBadges.length" 
              :key="index"
              class="progress-step"
              :class="{ 'step-completed': index <= earned }"
              :style="{ left: `${((index - 1) / (displayBadges.length - 1)) * 100}%` }"
            ></div>
          </div>
          <div class="progress-percentage">{{ Math.round((earned / displayBadges.length) * 100) }}% complété</div>
        </div>
      </v-card-text>
      
      <!-- Détails du badge sélectionné -->
      <v-dialog v-model="showBadgeDetails" max-width="400px" transition="dialog-bottom-transition" content-class="badge-detail-dialog">
        <v-card v-if="selectedBadge >= 0" class="badge-detail-card" :style="{ '--badge-detail-color': displayBadges[selectedBadge].color }">
          <div class="badge-detail-header" :style="{ backgroundColor: displayBadges[selectedBadge].color }">
            <div class="badge-detail-image-container">
              <img 
                :src="displayBadges[selectedBadge].image" 
                :alt="displayBadges[selectedBadge].name"
                class="badge-detail-image"
              />
            </div>
          </div>
          
          <v-card-title class="badge-detail-title text-center pt-4">
            {{ displayBadges[selectedBadge].name }}
          </v-card-title>
          
          <v-card-text class="badge-detail-text pa-4 text-center">
            <p>« {{ displayBadges[selectedBadge].description }} »</p>
            <div class="badge-achievement mt-4">
              <v-icon color="amber" class="mr-2">mdi-trophy-award</v-icon>
              <span>Badge obtenu !</span>
            </div>
          </v-card-text>
          
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" variant="elevated" class="close-detail-button" @click="closeBadgeDetails">
              Fermer
            </v-btn>
            <v-spacer></v-spacer>
          </v-card-actions>
        </v-card>
      </v-dialog>
      
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="red-darken-1"
          variant="elevated"
          class="close-button"
          @click="dialogOpen = false"
        >
          Fermer
        </v-btn>
        <v-spacer></v-spacer>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.pokemon-badges {
  background-color: var(--pokemon-gray-100);
  border-radius: 12px;
  padding: 16px;
  border: 2px solid var(--pokemon-red);
  box-shadow: 0 0 15px rgba(255, 61, 40, 0.2);
}

.badges-title {
  color: var(--pokemon-red);
  text-align: center;
  margin-top: 0;
  margin-bottom: 16px;
  font-size: 1.2rem;
  text-shadow: 0 0 5px rgba(255, 61, 40, 0.5);
}

.badges-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

.badge-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  opacity: 0.4;
  filter: grayscale(1);
  transition: all 0.3s ease;
  position: relative;
}

.badge-earned {
  opacity: 1;
  filter: grayscale(0);
}

.badge-animate {
  animation: badge-obtained 3s ease-in-out;
}

.badge-selected {
  transform: scale(1.15);
  z-index: 10;
}

.badge-wrapper {
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  margin-bottom: 8px;
  border: 2px solid transparent;
  cursor: default;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 0 0 rgba(0, 0, 0, 0.5);
}

.badge-earned .badge-wrapper {
  cursor: pointer;
}

.badge-earned .badge-wrapper:hover {
  transform: scale(1.1) rotate(5deg);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.badge-click-indicator {
  position: absolute;
  bottom: 15px;
  right: 0;
  background-color: var(--pokemon-red);
  color: white;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  opacity: 0;
  transform: scale(0);
  animation: pulse-indicator 2s infinite;
  transition: all 0.3s ease;
}

.badge-earned:hover .badge-click-indicator {
  opacity: 1;
  transform: scale(1);
}

/* Glow autour des badges gagnés */
.badge-glow {
  position: absolute;
  top: -4px;
  left: -4px;
  right: -4px;
  bottom: -4px;
  border-radius: 50%;
  background: transparent;
  box-shadow: 0 0 10px var(--badge-color, var(--pokemon-red));
  opacity: 0.7;
  z-index: -1;
  animation: glow-pulse 2s infinite;
}

.badge-earned .badge-wrapper {
  background-color: var(--pokemon-black);
  border-color: var(--pokemon-red);
}

.badge-image {
  width: 40px;
  height: 40px;
  object-fit: contain;
}

.badge-name {
  font-size: 0.75rem;
  color: var(--pokemon-white);
  text-align: center;
}

.badge-shine {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    transparent 20%,
    rgba(255, 255, 255, 0.8) 30%,
    transparent 40%
  );
  animation: shine 1.5s infinite;
  border-radius: 50%;
  pointer-events: none;
}

.badges-progress {
  margin-top: 24px;
  background-color: var(--pokemon-gray-200);
  padding: 16px;
  border-radius: 8px;
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.2);
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.progress-title {
  color: var(--pokemon-white);
  font-weight: bold;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.progress-text {
  color: var(--pokemon-white);
  font-size: 0.9rem;
  font-weight: bold;
  padding: 3px 8px;
  background-color: var(--pokemon-gray-300);
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.progress-bar {
  height: 12px;
  background-color: var(--pokemon-gray-300);
  border-radius: 10px;
  overflow: hidden;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.3);
  position: relative;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(to right, #ff6b6b, var(--pokemon-red));
  border-radius: 10px;
  transition: width 1s cubic-bezier(0.22, 1, 0.36, 1);
  position: relative;
  overflow: hidden;
  box-shadow: 0 0 8px var(--pokemon-red);
}

.progress-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    to right,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.6) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  animation: shine 2s infinite;
}

.progress-step {
  width: 8px;
  height: 8px;
  background-color: var(--pokemon-gray-300);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  position: absolute;
  top: 1px;
  transform: translateX(-50%);
  z-index: 2;
  transition: background-color 0.5s ease;
}

.step-completed {
  background-color: #ffd700; /* Couleur or pour les badges obtenus */
  box-shadow: 0 0 5px #ffd700;
  border-color: rgba(255, 255, 255, 0.7);
}

.progress-percentage {
  text-align: center;
  color: var(--pokemon-white);
  font-size: 0.8rem;
  margin-top: 8px;
  opacity: 0.8;
}

@keyframes shine {
  0% { left: -100%; }
  100% { left: 100%; }
}

@keyframes badge-obtained {
  0%, 100% { transform: scale(1); }
  20% { transform: scale(1.5); }
  40% { transform: scale(1.2) rotate(10deg); }
  60% { transform: scale(1.2) rotate(-10deg); }
  80% { transform: scale(1.1); }
}

@keyframes shine {
  0% { transform: translateX(-150%) rotate(45deg); }
  100% { transform: translateX(150%) rotate(45deg); }
}

/* Style pour le dialogue des détails du badge */
.badge-detail-card {
  background-color: var(--pokemon-gray-100);
  border-radius: 12px;
  border: 3px solid var(--badge-detail-color, var(--pokemon-red));
  overflow: hidden;
  box-shadow: 0 0 20px var(--badge-detail-color, rgba(255, 61, 40, 0.5));
}

.badge-detail-header {
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.badge-detail-image-container {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.2);
  border: 3px solid white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.4);
}

.badge-detail-image {
  width: 70px;
  height: 70px;
  object-fit: contain;
  animation: float 3s infinite ease-in-out;
}

.badge-detail-title {
  font-size: 1.4rem;
  color: var(--badge-detail-color, var(--pokemon-red));
  font-weight: 700;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.badge-detail-text {
  color: var(--pokemon-white);
  font-size: 1.1rem;
  line-height: 1.5;
}

.badge-achievement {
  display: inline-flex;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.2);
  padding: 8px 16px;
  border-radius: 20px;
  color: var(--pokemon-white);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  animation: pulse 2s infinite;
}

/* Animation pour l'indicateur de clic */
@keyframes pulse-indicator {
  0% { transform: scale(0.8); opacity: 0.5; }
  50% { transform: scale(1.2); opacity: 1; }
  100% { transform: scale(0.8); opacity: 0.5; }
}

/* Animation pour les badges en détail */
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px) rotate(5deg); }
}

/* Animation de pulsation pour la lueur */
@keyframes glow-pulse {
  0%, 100% { opacity: 0.5; box-shadow: 0 0 5px var(--badge-color, var(--pokemon-red)); }
  50% { opacity: 1; box-shadow: 0 0 15px var(--badge-color, var(--pokemon-red)); }
}

/* Animation de pulsation pour l'accomplissement */
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

/* Responsive */
@media (max-width: 480px) {
  .badges-container {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .badge-wrapper {
    width: 50px;
    height: 50px;
  }
  
  .badge-image {
    width: 30px;
    height: 30px;
  }
  
  .badge-detail-image-container {
    width: 80px;
    height: 80px;
  }
  
  .badge-detail-image {
    width: 50px;
    height: 50px;
  }
}
</style>
