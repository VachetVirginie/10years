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
  }
});

// Liste des badges officiels Pokémon de Kanto
const badgeImages = [
  { name: 'Badge Roche', image: 'https://archives.bulbagarden.net/media/upload/d/dd/Boulder_Badge.png' },
  { name: 'Badge Cascade', image: 'https://archives.bulbagarden.net/media/upload/9/9c/Cascade_Badge.png' },
  { name: 'Badge Foudre', image: 'https://archives.bulbagarden.net/media/upload/a/a6/Thunder_Badge.png' },
  { name: 'Badge Prisme', image: 'https://archives.bulbagarden.net/media/upload/b/b5/Rainbow_Badge.png' },
  { name: 'Badge Âme', image: 'https://archives.bulbagarden.net/media/upload/7/7d/Soul_Badge.png' },
  { name: 'Badge Marais', image: 'https://archives.bulbagarden.net/media/upload/9/9d/Marsh_Badge.png' },
  { name: 'Badge Volcan', image: 'https://archives.bulbagarden.net/media/upload/1/12/Volcano_Badge.png' },
  { name: 'Badge Terre', image: 'https://archives.bulbagarden.net/media/upload/7/78/Earth_Badge.png' }
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
  <div class="pokemon-badges">
    <h3 class="badges-title">Badges</h3>
    
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
      <span class="progress-text">{{ earned }}/{{ displayBadges.length }}</span>
      <div class="progress-bar">
        <div 
          class="progress-fill"
          :style="{ width: `${(earned / displayBadges.length) * 100}%` }"
        ></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pokemon-badges {
  background-color: var(--pokemon-gray-100);
  border-radius: 12px;
  padding: 16px;
  border: 2px solid var(--pokemon-red);
  box-shadow: 0 0 15px rgba(255, 61, 40, 0.2);
  max-width: 600px;
  margin: 0 auto;
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
  margin-top: 16px;
}

.progress-text {
  display: block;
  text-align: center;
  color: var(--pokemon-white);
  font-size: 0.9rem;
  margin-bottom: 8px;
}

.progress-bar {
  height: 8px;
  background-color: var(--pokemon-gray-300);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--pokemon-red);
  border-radius: 4px;
  transition: width 0.5s ease;
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
