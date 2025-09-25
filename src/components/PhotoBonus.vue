<template>
  <div v-if="show" class="photo-bonus-overlay">
    <div class="photo-bonus-container">
      <div class="photo-bonus-header">
        <h2 class="photo-bonus-title">📸 Bonus Photo</h2>
      </div>
      
      <div class="photo-bonus-content">
        <div class="photo-icon">📸</div>
        <p class="photo-instruction whitespace-pre-line">{{ photoInstruction }}</p>
        <v-btn
          color="var(--pokemon-red)"
          variant="elevated"
          @click="takePicture"
          class="photo-button"
          rounded="pill"
          size="large"
        >
          <v-icon start>mdi-camera</v-icon>
          Prendre une photo
        </v-btn>
      </div>
      
      <div class="photo-bonus-footer">
        <v-btn 
          color="var(--pokemon-gray-300)" 
          variant="text" 
          @click="skipPhoto" 
          class="skip-button"
        >
          Passer
        </v-btn>
      </div>
      
      <div v-if="takenPhoto" class="photo-preview">
        <div class="preview-container">
          <img :src="takenPhoto" alt="Photo prise" class="preview-image" />
          <div class="preview-actions">
            <v-btn color="error" variant="outlined" @click="retakePicture" size="small" class="action-btn">
              <v-icon start>mdi-refresh</v-icon>
              Reprendre
            </v-btn>
            <v-btn color="success" @click="confirmPhoto" size="small" class="action-btn">
              <v-icon start>mdi-check</v-icon>
              Valider
            </v-btn>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  show: boolean;
  photoInstruction: string;
}>();

const emit = defineEmits(['confirm', 'skip']);

const takenPhoto = ref<string | null>(null);

// Fonction pour simuler la prise de photo
// Dans une implémentation réelle, cela ouvrirait la caméra
function takePicture() {
  // Simulation: Créer un data URL avec une image fictive
  // En production, vous utiliseriez l'API WebRTC pour accéder à la caméra
  
  // Ouvrir la caméra si disponible
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    // Demander l'accès à la caméra
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      .then(function(stream) {
        // Créer un élément vidéo pour afficher le flux
        const video = document.createElement('video');
        video.srcObject = stream;
        video.play();
        
        // Créer un canevas pour capturer l'image
        const canvas = document.createElement('canvas');
        
        // Attendre que la vidéo soit chargée
        video.addEventListener('loadeddata', function() {
          // Définir la taille du canevas à celle de la vidéo
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          
          // Dessiner l'image de la vidéo sur le canevas
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          // Convertir le canevas en data URL
          const dataUrl = canvas.toDataURL('image/jpeg');
          
          // Mettre à jour l'état avec la photo prise
          takenPhoto.value = dataUrl;
          
          // Arrêter tous les flux de la caméra
          stream.getTracks().forEach(track => {
            track.stop();
          });
        });
      })
      .catch(function(err) {
        console.error("Erreur d'accès à la caméra:", err);
        alert("Impossible d'accéder à la caméra. Vérifiez vos paramètres d'autorisation.");
        
        // Fallback: utiliser une image fictive
        simulatePhoto();
      });
  } else {
    // Fallback pour les navigateurs qui ne supportent pas getUserMedia
    alert("Votre navigateur ne supporte pas l'accès à la caméra.");
    simulatePhoto();
  }
}

// Fonction de simulation si la caméra n'est pas disponible
function simulatePhoto() {
  // Simuler une photo avec un délai pour une meilleure expérience utilisateur
  setTimeout(() => {
    // Utiliser une image fictive pour la démo
    takenPhoto.value = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiM0MjQyNDIiLz48Y2lyY2xlIGN4PSIxMDAiIGN5PSI4MCIgcj0iNDAiIGZpbGw9IiM3MDcwNzAiLz48cmVjdCB4PSI2MCIgeT0iMTMwIiB3aWR0aD0iODAiIGhlaWdodD0iMzAiIGZpbGw9IiM3MDcwNzAiLz48dGV4dCB4PSI1MCIgeT0iMTgwIiBmaWxsPSJ3aGl0ZSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0Ij5QaG90byBzaW11bMOpZTwvdGV4dD48L3N2Zz4=';
  }, 500);
}

// Fonction pour retenter une photo
function retakePicture() {
  takenPhoto.value = null;
  takePicture();
}

// Fonction pour confirmer la photo
function confirmPhoto() {
  // Ici, vous pourriez enregistrer la photo dans le stockage local ou l'envoyer à un serveur
  // Pour l'exemple, nous allons simplement émettre un événement
  emit('confirm', takenPhoto.value);
}

// Fonction pour passer l'étape photo
function skipPhoto() {
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
  background-color: rgba(0, 0, 0, 0.85);
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

.photo-preview {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
  padding: 20px;
}

.preview-container {
  width: 90%;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.preview-image {
  max-width: 100%;
  max-height: 70vh;
  border: 3px solid var(--pokemon-red);
  border-radius: 8px;
  box-shadow: 0 0 20px rgba(227, 53, 13, 0.5);
}

.preview-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.action-btn {
  min-width: 120px;
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
  
  .action-btn {
    min-width: 100px;
  }
}
</style>
