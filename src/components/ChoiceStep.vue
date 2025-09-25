<script setup lang="ts">
import { ref, computed, inject } from 'vue'
import { useRouter } from 'vue-router'
import { useProgress } from '../store/progress'
import '../assets/quest-components.css'
import SuccessPopup from './SuccessPopup.vue'
import PhotoBonus from './PhotoBonus.vue'

// Importer correctement les images
import charizardImg from '../assets/images/pokemon/cheval.png'
import blastoiseImg from '../assets/images/pokemon/fantominus.png'
import trainerRedImg from '../assets/images/aaa.jpg'
import trainerVillainImg from '../assets/images/woman.jpg'
import pokeballImg from '../assets/images/pokemon/pokeball.svg'

const props = defineProps<{ step:{ id:string; prompt:string; choices:string[]; correctIndex:number; success?:string; hint?:string; photo?:string } }>()
const emit = defineEmits(['navigate'])

// État du combat Pokémon
const battleState = ref('intro'); // 'intro', 'active', 'attacking', 'victory', 'defeat'
const selected = ref<number|null>(null);
const feedback = ref('');
const showHint = ref(false);
const animationInProgress = ref(false);
const showSuccessPopup = ref(false);
const showPhotoBonus = ref(false);
const router = useRouter();
const store = useProgress(); store.load();

// Déterminer si l'étape actuelle a une étape précédente
const hasPreviousStep = Number(props.step.id) > 1;

// Récupérer la fonction de navigation du parent
const navigateToStep = inject('navigateToStep', (stepId: string | number) => {
  // Fallback si l'injection n'est pas disponible
  console.warn('navigateToStep not provided by parent')
  router.push(`/step/${stepId}`)
});

// Informations des dresseurs et Pokémon avec images locales
const playerInfo = {
  name: 'Toi',
  avatar: trainerRedImg,
  pokemon: 'Charizard',
  pokemonImage: charizardImg,
  hp: 100,
  level: 50
};

const opponentInfo = {
  name: 'Dresseur Rival',
  avatar: trainerVillainImg,
  pokemon: 'Blastoise',
  pokemonImage: blastoiseImg,
  hp: 100,
  level: 50
};

// Messages de combat inspirés par le combat traditionnel Pokémon
const battleMessages = [
  'C\'est super efficace !',
  'Un coup critique !',
  'L\'adversaire est gravement touché !',
  'Ton attaque a dévasté l\'ennemi !',
  'L\'adversaire est impressionné par ta puissance !'
];

const playerHP = ref(playerInfo.hp);
const opponentHP = ref(opponentInfo.hp);
const battleMessage = ref(`Un dresseur rival te défie ! Réponds correctement pour gagner ce combat !`);

// Attaques disponibles (les choix de réponse)
const attacks = computed(() => {
  return props.step.choices.map((choice, index) => ({
    name: choice,
    type: index === props.step.correctIndex ? 'Amour' : 'Normal',
    power: index === props.step.correctIndex ? 100 : 0
  }));
});

// Démarrer le combat
function startBattle() {
  battleState.value = 'active';
  battleMessage.value = 'Choisissez votre attaque !';
}

// Sélectionner une attaque (choix)
function selectAttack(index: number) {
  if (battleState.value !== 'active' || animationInProgress.value) return;
  
  selected.value = index;
}

// Lancer l'attaque sélectionnée
function useAttack() {
  if (selected.value === null || battleState.value !== 'active') return;
  
  animationInProgress.value = true;
  battleState.value = 'attacking';
  
  const isCorrect = selected.value === props.step.correctIndex;
  
  // Animation d'attaque
  setTimeout(() => {
    if (isCorrect) {
      // Attaque correcte
      opponentHP.value = 0;
      const randomMessage = battleMessages[Math.floor(Math.random() * battleMessages.length)];
      battleMessage.value = randomMessage;
      
      // Animation de victoire
      setTimeout(() => {
        battleState.value = 'victory';
        feedback.value = props.step.success ?? 'Vous avez gagné ce combat d\'amour ! Votre lien est renforcé !';
        store.markDone(props.step.id);
        animationInProgress.value = false;
        // Afficher le popup de succès après un court délai
        setTimeout(() => {
          showSuccessPopup.value = true;
        }, 1000);
      }, 1500);
    } else {
      // Mauvaise attaque
      playerHP.value -= 20;
      battleMessage.value = 'Votre attaque a échoué ! Essayez une autre stratégie !';
      
      // Contre-attaque de l'adversaire
      setTimeout(() => {
        playerHP.value -= 20;
        battleMessage.value = 'Le Pokémon adverse contre-attaque !';
        
        // Retour à l'état actif
        setTimeout(() => {
          battleState.value = 'active';
          battleMessage.value = 'Choisissez une meilleure attaque !';
          animationInProgress.value = false;
          
          // Game over si HP = 0
          if (playerHP.value <= 0) {
            battleState.value = 'defeat';
            battleMessage.value = 'Vous avez perdu ce combat !';
          }
        }, 1000);
      }, 1000);
    }
  }, 1000);
}

