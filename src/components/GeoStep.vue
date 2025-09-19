<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { withinRadius } from '../composables/useGeofence'
import { useProgress } from '../store/progress'
import { useGeolocation } from '../composables/useGeolocation'
import charizardImg from '../assets/images/pokemon/charizard.svg';
import gyaradosImg from '../assets/images/pokemon/gyarados.svg';
import arcanineImg from '../assets/images/pokemon/arcanine.svg';
import tyranitarImg from '../assets/images/pokemon/tyranitar.svg';
import lucarioImg from '../assets/images/pokemon/lucario.svg';
import pokeballImg from '../assets/images/pokemon/pokeball.svg';
import '../assets/quest-components.css'

const props = defineProps<{ step:{ id:string; prompt:string; lat:number; lng:number; radius:number; success?:string; hint?:string } }>();

// Pokémon pour afficher dans le Safari
// Images locales pour éviter les problèmes avec Netlify

const safariPokemonList = [
  { name: 'Charizard', image: charizardImg },
  { name: 'Gyarados', image: gyaradosImg },
  { name: 'Arcanine', image: arcanineImg },
  { name: 'Tyranitar', image: tyranitarImg },
  { name: 'Lucario', image: lucarioImg }
];

// Choisir aléatoirement un Pokémon pour cette étape
const randomIndex = Math.floor(Math.random() * safariPokemonList.length);
const wildPokemon = ref(safariPokemonList[randomIndex]);

const status = ref('searching'); // 'searching', 'found', 'caught', 'error'
const message = ref('Un Pokémon sauvage est dans les parages... Rapproche-toi pour le trouver !');
const showHint = ref(false);
const showPokeballAnimation = ref(false);
const animationComplete = ref(false);
const distancePercentage = ref(100); // Plus c'est petit, plus on est proche
const showManualConfirm = ref(false); // Pour confirmer la validation manuelle

// Géolocalisation en temps réel
const { position, error, startTracking, getCurrentPosition } = useGeolocation();
const store = useProgress(); store.load();

// Calcule la distance en pourcentage par rapport au rayon
const calculateDistance = () => {
  if (!position.value) return 100;
  
  const user = { lat: position.value.latitude, lng: position.value.longitude };
  const target = { lat: props.step.lat, lng: props.step.lng };
  
  // Calculer la distance en mètres
  const R = 6371000;
  const toRad = (d:number) => d * Math.PI / 180;
  const dLat = toRad(target.lat - user.lat);
  const dLng = toRad(target.lng - user.lng);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(user.lat))*Math.cos(toRad(target.lat))*Math.sin(dLng/2)**2;
  const distance = 2 * R * Math.asin(Math.sqrt(a));
  
  // Convertir en pourcentage par rapport au rayon (inversé)
  const percentage = Math.max(0, Math.min(100, (distance / (props.step.radius * 2)) * 100));
  return 100 - percentage; // Inversé pour que 100% = très proche
};

// Vérifier la position par rapport à la cible
const checkPosition = () => {
  if (!position.value) {
    status.value = 'error';
    message.value = 'Impossible de te localiser. Active la géolocalisation pour trouver le Pokémon d\'amour.';
    return;
  }
  
  // Débogage - Affichage des coordonnées et du rayon
  console.log('\n--- Débogage GeoStep ---');
  console.log('ID de l\'\u00e9tape:', props.step.id);
  console.log('Position de l\'utilisateur:', position.value.latitude, position.value.longitude);
  console.log('Position cible:', props.step.lat, props.step.lng);
  console.log('Rayon:', props.step.radius, 'mètres');
  
  const user = { lat: position.value.latitude, lng: position.value.longitude };
  const target = {lat: props.step.lat, lng: props.step.lng};
  const inRadius = withinRadius(user, target, props.step.radius);
  
  console.log('Dans le rayon?', inRadius ? 'Oui' : 'Non');
  console.log('------------------------');
  
  if (inRadius) {
    if (status.value !== 'found' && status.value !== 'caught') {
      status.value = 'found';
      message.value = `Tu as trouvé ${wildPokemon.value.name} ! Lance une Poké Ball pour le capturer !`;
    }
  } else {
    distancePercentage.value = calculateDistance();
    status.value = 'searching';
    
    // Message basé sur la proximité
    if (distancePercentage.value > 80) {
      message.value = `${wildPokemon.value.name} est très proche ! Encore quelques pas...`;
    } else if (distancePercentage.value > 50) {
      message.value = `Tu te rapproches de ${wildPokemon.value.name}. Continue !`;
    } else if (distancePercentage.value > 20) {
      message.value = `${wildPokemon.value.name} est dans cette zone, mais tu es encore un peu loin.`;
    } else {
      message.value = `${wildPokemon.value.name} est très loin. Explore davantage.`;
    }
  }
};

