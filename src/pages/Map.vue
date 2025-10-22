<script setup lang="ts">
import LyonMap from '../components/LyonMap.vue'
</script>

<template>
  <LyonMap />
</template>

<style scoped>
/* Styles spécifiques à la page si nécessaire */
</style>

<style scoped>
.pokemon-map {
  background: var(--pokemon-black);
  min-height: 100vh;
  position: relative;
  color: var(--pokemon-white);
}

.map-header {
  background: var(--pokemon-gray-100);
  border-radius: 12px;
  border: 2px solid var(--pokemon-red);
  box-shadow: 0 0 15px rgba(227, 53, 13, 0.3);
  margin-bottom: 24px;
  padding: 24px;
}

.map-title {
  color: var(--pokemon-red);
  font-weight: 700;
  font-size: 1.875rem;
  margin-bottom: 16px;
  letter-spacing: -0.025em;
  text-align: center;
  text-shadow: 0 0 10px rgba(255, 61, 40, 0.5);
}

.stats-container {
  gap: 1rem;
}

.stat-card {
  background: var(--pokemon-gray-100);
  border-radius: 8px;
  border: 1px solid var(--pokemon-red);
  transition: all 0.2s ease;
  min-width: 100px;
  box-shadow: 0 0 10px rgba(227, 53, 13, 0.2);
}

.stat-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  font-size: 1.5rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.stat-value {
  color: var(--pokemon-white);
  font-weight: 600;
}

.stat-label {
  color: var(--pokemon-gray-800);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.map-container {
  background: var(--pokemon-gray-100);
  border-radius: 12px;
  box-shadow: 0 0 15px rgba(227, 53, 13, 0.3);
  overflow: hidden;
}

.pokemon-map-view {
  height: 60vh;
  width: 100%;
  position: relative;
}

.legend {
  background: var(--pokemon-black);
  border-top: 2px solid var(--pokemon-red);
}

.legend-title {
  color: var(--pokemon-red);
  font-weight: 600;
}

.legend-items {
  gap: 1.5rem;
}

.legend-item {
  align-items: center;
}

.legend-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid var(--pokemon-red);
  background-color: var(--pokemon-gray-100);
  overflow: hidden;
  box-shadow: 0 0 5px rgba(255, 61, 40, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2px;
}

.legend-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* Responsive design */
@media (max-width: 768px) {
  .stats-container {
    flex-direction: column;
  }
  
  .stat-card {
    min-width: unset;
  }
  
  .pokemon-map-view {
    height: 50vh;
  }
  
  .legend-items {
    flex-direction: column;
    gap: 0.5rem;
  }
}

/* Styles pour les marqueurs personnalisés */
.pokeball-marker {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 0 0 2px var(--pokemon-black), 0 0 10px rgba(255, 61, 40, 0.6);
}

.pokeball-marker img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transform-origin: center;
  animation: rotate 6s linear infinite;
}

.pokeball-marker.completed img {
  animation: bounce 2s ease-in-out infinite;
}

.trainer-marker {
  width: 40px;
  height: 40px;
  filter: drop-shadow(0 0 8px var(--pokemon-red));
}

.trainer-marker.pulsing {
  animation: pulse 1.5s ease-in-out infinite;
}

.trainer-marker img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* Animation pour les cartes de statistiques */
@keyframes statPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.stat-card:hover .stat-icon {
  animation: statPulse 1s ease-in-out infinite;
}

/* Animation pour les marqueurs */
@keyframes rotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

@keyframes pulse {
  0% { opacity: 0.8; filter: drop-shadow(0 0 5px var(--pokemon-red)); }
  50% { opacity: 1; filter: drop-shadow(0 0 15px var(--pokemon-red)); }
  100% { opacity: 0.8; filter: drop-shadow(0 0 5px var(--pokemon-red)); }
}
</style>
