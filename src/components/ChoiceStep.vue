<script setup lang="ts">
import { ref, computed } from 'vue'
import { useProgress } from '../store/progress'
import '../assets/quest-components.css'
const props = defineProps<{ step:{ id:string; prompt:string; choices:string[]; correctIndex:number; success?:string; hint?:string } }>()

// État du combat Pokémon
const battleState = ref('intro'); // 'intro', 'active', 'attacking', 'victory', 'defeat'
const selected = ref<number|null>(null);
const feedback = ref('');
const showHint = ref(false);
const animationInProgress = ref(false);
const store = useProgress(); store.load();

// Informations des dresseurs et Pokémon
const playerInfo = {
  name: 'Toi',
  avatar: 'https://archives.bulbagarden.net/media/upload/thumb/0/05/Red_FRLG.png/150px-Red_FRLG.png',
  pokemon: 'Charizard',
  pokemonImage: 'https://archives.bulbagarden.net/media/upload/thumb/7/7e/006Charizard.png/250px-006Charizard.png',
  hp: 100,
  level: 50
};

const opponentInfo = {
  name: 'Dresseur Rival',
  avatar: 'https://archives.bulbagarden.net/media/upload/thumb/a/a4/Blue_FRLG.png/150px-Blue_FRLG.png',
  pokemon: 'Blastoise',
  pokemonImage: 'https://archives.bulbagarden.net/media/upload/thumb/0/02/009Blastoise.png/250px-009Blastoise.png',
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
            <p class="battle-prompt">{{ props.step.prompt }}</p>
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
          <v-btn color="var(--pokemon-black)" class="quest-button" rounded="pill" to="/map">
            Continuer l'aventure
          </v-btn>
        </div>
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
            <p>{{ props.step.prompt }}</p>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </div>
  </div>
</template>
