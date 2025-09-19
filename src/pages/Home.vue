<script setup lang="ts">
import { useHunt } from '../composables/useHunt'
import { useGeolocation } from '../composables/useGeolocation'
import { useProgress } from '../store/progress'
import { ref, computed } from 'vue'

// Activer le suivi de géolocalisation
useGeolocation()
const { title, steps } = useHunt()
const store = useProgress()
store.load()

// Calcul du pourcentage de progression pour la barre
const progressPercent = computed(() => {
  return Math.round((store.done.size / steps.length) * 100)
})
</script>

<template>
  <main class="pokemon-home">
    <!-- Hero Section -->
    <div class="pokemon-hero">
      <div class="pokemon-hero-content">
        <h1 class="pokemon-main-title">{{ title }}</h1>
        <div class="pokemon-subtitle">Une chasse au trésor à travers Lyon</div>
      </div>
    </div>

    <!-- Progress Bar -->
    <div class="progress-section">
      <v-container>
        <v-row justify="center">
          <v-col cols="12">
            <div class="progress-info">
              <div class="progress-text">Progression: {{ store.done.size }}/{{ steps.length }}</div>
              <v-progress-linear
                v-model="progressPercent"
                height="10"
                rounded
                color="var(--pokemon-red)"
                background-color="var(--pokemon-gray-200)"
              ></v-progress-linear>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </div>

    <!-- Action Section -->
    <div class="action-section">
      <v-container>
        <v-row justify="center">
          <v-col cols="12">
            <div class="action-card">
              <v-btn
                :to="store.done.size === 0 ? '/step/1' : `/step/${store.currentIndex + 1}`"
                class="start-btn"
                size="large"
                block
              >
                {{ store.done.size === 0 ? 'Commencer' : 'Continuer' }}
              </v-btn>
              
              <v-btn
                to="/map"
                class="map-btn"
                size="large"
                block
                variant="outlined"
              >
                Voir la carte
              </v-btn>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </div>

    <!-- Instructions -->
    <div class="instructions-section">
      <v-container>
        <v-row justify="center">
          <v-col cols="12">
            <div class="instruction-card">
              <h3>Comment jouer</h3>
              <ol>
                <li>Suis les indices pour trouver chaque lieu</li>
                <li>Résous les énigmes sur place</li>
                <li>Débloque de nouvelles étapes en avançant</li>
              </ol>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </div>
  </main>
</template>

<style scoped>
.pokemon-home {
  background: var(--pokemon-black);
  min-height: 100vh;
  padding: 16px;
  color: var(--pokemon-white);
}

.pokemon-hero {
  padding: 40px 16px 20px;
  text-align: center;
}

.pokemon-hero-content {
  margin: 0 auto;
}

.pokemon-main-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--pokemon-red);
  margin-bottom: 10px;
  text-shadow: 0 0 10px rgba(255, 61, 40, 0.5);
}

.pokemon-subtitle {
  font-size: 1rem;
  color: var(--pokemon-white);
}

/* Progress bar styles */
.progress-section {
  padding: 20px 0;
}

.progress-info {
  margin-bottom: 30px;
}

.progress-text {
  font-size: 0.9rem;
  margin-bottom: 8px;
  color: var(--pokemon-white);
  font-weight: 500;
}

/* Action buttons */
.action-section {
  padding: 20px 0;
}

.action-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.start-btn {
  background: var(--pokemon-red) !important;
  color: white !important;
  height: 48px !important;
  font-weight: 600 !important;
  letter-spacing: 0.5px !important;
}

.map-btn {
  border-color: var(--pokemon-black) !important;
  color: var(--pokemon-black) !important;
  height: 48px !important;
}

/* Instructions section */
.instructions-section {
  padding: 20px 0;
}

.instruction-card {
  background: var(--pokemon-gray-100);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid var(--pokemon-red);
  box-shadow: 0 0 15px rgba(255, 61, 40, 0.15);
}

.instruction-card h3 {
  font-size: 1.2rem;
  margin-bottom: 16px;
  color: var(--pokemon-red);
  text-shadow: 0 0 5px rgba(255, 61, 40, 0.5);
}

.instruction-card ol {
  padding-left: 24px;
  margin: 0;
}

.instruction-card li {
  margin-bottom: 10px;
  color: var(--pokemon-white);
}

.instruction-card li:last-child {
  margin-bottom: 0;
}
</style>
