<template>
  <div v-if="show" class="photo-bonus-overlay">
    <div class="photo-bonus-container glass-dark">
      <div class="photo-bonus-header">
        <h2 class="photo-bonus-title">
          <span class="photo-title-icon floating">📷</span> Bonus Photo
        </h2>
      </div>
      
      <div v-if="!cameraActive && !takenPhoto" class="photo-bonus-content">
        <div class="photo-icon floating">📷</div>
        <p class="photo-instruction whitespace-pre-line glass-card">{{ photoInstruction }}</p>
        
        <v-btn
          color="var(--pokemon-red)"
          variant="elevated"
          @click="activateCamera"
          class="photo-button glass-btn-primary hover-lift click-feedback touch-target"
          rounded="pill"
          elevation="3"
          size="large"
        >
          <v-icon start class="pulsing-icon">mdi-camera</v-icon>
          Ouvrir la caméra
        </v-btn>
        
        <div class="camera-options glass-light mt-4 pa-2 rounded-lg">
          <v-switch
            v-model="useFrontCamera"
            color="var(--pokemon-blue)"
            :label="useFrontCamera ? 'Caméra arrière' : 'Caméra avant'"
            hide-details
            class="camera-switch"
            density="compact"
          ></v-switch>
        </div>
      </div>
      
      <!-- Interface de la caméra active -->
      <transition name="fade" mode="out-in">
        <div v-if="cameraActive && !takenPhoto" class="camera-view-container">
          <video ref="videoElement" autoplay playsinline class="camera-view"></video>
          
          <div class="camera-frame"></div>
          
          <div class="camera-controls glass-dark">
            <v-btn
              color="white"
              variant="outlined"
              @click="closeCameraView"
              icon
              class="camera-control-btn click-feedback touch-target"
            >
              <v-icon>mdi-close</v-icon>
            </v-btn>
            
            <v-btn
              color="white"
              variant="outlined"
              @click="capturePhoto"
              icon
              class="capture-btn click-feedback touch-target"
            >
              <v-icon size="large">mdi-camera</v-icon>
            </v-btn>
            
            <v-btn
              color="white"
              variant="outlined"
              @click="switchCamera"
              icon
              class="camera-control-btn click-feedback touch-target"
            >
              <v-icon>mdi-camera-switch</v-icon>
            </v-btn>
          </div>
        </div>
      </transition>
      
      <div v-if="!cameraActive && !takenPhoto" class="photo-bonus-footer">
        <div class="glass-separator"></div>
        <v-btn 
          color="var(--pokemon-gray-300)" 
          variant="text" 
          @click="skipPhoto" 
          class="skip-button hover-grow click-feedback touch-target"
        >
          Passer
        </v-btn>
      </div>
      
      <!-- Prévisualisation de la photo prise -->
      <transition name="scale" mode="out-in">
        <div v-if="takenPhoto" class="photo-preview-content">
          <div class="preview-container glass-card">
            <img :src="takenPhoto" alt="Photo prise" class="preview-image depth-shadow" />
          </div>
          
          <div class="preview-actions mt-4">
            <v-btn 
              color="error" 
              variant="outlined" 
              @click="retakePicture" 
              class="action-btn mr-2 hover-lift click-feedback touch-target"
            >
              <v-icon start>mdi-refresh</v-icon>
              Reprendre
            </v-btn>
            
            <v-btn 
              color="success" 
              @click="confirmPhoto" 
              class="action-btn hover-lift click-feedback touch-target glass-btn-primary"
            >
              <v-icon start>mdi-check</v-icon>
              Valider
            </v-btn>
          </div>
          
          <div class="checkbox-container glass-light pa-2 mt-4 rounded-lg">
            <v-checkbox
              v-model="saveToGallery"
              color="var(--pokemon-blue)"
              label="Enregistrer dans ma galerie"
              class="save-checkbox"
              hide-details
            ></v-checkbox>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';

const props = defineProps<{
  show: boolean;
  photoInstruction: string;
}>();

const emit = defineEmits(['confirm', 'skip']);

// États de la caméra
const takenPhoto = ref<string | null>(null);
const cameraActive = ref(false);
const videoElement = ref<HTMLVideoElement | null>(null);
const useFrontCamera = ref(false);
const currentStream = ref<MediaStream | null>(null);
const saveToGallery = ref(true);

// Nettoyer le flux vidéo à la destruction du composant
onBeforeUnmount(() => {
  stopCameraStream();
});

// Fonction pour activer la caméra sans prendre de photo automatiquement
function activateCamera() {
  cameraActive.value = true;
  // Initialiser la caméra au prochain tick du DOM après que vidéoElement est rendu
  setTimeout(() => {
    initializeCamera();
  }, 100);
}

