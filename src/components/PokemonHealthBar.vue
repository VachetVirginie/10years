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

// Status text based on health percentage
const statusText = computed(() => {
  if (healthPercent.value <= 20) return 'CRITIQUE';
  if (healthPercent.value <= 50) return 'MOYEN';
  if (healthPercent.value < 100) return 'BON';
  return 'PARFAIT';
});

// Status class based on health percentage
const statusClass = computed(() => {
  if (healthPercent.value <= 20) return 'status-critical';
  if (healthPercent.value <= 50) return 'status-warning';
  if (healthPercent.value < 100) return 'status-good';
  return 'status-perfect';
});
</script>

<template>
  <div class="health-bar-container glass-card depth-shadow hover-lift-subtle">
    <!-- Level badge with glow effect -->
    <div class="health-bar-header">
      <div class="pokemon-avatar glass-dark">
        <div class="avatar-glow"></div>
        <span>{{ name.charAt(0) }}</span>
      </div>
      <div class="header-info">
        <span class="pokemon-name">{{ name }}</span>
        <div class="pokemon-progress">
          <span class="pokemon-bonus" v-if="current > 0">+ {{ Math.round(healthPercent) }}% XP</span>
        </div>
      </div>
    </div>
    
    <div class="health-bar-row">
      <div class="health-bar-label glass-dark">{{ label }}</div>
      <div class="health-bar-track">
        <!-- Progress segments with dynamic appearance based on completion -->
        <div 
          class="health-bar-fill progress-bar-animated" 
          :class="[barColor, animationClass]" 
          :style="{ width: `${healthPercent}%` }"
        >
          <div class="progress-shine"></div>
          <div class="progress-particles" v-if="healthPercent > 30"></div>
          <div class="progress-glow" :class="barColor"></div>
        </div>
        
        <!-- Progress indicators -->
        <div 
          v-for="segment in 8" 
          :key="segment"
          class="progress-segment"
          :class="{'segment-active': (segment / 8) * 100 <= healthPercent}"
          :style="{left: `${(segment / 8) * 100 - (100/16)}%`}"
        ></div>
      </div>
    </div>
    
    <div class="health-bar-footer">
      <div class="status-values">
        <div class="health-bar-values glass-light">
          <span class="current-value">{{ current }}</span>
          <span class="separator">/</span>
          <span class="max-value">{{ max }}</span>
        </div>
        
        <!-- Status indicator avec icône -->
        <div class="status-indicator" :class="statusClass">
          <span class="status-icon" :class="statusClass"></span>
          <span class="status-text">{{ statusText }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.health-bar-container {
  background: rgba(20, 20, 20, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--border-radius-xl);
  padding: 20px;
  width: 100%;
  max-width: 340px;
  position: relative;
  font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
  margin: 0 auto;
  overflow: hidden;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.hover-lift-subtle:hover {
  transform: translateY(-3px) scale(1.01);
  box-shadow: var(--shadow-xl), 0 10px 30px rgba(0, 0, 0, 0.2);
}

/* Level badge floating in top right corner with glow effect */
.level-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  width: 50px;
  height: 50px;
  background: var(--gradient-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 15px rgba(255, 61, 40, 0.5);
  z-index: 10;
  border: 2px solid rgba(255, 255, 255, 0.8);
  animation: pulse-glow 3s infinite;
}

.level-text {
  color: white;
  font-weight: 700;
  font-size: 1.2rem;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}

.health-bar-header {
  display: flex;
  margin-bottom: 18px;
  align-items: center;
  gap: 15px;
}

/* Avatar styling */
.pokemon-avatar {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--pokemon-white);
  background: var(--gradient-primary);
  position: relative;
  overflow: hidden;
  box-shadow: var(--shadow-md), 0 0 15px rgba(255, 61, 40, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Glow effect for the avatar */
.avatar-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at center, rgba(255, 255, 255, 0.2) 0%, transparent 70%);
  animation: rotate-slow 8s linear infinite;
}

@keyframes rotate-slow {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Header info section */
.header-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.pokemon-name {
  color: var(--pokemon-white);
  font-weight: 700;
  font-size: 1.15rem;
  text-transform: uppercase;
  letter-spacing: -0.01em;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
}

.pokemon-progress {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pokemon-bonus {
  color: #64ffda;
  font-size: 0.85rem;
  font-weight: 600;
  background: rgba(100, 255, 218, 0.1);
  padding: 4px 10px;
  border-radius: var(--border-radius-full);
  display: inline-flex;
  align-items: center;
  box-shadow: 0 0 10px rgba(100, 255, 218, 0.2);
  border: 1px solid rgba(100, 255, 218, 0.2);
}

.health-bar-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 15px;
}

.health-bar-label {
  color: var(--pokemon-white);
  font-size: 0.8rem;
  font-weight: 600;
  min-width: 40px;
  text-align: center;
  border-radius: 6px;
  padding: 4px 8px;
}

.health-bar-track {
  flex: 1;
  height: 14px;
  background-color: rgba(30, 30, 30, 0.8);
  border-radius: 7px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.5);
}

.health-bar-fill {
  height: 100%;
  transition: width 1s cubic-bezier(0.22, 1, 0.36, 1);
  border-radius: 7px;
  position: relative;
  overflow: hidden;
}

.health-bar-fill.green {
  background: linear-gradient(90deg, rgba(58, 223, 0, 0.6), rgba(58, 223, 0, 0.9));
  box-shadow: 0 0 10px rgba(58, 223, 0, 0.5);
}

.health-bar-fill.orange {
  background: linear-gradient(90deg, rgba(255, 165, 0, 0.6), rgba(255, 165, 0, 0.9));
  box-shadow: 0 0 10px rgba(255, 165, 0, 0.5);
}

.health-bar-fill.red {
  background: linear-gradient(90deg, rgba(255, 0, 0, 0.6), rgba(255, 0, 0, 0.9));
  box-shadow: 0 0 10px rgba(255, 0, 0, 0.5);
}

.health-bar-fill.health-critical {
  animation: pulse-critical 0.6s infinite;
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
    rgba(255, 255, 255, 0.4) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  animation: progress-shine 2.5s infinite;
  z-index: 2;
}

/* Effet de lueur qui pulse sur la barre de progression */
.progress-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  animation: progress-glow 3s infinite alternate;
  filter: blur(5px);
  opacity: 0.6;
  z-index: 1;
}

