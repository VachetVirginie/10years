<template>
  <div class="mission-complete-overlay">
    <div class="mission-complete-container glass-card">
      <div class="particles-container">
        <div class="particle"></div>
        <div class="particle"></div>
        <div class="particle"></div>
        <div class="particle"></div>
        <div class="particle"></div>
        <div class="particle"></div>
        <div class="particle"></div>
        <div class="particle"></div>
      </div>
      
      <div class="mission-complete-content">
        <div class="mission-complete-header">
          <h1 class="mission-complete-title">Mission Accomplie !</h1>
        </div>
        
        <div class="celebration-icon">🎉</div>
        
        <div class="message-container">
          <p class="mission-complete-message">
            Félicitations, tu as terminé toutes les étapes de cette chasse au trésor !
          </p>
          <p class="mission-complete-subtext">
            Ce voyage ensemble n'est que le début d'une belle aventure...
          </p>
        </div>
        
        <div class="stats-container glass-panel">
          <h3 class="stats-title">Tes Statistiques</h3>
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-value">{{ completedSteps }}</div>
              <div class="stat-label">Étapes complétées</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ timeSpent }}</div>
              <div class="stat-label">Temps écoulé</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ photosTaken }}</div>
              <div class="stat-label">Photos prises</div>
            </div>
          </div>
        </div>
        
        <div class="special-message glass-panel">
          <div class="message-icon">💖</div>
          <p class="special-text">{{ specialMessage }}</p>
        </div>
        
        <v-btn 
          @click="returnToHome"
          class="glass-button home-button"
          rounded="pill"
          size="large"
          elevation="0"
        >
          <v-icon start>mdi-home</v-icon>
          Retour à l'accueil
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useProgress } from '../store/progress';

const router = useRouter();
const progress = useProgress();

progress.load(); // Charger le progrès