// Réinitialiser le combat
function resetBattle() {
  playerHP.value = playerInfo.hp;
  opponentHP.value = opponentInfo.hp;
  selected.value = null;
  battleState.value = 'intro';
  battleMessage.value = `Un dresseur rival vous défie ! Répondez correctement pour gagner ce combat d'amour !`;
}

// Fonction pour passer à l'étape suivante
function goToNextStep() {
  // Fermer la pop-in avant de naviguer
  showSuccessPopup.value = false;
  
  // Petit délai avant la navigation pour permettre à la transition de se terminer
  setTimeout(() => {
    const currentId = Number(props.step.id);
    const nextId = currentId + 1;
    
    // Utiliser la fonction injectée pour naviguer avec le splash
    emit('navigate', nextId);
  }, 300);
}

// Fonction pour afficher le bonus photo
function displayPhotoBonus() {
  showSuccessPopup.value = false;
  showPhotoBonus.value = true;
}

// Fonction appelée lorsque le bonus photo est terminé
function onPhotoCompleted() {
  showPhotoBonus.value = false;
  // Si l'utilisateur a pris une photo, on pourrait la sauvegarder ici
  // Puis on continue vers l'étape suivante
  goToNextStep();
}

// Fonction appelée lorsque le bonus photo est ignoré
function onPhotoSkipped() {
  showPhotoBonus.value = false;
  goToNextStep();
}

// Fonction pour revenir à l'étape précédente
function goToPreviousStep() {
  // Fermer la pop-in avant de naviguer
  showSuccessPopup.value = false;
  
  // Petit délai avant la navigation pour permettre à la transition de se terminer
  setTimeout(() => {
    const currentId = Number(props.step.id);
    if (currentId > 1) {
      const prevId = currentId - 1;
      
      // Utiliser la fonction injectée pour naviguer avec le splash
      emit('navigate', prevId);
    }
  }, 300);
}

// Afficher/masquer l'indice
function toggleHint() {
  showHint.value = !showHint.value;
}
</script>

