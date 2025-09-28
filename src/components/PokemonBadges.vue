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
    overlay-opacity="0.9"
  >
    <v-card class="pokemon-badges glass-dark depth-shadow">
      <div class="badge-background-decoration"></div>
      
      <v-card-title>
        <h3 class="badges-title">Collection de Badges</h3>
        <div class="glass-separator"></div>
      </v-card-title>
      
      <v-card-text>
        <div class="badges-container">
          <div 
            v-for="(badge, index) in displayBadges" 
            :key="index"
            class="badge-item hover-lift click-feedback"
            :class="{
              'badge-earned': index < earned,
              'badge-animate': index === animateBadgeIndex,
              'badge-selected': index === selectedBadge && showBadgeDetails
            }"
            @click="handleBadgeClick(index)"
          >
            <div class="badge-wrapper glass-card depth-shadow" :style="{ '--badge-color': badge.color }">
              <img 
                :src="badge.image" 
                :alt="badge.name" 
                class="badge-image"
              />
              <div v-if="index === animateBadgeIndex" class="badge-shine"></div>
              <div v-if="index < earned" class="badge-glow" :style="{ '--badge-color': badge.color }"></div>
              
              <!-- Indicateur de badge complet -->
              <div v-if="index < earned" class="badge-complete-indicator" :style="{ '--badge-color': badge.color }">
                <v-icon size="x-small" color="white">mdi-check</v-icon>
              </div>
            </div>
            <span class="badge-name">{{ badge.name }}</span>
            
            <!-- Indicateur cliquable pour badges obtenus -->
            <div v-if="index < earned" class="badge-click-indicator glass-light">
              <v-icon size="x-small" color="white">mdi-information-outline</v-icon>
            </div>
          </div>
        </div>
        
        <div class="badges-progress glass-card">
          <div class="progress-header">
            <span class="progress-title">Progression</span>
            <span class="progress-text glass-light">{{ earned }}/{{ displayBadges.length }}</span>
          </div>
          
          <!-- Barre de progression avec animation -->
          <div class="progress-bar">
            <div 
              class="progress-fill progress-bar-animated"
              :style="{ width: `${(earned / displayBadges.length) * 100}%` }"
            >
              <div class="progress-shine"></div>
              <div class="progress-particles" v-if="earned > displayBadges.length / 2"></div>
            </div>
            
            <!-- Indicateurs de progression -->
            <div 
              v-for="index in displayBadges.length" 
              :key="index"
              class="progress-step"
              :class="{ 'step-completed': index <= earned }"
              :style="{ left: `${((index - 1) / (displayBadges.length - 1)) * 100}%` }"
            ></div>
          </div>
          
          <!-- Pourcentage de progression -->
          <div class="progress-percentage glass-light" :class="{'complete': earned === displayBadges.length}">
            {{ Math.round((earned / displayBadges.length) * 100) }}% complété
            <v-icon v-if="earned === displayBadges.length" color="amber" size="x-small" class="ml-1">mdi-star</v-icon>
          </div>
        </div>
      </v-card-text>
      
      <!-- Détails du badge sélectionné avec glassmorphism -->
      <v-dialog v-model="showBadgeDetails" max-width="400px" transition="scale-transition" content-class="badge-detail-dialog">
        <v-card v-if="selectedBadge >= 0" class="badge-detail-card glass-dark depth-shadow-intense" :style="{ '--badge-detail-color': displayBadges[selectedBadge].color }">
          <div class="badge-detail-header" :style="{ background: `linear-gradient(135deg, ${displayBadges[selectedBadge].color}CC, ${displayBadges[selectedBadge].color}99)` }">
            <div class="badge-detail-image-container glass-light">
              <img 
                :src="displayBadges[selectedBadge].image" 
                :alt="displayBadges[selectedBadge].name"
                class="badge-detail-image floating"
              />
            </div>
          </div>
          
          <v-card-title class="badge-detail-title text-center pt-4">
            {{ displayBadges[selectedBadge].name }}
          </v-card-title>
          
          <div class="glass-separator"></div>
          
          <v-card-text class="badge-detail-text pa-4 text-center">
            <p class="description glass-card">« {{ displayBadges[selectedBadge].description }} »</p>
            <div class="badge-achievement glass-light mt-4 glow" :style="{'--glow-color': displayBadges[selectedBadge].color}">
              <v-icon color="amber" class="mr-2 pulsing-icon">mdi-trophy-award</v-icon>
              <span>Badge obtenu !</span>
            </div>
          </v-card-text>
          
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" variant="elevated" class="close-detail-button glass-btn hover-lift click-feedback" @click="closeBadgeDetails">
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
          class="close-button glass-btn hover-lift click-feedback touch-target"
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
/* Main Badge Dialog */
.pokemon-badges {
  background: linear-gradient(135deg, rgba(20, 20, 20, 0.7), rgba(40, 40, 40, 0.7));
  border-radius: var(--border-radius-xl);
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
  position: relative;
}

/* Background decoration with particles effect */
.badge-background-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: radial-gradient(circle at 20% 80%, rgba(255, 61, 40, 0.1) 0%, transparent 50%),
                    radial-gradient(circle at 80% 20%, rgba(255, 215, 0, 0.1) 0%, transparent 50%);
  z-index: 0;
  pointer-events: none;
}

