<script setup lang="ts">
import { useHunt } from '../composables/useHunt'
import { useGeolocation } from '../composables/useGeolocation'
import { useProgress } from '../store/progress'
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import PokemonDialog from '../components/PokemonDialog.vue'
import PokemonHealthBar from '../components/PokemonHealthBar.vue'
import PokemonBadges from '../components/PokemonBadges.vue'
import PokemonMenu from '../components/PokemonMenu.vue'

// Router pour la navigation
const router = useRouter()

// Activer le suivi de géolocalisation
useGeolocation()
const { title, steps } = useHunt()
const store = useProgress()
store.load()

// Calcul du pourcentage de progression pour la barre
const progressPercent = computed(() => {
  return Math.round((store.done.size / steps.length) * 100)
})

// Message de bienvenue pour le dialog Pokémon
const welcomeMessage = computed(() => {
  if (store.done.size === 0) {
    return "Bienvenue aventurier! Une quête épique t'attend à travers la ville. Es-tu prêt à relever le défi?"
  } else {
    return `Content de te revoir! Tu as déjà complété ${store.done.size} étapes sur ${steps.length}. Continue l'aventure!`
  }
})

// Menu items pour navigation
const menuItems = [
  { id: 'start', label: store.done.size === 0 ? 'Commencer l\'aventure' : 'Continuer l\'aventure', icon: '🚀' },
  { id: 'badges', label: 'Voir les badges', icon: '🏆' },
  { id: 'intro', label: 'Revoir intro', icon: '🌟' },
  { id: 'reset', label: 'Réinitialiser', icon: '🔄' }
]

// Interface pour les items du menu
interface MenuItem {
  id: string;
  label: string;
  icon?: string;
  disabled?: boolean;
}

// Gestion des sélections du menu
const showBadges = ref(false)
const dialogDone = ref(false)

// Dialog de confirmation pour la réinitialisation
const showResetConfirmation = ref(false)
const resetConfirmationMessage = "Es-tu sûr de vouloir réinitialiser ta progression ? Toutes tes étapes complétées seront perdues."

// Dialog de confirmation pour revoir l'intro
const showIntroConfirmation = ref(false)
const introConfirmationMessage = "Voulez-vous revoir l'animation d'introduction et le splash screen ?"

function handleMenuSelect(item: MenuItem) {
  if (item.id === 'start') {
    // Charger explicitement le store avant d'accéder aux valeurs
    store.load()
    
    console.log('Débog - État actuel:', { 
      currentIndex: store.currentIndex,
      doneSize: store.done.size,
      doneItems: Array.from(store.done),
      stepCount: steps.length,
      resumeIndex: store.resumeIndex,
      currentStepId: store.currentStepId,
      nextStepId: store.nextStepId
    });
    
    if (store.done.size === 0) {
      // Si aucune étape n'est terminée, commencer à la première étape
      console.log('Débog - Début nouvelle partie');
      router.push('/step/1')
    } else {
      // Déterminer l'ID de l'étape à laquelle reprendre en fonction de la progression
      const resumeIndex = store.resumeIndex;
      const resumeStepId = steps[resumeIndex]?.id || '1';
      
      console.log(`Débog - Reprise de l'aventure à l'étape ${resumeStepId} (index ${resumeIndex})`);
      router.push(`/step/${resumeStepId}`)
    }
  } else if (item.id === 'map') {
    router.push('/map')
  } else if (item.id === 'badges') {
    showBadges.value = true
  } else if (item.id === 'reset') {
    showResetConfirmation.value = true
  } else if (item.id === 'intro') {
    showIntroConfirmation.value = true
  }
}

// Fonction pour réinitialiser la progression
function resetProgress() {
  store.reset()
  showResetConfirmation.value = false
  // Mettre à jour l'interface
  router.go(0) // Équivalent à refresh mais utilise le router
}

// Fonction pour réinitialiser le splash screen et l'intro
function resetIntro() {
  // Supprimer les entrées dans le localStorage
  localStorage.removeItem('hasSeenSplash')
  localStorage.removeItem('hasSeenIntro')
  showIntroConfirmation.value = false
  // Rafraîchir la page pour montrer le splash screen
  router.go(0)
}
</script>