.progress-glow.green {
  background: radial-gradient(ellipse at center, rgba(58, 223, 0, 0.6) 0%, rgba(58, 223, 0, 0) 70%);
}

.progress-glow.orange {
  background: radial-gradient(ellipse at center, rgba(255, 165, 0, 0.6) 0%, rgba(255, 165, 0, 0) 70%);
}

.progress-glow.red {
  background: radial-gradient(ellipse at center, rgba(255, 0, 0, 0.6) 0%, rgba(255, 0, 0, 0) 70%);
}

/* Particles animation for high progress */
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

@keyframes particles-float {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Progress segments */
.progress-segment {
  position: absolute;
  width: 3px;
  height: 14px;
  background: rgba(255, 255, 255, 0.1);
  top: 0;
  transform: translateX(-50%);
  z-index: 1;
  transition: background-color 0.5s ease;
}

.segment-active {
  background: rgba(255, 255, 255, 0.7);
  box-shadow: 0 0 5px rgba(255, 255, 255, 0.8);
}

.health-bar-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 15px;
}

.status-values {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.health-bar-values {
  font-size: 0.95rem;
  color: var(--pokemon-white);
  padding: 6px 14px;
  border-radius: var(--border-radius-full);
  display: inline-flex;
  align-items: center;
  gap: 2px;
  background: rgba(255, 255, 255, 0.1);
  box-shadow: var(--shadow-sm);
}

.current-value {
  font-weight: 700;
  font-size: 1.05rem;
}

.separator {
  opacity: 0.7;
  margin: 0 2px;
}

.max-value {
  opacity: 0.8;
}

/* Status indicator avec icône */
.status-indicator {
  font-size: 0.85rem;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: var(--border-radius-full);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 6px;
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
}

.status-icon {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}

/* Critical status */
.status-critical {
  background-color: rgba(255, 0, 0, 0.15);
  color: #ff6b6b;
  animation: pulse-critical 1s infinite;
  border: 1px solid rgba(255, 0, 0, 0.2);
}

.status-icon.status-critical {
  background-color: #ff6b6b;
  box-shadow: 0 0 10px #ff6b6b;
  animation: pulse 1s infinite alternate;
}

/* Warning status */
.status-warning {
  background-color: rgba(255, 165, 0, 0.15);
  color: #ffa94d;
  border: 1px solid rgba(255, 165, 0, 0.2);
}

.status-icon.status-warning {
  background-color: #ffa94d;
  box-shadow: 0 0 10px #ffa94d;
}

/* Good status */
.status-good {
  background-color: rgba(58, 223, 0, 0.15);
  color: #69db7c;
  border: 1px solid rgba(58, 223, 0, 0.2);
}

.status-icon.status-good {
  background-color: #69db7c;
  box-shadow: 0 0 10px #69db7c;
}

/* Perfect status */
.status-perfect {
  background-color: rgba(100, 255, 218, 0.15);
  color: #64ffda;
  animation: pulse 2s infinite;
  border: 1px solid rgba(100, 255, 218, 0.2);
}

.status-icon.status-perfect {
  background-color: #64ffda;
  box-shadow: 0 0 10px #64ffda;
  animation: pulse 1s infinite alternate;
}

/* Animations */
@keyframes pulse-critical {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(0.98); }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

@keyframes progress-shine {
  0% { left: -100%; }
  100% { left: 100%; }
}

@keyframes progress-glow {
  0%, 100% { opacity: 0.4; filter: blur(4px); }
  50% { opacity: 0.7; filter: blur(7px); }
}

@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 10px rgba(255, 61, 40, 0.5); }
  50% { box-shadow: 0 0 20px rgba(255, 61, 40, 0.8); }
}