.badges-title {
  color: var(--pokemon-white);
  text-align: center;
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 1.4rem;
  font-weight: 700;
  text-shadow: 0 0 10px rgba(255, 61, 40, 0.5);
  letter-spacing: -0.01em;
  position: relative;
  z-index: 1;
}

/* Badge grid container */
.badges-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin: 20px 0;
  position: relative;
  z-index: 1;
}

.badge-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  opacity: 0.4;
  filter: grayscale(1);
  transition: all 0.3s var(--transition-bounce);
  position: relative;
  cursor: default;
  padding: 5px;
}

.badge-earned {
  opacity: 1;
  filter: grayscale(0);
}

.badge-animate {
  animation: badge-obtained 3s var(--transition-bounce);
  z-index: 5;
}

.badge-selected {
  transform: scale(1.15);
  z-index: 10;
}

/* Badge circular wrapper */
.badge-wrapper {
  background-color: rgba(20, 20, 20, 0.6);
  border-radius: 50%;
  width: 70px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  margin-bottom: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  cursor: default;
  overflow: hidden;
}

.badge-earned .badge-wrapper {
  cursor: pointer;
  border-color: rgba(255, 255, 255, 0.2);
}

.badge-earned .badge-wrapper:hover {
  transform: scale(1.1) rotate(5deg);
}

/* Badge complete indicator checkmark */
.badge-complete-indicator {
  position: absolute;
  bottom: 0;
  right: 0;
  background-color: var(--badge-color, var(--pokemon-red));
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 10px var(--badge-color, rgba(255, 61, 40, 0.5));
  z-index: 2;
  border: 1px solid rgba(255, 255, 255, 0.5);
}

/* Information indicator */
.badge-click-indicator {
  position: absolute;
  top: 0;
  right: 0;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  z-index: 3;
  opacity: 0;
  transform: scale(0);
  animation: pulse-indicator 2s infinite;
  transition: all 0.3s ease;
}

.badge-earned:hover .badge-click-indicator {
  opacity: 1;
  transform: scale(1);
}

/* Glow effect for earned badges */
.badge-glow {
  position: absolute;
  top: -4px;
  left: -4px;
  right: -4px;
  bottom: -4px;
  border-radius: 50%;
  background: transparent;
  box-shadow: 0 0 15px var(--badge-color, var(--pokemon-red));
  opacity: 0.6;
  z-index: -1;
  animation: glow-pulse 2s infinite ease-in-out;
}

/* Badge image */
.badge-image {
  width: 45px;
  height: 45px;
  object-fit: contain;
  transition: transform 0.3s ease;
  filter: drop-shadow(0 0 3px rgba(255, 255, 255, 0.3));
}

.badge-earned .badge-image {
  animation: floating-subtle 5s infinite ease-in-out;
}

.badge-name {
  font-size: 0.8rem;
  color: var(--pokemon-white);
  text-align: center;
  margin-top: 5px;
  font-weight: 500;
  transition: opacity 0.3s ease;
  max-width: 90px;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
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
  z-index: 3;
}

/* Progress section with glassmorphism */
.badges-progress {
  margin-top: 24px;
  padding: 20px;
  border-radius: var(--border-radius-lg);
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background-color: rgba(30, 30, 30, 0.4);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.progress-title {
  color: var(--pokemon-white);
  font-weight: 700;
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.progress-text {
  color: var(--pokemon-white);
  font-size: 0.9rem;
  font-weight: 600;
  padding: 5px 12px;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  background: rgba(255, 255, 255, 0.1);
}

/* Progress bar with animated fill */
.progress-bar {
  height: 14px;
  background-color: rgba(30, 30, 30, 0.6);
  border-radius: 7px;
  overflow: hidden;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.5);
  position: relative;
  margin-bottom: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, rgba(255, 61, 40, 0.6), rgba(255, 61, 40, 0.9));
  border-radius: 7px;
  transition: width 1s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  overflow: hidden;
  box-shadow: 0 0 10px rgba(255, 61, 40, 0.5);
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
  animation: progress-shine 2s infinite linear;
}

/* Particles animation for progress bar */
.progress-particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.progress-particles::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background-image: 
    radial-gradient(circle at 30% 60%, rgba(255, 255, 255, 0.8) 0.2px, transparent 0.2px),
    radial-gradient(circle at 70% 40%, rgba(255, 255, 255, 0.7) 0.2px, transparent 0.2px),
    radial-gradient(circle at 40% 20%, rgba(255, 255, 255, 0.6) 0.2px, transparent 0.2px);
  background-size: 15px 15px;
  animation: particles-float 3s infinite linear;
}

/* Progress step indicators */
.progress-step {
  width: 5px;
  height: 14px;
  background-color: rgba(50, 50, 50, 0.5);
  border-radius: 2.5px;
  position: absolute;
  top: 0;
  transform: translateX(-50%);
  z-index: 2;
  transition: all 0.5s var(--transition-bounce);
}

