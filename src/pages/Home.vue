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

// Menu items pour navigation avec des icônes améliorées
const menuItems = [
  { 
    id: 'start', 
    label: store.done.size === 0 ? 'Commencer l\'aventure' : 'Continuer l\'aventure', 
    icon: '🚀',
    color: 'var(--pokemon-red)'
  },
  { 
    id: 'badges', 
    label: 'Voir les badges', 
    icon: '🏆',
    color: '#FFD700'
  },
  { 
    id: 'intro', 
    label: 'Revoir intro', 
    icon: '🌟',
    color: '#64FFDA'
  },
  { 
    id: 'reset', 
    label: 'Réinitialiser', 
    icon: '🔄',
    color: '#8B8B8B'
  }
]

// Interface pour les items du menu
interface MenuItem {
  id: string;
  label: string;
  icon?: string;
  color?: string;
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
    <!-- Hero Section with Glassmorphism -->
    <div class="pokemon-hero glass-dark">
      <div class="hero-background"></div>
      <div class="pokemon-hero-content">
        <h1 class="pokemon-main-title">{{ title }}</h1>
        <div class="pokemon-subtitle glass-light">Une chasse au trésor à travers Lyon</div>
      </div>
    </div>

    <!-- Progress Bar with animated gradient -->
    <div class="progress-section glass-card">
      <v-container>
        <v-row justify="center">
          <v-col cols="12">
            <PokemonHealthBar
              :current="store.done.size"
              :max="steps.length"
              :level="progressPercent"
              name="AVENTURIER"
              label="XP"
              class="progress-animated"
            />
          </v-col>
        </v-row>
      </v-container>
    </div>

    <!-- Dialog de bienvenue Pokémon avec effet de profondeur -->
    <div class="dialog-section">
      <v-container>
        <v-row justify="center">
          <v-col cols="12">
            <PokemonDialog
              :text="welcomeMessage"
              speaker="PROFESSEUR"
              avatar="../../images/prof.png"
              @complete="dialogDone = true"
              class="depth-shadow"
            />
          </v-col>
        </v-row>
      </v-container>
    </div>

    <!-- Menu de navigation avec effet glassmorphism -->
    <transition name="fade" mode="out-in">
      <div class="menu-section" v-if="dialogDone">
        <v-container>
          <v-row justify="center">
            <v-col cols="12">
              <PokemonMenu
                :items="menuItems"
                title="MENU PRINCIPAL"
                @select="handleMenuSelect"
                class="glass-card depth-shadow"
              />
            </v-col>
          </v-row>
        </v-container>
      </div>
    </transition>

    <!-- Dialog des badges Pokémon -->
    <PokemonBadges
      v-model="showBadges"
      :earned="store.done.size"
      :total="steps.length > 8 ? 8 : steps.length"
      :showAnimation="true"
    />

    <!-- Dialogue de confirmation pour la réinitialisation avec glassmorphism -->
    <transition name="scale">
      <div v-if="showResetConfirmation" class="reset-confirmation-overlay blur-bg">
        <div class="reset-confirmation-dialog glass-dark">
          <div class="dialog-content">
            <h3 class="dialog-title">Attention!</h3>
            <div class="glass-separator"></div>
            <p class="dialog-message">{{ resetConfirmationMessage }}</p>
            <div class="dialog-actions">
              <button @click="resetProgress" class="confirm-btn glass-btn glass-btn-primary click-feedback touch-target">Oui, réinitialiser</button>
              <button @click="showResetConfirmation = false" class="cancel-btn click-feedback touch-target">Annuler</button>
            </div>
          </div>
        </div>
      </div>
    </transition>
    
    <!-- Dialogue de confirmation pour revoir l'intro avec glassmorphism -->
    <transition name="scale">
      <div v-if="showIntroConfirmation" class="reset-confirmation-overlay blur-bg">
        <div class="reset-confirmation-dialog glass-dark">
          <div class="dialog-content">
            <h3 class="dialog-title">Revoir l'intro</h3>
            <div class="glass-separator"></div>
            <p class="dialog-message">{{ introConfirmationMessage }}</p>
            <div class="dialog-actions">
              <button @click="resetIntro" class="confirm-btn glass-btn glass-btn-primary click-feedback touch-target">Oui, revoir</button>
              <button @click="showIntroConfirmation = false" class="cancel-btn click-feedback touch-target">Annuler</button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </main>
</template>

<style scoped>
.pokemon-home {
  background: var(--pokemon-black);
  min-height: 100vh;
  padding: 16px;
  color: var(--pokemon-white);
  position: relative;
  overflow: hidden;
}

/* Ajout d'un fond avec effet de rotation pour toute la page */
.pokemon-home::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background-image: 
    radial-gradient(circle at 30% 30%, rgba(255, 61, 40, 0.15) 0%, transparent 60%),
    radial-gradient(circle at 70% 70%, rgba(255, 61, 40, 0.1) 0%, transparent 60%);
  z-index: -1;
  animation: rotate-slow 40s linear infinite;
  pointer-events: none;
}

/* Couche supplémentaire avec des étoiles/points pour créer de la profondeur */
.pokemon-home::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(circle at 10% 20%, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.05) 0.2%, transparent 0.5%),
    radial-gradient(circle at 15% 25%, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.03) 0.2%, transparent 0.4%),
    radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.04) 0.2%, transparent 0.5%),
    radial-gradient(circle at 25% 35%, rgba(255, 255, 255, 0.02) 0%, rgba(255, 255, 255, 0.02) 0.2%, transparent 0.4%),
    radial-gradient(circle at 70% 80%, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.04) 0.2%, transparent 0.5%),
    radial-gradient(circle at 80% 85%, rgba(255, 255, 255, 0.02) 0%, rgba(255, 255, 255, 0.02) 0.2%, transparent 0.4%),
    radial-gradient(circle at 85% 90%, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.03) 0.2%, transparent 0.5%);
  z-index: -2;
  pointer-events: none;
}