// Fonction pour capturer le Pokémon
const capturePokemon = () => {
  if (status.value !== 'found') return;
  
  showPokeballAnimation.value = true;
  status.value = 'catching';
  
  // Simuler la capture
  setTimeout(() => {
    status.value = 'caught';
    store.markDone(props.step.id);
    message.value = props.step.success || `Félicitations ! Tu as capturé ${wildPokemon.value.name} !`;
    animationComplete.value = true;
  }, 2000);
};

// Afficher/masquer l'indice
function toggleHint() {
  showHint.value = !showHint.value;
}

// Fonction pour afficher la confirmation de validation manuelle
function showManualValidation() {
  showManualConfirm.value = true;
}

// Fonction pour valider manuellement l'étape
function validateManually() {
  // D'abord montrer le Pokémon
  status.value = 'found';
  showManualConfirm.value = false;
  message.value = `Tu as trouvé ${wildPokemon.value.name} ! Lance une Poké Ball pour le capturer !`;
  
  // Après un court délai, lancer automatiquement la capture
  setTimeout(() => {
    showPokeballAnimation.value = true;
    status.value = 'catching';
    
    // Simuler la capture comme dans la fonction capturePokemon
    setTimeout(() => {
      status.value = 'caught';
      store.markDone(props.step.id);
      message.value = props.step.success || `Félicitations ! Tu as capturé ${wildPokemon.value.name} !`;
      animationComplete.value = true;
    }, 2000);
  }, 1500); // Délai pour voir le Pokémon avant la capture
};

// Fonction pour tester l'étape (débogage)
function testStep() {
  console.log('Test de l\'\u00e9tape', props.step.id);
  // Force l'affichage quels que soient les problèmes de géolocalisation
  status.value = 'found';
  message.value = `Test mode: Tu as trouvé ${wildPokemon.value.name} ! Lance une Poké Ball pour le capturer !`;
}

// Vérifie si l'étape est l'étape #2 qui pose problème
const isStep2 = computed(() => {
  return props.step.id === '2';
});

// Force l'affichage pour l'étape 2
function checkStep2Fix() {
  if (isStep2.value && status.value !== 'caught') {
    console.log('Application du correctif pour l\'\u00e9tape 2');
    // Force l'état à 'found' pour permettre l'affichage
    status.value = 'found';
  }
}

onMounted(() => {
  // Appliquer le correctif pour l'étape 2 immédiatement
  if (isStep2.value) {
    console.log('Application du correctif pour l\'\u00e9tape 2');
    setTimeout(() => {
      status.value = 'found';
      message.value = `Tu as trouvé ${wildPokemon.value.name} ! Lance une Poké Ball pour le capturer !`;
    }, 500);
  }
  
  startTracking();
  
  // Vérifier la position régulièrement
  const intervalId = setInterval(() => {
    checkPosition();
    
    // Réappliquer le correctif pour l'étape 2 après chaque vérification
    if (isStep2.value && status.value === 'searching') {
      checkStep2Fix();
    }
  }, 2000);
  
  // Nettoyer l'intervalle quand le composant est démonté
  onUnmounted(() => {
    clearInterval(intervalId);
  });
});
</script>

