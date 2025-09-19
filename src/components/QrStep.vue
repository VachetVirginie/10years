<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useProgress } from '../store/progress'
import { scanOnce } from '../composables/useQrScanner'
import '../assets/quest-components.css'
const props = defineProps<{ step: { id:string; prompt:string; qrValue:string; success?:string; hint?:string } }>()

// Liste des Pokémon légendaires puissants pour le QR code
const specialPokemonList = [
  { name: 'Mewtwo', image: 'https://archives.bulbagarden.net/media/upload/thumb/7/78/150Mewtwo.png/250px-150Mewtwo.png', description: 'Le Pokémon légendaire le plus puissant' },
  { name: 'Rayquaza', image: 'https://archives.bulbagarden.net/media/upload/thumb/e/e4/384Rayquaza.png/250px-384Rayquaza.png', description: 'Le maître des cieux et gardien de l\'atmosphère' },
  { name: 'Groudon', image: 'https://archives.bulbagarden.net/media/upload/thumb/7/70/383Groudon.png/250px-383Groudon.png', description: 'Incarne la puissance de la terre et la lave' },
  { name: 'Giratina', image: 'https://archives.bulbagarden.net/media/upload/thumb/c/c5/487Giratina-Altered.png/250px-487Giratina-Altered.png', description: 'Le gardien redoutable du Monde Distorsion' },
  { name: 'Yveltal', image: 'https://archives.bulbagarden.net/media/upload/thumb/5/54/717Yveltal.png/250px-717Yveltal.png', description: 'L\'incarnation de la destruction aux couleurs rouges et noires' }
];

// État du composant
const status = ref('waiting'); // 'waiting', 'scanning', 'success', 'error'
const message = ref('Utilise la caméra pour scanner le QR code et capturer un Pokémon légendaire de l\'amour !')
const videoRef = ref<HTMLVideoElement|null>(null)
const showPokeballAnimation = ref(false)
const capturedPokemon = ref<any>(null)
const showHint = ref(false)
const showManualInput = ref(false)
const manualCode = ref('')
const store = useProgress(); store.load()

// Sélectionner un Pokémon aléatoirement
const selectedPokemonIndex = Math.floor(Math.random() * specialPokemonList.length);

// Fonction pour scanner le QR code
const startScanning = async () => {
  const v = videoRef.value
  if (!v) return
  
  status.value = 'scanning'
  message.value = 'Scanne le QR code pour trouver un Pokémon légendaire...'
  
  try {
    const text = await scanOnce(v)
    if (text && text.trim() === props.step.qrValue) {
      // QR code correct - lancer l'animation de capture
      capturedPokemon.value = specialPokemonList[selectedPokemonIndex]
      showPokeballAnimation.value = true
      
      // Animation de capture
      setTimeout(() => {
        status.value = 'success'
        message.value = props.step.success || `Félicitations ! Tu as capturé ${capturedPokemon.value.name}, ${capturedPokemon.value.description} !`
        store.markDone(props.step.id)
      }, 2500)
    } else {
      status.value = 'error'
      message.value = 'Ce QR code ne correspond pas au Pokémon recherché. Essaie encore !'
    }
  } catch (e:any) {
    status.value = 'error'
    message.value = e?.message ?? 'Impossible d\'accéder à la caméra. Active-la pour capturer le Pokémon.'
  }
}

// Fonction pour vérifier le code saisi manuellement
const checkManualCode = () => {
  if (manualCode.value.trim() === props.step.qrValue) {
    capturedPokemon.value = specialPokemonList[selectedPokemonIndex]
    showPokeballAnimation.value = true
    
    setTimeout(() => {
      status.value = 'success'
      message.value = props.step.success || `Félicitations ! Tu as capturé ${capturedPokemon.value.name}, ${capturedPokemon.value.description} !`
      store.markDone(props.step.id)
    }, 2500)
  } else {
    status.value = 'error'
    message.value = 'Code incorrect. Essaie encore !'
  }
}

// Fonction pour afficher/masquer l'indice
const toggleHint = () => {
  showHint.value = !showHint.value
}

// Fonction pour afficher/masquer l'option de saisie manuelle
const toggleManualInput = () => {
  showManualInput.value = !showManualInput.value
}

