<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

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

const emit = defineEmits(['update:modelValue']);

// Pour gérer l'état du dialog
const dialogOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

// Liste des badges officiels Pokémon de Kanto
const badgeImages = [
  { name: 'Badge Roche', image: 'https://www.pokepedia.fr/images/a/ab/Badge_Roche_Kanto_LGPE.png' },
  { name: 'Badge Cascade', image: 'https://www.pokepedia.fr/images/6/67/Badge_Cascade_Kanto_LGPE.png' },
  { name: 'Badge Foudre', image: 'https://www.pokepedia.fr/images/9/97/Badge_Foudre_Kanto_LGPE.png' },
  { name: 'Badge Prisme', image: 'https://www.pokepedia.fr/images/7/74/Badge_Prisme_Kanto_LGPE.png' },
  { name: 'Badge Âme', image: 'https://www.pokepedia.fr/images/1/10/Badge_Marais_Kanto_LGPE.png' },
  { name: 'Badge Marais', image: 'https://www.pokepedia.fr/images/3/33/Badge_Volcan_Kanto_LGPE.png' },
  { name: 'Badge Volcan', image: 'https://www.pokepedia.fr/images/1/15/Badge_Terre_Kanto_LGPE.png' },
  { name: 'Badge Terre', image: 'https://www.pokepedia.fr/images/e/eb/Badge_%C3%82me_Kanto_LGPE.png' }
];

// Animation de badge nouvellement obtenu
const animateBadgeIndex = ref(-1);

// Démarrer l'animation pour le dernier badge gagné
onMounted(() => {
  if (props.showAnimation && props.earned > 0) {
    animateBadgeIndex.value = props.earned - 1;
    setTimeout(() => {
      animateBadgeIndex.value = -1;
    }, 3000);
  }
});

// Calculer les badges à afficher
const displayBadges = computed(() => {
  return badgeImages.slice(0, props.total);
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
          'badge-animate': index === animateBadgeIndex
        }"
      >
        <div class="badge-wrapper">
          <img 
            :src="badge.image" 
            :alt="badge.name" 
            class="badge-image"
          />
          <div v-if="index === animateBadgeIndex" class="badge-shine"></div>
        </div>
        <span class="badge-name">{{ badge.name }}</span>
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
}
</style>