// Initialise et démarre le flux de la caméra
function initializeCamera() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    alert("Votre navigateur ne prend pas en charge l'accès à la caméra.");
    return;
  }

  // Arrêter tout flux existant
  stopCameraStream();

  // Configuration de la caméra (avant ou arrière)
  const constraints = {
    video: {
      facingMode: useFrontCamera.value ? 'user' : 'environment',
      width: { ideal: 1920 },
      height: { ideal: 1080 }
    }
  };

  // Demander l'accès à la caméra
  navigator.mediaDevices.getUserMedia(constraints)
    .then(stream => {
      // Stocker le flux pour pouvoir l'arrêter plus tard
      currentStream.value = stream;
      
      // Connecter le flux à l'élément vidéo
      if (videoElement.value) {
        videoElement.value.srcObject = stream;
      }
    })
    .catch(error => {
      console.error("Erreur d'accès à la caméra:", error);
      alert("Impossible d'accéder à la caméra. Vérifiez vos paramètres d'autorisation.");
      cameraActive.value = false;
    });
}

// Fonction pour capturer une photo depuis le flux vidéo
function capturePhoto() {
  if (!videoElement.value || !currentStream.value) return;
  
  // Créer un canevas pour capturer l'image
  const canvas = document.createElement('canvas');
  canvas.width = videoElement.value.videoWidth;
  canvas.height = videoElement.value.videoHeight;
  
  // Dessiner l'image de la vidéo sur le canevas
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.drawImage(videoElement.value, 0, 0, canvas.width, canvas.height);
    
    // Convertir le canevas en data URL
    const dataUrl = canvas.toDataURL('image/jpeg');
    takenPhoto.value = dataUrl;
    
    // Arrêter le flux de la caméra après la capture
    stopCameraStream();
    cameraActive.value = false;
  }
}

// Fonction pour changer entre caméra avant et arrière
function switchCamera() {
  useFrontCamera.value = !useFrontCamera.value;
  initializeCamera();
}

// Fonction pour arrêter le flux de la caméra
function stopCameraStream() {
  if (currentStream.value) {
    currentStream.value.getTracks().forEach(track => track.stop());
    currentStream.value = null;
  }
  
  // Réinitialiser l'élément vidéo
  if (videoElement.value) {
    videoElement.value.srcObject = null;
  }
}

// Fermer la vue de la caméra sans prendre de photo
function closeCameraView() {
  stopCameraStream();
  cameraActive.value = false;
}

// Fonction pour retenter une photo
function retakePicture() {
  takenPhoto.value = null;
  activateCamera();
}