/* Hero section with glassmorphism */
.pokemon-hero {
  padding: 50px 16px 30px;
  text-align: center;
  border-radius: var(--border-radius-lg);
  position: relative;
  overflow: hidden;
  margin-bottom: 30px;
  box-shadow: var(--shadow-lg);
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

.hero-background {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle at center, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  z-index: -1;
  animation: rotate-slow-reverse 35s linear infinite; /* Animation en sens inverse pour créer un effet de profondeur */
}

@keyframes rotate-slow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes rotate-slow-reverse {
  from { transform: rotate(0deg); }
  to { transform: rotate(-360deg); }
}

.pokemon-hero-content {
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.pokemon-main-title {
  font-size: 2.2rem;
  font-weight: 700;
  color: var(--pokemon-white);
  margin-bottom: 20px;
  text-shadow: 0 0 15px rgba(255, 61, 40, 0.7);
  letter-spacing: -0.02em;
  /* animation supprimée */
}

.pokemon-subtitle {
  font-size: 1.1rem;
  color: var(--pokemon-white);
  padding: 8px 16px;
  display: inline-block;
  border-radius: var(--border-radius-md);
  margin: 0 auto;
  font-weight: 500;
  box-shadow: var(--shadow-sm);
}

/* Progress bar styles with glassmorphism */
.progress-section {
  padding: 20px;
  margin: 0 10px 30px;
  border-radius: var(--border-radius-lg);
}

.progress-info {
  margin-bottom: 30px;
}

.progress-text {
  font-size: 0.95rem;
  margin-bottom: 10px;
  color: var(--pokemon-white);
  font-weight: 500;
}

/* Dialog section */
.dialog-section {
  margin-bottom: 30px;
  position: relative;
}

/* Menu section with animations */
.menu-section {
  margin-bottom: 30px;
  transition: all 0.3s ease;
}

/* Dialog de confirmation de réinitialisation */
.reset-confirmation-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: var(--z-modal);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.reset-confirmation-dialog {
  width: 100%;
  max-width: 400px;
  border-radius: var(--border-radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-xl);
  position: relative;
  transition: all 0.3s var(--transition-bounce);
}

/* Shine effect for dialogs */
.reset-confirmation-dialog::after {
  content: '';
  position: absolute;
  top: -10px;
  left: -10px;
  right: -10px;
  height: 5px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  border-radius: var(--border-radius-xl) var(--border-radius-xl) 0 0;
  z-index: 0;
}

.dialog-content {
  padding: 25px;
  position: relative;
  z-index: 1;
}

.dialog-title {
  color: var(--pokemon-red);
  font-size: 1.4rem;
  margin-top: 0;
  margin-bottom: 16px;
  text-shadow: 0 0 10px rgba(255, 61, 40, 0.5);
  text-align: center;
  font-weight: 700;
}

.dialog-message {
  color: var(--pokemon-white);
  margin: 20px 0;
  line-height: 1.6;
  text-align: center;
  font-size: 1.05rem;
}

.dialog-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 25px;
}

.confirm-btn, .cancel-btn {
  padding: 12px 25px;
  border-radius: var(--border-radius-md);
  font-weight: bold;
  cursor: pointer;
  border: none;
  transition: all 0.3s ease;
  font-size: 0.95rem;
}

.confirm-btn {
  color: var(--pokemon-white);
}

.cancel-btn {
  background-color: rgba(100, 100, 100, 0.2);
  color: var(--pokemon-white);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Animations */
@keyframes dialog-appear {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 10px rgba(255, 61, 40, 0.5); }
  50% { box-shadow: 0 0 20px rgba(255, 61, 40, 0.8), 0 0 30px rgba(255, 215, 0, 0.5); }
}

/* Media queries for responsive design */
@media (max-width: 768px) {
  .pokemon-main-title {
    font-size: 1.8rem;
    margin-bottom: 15px;
  }
  
  .pokemon-subtitle {
    font-size: 1rem;
    padding: 8px 16px;
  }
  
  .progress-section {
    padding: 15px;
    margin: 0 5px 20px;
  }
  
  .pokemon-hero {
    padding: 40px 16px 25px;
    border-radius: var(--border-radius-md);
    margin-bottom: 20px;
  }
  
  /* Hero background reste à opacité normale */
  
  .dialog-title {
    font-size: 1.3rem;
  }
  
  .dialog-message {
    font-size: 1rem;
  }
  
  .confirm-btn, .cancel-btn {
    padding: 10px 20px;
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .pokemon-main-title {
    font-size: 1.5rem;
    margin-bottom: 12px;
  }
  
  .pokemon-subtitle {
    font-size: 0.85rem;
    padding: 6px 12px;
  }
  
  .pokemon-hero {
    padding: 25px 12px 15px;
    border-radius: var(--border-radius-md);
    margin: 5px;
    margin-bottom: 15px;
  }
  
  .progress-section {
    padding: 12px;
    margin: 0 5px 15px;
  }
  
  /* Hero background reste à opacité normale */
  
  .dialog-actions {
    flex-direction: column;
    gap: 10px;
  }
  
  .confirm-btn, .cancel-btn {
    width: 100%;
    padding: 8px 16px;
  }
}
</style>