// Nettoyer les ressources de la caméra
onBeforeUnmount(() => {
  const v = videoRef.value
  if (v && v.srcObject) {
    const tracks = (v.srcObject as MediaStream).getTracks()
    tracks.forEach(t => t.stop())
  }
})
</script>

<template>
  <div class="quest-container">
    <!-- Entête de la capture de Pokémon légendaire -->
    <div class="quest-header">
      <img src="https://archives.bulbagarden.net/media/upload/9/95/Dream_Master_Ball_Sprite.png" alt="Master Ball" class="pokeball-icon animate-float" />
      <h2 class="quest-title">Capture de Pokémon Légendaire</h2>
      <img src="https://archives.bulbagarden.net/media/upload/9/95/Dream_Master_Ball_Sprite.png" alt="Master Ball" class="pokeball-icon animate-float" />
    </div>
    
    <!-- Carte de l'interface de capture -->
    <v-card class="quest-card" elevation="8">
      <!-- Zone de visualisation et d'animation -->
      <div class="capture-area">
        <!-- Animation de capture réussie -->
        <template v-if="status === 'success' && capturedPokemon">
          <div class="pokemon-captured-container">
            <div class="captured-sparkles"></div>
            <img 
              :src="capturedPokemon.image" 
              :alt="capturedPokemon.name" 
              class="captured-pokemon"
            />
            <div class="captured-sparkles"></div>
          </div>
          <div class="captured-banner">
            <div class="captured-text">{{ capturedPokemon.name }} capturé !</div>
          </div>
        </template>
        
        <!-- Caméra pour le scan QR -->
        <template v-else-if="status !== 'success'">
          <div class="camera-container" :class="{ 'scanning': status === 'scanning' }">
            <video 
              ref="videoRef" 
              playsinline 
              muted 
              aria-label="Caméra pour scanner le QR code"
              class="qr-video"
            ></video>
            
            <!-- Animation de Poké Ball -->
            <div v-if="showPokeballAnimation" class="pokeball-animation">
              <img 
                src="https://archives.bulbagarden.net/media/upload/9/91/Bag_Master_Ball_Sprite.png" 
                alt="Master Ball" 
                class="throwing-masterball"
              />
            </div>
            
            <!-- Overlay de cadre de scan -->
            <div v-if="status === 'scanning'" class="scan-overlay">
              <div class="scan-frame"></div>
              <div class="scan-line"></div>
            </div>
          </div>
        </template>
      </div>
      
      <!-- Zone de message et actions -->
      <div class="interaction-area">
        <div v-if="status === 'waiting' || status === 'scanning' || status === 'error'" class="quest-message">
          <p class="quest-message-text">{{ message }}</p>
        </div>
        
        <div class="action-buttons" v-if="status !== 'success'">
          <v-btn 
            v-if="status !== 'scanning'"
            color="var(--pokemon-red)" 
            @click="startScanning"
            class="quest-button"
            :loading="status === 'scanning'"
            :disabled="status === 'scanning'"
          >
            <span>Scanner le QR Code</span>
          </v-btn>
          
          <v-btn 
            v-if="status === 'scanning'"
            color="var(--pokemon-black)"
            @click="status = 'waiting'"
            class="quest-button-secondary"
          >
            <span>Arrêter le scan</span>
          </v-btn>
          
          <v-btn 
            color="var(--pokemon-black)" 
            variant="outlined"
            @click="showManualInput = true"
            class="quest-button-secondary"
            v-if="status !== 'scanning'"
          >
            <span>Saisir manuellement</span>
          </v-btn>
        </div>
        
        <!-- Options alternatives -->
        <div class="alternative-options">
          <!-- Option d'indice -->
          <v-btn
            v-if="props.step.hint && status !== 'success'"
            color="var(--pokemon-black)"
            variant="text"
            @click="toggleHint"
            class="hint-btn"
            size="small"
          >
            {{ showHint ? 'Masquer l\'indice' : 'Afficher un indice' }}
          </v-btn>
          
          <!-- Option de saisie manuelle -->
          <v-btn
            v-if="status !== 'success'"
            color="#4CAF50"
            variant="text"
            @click="toggleManualInput"
            class="manual-btn"
            size="small"
          >
            {{ showManualInput ? 'Masquer la saisie manuelle' : 'Saisie manuelle du code' }}
          </v-btn>
        </div>
        
        <!-- Zone d'indice -->
        <div v-if="showHint && props.step.hint" class="hint-box">
          <div class="hint-icon">💡</div>
          <p class="hint-text">{{ props.step.hint }}</p>
        </div>
        
        <!-- Zone de saisie manuelle -->
        <div v-if="showManualInput" class="manual-input-area">
          <v-text-field
            v-model="manualCode"
            label="Code du Pokémon"
            placeholder="Entre le code ici..."
            variant="outlined"
            density="compact"
            class="manual-code-input"
          ></v-text-field>
          
          <v-btn
            color="#7B68EE"
            @click="checkManualCode"
            class="check-code-btn"
            size="small"
          >
            Vérifier
          </v-btn>
        </div>
      </div>
      
      <!-- Prompt original (caché dans un panneau d'expansion) -->
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
/* Les styles communs sont dans quest-components.css */

.capture-area {
  height: 300px;
  background: var(--pokemon-gray-100);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-bottom: 2px solid var(--pokemon-red);
}

/* Étoiles d'arrière-plan pour la zone de capture */
.capture-area::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><path fill="%23E3350D1A" d="M50,20 C33.8,20 20,33.8 20,50 C20,66.2 33.8,80 50,80 C66.2,80 80,66.2 80,50 C80,33.8 66.2,20 50,20 Z M50,47 C51.7,47 53,48.3 53,50 C53,51.7 51.7,53 50,53 C48.3,53 47,51.7 47,50 C47,48.3 48.3,47 50,47 Z"></path></svg>');
  background-size: 100px 100px;
  opacity: 0.2;
  z-index: 0;
}