.step-completed {
  background-color: rgba(255, 215, 0, 0.9); /* Gold color for completed steps */
  box-shadow: 0 0 8px rgba(255, 215, 0, 0.7);
}

/* Progress percentage display */
.progress-percentage {
  text-align: center;
  color: var(--pokemon-white);
  font-size: 0.85rem;
  font-weight: 500;
  margin-top: 10px;
  padding: 4px 12px;
  display: inline-block;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
}

.progress-percentage.complete {
  animation: pulse-glow 2s infinite;
  color: #ffd700;
  font-weight: 700;
}

@keyframes shine {
  0% { transform: translateX(-150%) rotate(45deg); }
  100% { transform: translateX(150%) rotate(45deg); }
}

@keyframes progress-shine {
  0% { left: -100%; }
  100% { left: 100%; }
}

@keyframes particles-float {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes badge-obtained {
  0%, 100% { transform: scale(1); }
  20% { transform: scale(1.5); }
  40% { transform: scale(1.2) rotate(10deg); }
  60% { transform: scale(1.2) rotate(-10deg); }
  80% { transform: scale(1.1); }
}

@keyframes floating-subtle {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px) rotate(2deg); }
}

@keyframes glow-pulse {
  0%, 100% { opacity: 0.6; box-shadow: 0 0 10px var(--badge-color, var(--pokemon-red)); }
  50% { opacity: 1; box-shadow: 0 0 20px var(--badge-color, var(--pokemon-red)); }
}

@keyframes pulse-glow {
  0%, 100% { text-shadow: 0 0 5px rgba(255, 215, 0, 0.5); }
  50% { text-shadow: 0 0 15px rgba(255, 215, 0, 0.8); }
}

/* Style pour le dialogue des détails du badge */
.badge-detail-card {
  background: linear-gradient(135deg, rgba(20, 20, 20, 0.6), rgba(30, 30, 30, 0.8));
  border-radius: var(--border-radius-xl);
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3), 0 0 20px var(--badge-detail-color, rgba(255, 61, 40, 0.3));
  position: relative;
}

.badge-detail-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--badge-detail-color), transparent);
  opacity: 0.5;
}

.badge-detail-header {
  padding: 30px 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.badge-detail-image-container {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 30px var(--badge-detail-color, rgba(255, 61, 40, 0.5));
  position: relative;
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  z-index: 1;
}

.badge-detail-image {
  width: 80px;
  height: 80px;
  object-fit: contain;
  filter: drop-shadow(0 2px 5px rgba(0, 0, 0, 0.2));
}

.badge-detail-title {
  font-size: 1.6rem;
  color: var(--badge-detail-color, var(--pokemon-red));
  font-weight: 700;
  text-shadow: 0 0 10px var(--badge-detail-color, rgba(255, 61, 40, 0.3));
  letter-spacing: -0.01em;
}

.badge-detail-text {
  color: var(--pokemon-white);
  font-size: 1.1rem;
  line-height: 1.6;
}

.description {
  padding: 15px;
  border-radius: var(--border-radius-lg);
  margin: 0 0 20px;
  font-style: italic;
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  background: rgba(255, 255, 255, 0.05);
  position: relative;
}

.badge-achievement {
  display: inline-flex;
  align-items: center;
  padding: 10px 20px;
  border-radius: var(--border-radius-xl);
  color: var(--pokemon-white);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  font-weight: 600;
}

.badge-achievement.glow {
  box-shadow: 0 0 15px var(--glow-color, rgba(255, 215, 0, 0.5));
}

.pulsing-icon {
  animation: pulse 1.5s infinite ease-in-out;
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
@media (max-width: 768px) {
  .badges-container {
    grid-template-columns: repeat(4, 1fr);
    gap: 15px;
  }
  
  .badge-wrapper {
    width: 60px;
    height: 60px;
  }
  
  .badge-image {
    width: 40px;
    height: 40px;
  }
  
  .badge-detail-image-container {
    width: 100px;
    height: 100px;
  }
  
  .badge-detail-image {
    width: 65px;
    height: 65px;
  }
  
  .progress-step {
    width: 4px;
    height: 12px;
  }
}

@media (max-width: 480px) {
  .badges-container {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  
  .badge-wrapper {
    width: 55px;
    height: 55px;
  }
  
  .badge-image {
    width: 35px;
    height: 35px;
  }
  
  .badge-name {
    font-size: 0.75rem;
  }
  
  .badge-detail-card {
    border-radius: var(--border-radius-lg);
  }
  
  .badge-detail-header {
    padding: 20px 15px;
  }
  
  .badge-detail-image-container {
    width: 80px;
    height: 80px;
  }
  
  .badge-detail-image {
    width: 50px;
    height: 50px;
  }
  
  .badge-detail-title {
    font-size: 1.3rem;
  }
  
  .badge-detail-text {
    font-size: 0.95rem;
  }
  
  .description {
    padding: 10px;
  }
  
  .badge-achievement {
    padding: 8px 15px;
    font-size: 0.9rem;
  }
  
  .progress-bar {
    height: 12px;
  }
  
  .progress-step {
    width: 3px;
    height: 12px;
  }
}
</style>