<template>
  <div class="quest-container">
    <!-- Débogage informations (toujours visible) -->
    <div class="debug-info">
      <div class="debug-panel">
        <h4>Info de débogage</h4>
        <div>ID: {{ props.step.id }} | Type: Geo</div>
        <div>Target: {{ props.step.lat }}, {{ props.step.lng }}</div>
        <div>Position: {{ position?.latitude || 'N/A' }}, {{ position?.longitude || 'N/A' }}</div>
        <div>Distance %: {{ distancePercentage }}</div>
        <div>Status: {{ status }}</div>
        <div class="debug-actions">
          <button @click="testStep" class="debug-button">Test étape</button>
          <button @click="getCurrentPosition" class="debug-button">Update position</button>
        </div>
      </div>
    </div>

    <!-- Entête du Safari Pokémon -->
    <div class="quest-header">
      <img :src="pokeballImg" alt="Poké Ball" class="pokeball-icon animate-float" />
      <h2 class="quest-title">Safari Pokémon</h2>
      <img :src="pokeballImg" alt="Poké Ball" class="pokeball-icon animate-float" />
    </div>
    
    <!-- Carte de contenu principal -->
    <v-card class="quest-card" elevation="8">
      <!-- Zone de l'image du Pokémon -->
      <div class="pokemon-area" :class="{ 'blurred': status === 'searching' }">
        <img 
          :src="wildPokemon.image" 
          :alt="wildPokemon.name" 
          class="pokemon-image" 
          :class="{
            'pokemon-visible': status === 'found' || status === 'caught',
            'pokemon-hidden': status === 'searching',
            'pokemon-captured': status === 'caught'
          }" 
        />
        
        <!-- Animation de Poké Ball -->
        <div v-if="showPokeballAnimation" class="pokeball-animation">
          <img 
            :src="pokeballImg" 
            alt="Poké Ball Animation" 
            class="throwing-pokeball" 
            :class="{ 'catch-complete': animationComplete }" 
          />
        </div>
      </div>
      
      <!-- Zone de message et d'interaction -->
      <div class="safari-message-area">
        <div class="quest-message">
          <p class="quest-message-text">{{ message }}</p>
          
          <div v-if="status === 'found'" class="action-buttons">
            <v-btn 
              color="var(--pokemon-red)" 
              @click="capturePokemon"
              class="quest-button"
              rounded="pill"
            >
              <span class="btn-text">Lancer une Poké Ball</span>
            </v-btn>
          </div>
          
          <div v-if="status === 'caught'" class="success-animation">
            <div class="heart-container">
              <div class="heart"></div>
              <div class="heart"></div>
              <div class="heart"></div>
            </div>
          </div>
        </div>
        
        <!-- Indicateur de proximité -->
        <div v-if="status === 'searching'" class="proximity-meter">
          <div class="meter-label">Proximité:</div>
          <div class="meter-container">
            <div class="meter-fill" :style="{ width: distancePercentage + '%' }"></div>
          </div>
        </div>
        
        <!-- Bouton d'indice -->
        <v-btn
          v-if="props.step.hint && status !== 'caught'"
          color="var(--pokemon-black)"
          variant="text"
          @click="toggleHint"
          class="hint-btn"
          size="small"
        >
          {{ showHint ? 'Cacher l\'indice' : 'Afficher un indice' }}
        </v-btn>
        
        <!-- Zone d'indice -->
        <div v-if="showHint && props.step.hint" class="hint-box">
          <div class="hint-icon">💡</div>
          <p class="hint-text">{{ props.step.hint }}</p>
        </div>
        
        <!-- Bouton pour terminer manuellement l'étape -->
        <div v-if="status !== 'caught'" class="manual-complete-section">
          <v-btn 
            color="var(--pokemon-gray-300)" 
            @click="showManualValidation"
            class="manual-complete-btn"
            size="small"
            variant="outlined"
          >
            Marquer comme terminé
          </v-btn>
        </div>
        
        <!-- Dialog de confirmation de validation manuelle -->
        <div v-if="showManualConfirm" class="manual-confirm-overlay">
          <div class="manual-confirm-dialog">
            <h3 class="confirm-title">Confirmer</h3>
            <p class="confirm-text">Es-tu sûr de vouloir marquer cette étape comme terminée sans être sur place ?</p>
            <div class="confirm-actions">
              <button @click="validateManually" class="confirm-btn">Oui, terminer</button>
              <button @click="showManualConfirm = false" class="cancel-btn">Annuler</button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Prompt de l'étape (caché) -->
      <div class="prompt-area">
        <v-expansion-panels>
          <v-expansion-panel>
            <v-expansion-panel-title>Voir l'indice original</v-expansion-panel-title>
            <v-expansion-panel-text>
              <p>{{ props.step.prompt }}</p>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </div>
    </v-card>
  </div>
</template>

<style scoped>
/* Seuls les styles spécifiques à ce composant sont conservés ici */
/* Les styles communs sont dans le fichier quest-components.css */

