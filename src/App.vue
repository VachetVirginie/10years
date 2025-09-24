<script setup lang="ts">
import { useProgress } from './store/progress'
import { useHunt } from './composables/useHunt'
import { ref, computed, onMounted } from 'vue'
import SplashScreen from './components/SplashScreen.vue'
import IntroScreen from './components/IntroScreen.vue'
import { useResetScroll } from './composables/useResetScroll'
import { useScrollWatcher } from './composables/useScrollWatcher'
const store = useProgress()
store.load()
const { steps, title } = useHunt()

const drawer = ref(false)

// Gestion du splash screen et de l'intro
const showSplashScreen = ref(false)
const showIntroScreen = ref(false)

// Vérifier si c'est la première visite
onMounted(() => {
  const hasSeenSplash = localStorage.getItem('hasSeenSplash')
  const hasSeenIntro = localStorage.getItem('hasSeenIntro')
  
  if (!hasSeenSplash) {
    showSplashScreen.value = true
  } else if (hasSeenSplash && hasSeenIntro) {
    // Si les deux écrans ont été vus, s'assurer que les restrictions sont supprimées
    resetScrollRestrictions()
  }
  
  // Ajouter un gestionnaire d'événement pour s'assurer de libérer le scroll au premier geste de l'utilisateur
  const userInteractionHandler = () => {
    if (!showSplashScreen.value && !showIntroScreen.value) {
      resetScrollRestrictions()
    }
  }
  
  // Ajouter des écouteurs pour divers gestes de l'utilisateur
  document.addEventListener('touchstart', userInteractionHandler, { once: true })
  document.addEventListener('touchmove', userInteractionHandler, { once: true })
  document.addEventListener('click', userInteractionHandler, { once: true })
  document.addEventListener('scroll', userInteractionHandler, { once: true })
})

function onSplashComplete() {
  showSplashScreen.value = false
  
  // Après le splash, vérifier pour l'intro
  const hasSeenIntro = localStorage.getItem('hasSeenIntro')
  if (!hasSeenIntro) {
    showIntroScreen.value = true
  } else {
    // S'assurer que les restrictions de scroll sont supprimées si pas d'intro
    resetScrollRestrictions()
  }
  
  // Marquer le splash comme vu
  localStorage.setItem('hasSeenSplash', 'true')
}

function onIntroComplete() {
  showIntroScreen.value = false
  
  // Marquer l'intro comme vue
  localStorage.setItem('hasSeenIntro', 'true')
  
  // S'assurer que les restrictions de scroll sont supprimées
  resetScrollRestrictions()
}

// Utiliser le composable pour réinitialiser les restrictions de scroll
const { resetScrollRestrictions } = useResetScroll()

// Anniversaire: 10 ans ensemble
const anniversaryYears = 10

// Badge par année (8 premiers correspondent aux badges de Kanto)
const badgeIcons = [
  '🔶', // Badge Roche (Boulder Badge)
  '💧', // Badge Cascade (Cascade Badge) 
  '⚡', // Badge Foudre (Thunder Badge)
  '🌿', // Badge Prisme (Rainbow Badge)
  '💀', // Badge Âme (Soul Badge)
  '🧠', // Badge Marais (Marsh Badge)
  '🔥', // Badge Volcan (Volcano Badge)
  '🌍', // Badge Terre (Earth Badge)
  '❤️', // Badge Coeur (pour la 9e année)
  '💞', // Badge Amour (pour la 10e année)
]

// Calcule le nombre de badges obtenus en fonction de la progression
const earnedBadges = computed(() => {
  const stepCount = steps?.length || 0
  if (stepCount === 0) return 0
  
  // Obtient un badge après avoir complété 10% des étapes
  const progress = store.done.size / stepCount
  return Math.min(Math.floor(progress * 10), badgeIcons.length)
})
</script>

