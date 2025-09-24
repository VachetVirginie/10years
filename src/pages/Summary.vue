<script setup lang="ts">
import { computed } from 'vue'
import { useHunt } from '../composables/useHunt'
import { useProgress } from '../store/progress'

// Activer le suivi de géolocalisation
const { steps } = useHunt()
const store = useProgress(); store.load()

const completedSteps = computed(() => steps.filter(s => store.done.has(s.id)))
const totalSteps = computed(() => steps.length)
const completionRate = computed(() => Math.round((completedSteps.value.length / totalSteps.value) * 100))
const riddleSteps = computed(() => steps.filter(s => s.type === 'riddle'))
const choiceSteps = computed(() => steps.filter(s => s.type === 'choice'))

const getStepTypeIcon = (type: string) => {
  switch (type) {
    case 'riddle': return '🧩'
    case 'choice': return '🎯'
    default: return '⚡'
  }
}

const getStepTypeColor = (type: string) => {
  switch (type) {
    case 'riddle': return '#f59e0b'
    case 'choice': return '#ef4444'
    default: return '#6b7280'
  }
}
</script>

<template>
  <main class="pokemon-summary">
    <!-- En-tête de victoire -->
    <div class="victory-header pa-6 text-center">
      <div class="trophy-animation mb-4">
        <div class="trophy-icon">🏆</div>
        <div class="sparkles">
          <span class="sparkle">✨</span>
          <span class="sparkle">⭐</span>
          <span class="sparkle">✨</span>
        </div>
      </div>
      
      <h1 class="victory-title text-h3 mb-4">
        🎉 Maître Pokémon ! 🎉
      </h1>
      <p class="victory-subtitle text-h5 mb-4">
        Tu as capturé tous les Pokémon !
      </p>
      <p class="victory-description text-body-1 mb-6">
        Félicitations, Dresseur ! Tu as exploré tous les lieux et résolu toutes les énigmes de cette aventure épique.
      </p>
    </div>
    
    <!-- Statistiques globales -->
    <div class="stats-section pa-4">
      <v-row class="mb-6">
        <v-col cols="12" md="3" v-for="stat in [
          { icon: '🏆', value: completedSteps.length, label: 'Pokémon Capturés', color: '#fbbf24' },
          { icon: '🎯', value: totalSteps, label: 'Total Défis', color: '#3b82f6' },
          { icon: '⚡', value: completionRate + '%', label: 'Taux de Réussite', color: '#10b981' },
        ]" :key="stat.label">
          <v-card class="stat-card h-100" elevation="6">
            <v-card-text class="text-center pa-4">
              <div class="stat-icon mb-3">{{ stat.icon }}</div>
              <div class="stat-value text-h4 mb-2" :style="{ color: stat.color }">{{ stat.value }}</div>
              <div class="stat-label text-caption">{{ stat.label }}</div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>
    
    <!-- Récapitulatif détaillé -->
    <div class="summary-section pa-4">
      <v-card class="summary-card" elevation="8">
        <v-card-title class="summary-title pa-4">
          <div class="d-flex align-center">
            <span class="title-icon mr-3">📋</span>
            <span>Pokédex Complet</span>
          </div>
        </v-card-title>
        
        <v-card-text class="pa-0">
          <v-list class="pokemon-list">
            <v-list-item 
              v-for="(step, index) in steps" 
              :key="step.id"
              class="pokemon-item"
              :class="{ 'completed': store.done.has(step.id) }"
            >
              <template #prepend>
                <div class="pokemon-avatar">
                  <div class="pokemon-type-icon" :style="{ backgroundColor: getStepTypeColor(step.type) }">
                    {{ getStepTypeIcon(step.type) }}
                  </div>
                </div>
              </template>
              
              <div class="pokemon-info">
                <v-list-item-title class="pokemon-name">{{ step.title }}</v-list-item-title>
                <v-list-item-subtitle class="pokemon-details">
                  Étape {{ step.id }} • Type: {{ step.type.toUpperCase() }}
                </v-list-item-subtitle>
              </div>
              
              <template #append>
                <div class="pokemon-status">
                  <v-chip 
                    :color="store.done.has(step.id) ? '#10b981' : '#6b7280'"
                    size="small"
                    variant="flat"
                  >
                    {{ store.done.has(step.id) ? '✅ Capturé' : '⏳ En attente' }}
                  </v-chip>
                </div>
              </template>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>
    </div>
    
    <!-- Actions finales -->
    <div class="actions-section pa-4 text-center">
      <v-card class="actions-card" elevation="4">
        <v-card-text class="pa-6">
          <div class="actions-buttons d-flex flex-wrap gap-4 justify-center">
            <v-btn 
              color="#fbbf24"
              variant="elevated"
              size="x-large"
              class="action-btn"
              to="/"
            >
              <v-icon start>mdi-home</v-icon>
              Retour à l'accueil
            </v-btn>
            
            <v-btn 
              color="#10b981"
              variant="outlined"
              size="x-large"
              class="action-btn"
              to="/map"
            >
              <v-icon start>mdi-map</v-icon>
              Revoir la carte
            </v-btn>
            
            <v-btn 
              color="#3b82f6"
              variant="outlined"
              size="x-large"
              class="action-btn"
              @click="store.reset()"
            >
              <v-icon start>mdi-refresh</v-icon>
              Nouvelle aventure
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </div>
  </main>
