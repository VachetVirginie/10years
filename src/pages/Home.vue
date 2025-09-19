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
  { id: 'map', label: 'Voir la carte', icon: '🗺️' },
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
    router.push(store.done.size === 0 ? '/step/1' : `/step/${store.currentIndex + 1}`)
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
    <!-- Barre de santé Pokémon montrant la progression -->
    <div class="progress-section">
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
    </div>

    <!-- Dialog de bienvenue Pokémon -->
    <div class="dialog-section">
      <v-container>
        <v-row justify="center">
          <v-col cols="12">
            <PokemonDialog
              :text="welcomeMessage"
              speaker="PROFESSEUR"
              avatar="https://archives.bulbagarden.net/media/upload/thumb/4/44/Professor_Cerise_anime.png/180px-Professor_Cerise_anime.png"
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

    <!-- Badges Pokémon (affichés conditionnellement) -->
    <div class="badges-section" v-if="showBadges">
      <v-container>
        <v-row justify="center">
          <v-col cols="12">
            <PokemonBadges
              :earned="store.done.size"
              :total="steps.length > 8 ? 8 : steps.length"
              :showAnimation="true"
            />
            
            <!-- Bouton pour revenir au menu principal -->
            <div class="back-button-container">
              <button @click="showBadges = false" class="back-button">
                Retour au menu
              </button>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </div>

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
  background-color: var(--pokemon-gray-100);
  border: 4px solid var(--pokemon-white);
  border-radius: 10px;
  box-shadow: 0 0 0 4px var(--pokemon-black), 0 0 15px rgba(255, 61, 40, 0.5);
  width: 100%;
  max-width: 400px;
  overflow: hidden;
  animation: dialog-appear 0.3s ease-out;
}

.dialog-content {
  padding: 20px;
}

.dialog-title {
  color: var(--pokemon-red);
  font-size: 1.2rem;
  margin-top: 0;
  margin-bottom: 16px;
  text-shadow: 0 0 5px rgba(255, 61, 40, 0.5);
  text-align: center;
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
  padding: 10px 20px;
  border-radius: 5px;
  font-weight: bold;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
}

.confirm-btn {
  background-color: var(--pokemon-red);
  color: var(--pokemon-white);
}

.cancel-btn {
  background-color: var(--pokemon-gray-300);
  color: var(--pokemon-black);
}

.confirm-btn:hover {
  background-color: var(--pokemon-red-dark);
  transform: translateY(-2px);
}

.cancel-btn:hover {
  background-color: var(--pokemon-gray-200);
  transform: translateY(-2px);
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