<template>
  <div class="quest-container">
    <!-- En-tête du combat -->
    <div class="quest-header">
      <img src="https://archives.bulbagarden.net/media/upload/7/79/Dream_Pok%C3%A9_Ball_Sprite.png" alt="Poké Ball" class="pokeball-icon animate-float" />
      <h2 class="quest-title">Combat de Dresseurs</h2>
      <img src="https://archives.bulbagarden.net/media/upload/7/79/Dream_Pok%C3%A9_Ball_Sprite.png" alt="Poké Ball" class="pokeball-icon animate-float" />
    </div>
    
    <!-- Écran de bataille Pokémon -->
    <v-card class="quest-card" elevation="8">
      <!-- Écran d'intro -->
      <div v-if="battleState === 'intro'" class="intro-screen">
        <div class="intro-content">
          <img :src="opponentInfo.avatar" alt="Dresseur rival" class="trainer-avatar opponent-avatar" />
          <div class="intro-message">
            <p class="battle-text">{{ battleMessage }}</p>
            <p class="battle-prompt whitespace-pre-line">{{ props.step.prompt }}</p>
          </div>
          <img :src="playerInfo.avatar" alt="Ton avatar" class="trainer-avatar player-avatar" />
        </div>
        <v-btn color="var(--pokemon-red)" @click="startBattle" class="quest-button" rounded="pill">
          <span class="btn-text">Commencer le combat !</span>
        </v-btn>
      </div>
      
      <!-- Écran de combat actif -->
      <template v-else-if="['active', 'attacking'].includes(battleState)">
        <!-- Zone de l'adversaire -->
        <div class="opponent-area">
          <div class="pokemon-stats">
            <div class="stats-header">
              <span class="pokemon-name">{{ opponentInfo.pokemon }}</span>
              <span class="pokemon-level">N.{{ opponentInfo.level }}</span>
            </div>
            <div class="hp-bar">
              <div class="hp-label">HP</div>
              <div class="hp-container">
                <div class="hp-fill" :style="{ width: (opponentHP / opponentInfo.hp * 100) + '%' }" 
                     :class="{ 'low-hp': opponentHP < opponentInfo.hp * 0.3 }"></div>
              </div>
              <div class="hp-value">{{ opponentHP }}/{{ opponentInfo.hp }}</div>
            </div>
          </div>
          <img 
            :src="opponentInfo.pokemonImage" 
            :alt="opponentInfo.pokemon" 
            class="pokemon-sprite opponent-pokemon" 
            :class="{ 'pokemon-hit': battleState === 'attacking' && selected === props.step.correctIndex }"
          />
        </div>
        
        <!-- Zone du joueur -->
        <div class="player-area">
          <img 
            :src="playerInfo.pokemonImage" 
            :alt="playerInfo.pokemon" 
            class="pokemon-sprite player-pokemon"
            :class="{ 'pokemon-attack': battleState === 'attacking' }"
          />
          <div class="pokemon-stats">
            <div class="stats-header">
              <span class="pokemon-name">{{ playerInfo.pokemon }}</span>
              <span class="pokemon-level">N.{{ playerInfo.level }}</span>
            </div>
            <div class="hp-bar">
              <div class="hp-label">HP</div>
              <div class="hp-container">
                <div class="hp-fill" :style="{ width: (playerHP / playerInfo.hp * 100) + '%' }" 
                     :class="{ 'low-hp': playerHP < playerInfo.hp * 0.3 }"></div>
              </div>
              <div class="hp-value">{{ playerHP }}/{{ playerInfo.hp }}</div>
            </div>
          </div>
        </div>
        
        <!-- Zone de message -->
        <div class="quest-message">
          <p class="quest-message-text">{{ battleMessage }}</p>
        </div>
        
        <!-- Zone d'attaques (choix) -->
        <div class="attack-selection" v-if="battleState === 'active'">
          <div class="attacks-grid">
            <div 
              v-for="(attack, index) in attacks" 
              :key="index"
              class="attack-option"
              :class="{ 'selected-attack': selected === index }"
              @click="selectAttack(index)"
            >
              <div class="attack-name">{{ attack.name }}</div>
              <div class="attack-type">{{ attack.type }}</div>
            </div>
          </div>
          <div class="attack-actions">
            <v-btn 
              color="var(--pokemon-red)" 
              @click="useAttack" 
              :disabled="selected === null || animationInProgress"
              class="quest-button"
              rounded="pill"
            >
              Utiliser l'attaque
            </v-btn>
            <v-btn
              v-if="props.step.hint"
              color="var(--pokemon-black)"
              variant="text"
              @click="toggleHint"
              class="hint-btn"
              size="small"
            >
              {{ showHint ? 'Masquer l\'indice' : 'Voir un indice' }}
            </v-btn>
          </div>
          
          <!-- Zone d'indice -->
          <div v-if="showHint && props.step.hint" class="hint-box">
            <div class="hint-icon">💡</div>
            <p class="hint-text">{{ props.step.hint }}</p>
          </div>
        </div>
      </template>
      
      <!-- Écran de victoire -->
      <div v-else-if="battleState === 'victory'" class="result-screen victory-screen">
        <div class="result-content">
          <img :src="playerInfo.pokemonImage" alt="Pokémon vainqueur" class="result-pokemon" />
          <div class="result-message">
            <h3 class="result-title">Victoire !</h3>
            <div class="victory-sparkles"></div>
            <p class="result-text">{{ feedback }}</p>
          </div>
        </div>
        <div class="result-actions">
          <v-btn color="var(--pokemon-black)" class="quest-button" rounded="pill" @click="goToNextStep">
            Continuer l'aventure
          </v-btn>
        </div>
        
        <!-- Pop-in de succès -->
        <SuccessPopup 
          :show="showSuccessPopup"
          title="Combat gagné !"
          :message="feedback"
          :current-step-id="props.step.id"
          :hasPreviousStep="hasPreviousStep"
          :photoInstruction="props.step.photo"
          @next="goToNextStep"
          @previous="goToPreviousStep"
          @photo-bonus="displayPhotoBonus"
        />
        
        <!-- Bonus photo -->
        <PhotoBonus
          :show="showPhotoBonus"
          :photoInstruction="props.step.photo || 'Prenez une photo souvenir de cette étape !'"
          @confirm="onPhotoCompleted"
          @skip="onPhotoSkipped"
        />
      </div>
      
      <!-- Écran de défaite -->
      <div v-else-if="battleState === 'defeat'" class="result-screen defeat-screen">
        <div class="result-content">
          <img :src="playerInfo.pokemonImage" alt="Pokémon vaincu" class="result-pokemon defeated" />
          <div class="result-message">
            <h3 class="result-title">Défaite</h3>
            <p class="result-text">Votre Pokémon a épuisé ses forces. Réessayez avec une autre stratégie !</p>
          </div>
        </div>
        <div class="result-actions">
          <v-btn color="var(--pokemon-red)" class="quest-button" rounded="pill" @click="resetBattle">
            Réessayer
          </v-btn>
        </div>
      </div>
    </v-card>
    
    <!-- Prompt original (caché) -->
    <div class="original-prompt">
      <v-expansion-panels>
        <v-expansion-panel>
          <v-expansion-panel-title>Voir l'indice original</v-expansion-panel-title>
          <v-expansion-panel-text>
            <p class="whitespace-pre-line">{{ props.step.prompt }}</p>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </div>
  </div>
