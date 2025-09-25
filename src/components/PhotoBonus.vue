<template>
  <div v-if="show" class="photo-bonus-overlay">
    <div class="photo-bonus-container">
      <div class="photo-bonus-header">
        <h2 class="photo-bonus-title">📸 Bonus Photo</h2>
      </div>
      
      <div v-if="!cameraActive && !takenPhoto" class="photo-bonus-content">
        <div class="photo-icon">📸</div>
        <p class="photo-instruction whitespace-pre-line">{{ photoInstruction }}</p>
        <v-btn
          color="var(--pokemon-red)"
          variant="elevated"
          @click="activateCamera"
          class="photo-button"
          rounded="pill"
          size="large"
        >
          <v-icon start>mdi-camera</v-icon>
          Ouvrir la caméra
        </v-btn>
        
        <div class="camera-options mt-4">
          <v-switch
            v-model="useFrontCamera"
            color="var(--pokemon-blue)"
            :label="useFrontCamera ? 'Caméra avant' : 'Caméra arrière'"
            hide-details
            class="camera-switch"
            density="compact"
          ></v-switch>
        </div>
      </div>
      
      <!-- Interface de la caméra active -->
      <div v-if="cameraActive && !takenPhoto" class="camera-view-container">
        <video ref="videoElement" autoplay playsinline class="camera-view"></video>
        
        <div class="camera-controls">
          <v-btn
            color="white"
            variant="outlined"
            @click="closeCameraView"
            icon
            class="camera-control-btn"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
          
          <v-btn
            color="white"
            variant="outlined"
            @click="capturePhoto"
            icon
            class="capture-btn"
          >
            <v-icon>mdi-camera</v-icon>
          </v-btn>
          
          <v-btn
            color="white"
            variant="outlined"
            @click="switchCamera"
            icon
            class="camera-control-btn"
          >
            <v-icon>mdi-camera-switch</v-icon>
          </v-btn>
        </div>
      </div>
      
      <div v-if="!cameraActive && !takenPhoto" class="photo-bonus-footer">
        <v-btn 
          color="var(--pokemon-gray-300)" 
          variant="text" 
          @click="skipPhoto" 
          class="skip-button"
        >
          Passer
        </v-btn>
      </div>
      
      <!-- Prévisualisation de la photo prise -->
      <div v-if="takenPhoto" class="photo-preview-content">
        <img :src="takenPhoto" alt="Photo prise" class="preview-image" />
        
        <div class="preview-actions mt-4">
          <v-btn color="error" variant="outlined" @click="retakePicture" class="action-btn mr-2">
            <v-icon start>mdi-refresh</v-icon>
            Reprendre
          </v-btn>
          
          <v-btn color="success" @click="confirmPhoto" class="action-btn">
            <v-icon start>mdi-check</v-icon>
            Valider
          </v-btn>
        </div>
        
        <v-checkbox
          v-model="saveToGallery"
          color="var(--pokemon-blue)"
          label="Enregistrer dans ma galerie"
          class="mt-4 save-checkbox"
          hide-details
        ></v-checkbox>
      </div>
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
  z-index: 9999;
  padding: 20px;
}

.photo-bonus-container {
  background-color: var(--pokemon-gray-100);
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 0 20px rgba(227, 53, 13, 0.5);
  border: 2px solid var(--pokemon-red);
  overflow: hidden;
  animation: popup-appear 0.3s ease-out;
}

.photo-bonus-header {
  background-color: var(--pokemon-red);
  color: white;
  padding: 15px 20px;
  text-align: center;
}

.photo-bonus-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: bold;
}

.photo-bonus-content {
  padding: 30px 20px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.photo-preview-content {
  padding: 30px 20px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.photo-icon {
  font-size: 3rem;
  margin-bottom: 15px;
  animation: bounce 1s infinite alternate ease-in-out;
}

.photo-instruction {
  color: var(--pokemon-white);
  font-size: 1.2rem;
  margin: 0 0 25px;
  line-height: 1.5;
}

.photo-button {
  font-size: 1.1rem;
  padding: 10px 20px;
  margin-bottom: 10px;
}

.photo-bonus-footer {
  padding: 15px 20px;
  display: flex;
  justify-content: center;
  border-top: 1px solid var(--pokemon-gray-300);
}

.skip-button {
  opacity: 0.7;
}

.skip-button:hover {
  opacity: 1;
}

/* Camera styles */
.camera-view-container {
  position: relative;
  width: 100%;
  height: 400px;
  max-height: 60vh;
  overflow: hidden;
  background-color: #000;
}

.camera-view {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.camera-controls {
  position: absolute;
  bottom: 20px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 0 20px;
}

.camera-control-btn {
  background-color: rgba(0, 0, 0, 0.5) !important;
  color: white !important;
  border: 2px solid white !important;
  height: 50px;
  width: 50px;
  border-radius: 25px;
}

.capture-btn {
  background-color: rgba(0, 0, 0, 0.5) !important;
  color: white !important;
  border: 3px solid white !important;
  height: 70px;
  width: 70px;
  border-radius: 35px;
}

.camera-options {
  width: 100%;
  text-align: center;
}

.camera-switch {
  margin: 0 auto;
}

.preview-image {
  max-width: 100%;
  max-height: 300px;
  border: 3px solid var(--pokemon-red);
  border-radius: 8px;
  box-shadow: 0 0 20px rgba(227, 53, 13, 0.5);
}

.preview-actions {
  display: flex;
  justify-content: center;
}

.action-btn {
  min-width: 120px;
}

.save-checkbox {
  margin-top: 15px;
}

.save-checkbox :deep(.v-label) {
  color: var(--pokemon-white);
}

@keyframes bounce {
  0% { transform: translateY(0); }
  100% { transform: translateY(-10px); }
}

@keyframes popup-appear {
  0% {
    transform: scale(0.7);
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
    padding: 8px 16px;
  }
  
  .camera-view-container {
    height: 300px;
  }
  
  .camera-control-btn {
    height: 40px;
    width: 40px;
    border-radius: 20px;
  }
  
  .capture-btn {
    height: 60px;
    width: 60px;
    border-radius: 30px;
  }
  
  .action-btn {
    min-width: 100px;
  }
}
</style>