/* Responsive */
@media (max-width: 768px) {
  .health-bar-container {
    padding: 18px;
    max-width: 500px;
  }
  
  .pokemon-name {
    font-size: 1.05rem;
  }
  
  .pokemon-avatar {
    width: 40px;
    height: 40px;
    font-size: 1.2rem;
  }
  
  .status-values {
    flex-direction: row;
    gap: 10px;
  }
}

@media (max-width: 480px) {
  .health-bar-container {
    padding: 15px;
    border-radius: var(--border-radius-lg);
  }
  
  .pokemon-avatar {
    width: 36px;
    height: 36px;
    font-size: 1.1rem;
  }
  
  .health-bar-header {
    gap: 10px;
    margin-bottom: 15px;
  }
  
  .pokemon-name {
    font-size: 0.95rem;
  }
  
  .pokemon-bonus {
    font-size: 0.75rem;
    padding: 3px 8px;
  }
  
  .health-bar-label {
    font-size: 0.7rem;
    min-width: 35px;
    padding: 3px 6px;
  }
  
  .health-bar-track {
    height: 12px;
  }
  
  .progress-segment {
    height: 12px;
    width: 2px;
  }
  
  .status-values {
    flex-direction: column;
    gap: 10px;
    align-items: center;
  }
  
  .health-bar-values {
    font-size: 0.85rem;
    padding: 5px 12px;
    margin-bottom: 5px;
  }
  
  .status-indicator {
    font-size: 0.75rem;
    padding: 4px 10px;
  }
  
  .status-icon {
    width: 8px;
    height: 8px;
  }
}
</style>