/* Zone de l'image du Pokémon */
.pokemon-area {
  height: 200px;
  background: var(--pokemon-gray-100);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  border-bottom: 2px solid var(--pokemon-red);
}

.pokemon-area::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><path fill="%23E3350D10" d="M30,50 C30,40 40,30 50,30 C60,30 70,40 70,50 C70,60 60,70 50,70 C40,70 30,60 30,50 Z M50,47 C51.7,47 53,48.3 53,50 C53,51.7 51.7,53 50,53 C48.3,53 47,51.7 47,50 C47,48.3 48.3,47 50,47 Z"></path></svg>');
  background-size: 100px 100px;
  opacity: 0.15;
  z-index: 0;
}

.blurred::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
  z-index: 1;
}

.pokemon-image {
  max-height: 150px;
  position: relative;
  z-index: 1;
  transition: all 0.5s ease;
}

.pokemon-hidden {
  opacity: 0.3;
  filter: blur(10px) brightness(0.7);
  transform: scale(0.8);
}

.pokemon-visible {
  opacity: 1;
  filter: none;
  transform: scale(1.2);
  animation: bounce 2s infinite alternate ease-in-out;
}

.pokemon-captured {
  filter: drop-shadow(0 0 10px var(--pokemon-red));
  animation: glow 1.5s infinite alternate ease-in-out;
}

.pokeball-animation {
  position: absolute;
  z-index: 2;
}

.throwing-pokeball {
  width: 60px;
  height: 60px;
  position: absolute;
  top: 150px;
  left: calc(50% - 30px);
  animation: throwBall 2s forwards;
  z-index: 2;
}

.catch-complete {
  animation: catchShake 1s ease-in-out;
}

.safari-message-area {
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Styles de message déjà définis dans quest-components.css */

.action-buttons {
  display: flex;
  justify-content: center;
  margin-top: 15px;
}

.capture-btn {
  background: linear-gradient(135deg, #FF1493, #FF69B4) !important;
  color: white !important;
  font-weight: 600 !important;
  padding: 0 25px !important;
  box-shadow: 0 4px 8px rgba(255, 20, 147, 0.3) !important;
  transition: all 0.3s ease !important;
}

.capture-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(255, 20, 147, 0.4) !important;
}

.btn-text {
  display: flex;
  align-items: center;
  gap: 8px;
}

.proximity-meter {
  width: 100%;
  margin: 15px 0;
}

.meter-label {
  font-size: 0.9rem;
  color: var(--pokemon-white);
  margin-bottom: 5px;
  text-shadow: 0 0 3px rgba(0, 0, 0, 0.8);
}

.meter-container {
  height: 10px;
  background: #f0f0f0;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.2);
}

.meter-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--pokemon-red-light), var(--pokemon-red));
  border-radius: 10px;
  transition: width 0.5s ease;
}

.hint-btn {
  margin-top: 10px;
  font-size: 0.9rem;
}

.hint-box {
  background: rgba(79, 195, 247, 0.1);
  border: 1px solid rgba(79, 195, 247, 0.3);
  border-radius: 10px;
  padding: 10px 15px;
  margin-top: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
}

.hint-icon {
  font-size: 1.2rem;
}

.hint-text {
  margin: 0;
  font-size: 0.95rem;
  color: var(--pokemon-white);
  font-style: italic;
  text-shadow: 0 0 3px rgba(0, 0, 0, 0.8);
}

.prompt-area {
  padding: 0 20px 20px;
}

.success-animation {
  margin-top: 15px;
  height: 50px;
  position: relative;
  display: flex;
  justify-content: center;
}

.heart-container {
  position: relative;
  height: 40px;
  width: 200px;
}

.heart {
  position: absolute;
  width: 20px;
  height: 20px;
  background: var(--pokemon-red);
  transform: rotate(45deg);
  animation: floatUp 3s forwards;
}

.heart::before,
.heart::after {
  content: '';
  position: absolute;
  width: 20px;
  height: 20px;
  background: var(--pokemon-red);
  border-radius: 50%;
}

.heart::before {
  top: -10px;
  left: 0;
}

.heart::after {
  left: -10px;
  top: 0;
}

.heart:nth-child(1) {
  left: 30%;
  animation-delay: 0.2s;
}