<template>
  <main class="pokemon-home">
    <!-- Hero Section -->
    <div class="pokemon-hero glass-card">
      <div class="pokemon-hero-content">
        <div class="hero-particles">
          <div class="glass-particle"></div>
          <div class="glass-particle"></div>
          <div class="glass-particle"></div>
          <div class="glass-particle"></div>
        </div>
        <h1 class="pokemon-main-title">{{ title }}</h1>
        <div class="pokemon-subtitle">Une chasse au trésor à travers Lyon</div>
      </div>
    </div>

    <!-- Progress Bar -->
    <!-- Barre de santé Pokémon montrant la progression -->
    <!-- <div class="progress-section">
      <v-container>
        <v-row justify="center">
          <v-col cols="12">
            <PokemonHealthBar
              :current="store.done.size"
              :max="steps.length"
              :level="progressPercent"
              name="AVENTURIER"
              label="XP"
            />
          </v-col>
        </v-row>
      </v-container>
    </div> -->

    <!-- Dialog de bienvenue Pokémon -->
    <div class="dialog-section">
      <v-container>
        <v-row justify="center">
          <v-col cols="12">
            <PokemonDialog
              :text="welcomeMessage"
              speaker="PROFESSEUR"
              avatar="../../images/prof.png"
              @complete="dialogDone = true"
            />
          </v-col>
        </v-row>
      </v-container>
    </div>

    <!-- Menu de navigation style Pokémon -->
    <div class="menu-section" v-if="dialogDone">
      <v-container>
        <v-row justify="center">
          <v-col cols="12">
            <PokemonMenu
              :items="menuItems"
              title="MENU PRINCIPAL"
              @select="handleMenuSelect"
            />
          </v-col>
        </v-row>
      </v-container>
    </div>

    <!-- Dialog des badges Pokémon -->
    <PokemonBadges
      v-model="showBadges"
      :earned="store.done.size"
      :total="steps.length > 8 ? 8 : steps.length"
      :showAnimation="true"
    />

    <!-- Dialogue de confirmation pour la réinitialisation -->
    <div v-if="showResetConfirmation" class="reset-confirmation-overlay">
      <div class="reset-confirmation-dialog">
        <div class="dialog-content">
          <h3 class="dialog-title">Attention!</h3>
          <p class="dialog-message">{{ resetConfirmationMessage }}</p>
          <div class="dialog-actions">
            <button @click="resetProgress" class="confirm-btn">Oui, réinitialiser</button>
            <button @click="showResetConfirmation = false" class="cancel-btn">Annuler</button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Dialogue de confirmation pour revoir l'intro -->
    <div v-if="showIntroConfirmation" class="reset-confirmation-overlay">
      <div class="reset-confirmation-dialog">
        <div class="dialog-content">
          <h3 class="dialog-title">Revoir l'intro</h3>
          <p class="dialog-message">{{ introConfirmationMessage }}</p>
          <div class="dialog-actions">
            <button @click="resetIntro" class="confirm-btn">Oui, revoir</button>
            <button @click="showIntroConfirmation = false" class="cancel-btn">Annuler</button>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
@import '../assets/glassmorphism.css';
.pokemon-home {
  background: var(--pokemon-black);
  min-height: 100vh;
  padding: 16px;
  color: var(--pokemon-white);
}

.pokemon-hero {
  padding: 40px 20px 30px;
  text-align: center;
  background: rgba(33, 33, 33, 0.6);
  border-radius: 20px;
  margin: 10px 10px 20px;
  border: 1px solid var(--glass-border-light);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(var(--glass-blur-medium));
  -webkit-backdrop-filter: blur(var(--glass-blur-medium));
  transition: var(--glass-transition);
}

.pokemon-hero:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
}

.pokemon-hero-content {
  margin: 0 auto;
  position: relative;
  z-index: 2;
}

.hero-particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.pokemon-main-title {
  font-size: 2rem;
  font-weight: 700;
  color: white;
  margin-bottom: 15px;
  text-shadow: 0 0 10px var(--glass-pokemon-red), 0 0 20px rgba(255, 61, 40, 0.5);
  position: relative;
  display: inline-block;
}

.pokemon-main-title::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: -5px;
  transform: translateX(-50%);
  width: 80px;
  height: 3px;
  background: linear-gradient(to right, transparent, var(--glass-pokemon-red), transparent);
  border-radius: 3px;
}

.pokemon-subtitle {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  letter-spacing: 0.5px;
  margin-top: 5px;
  position: relative;
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

/* Dialog de confirmation de réinitialisation */
.reset-confirmation-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.reset-confirmation-dialog {
  background-color: rgba(33, 33, 33, 0.8);
  border: 1px solid var(--glass-border-light);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  width: 100%;
  max-width: 400px;
  overflow: hidden;
  animation: dialog-appear 0.3s ease-out;
  backdrop-filter: blur(var(--glass-blur-strong));
  -webkit-backdrop-filter: blur(var(--glass-blur-strong));
}

.dialog-content {
  padding: 25px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.dialog-title {
  color: white;
  font-size: 1.3rem;
  margin-top: 0;
  margin-bottom: 20px;
  text-shadow: 0 0 10px var(--glass-pokemon-red);
  text-align: center;
  letter-spacing: 0.5px;
  position: relative;
  display: inline-block;
  padding-bottom: 8px;
}

.dialog-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 2px;
  background: linear-gradient(to right, transparent, white, transparent);
}

.dialog-message {
  color: var(--pokemon-white);
  margin-bottom: 20px;
  line-height: 1.5;
  text-align: center;
}

.dialog-actions {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
}

.confirm-btn, .cancel-btn {
  padding: 12px 24px;
  border-radius: 30px;
  font-weight: bold;
  cursor: pointer;
  border: 1px solid var(--glass-border-light);
  transition: var(--glass-transition);
  backdrop-filter: blur(var(--glass-blur-light));
  -webkit-backdrop-filter: blur(var(--glass-blur-light));
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.confirm-btn {
  background-color: var(--glass-pokemon-red);
  color: white;
  position: relative;
  overflow: hidden;
}

.confirm-btn::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 70%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.confirm-btn:hover::before {
  opacity: 1;
}

.cancel-btn {
  background-color: rgba(60, 60, 60, 0.6);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.confirm-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(255, 0, 0, 0.3);
}

.cancel-btn:hover {
  background-color: rgba(80, 80, 80, 0.6);
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

@keyframes dialog-appear {
  from { transform: scale(0.8); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

/* Styles pour le bouton de retour dans la section badges */
.back-button-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.back-button {
  background-color: var(--pokemon-red);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Press Start 2P', 'Courier New', monospace;
  font-size: 0.85rem;
  box-shadow: 0 4px 0 var(--pokemon-red-dark), 0 0 10px rgba(255, 61, 40, 0.3);
}

.back-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 0 var(--pokemon-red-dark), 0 0 15px rgba(255, 61, 40, 0.5);
}

.back-button:active {
  transform: translateY(2px);
  box-shadow: 0 2px 0 var(--pokemon-red-dark), 0 0 5px rgba(255, 61, 40, 0.3);
}
</style>