// Fonction pour sauvegarder la photo dans la galerie
function savePhotoToGallery() {
  if (!takenPhoto.value) return false;
  
  try {
    // Créer un lien de téléchargement
    const link = document.createElement('a');
    link.href = takenPhoto.value;
    link.download = `treasure-hunt-photo-${new Date().getTime()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  } catch (error) {
    console.error("Erreur lors de l'enregistrement de la photo:", error);
    return false;
  }
}

// Fonction pour confirmer la photo
function confirmPhoto() {
  // Sauvegarder la photo dans la galerie si l'option est cochée
  if (saveToGallery.value) {
    const saved = savePhotoToGallery();
    if (!saved) {
      alert("Impossible d'enregistrer la photo dans la galerie. La photo sera quand même utilisée dans le jeu.");
    }
  }
  
  // Émettre l'événement de confirmation avec la photo
  emit('confirm', takenPhoto.value);
}

// Fonction pour passer l'étape photo
function skipPhoto() {
  // Arrêter le flux de la caméra si actif
  stopCameraStream();
  emit('skip');
}
</script>

<style scoped>
.photo-bonus-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: var(--z-modal);
  padding: 0; /* Suppression du padding pour plein écran */
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
}

.photo-bonus-container {
  background: linear-gradient(135deg, rgba(20, 20, 20, 0.7), rgba(0, 0, 0, 0.9));
  width: 100%;
  height: 100%;
  max-width: 100%;
  overflow: hidden;
  animation: popup-appear 0.5s var(--transition-bounce);
  display: flex;
  flex-direction: column;
  position: relative;
  border: none;
}

.photo-bonus-header {
  background: var(--gradient-primary);
  color: white;
  padding: 15px 20px;
  text-align: center;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

/* Header shine effect */
.photo-bonus-header:after {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transform: rotate(30deg);
  animation: header-shine 3s infinite linear;
}

@keyframes header-shine {
  0% { transform: translateX(-100%) rotate(30deg); }
  100% { transform: translateX(100%) rotate(30deg); }
}

.photo-bonus-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  position: relative;
  z-index: 1;
}

.photo-title-icon {
  display: inline-block;
}

.photo-bonus-content {
  padding: 30px 20px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  justify-content: center;
}

.photo-preview-content {
  padding: 30px 20px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  justify-content: center;
}

.photo-icon {
  font-size: 3rem;
  margin-bottom: 20px;
  padding: 15px;
  background: var(--glass-bg);
  border-radius: 50%;
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  box-shadow: var(--shadow-md);
  border: 1px solid var(--glass-border);
}

.photo-instruction {
  color: var(--pokemon-white);
  font-size: 1.2rem;
  margin: 0 0 30px;
  line-height: 1.6;
  max-width: 600px;
  padding: 15px 20px;
}

.photo-button {
  font-size: 1.1rem;
  padding: 12px 25px;
  margin-bottom: 15px;
  position: relative;
  overflow: hidden;
}

.pulsing-icon {
  animation: pulse 1.5s infinite ease-in-out;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.9; }
}

.photo-bonus-footer {
  padding: 15px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.skip-button {
  opacity: 0.7;
  margin-top: 15px;
}

.skip-button:hover {
  opacity: 1;
}

/* Camera styles */
.camera-view-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background-color: #000;
  z-index: 1000;
}

.camera-frame {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 85%;
  height: 85%;
  border: 2px solid rgba(255, 255, 255, 0.5);
  border-radius: 15px;
  box-shadow: 0 0 0 2000px rgba(0, 0, 0, 0.3);
  pointer-events: none;
  z-index: 1001;
  animation: frame-pulse 3s infinite ease-in-out;
}

@keyframes frame-pulse {
  0%, 100% { box-shadow: 0 0 0 2000px rgba(0, 0, 0, 0.3); border-color: rgba(255, 255, 255, 0.5); }
  50% { box-shadow: 0 0 0 2000px rgba(0, 0, 0, 0.4); border-color: rgba(255, 255, 255, 0.7); }
}

.camera-view {
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: absolute;
  top: 0;
  left: 0;
}

.camera-controls {
  position: absolute;
  bottom: 30px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 15px 20px;
  z-index: 1010;
  border-radius: 20px;
  margin: 0 20px;
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
}

.camera-control-btn {
  background-color: rgba(0, 0, 0, 0.3) !important;
  color: white !important;
  border: 2px solid rgba(255, 255, 255, 0.8) !important;
  height: 50px;
  width: 50px;
  border-radius: 25px;
  transition: all 0.3s ease;
}

.camera-control-btn:hover {
  background-color: rgba(0, 0, 0, 0.5) !important;
  transform: scale(1.05);
}

.capture-btn {
  background-color: rgba(255, 61, 40, 0.2) !important;
  color: white !important;
  border: 3px solid rgba(255, 255, 255, 0.9) !important;
  height: 70px;
  width: 70px;
  border-radius: 35px;
  transition: all 0.3s ease;
  box-shadow: 0 0 15px rgba(255, 61, 40, 0.3);
}

.capture-btn:hover {
  background-color: rgba(255, 61, 40, 0.4) !important;
  box-shadow: 0 0 20px rgba(255, 61, 40, 0.5);
  transform: scale(1.05);
}

.camera-options {
  width: 80%;
  text-align: center;
  border-radius: var(--border-radius-lg);
}

.camera-switch {
  margin: 0 auto;
}

.preview-container {
  padding: 10px;
  border-radius: 15px;
  margin-bottom: 20px;
}

.preview-image {
  max-width: 100%;
  max-height: 300px;
  border-radius: 10px;
  transition: transform 0.3s ease;
}

.preview-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
}

.action-btn {
  min-width: 120px;
}

.checkbox-container {
  width: 80%;
  border-radius: var(--border-radius-lg);
}

.save-checkbox {
  margin-top: 0;
}

.save-checkbox :deep(.v-label) {
  color: var(--pokemon-white);
}

@keyframes popup-appear {
  0% {
    transform: scale(0.95);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@media (max-width: 480px) {
  .photo-bonus-title {
    font-size: 1.3rem;
  }
  
  .photo-instruction {
    font-size: 1rem;
  }
  
  .photo-button {
    font-size: 1rem;
    padding: 10px 20px;
  }
  
  .camera-view-container {
    height: 100vh;
    position: fixed;
  }
  
  .camera-control-btn {
    height: 45px;
    width: 45px;
    border-radius: 23px;
  }
  
  .capture-btn {
    height: 65px;
    width: 65px;
    border-radius: 33px;
  }
  
  .action-btn {
    min-width: 110px;
  }
  
  .camera-controls {
    padding: 12px;
    margin: 0 10px;
    bottom: 20px;
  }
  
  .camera-options,
  .checkbox-container {
    width: 90%;
  }
}
</style>