<template>
  <v-app class="pokemon-app">
    <!-- Splash Screen au démarrage -->
    <SplashScreen v-if="showSplashScreen" @complete="onSplashComplete" />
    
    <!-- Écran d'introduction -->
    <IntroScreen v-if="showIntroScreen" @complete="onIntroComplete" />
    <!-- Navigation Drawer - Thème Pokémon -->
    <v-navigation-drawer
      v-model="drawer"
      app
      temporary
      class="pokemon-drawer gradient-dark"
    >
      <div class="drawer-header">
        <h3 class="text-white">Menu</h3>
      </div>
      
      <v-list class="nav-list">
        <v-list-item
          to="/"
          class="nav-item"
        >
          <template #prepend>
            <v-icon>mdi-home</v-icon>
          </template>
          <v-list-item-title>Accueil</v-list-item-title>
        </v-list-item>
        
        <!-- <v-list-item
          to="/map"
          class="nav-item"
        >
          <template #prepend>
            <v-icon>mdi-map</v-icon>
          </template>
          <v-list-item-title>Carte</v-list-item-title>
        </v-list-item> -->
        
        <v-divider class="my-2"></v-divider>
        
        <v-list-item
          v-if="steps?.length > 0"
          :to="`/step/${store.done.size === 0 ? 1 : store.currentIndex + 1}`"
          class="nav-item"
        >
          <template #prepend>
            <v-icon>mdi-play-circle</v-icon>
          </template>
          <v-list-item-title>{{ store.done.size === 0 ? 'Commencer' : 'Continuer' }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- App Bar - Thème Pokémon (Version Mobile) -->
    <v-app-bar
      app
      class="pokemon-header"
      color="var(--pokemon-red)"
      elevation="2"
      height="56"
    >
      <v-app-bar-nav-icon
        @click="drawer = !drawer"
        class="pokemon-menu-btn"
        color="white"
        size="large"
      >
        <span class="pokemon-menu-icon">
          <img src="https://archives.bulbagarden.net/media/upload/7/79/Dream_Pok%C3%A9_Ball_Sprite.png" width="24" alt="Poké Ball" class="menu-pokeball animate-pulse">
        </span>
      </v-app-bar-nav-icon>
      
      <v-toolbar-title class="pokemon-title">
        Chasse au trésor
      </v-toolbar-title>
      
      <v-spacer />
      
      <!-- Barre de progression stylisée -->
      <div class="header-progress" v-if="steps && steps.length > 0">
        <div class="progress-bar header-progress-bar">
          <div 
            class="progress-fill header-progress-fill"
            :style="{ width: `${(store.done.size / steps.length) * 100}%` }"
          >
            <div class="progress-shine"></div>
          </div>
          <div 
            v-for="index in Math.min(steps.length, 8)" 
            :key="index"
            class="progress-step header-progress-step"
            :class="{ 'step-completed': index <= earnedBadges }"
            :style="{ left: `${((index - 1) / (Math.min(steps.length, 8) - 1)) * 100}%` }"
          ></div>
        </div>
        <span class="progress-text header-progress-text">{{ store.done.size }}/{{ steps.length }}</span>
      </div>
      
      <!-- Bouton carte -->
      <!-- <v-btn
        icon
        to="/map"
        class="map-btn"
      >
        <v-icon>mdi-map</v-icon>
      </v-btn> -->
    </v-app-bar>

    <!-- Main Content -->
    <v-main class="pokemon-main">
      <div class="pokemon-background">
        <router-view />
      </div>
    </v-main>
  </v-app>
</template>

<style scoped>
/* Animation pour les coeurs et pétales qui tombent */
@keyframes floating {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-15px) rotate(5deg); }
}

@keyframes heart-beat {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

@keyframes badge-shine {
  0% { box-shadow: 0 0 5px var(--pokemon-red); }
  50% { box-shadow: 0 0 15px var(--pokemon-red), 0 0 20px var(--pokemon-white); }
  100% { box-shadow: 0 0 5px var(--pokemon-red); }
}

@keyframes love-float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  33% { transform: translateY(-8px) rotate(5deg); }
  66% { transform: translateY(-4px) rotate(-3deg); }
}

/* Styles généraux de l'application */
.pokemon-app {
  background: var(--pokemon-black);
  min-height: 100vh;
  font-family: var(--font-family-main);
}

/* Header Pokémon */
.pokemon-header {
  background: var(--pokemon-red) !important;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5) !important;
  border-bottom: 1px solid var(--pokemon-red-dark);
  position: relative;
  overflow: hidden;
}

/* Effet de particules flottantes dans le header */
.pokemon-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(circle at 10% 20%, rgba(0, 0, 0, 0.3) 1px, transparent 1px),
    radial-gradient(circle at 90% 60%, rgba(0, 0, 0, 0.3) 1px, transparent 1px),
    radial-gradient(circle at 40% 80%, rgba(0, 0, 0, 0.3) 1px, transparent 1px),
    radial-gradient(circle at 70% 30%, rgba(0, 0, 0, 0.3) 1px, transparent 1px);
  background-size: 100px 100px;
  opacity: 0.3;
  z-index: 0;
}

.pokemon-title-container {
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
  z-index: 1;
}

.pokemon-title {
  color: var(--pokemon-white) !important;
  font-weight: var(--font-weight-bold) !important;
  font-size: 1.1rem !important;
  letter-spacing: -0.025em;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

/* Styles de la barre de progression dans le header */
.header-progress {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 12px;
  min-width: 180px;
  max-width: 240px;
  width: 30vw;
  background: rgba(0, 0, 0, 0.2);
  padding: 6px 10px;
  border-radius: 10px;
}

.header-progress-bar {
  height: 8px;
  width: 100%;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  position: relative;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.3);
  margin-bottom: 3px;
  overflow: visible;
}