</template>

<style scoped>
/* Styles pour le combat Pokémon */

.intro-screen {
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-lg);
  background: var(--pokemon-gray-100);
}

.intro-content {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.trainer-avatar {
  width: 100px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--pokemon-red);
  background-color: var(--pokemon-gray-200);
  box-shadow: 0 0 10px rgba(255, 61, 40, 0.3);
}

.player-avatar {
  transform: scaleX(-1);
}

.intro-message {
  background: var(--pokemon-gray-200);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-md);
  flex: 1;
  position: relative;
  border: 2px solid var(--pokemon-red);
}

.battle-text {
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--spacing-sm);
  color: var(--pokemon-white);
}

.battle-prompt {
  font-style: italic;
  color: var(--pokemon-gray-800);
}

/* Zones de combat */
.opponent-area, .player-area {
  height: 150px;
  display: flex;
  align-items: center;
  padding: var(--spacing-md);
  position: relative;
  background: var(--pokemon-gray-100);
}

.opponent-area {
  justify-content: space-between;
  border-bottom: 2px dashed var(--pokemon-gray-300);
}

.player-area {
  justify-content: space-between;
  flex-direction: row-reverse;
}

/* Sprites Pokémon */
.pokemon-sprite {
  height: 120px;
  filter: drop-shadow(0 3px 5px rgba(0, 0, 0, 0.3));
  transition: all 0.3s ease;
}

.opponent-pokemon {
  margin-right: var(--spacing-lg);
}

.player-pokemon {
  margin-left: var(--spacing-lg);
}

/* Animation d'attaque */
.pokemon-attack {
  animation: attack 0.5s ease-in-out;
}

.pokemon-hit {
  animation: hit 0.5s ease-in-out;
}

/* Stats Pokémon */
.pokemon-stats {
  background: var(--pokemon-gray-200);
  border: 2px solid var(--pokemon-red);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-sm);
  min-width: 180px;
}

.stats-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}

.pokemon-name {
  font-weight: var(--font-weight-bold);
  color: var(--pokemon-white);
}

.pokemon-level {
  color: var(--pokemon-gray-800);
}

.hp-bar {
  display: flex;
  align-items: center;
  gap: 5px;
}

.hp-label {
  font-size: 0.8rem;
  font-weight: var(--font-weight-bold);
  color: var(--pokemon-white);
  background: var(--pokemon-gray-300);
  padding: 2px 4px;
  border-radius: 3px;
}