// Propriétés calculées pour les statistiques
const completedSteps = computed(() => progress.done.size);
const startTime = ref(localStorage.getItem('huntStartTime') || Date.now().toString());
const timeSpent = computed(() => {
  const start = parseInt(startTime.value);
  const now = Date.now();
  const diff = now - start;
  
  // Convertir en minutes
  const minutes = Math.floor(diff / 60000);
  
  if (minutes < 60) {
    return `${minutes} min`;
  } else {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}min`;
  }
});

// Photos prises (estimation basée sur les étapes terminées)
const photosTaken = computed(() => {
  // On peut ajuster ce calcul selon comment on veut compter les photos
  // Par exemple, si on suppose que l'utilisateur prend une photo à chaque étape
  return completedSteps.value;
});

// Message spécial personnalisé
const specialMessage = ref("Merci d'avoir partagé cette belle aventure. Notre amour est le plus beau des trésors.");

// Animation de confettis
onMounted(() => {
  // Sauvegarder le temps de départ si pas déjà fait
  if (!localStorage.getItem('huntStartTime')) {
    localStorage.setItem('huntStartTime', Date.now().toString());
  }

  // Animation des particules (pour un effet de confettis)
  animateParticles();
});

// Fonction pour animer les particules
function animateParticles() {
  const particles = document.querySelectorAll('.particle');
  particles.forEach((particle, index) => {
    const element = particle as HTMLElement;
    // Position aléatoire
    element.style.left = `${Math.random() * 100}%`;
    element.style.animationDelay = `${index * 0.2}s`;
    // Taille et couleur aléatoires
    const size = 5 + Math.random() * 10;
    element.style.width = `${size}px`;
    element.style.height = `${size}px`;
    // Couleurs festives
    const colors = ['#FF5252', '#FF4081', '#E040FB', '#7C4DFF', '#536DFE', '#448AFF', '#40C4FF', '#18FFFF', '#64FFDA', '#69F0AE', '#B2FF59', '#EEFF41', '#FFFF00', '#FFD740', '#FFAB40', '#FF6E40'];
    element.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
  });
}

// Retour à l'accueil
function returnToHome() {
  router.push('/');
}
</script>

<style scoped>
@import '../assets/glassmorphism.css';

.mission-complete-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  background-image: radial-gradient(circle at center, rgba(50, 50, 50, 0.8) 0%, rgba(20, 20, 20, 0.95) 70%);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  padding: 20px;
}

.mission-complete-container {
  background: rgba(33, 33, 33, 0.7);
  border-radius: 20px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 8px 32px var(--glass-shadow-strong);
  border: 1px solid var(--glass-border-light);
  position: relative;
  backdrop-filter: blur(var(--glass-blur-medium));
  -webkit-backdrop-filter: blur(var(--glass-blur-medium));
  animation: appear 1s ease-out;
  scrollbar-width: none; /* Cacher la barre de défilement sur Firefox */
}

.mission-complete-container::-webkit-scrollbar {
  display: none; /* Cacher la barre de défilement sur Chrome/Safari */
}

.mission-complete-content {
  padding: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 2;
}

.mission-complete-header {
  text-align: center;
  margin-bottom: 20px;
}

.mission-complete-title {
  font-size: 2.5rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  margin: 0;
  background: linear-gradient(45deg, #FF5252, #FF4081, #7C4DFF, #536DFE, #64FFDA);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation: gradient 3s ease infinite;
  background-size: 300% 300%;
}

.celebration-icon {
  font-size: 5rem;
  margin: 20px 0;
  animation: bounce 1.5s infinite alternate ease-in-out;
}

.message-container {
  text-align: center;
  margin-bottom: 30px;
}

.mission-complete-message {
  font-size: 1.3rem;
  color: white;
  margin-bottom: 10px;
}

.mission-complete-subtext {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.8);
  font-style: italic;
}

.stats-container {
  width: 100%;
  margin-bottom: 30px;
  padding: 20px;
  border-radius: 16px;
  background: rgba(50, 50, 50, 0.5);
  border: 1px solid var(--glass-border-light);
}

.stats-title {
  text-align: center;
  margin-bottom: 15px;
  color: white;
  font-size: 1.3rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  text-align: center;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: bold;
  color: white;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
}

.special-message {
  width: 100%;
  margin-bottom: 30px;
  padding: 20px;
  text-align: center;
  border-radius: 16px;
  background: rgba(50, 50, 50, 0.5);
  border: 1px solid var(--glass-border-light);
  position: relative;
}

.message-icon {
  font-size: 2.5rem;
  margin-bottom: 15px;
  animation: pulse 2s infinite;
}

.special-text {
  font-size: 1.1rem;
  color: white;
  line-height: 1.5;
  font-style: italic;
}

.home-button {
  min-width: 200px;
  font-size: 1.1rem;
  margin-top: 20px;
  background: rgba(255, 255, 255, 0.2) !important;
  border: 1px solid var(--glass-border-light) !important;
  color: white !important;
  font-weight: bold !important;
  transition: var(--glass-transition);
  padding: 12px 24px !important;
}

.home-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.25) !important;
  background: rgba(255, 255, 255, 0.3) !important;
}

.glass-panel {
  backdrop-filter: blur(var(--glass-blur-light));
  -webkit-backdrop-filter: blur(var(--glass-blur-light));
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  transition: var(--glass-transition);
}

.glass-panel:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.particles-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 1;
}

.particle {
  position: absolute;
  top: -20px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  animation: fall 5s linear infinite;
}

@keyframes appear {
  0% {
    opacity: 0;
    transform: translateY(20px) scale(0.9);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes bounce {
  0% { transform: translateY(0); }
  100% { transform: translateY(-10px); }
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

@keyframes gradient {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

@keyframes fall {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(360deg);
    opacity: 0;
  }
}

@media (max-width: 600px) {
  .mission-complete-title {
    font-size: 2rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .mission-complete-container {
    width: 95%;
  }
  
  .celebration-icon {
    font-size: 4rem;
  }
  
  .mission-complete-message {
    font-size: 1.1rem;
  }
  
  .special-text {
    font-size: 1rem;
  }
  
  .stat-value {
    font-size: 1.5rem;
  }
}
</style>
