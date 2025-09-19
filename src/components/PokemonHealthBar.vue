<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  current: {
    type: Number,
    required: true
  },
  max: {
    type: Number,
    required: true
  },
  label: {
    type: String,
    default: 'HP'
  },
  name: {
    type: String,
    default: 'JOUEUR'
  },
  level: {
    type: Number,
    default: 1
  },
  animated: {
    type: Boolean,
    default: true
  }
});

// Calcul du pourcentage de santé restant
const healthPercent = computed(() => {
  const percent = (props.current / props.max) * 100;
  return Math.max(0, Math.min(100, percent)); // Limite entre 0 et 100
});

// Détermination de la couleur de la barre de santé
const barColor = computed(() => {
  if (healthPercent.value <= 20) return 'red';
  if (healthPercent.value <= 50) return 'orange';
  return 'green';
});

// Classe pour l'animation (si activée)
const animationClass = computed(() => {
  return props.animated && healthPercent.value <= 20 ? 'health-critical' : '';
});
</script>

<template>
  <div class="health-bar-container">
    <div class="health-bar-header">
      <span class="pokemon-name">{{ name }}</span>
      <span class="pokemon-level">Nv.{{ level }}</span>
    </div>
    
    <div class="health-bar-row">
      <div class="health-bar-label">{{ label }}</div>
      <div class="health-bar-track">
        <div 
          class="health-bar-fill" 
          :class="[barColor, animationClass]" 
          :style="{ width: `${healthPercent}%` }"
        ></div>
      </div>
    </div>
    
    <div class="health-bar-values">
      {{ current }} / {{ max }}
    </div>
  </div>
</template>

<style scoped>
.health-bar-container {
  background-color: var(--pokemon-gray-100);
  border: 2px solid var(--pokemon-white);
  border-radius: 8px;
  padding: 12px;
  width: 100%;
  max-width: 300px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  position: relative;
  font-family: 'Press Start 2P', 'Courier New', monospace;
}

.health-bar-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}

.pokemon-name {
  color: var(--pokemon-white);
  font-weight: bold;
  font-size: 0.9rem;
  text-transform: uppercase;
}

.pokemon-level {
  color: var(--pokemon-white);
  font-size: 0.9rem;
}

.health-bar-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 5px;
}

.health-bar-label {
  color: var(--pokemon-white);
  font-size: 0.8rem;
  width: 30px;
  text-align: center;
  background-color: var(--pokemon-gray-200);
  border-radius: 4px;
  padding: 2px;
}

.health-bar-track {
  flex: 1;
  height: 12px;
  background-color: #333;
  border-radius: 3px;
  overflow: hidden;
  border: 1px solid var(--pokemon-white);
}

.health-bar-fill {
  height: 100%;
  transition: width 0.5s ease-out;
  border-radius: 3px;
}

.health-bar-fill.green {
  background-color: #3ADF00;
}

.health-bar-fill.orange {
  background-color: #FFA500;
}

.health-bar-fill.red {
  background-color: #FF0000;
}

.health-bar-fill.health-critical {
  animation: pulse-critical 0.8s infinite;
}

.health-bar-values {
  text-align: right;
  font-size: 0.8rem;
  color: var(--pokemon-white);
}

@keyframes pulse-critical {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

/* Responsive */
@media (max-width: 480px) {
  .health-bar-container {
    padding: 8px;
  }
  
  .pokemon-name, .pokemon-level {
    font-size: 0.8rem;
  }
  
  .health-bar-label {
    font-size: 0.7rem;
    width: 25px;
  }
  
  .health-bar-track {
    height: 10px;
  }
}
</style>