/* Conteneur de la caméra */
.camera-container {
  width: 90%;
  height: 90%;
  border-radius: 15px;
  overflow: hidden;
  position: relative;
  border: 3px solid rgba(123, 104, 238, 0.5);
}

.qr-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 1;
}

/* Overlay de scan */
.scan-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2;
  pointer-events: none;
}

.scan-frame {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 200px;
  height: 200px;
  border: 3px dashed rgba(123, 104, 238, 0.8);
  border-radius: 10px;
  box-shadow: 0 0 15px rgba(123, 104, 238, 0.6);
}

.scan-line {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
  height: 2px;
  background: rgba(123, 104, 238, 0.8);
  box-shadow: 0 0 10px rgba(123, 104, 238, 0.8);
  animation: scan 2s linear infinite;
}

/* Animation de capture */
.pokeball-animation {
  position: absolute;
  z-index: 3;
}

.throwing-masterball {
  width: 60px;
  height: 60px;
  position: absolute;
  top: 150px;
  left: calc(50% - 30px);
  animation: throwBall 2.5s forwards;
  z-index: 3;
}

/* Zone du Pokémon capturé */
.pokemon-captured-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  position: relative;
  z-index: 2;
}

.captured-pokemon {
  max-height: 180px;
  max-width: 180px;
  animation: pulseGlow 2s infinite alternate;
  filter: drop-shadow(0 0 15px rgba(123, 104, 238, 0.8));
}

.captured-sparkles {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(circle at 10% 20%, var(--pokemon-red) 1px, transparent 2px),
    radial-gradient(circle at 80% 60%, var(--pokemon-white) 2px, transparent 3px),
    radial-gradient(circle at 40% 80%, var(--pokemon-red) 1px, transparent 2px),
    radial-gradient(circle at 70% 30%, var(--pokemon-white) 2px, transparent 3px);
  background-size: 50px 50px;
  animation: twinkle 3s infinite ease;
  opacity: 0.5;
  z-index: -1;
}

.captured-banner {
  position: absolute;
  bottom: 20px;
  left: 0;
  right: 0;
  text-align: center;
  z-index: 3;
}