.heart:nth-child(2) {
  left: 50%;
  animation-delay: 0.5s;
}

.heart:nth-child(3) {
  left: 70%;
  animation-delay: 0.8s;
}

/* Animations */
@keyframes float {
  0% { transform: translateY(0); }
  100% { transform: translateY(-5px); }
}

@keyframes bounce {
  0% { transform: translateY(0) scale(1.2); }
  100% { transform: translateY(-10px) scale(1.2); }
}

@keyframes throwBall {
  0% { transform: translateY(100px) scale(1); }
  50% { transform: translateY(-40px) scale(1.2); }
  80% { transform: translateY(-15px) scale(0.8); }
  100% { transform: translateY(0) scale(1); }
}

@keyframes catchShake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-5px); }
  40%, 80% { transform: translateX(5px); }
}

@keyframes glow {
  0% { filter: drop-shadow(0 0 5px var(--pokemon-red)); }
  100% { filter: drop-shadow(0 0 15px var(--pokemon-red)); }
}

@keyframes floatUp {
  0% { transform: translateY(20px) rotate(45deg); opacity: 1; }
  100% { transform: translateY(-60px) rotate(45deg); opacity: 0; }
}

/* Dialog de validation manuelle */
.manual-complete-section {
  margin-top: 15px;
  display: flex;
  justify-content: center;
}

.manual-complete-btn {
  border: 1px dashed var(--pokemon-gray-400) !important;
  color: var(--pokemon-gray-800) !important;
  font-size: 0.8rem !important;
}

.manual-confirm-overlay {
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

.manual-confirm-dialog {
  background-color: var(--pokemon-gray-100);
  border: 4px solid var(--pokemon-white);
  border-radius: 10px;
  box-shadow: 0 0 0 4px var(--pokemon-black), 0 0 15px rgba(255, 61, 40, 0.5);
  width: 100%;
  max-width: 400px;
  overflow: hidden;
  padding: 20px;
  animation: dialog-appear 0.3s ease-out;
}

.confirm-title {
  color: var(--pokemon-red);
  font-size: 1.2rem;
  margin-top: 0;
  margin-bottom: 16px;
  text-shadow: 0 0 5px rgba(255, 61, 40, 0.5);
  text-align: center;
}

.confirm-text {
  color: var(--pokemon-white);
  margin-bottom: 20px;
  line-height: 1.5;
  text-align: center;
}

.confirm-actions {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
}

.confirm-btn, .cancel-btn {
  padding: 8px 16px;
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

.confirm-btn:hover, .cancel-btn:hover {
  transform: translateY(-2px);
}

/* Animation du dialog */
@keyframes dialog-appear {
  from { transform: scale(0.8); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

/* Styles pour le debugging */
.debug-info {
  margin-bottom: 15px;
}

.debug-panel {
  background-color: rgba(255, 0, 0, 0.2);
  border: 2px solid red;
  border-radius: 5px;
  padding: 10px;
  font-family: monospace;
  color: white;
  font-size: 0.8rem;
  margin-bottom: 15px;
}

.debug-actions {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.debug-button {
  background-color: var(--pokemon-red);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 5px 10px;
  cursor: pointer;
  font-family: monospace;
  font-size: 0.8rem;
}

.debug-button:hover {
  background-color: var(--pokemon-red-dark);
}

/* Responsive */
@media (max-width: 600px) {
  /* Ajuster la taille des éléments */
  .pokemon-area {
    height: 180px;
    background: var(--pokemon-gray-100);
  }
  
  .pokemon-image {
    max-height: 120px;
  }
  
  /* S'assurer que les couleurs de fond sont correctes sur mobile */
  .quest-header {
    background-color: var(--pokemon-gray-100);
  }
  
  .quest-card {
    background-color: var(--pokemon-gray-100);
  }
  
  .safari-message-area {
    background-color: var(--pokemon-gray-100);
  }
  
  /* Améliorer la visibilité du texte */
  .quest-message-text {
    color: var(--pokemon-white);
    text-shadow: 0 0 2px rgba(0,0,0,0.5);
  }
  
  /* Améliorer le contraste de l'indicateur de proximité */
  .proximity-meter {
    background-color: var(--pokemon-gray-200);
    padding: 10px;
    border-radius: 8px;
  }
}
</style>