.header-progress-fill {
  height: 100%;
  background: linear-gradient(to right, #ffd700, #ffaa00);
  border-radius: 10px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 0 5px rgba(255, 215, 0, 0.7);
}

.header-progress-step {
  width: 5px;
  height: 5px;
  background-color: rgba(255, 255, 255, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 50%;
  position: absolute;
  top: 0.5px;
  transform: translateX(-50%);
  z-index: 2;
}

.header-progress-text {
  font-size: 0.75rem;
  color: white;
  font-weight: 600;
}

/* Animations et styles existants */
.progress-shine {
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
  animation: shine 2s infinite;
}

@keyframes shine {
  0% { left: -100%; }
  100% { left: 100%; }
}

.step-completed {
  background-color: #ffd700; /* Couleur or pour les badges obtenus */
  box-shadow: 0 0 5px #ffd700;
  border-color: rgba(255, 255, 255, 0.7);
}

.map-btn {
  color: white !important;
  background: rgba(0, 0, 0, 0.2) !important;
  transition: var(--transition-speed) var(--transition-timing) !important;
}

/* Menu button simplifié */
.pokemon-menu-btn {
  background: transparent !important;
  border-radius: 50% !important;
  transition: var(--transition-speed) var(--transition-timing) !important;
  z-index: 1;
}

.menu-pokeball {
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
  width: 22px !important;
  height: 22px !important;
}

/* Drawer avec thème Pokémon */
.pokemon-drawer {
  border-right: none;
  position: relative;
}

.pokemon-drawer::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><path fill="%23FFFFFF20" d="M10,0 C6.7,0 4,2.7 4,6 C4,11.5 10,18 10,18 C10,18 16,11.5 16,6 C16,2.7 13.3,0 10,0 Z"></path></svg>');
  background-size: 50px 50px;
  opacity: 0.2;
  z-index: 0;
  pointer-events: none;
}

/* Styles de menu simplifiés */
.drawer-header {
  padding: var(--spacing-md);
  background: rgba(0, 0, 0, 0.2);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.drawer-header h3 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 500;
}

/* Items de navigation */
.nav-list {
  padding-top: var(--spacing-sm);
}

.nav-item {
  border-radius: 0 !important;
  height: 48px;
  margin: 0 !important;
  padding: 0 var(--spacing-md) !important;
  color: var(--pokemon-white) !important;
}

.nav-item:hover {
  background: var(--pokemon-red) !important;
}

.nav-item .v-icon {
  color: var(--pokemon-white) !important;
  opacity: 0.8;
}



/* Contenu principal */
.pokemon-main {
  min-height: 100vh;
  position: relative;
}

.pokemon-background {
  background: var(--pokemon-black);
  min-height: 100vh;
  position: relative;
  border-radius: 0;
  overflow: hidden;
  z-index: 1;
  padding-bottom: env(safe-area-inset-bottom);
  color: var(--pokemon-white);
}

/* Background d'amour */
.pokemon-background::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><path fill="%23FF69B410" d="M10,0 C6.7,0 4,2.7 4,6 C4,11.5 10,18 10,18 C10,18 16,11.5 16,6 C16,2.7 13.3,0 10,0 Z"></path></svg>'),
    url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><circle fill="%23FF69B410" cx="12" cy="12" r="10"/></svg>');
  background-size: 100px 100px, 120px 120px;
  background-position: 0 0, 50px 50px;
  opacity: 0.3;
  z-index: -1;
}

/* Focus visible - accessibilité */
:focus-visible { 
  outline: 3px solid #FF1493 !important; 
  outline-offset: 2px; 
}

/* Responsive */
@media (max-width: 768px) {
  .pokemon-title {
    font-size: 1rem !important;
  }
  
  .badges-container {
    gap: 2px;
  }
  
  .badge-icon {
    width: 18px;
    height: 18px;
    font-size: 0.7rem;
  }
  
  .header-progress {
    min-width: 120px;
    width: 40vw;
    padding: 3px 6px;
    margin-right: 8px;
  }
  
  .header-progress-bar {
    height: 6px;
    margin-bottom: 2px;
  }
  
  .header-progress-step {
    width: 3px;
    height: 3px;
    top: 1px;
  }
  
  .header-progress-text {
    font-size: 0.65rem;
  }
  
  .pokemon-background {
    border-radius: 15px 15px 0 0;
  }
  
  .badges-progress {
    padding: 5px 8px;
  }
}
</style>