.captured-text {
  background: rgba(var(--pokemon-red), 0.8);
  display: inline-block;
  padding: 10px 25px;
  color: white;
  font-weight: 700;
  border-radius: 20px;
  font-size: 1.2rem;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  animation: popIn 0.5s ease-out;
}

/* Zone d'interaction */
.interaction-area {
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.message-box {
  background: rgba(var(--pokemon-gray-100), 0.1);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-md);
  margin-bottom: 20px;
  border: 1px solid var(--pokemon-gray-200);
  transition: all 0.3s ease;
}

.message-box.success {
  background: rgba(76, 175, 80, 0.1);
  border-color: rgba(76, 175, 80, 0.5);
}

.message-box.error {
  background: rgba(244, 67, 54, 0.1);
  border-color: rgba(244, 67, 54, 0.5);
}

.capture-message {
  color: #333;
  font-size: 1.1rem;
  text-align: center;
  margin: 0;
  font-weight: 500;
}

.action-buttons {
  display: flex;
  justify-content: center;
  margin: 15px 0;
  gap: 15px;
}

.scan-btn {
  background: linear-gradient(135deg, #7B68EE, #9370DB) !important;
  color: white !important;
  font-weight: 600 !important;
  padding: 0 25px !important;
  box-shadow: 0 4px 8px rgba(123, 104, 238, 0.3) !important;
  transition: all 0.3s ease !important;
}

.scan-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(123, 104, 238, 0.4) !important;
}

.stop-btn {
  background: linear-gradient(135deg, #FF5252, #FF8A80) !important;
  color: white !important;
  font-weight: 600 !important;
  padding: 0 25px !important;
}

.btn-text {
  display: flex;
  align-items: center;
  gap: 8px;
}

.alternative-options {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 15px;
  width: 100%;
}

.hint-btn, .manual-btn {
  font-size: 0.9rem;
}

.hint-box {
  background: rgba(79, 195, 247, 0.1);
  border: 1px solid rgba(79, 195, 247, 0.3);
  border-radius: 10px;
  padding: 10px 15px;
  margin-top: 10px;
  margin-bottom: 15px;
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
  color: #555;
  font-style: italic;
}

.manual-input-area {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.manual-code-input {
  flex: 1;
}

.check-code-btn {
  background: #7B68EE !important;
  color: white !important;
}

.prompt-area {
  padding: 0 20px 20px;
}

/* Animations */
@keyframes float {
  0% { transform: translateY(0); }
  100% { transform: translateY(-5px); }
}

@keyframes scan {
  0% { top: 10%; }
  50% { top: 90%; }
  100% { top: 10%; }
}

@keyframes throwBall {
  0% { transform: translateY(100px) scale(1); opacity: 0; }
  20% { opacity: 1; }
  40% { transform: translateY(-80px) scale(1.3); }
  60% { transform: translateY(0) scale(0.9); }
  70% { transform: translateY(-40px) scale(1.1); }
  80% { transform: translateY(0) scale(0.95); }
  90% { transform: translateY(-10px) scale(1); }
  100% { transform: translateY(0) scale(1); opacity: 0; }
}

@keyframes pulseGlow {
  0% { filter: drop-shadow(0 0 5px rgba(123, 104, 238, 0.8)); }
  100% { filter: drop-shadow(0 0 20px rgba(123, 104, 238, 0.8)); }
}

@keyframes twinkle {
  0%, 100% { opacity: 0.3; background-position: 0 0; }
  50% { opacity: 0.7; background-position: 30px 30px; }
}

@keyframes popIn {
  0% { transform: scale(0); opacity: 0; }
  80% { transform: scale(1.1); }
  100% { transform: scale(1); opacity: 1; }
}

/* Responsive */
@media (max-width: 600px) {
  .legendary-title {
    font-size: 1.5rem;
  }
  
  .master-ball-icon {
    width: 25px;
    height: 25px;
  }
  
  .capture-area {
    height: 250px;
  }
  
  .captured-pokemon {
    max-height: 150px;
    max-width: 150px;
  }
  
  .scan-frame {
    width: 150px;
    height: 150px;
  }
  
  .alternative-options {
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }
  
  .manual-input-area {
    flex-direction: column;
  }
  
  .check-code-btn {
    width: 100%;
  }
}
</style>