</template>

<style scoped>
.pokemon-summary {
  background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
  min-height: 100vh;
  position: relative;
}

.victory-header {
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 32px;
  position: relative;
  z-index: 1;
}

.trophy-animation {
  position: relative;
  display: inline-block;
}

.trophy-icon {
  font-size: 5rem;
  animation: trophyBounce 2s ease-in-out infinite;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
}

.sparkles {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.sparkle {
  position: absolute;
  font-size: 1.5rem;
  animation: sparkleFloat 3s ease-in-out infinite;
}

.sparkle:nth-child(1) {
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.sparkle:nth-child(2) {
  top: 20%;
  right: 10%;
  animation-delay: 1s;
}

.sparkle:nth-child(3) {
  bottom: 10%;
  left: 50%;
  animation-delay: 2s;
}

.victory-title {
  color: #1e293b;
  font-weight: 700;
  font-size: 2.5rem;
  margin-bottom: 16px;
  letter-spacing: -0.025em;
}

.victory-subtitle {
  color: #64748b;
  font-size: 1.125rem;
  font-weight: 400;
  margin-bottom: 24px;
  line-height: 1.6;
}

.victory-description {
  color: #ffffff;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
  max-width: 600px;
  margin: 0 auto;
}

.stats-section, .summary-section, .actions-section {
  position: relative;
  z-index: 1;
}

.stat-card {
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  font-size: 2.5rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.stat-value {
  font-weight: 800;
}

.stat-label {
  color: #64748b;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.summary-card {
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.summary-title {
  background: #3b82f6;
  color: #ffffff;
  font-weight: 600;
  border-radius: 12px 12px 0 0;
}

.title-icon {
  font-size: 1.5rem;
}

.pokemon-list {
  background: transparent;
}

.pokemon-item {
  border-bottom: 1px solid #e2e8f0;
  transition: all 0.3s ease;
  padding: 1rem;
}

.pokemon-item:hover {
  background: linear-gradient(90deg, #f8fafc, #ffffff);
  transform: translateX(8px);
}

.pokemon-item.completed {
  background: linear-gradient(90deg, #ecfdf5, #f0fdf4);
}

.pokemon-avatar {
  margin-right: 1rem;
}

.pokemon-type-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: #ffffff;
  font-weight: bold;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.pokemon-name {
  font-weight: 600;
  color: #1e293b;
}

.pokemon-details {
  color: #64748b;
  font-weight: 500;
}

.actions-card {
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.actions-buttons {
  gap: 1.5rem;
}

.action-btn {
  border-radius: 12px;
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  min-width: 180px;
}

.action-btn:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

/* Animations */
@keyframes trophyBounce {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  25% { transform: translateY(-10px) rotate(-5deg); }
  50% { transform: translateY(-20px) rotate(0deg); }
  75% { transform: translateY(-10px) rotate(5deg); }
}

@keyframes sparkleFloat {
  0%, 100% { transform: translateY(0) scale(1); opacity: 0.7; }
  50% { transform: translateY(-20px) scale(1.2); opacity: 1; }
}

/* Responsive design */
@media (max-width: 768px) {
  .victory-title {
    font-size: 2rem;
  }
  
  .trophy-icon {
    font-size: 3rem;
  }
  
  .actions-buttons {
    flex-direction: column;
    align-items: stretch;
  }
  
  .action-btn {
    min-width: unset;
    width: 100%;
  }
  
  .pokemon-item:hover {
    transform: none;
  }
}
</style>