.hp-container {
  flex: 1;
  height: 8px;
  background: var(--pokemon-gray-300);
  border-radius: 4px;
  overflow: hidden;
}

.hp-fill {
  height: 100%;
  background: #3ADF00;
  transition: width 0.5s ease;
}

.hp-value {
  font-size: 0.8rem;
  color: var(--pokemon-white);
}

.low-hp {
  background: #FF0000;
}

/* Zone d'attaques */
.attack-selection {
  padding: var(--spacing-md);
  background: var(--pokemon-gray-200);
}

.attacks-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.attack-option {
  background: var(--pokemon-gray-300);
  border: 1px solid var(--pokemon-gray-400);
  border-radius: var(--border-radius-sm);
  padding: var(--spacing-sm);
  cursor: pointer;
  transition: all 0.2s ease;
}

.attack-option:hover {
  background: var(--pokemon-gray-200);
  border-color: var(--pokemon-red);
}

.selected-attack {
  background: var(--pokemon-red-light);
  border: 2px solid var(--pokemon-red);
  transform: translateY(-2px);
  box-shadow: 0 2px 5px rgba(255, 61, 40, 0.3);
}

.attack-name {
  font-weight: var(--font-weight-bold);
  margin-bottom: 2px;
  color: var(--pokemon-white);
}

.attack-type {
  font-size: 0.8rem;
  color: var(--pokemon-gray-800);
  font-style: italic;
}

.attack-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
}

/* Écrans de résultat */
.result-screen {
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-lg);
}

.victory-screen {
  background: var(--pokemon-gray-100);
  background-image: radial-gradient(circle, rgba(255, 215, 0, 0.2) 10%, transparent 70%);
}

.defeat-screen {
  background: var(--pokemon-gray-100);
}

.result-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.result-pokemon {
  height: 150px;
  margin-bottom: var(--spacing-md);
  filter: drop-shadow(0 5px 15px rgba(255, 215, 0, 0.5));
}

.defeated {
  filter: grayscale(1) brightness(0.7);
  opacity: 0.7;
}

.result-message {
  background: var(--pokemon-gray-200);
  border: 2px solid var(--pokemon-red);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-md);
  position: relative;
  max-width: 400px;
}

.result-title {
  font-size: 1.5rem;
  margin-bottom: var(--spacing-md);
  color: var(--pokemon-red);
  text-shadow: 0 0 10px rgba(255, 61, 40, 0.3);
}

.result-text {
  color: var(--pokemon-white);
  line-height: 1.5;
}

.result-actions {
  margin-top: var(--spacing-md);
}

.victory-sparkles {
  position: absolute;
  top: -20px;
  left: 0;
  right: 0;
  height: 40px;
}

.victory-sparkles::before,
.victory-sparkles::after {
  content: '✨';
  position: absolute;
  font-size: 24px;
  animation: float 2s infinite alternate ease-in-out;
}

.victory-sparkles::before {
  left: 30%;
  animation-delay: 0.5s;
}

.victory-sparkles::after {
  right: 30%;
  animation-delay: 1s;
}

.original-prompt {
  margin-top: var(--spacing-md);
}

/* Animation */
@keyframes attack {
  0% { transform: translateX(0); }
  50% { transform: translateX(-20px); }
  100% { transform: translateX(0); }
}

@keyframes hit {
  0% { transform: translateX(0); filter: brightness(1); }
  25% { transform: translateX(10px); filter: brightness(1.5); }
  50% { transform: translateX(-5px); filter: brightness(1); }
  75% { transform: translateX(5px); filter: brightness(1.5); }
  100% { transform: translateX(0); filter: brightness(1); }
}

/* Responsive */
@media (max-width: 600px) {
  .intro-content {
    flex-direction: column;
    text-align: center;
  }
  
  .trainer-avatar {
    width: 60px;
    height: 60px;
  }
  
  .opponent-area, .player-area {
    height: 120px;
  }
  
  .pokemon-sprite {
    height: 90px;
  }
  
  .pokemon-stats {
    min-width: 150px;
  }
  
  .attacks-grid {
    grid-template-columns: 1fr;
  }
}
</style>
