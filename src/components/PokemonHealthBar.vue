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
  <div class="health-bar-container glass-card">
    <div class="health-bar-header">
      <span class="pokemon-name">{{ name }}</span>
      <span class="pokemon-level">Nv.{{ level }}</span>
    </div>
    
    <div class="health-bar-row">
      <div class="health-bar-label">{{ label }}</div>
      <div class="health-bar-track glass-progress-bar">
        <div 
          class="health-bar-fill" 
          :class="[barColor, animationClass]" 
          :style="{ width: `${healthPercent}%` }"
        >
          <div class="health-bar-shine"></div>
        </div>
      </div>
    </div>
    
    <div class="health-bar-values">
      {{ current }} / {{ max }}
    </div>
  </div>
</template>

<style scoped>
@import '../assets/glassmorphism.css';
.health-bar-container {
  background-color: rgba(33, 33, 33, 0.7);
  border: 1px solid var(--glass-border-light);
  border-radius: 16px;
  padding: 15px;
  width: 100%;
  max-width: 300px;
  box-shadow: 0 8px 32px var(--glass-shadow-strong);
  position: relative;
  font-family: 'Press Start 2P', 'Courier New', monospace;
  backdrop-filter: blur(var(--glass-blur-medium));
  -webkit-backdrop-filter: blur(var(--glass-blur-medium));
  transition: var(--glass-transition);
}

.health-bar-container:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 32px var(--glass-shadow-strong);
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
  text-shadow: 0 0 5px rgba(255, 255, 255, 0.3);
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
  background-color: rgba(60, 60, 60, 0.6);
  border-radius: 8px;
  padding: 3px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(var(--glass-blur-light));
  -webkit-backdrop-filter: blur(var(--glass-blur-light));
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.health-bar-track {
  flex: 1;
  height: 12px;
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(var(--glass-blur-light));
  -webkit-backdrop-filter: blur(var(--glass-blur-light));
  position: relative;
}

.health-bar-fill {
  height: 100%;
  transition: width 0.5s ease-out;
  border-radius: 8px;
  position: relative;
  overflow: hidden;
}

.health-bar-shine {
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
  animation: health-shine 2s infinite;
}

@keyframes health-shine {
  0% { left: -100%; }
  100% { left: 100%; }
}

.health-bar-fill.green {
  background: linear-gradient(to right, rgba(58, 223, 0, 0.8), rgba(120, 255, 60, 0.8));
  box-shadow: 0 0 10px rgba(58, 223, 0, 0.5);
}

.health-bar-fill.orange {
  background: linear-gradient(to right, rgba(255, 165, 0, 0.8), rgba(255, 200, 0, 0.8));
  box-shadow: 0 0 10px rgba(255, 165, 0, 0.5);
}

.health-bar-fill.red {
  background: linear-gradient(to right, rgba(255, 0, 0, 0.8), rgba(255, 70, 70, 0.8));
  box-shadow: 0 0 10px rgba(255, 0, 0, 0.5);
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
