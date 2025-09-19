<script setup lang="ts">
import { ref, onMounted } from 'vue'

const props = defineProps({
  duration: {
    type: Number,
    default: 3000 // 5 secondes par défaut
  }
})

const emit = defineEmits(['complete'])

// État pour gérer la visibilité du splash screen
const visible = ref(true)

// Déclencher l'événement après la durée spécifiée
onMounted(() => {
  setTimeout(() => {
    visible.value = false
    emit('complete')
  }, props.duration)
})
</script>

<template>
  <transition name="fade">
    <div v-if="visible" class="splash-container">
      <div class="splash-image-wrapper">
        <img 
          src="https://archives.bulbagarden.net/media/upload/7/79/Dream_Pok%C3%A9_Ball_Sprite.png" 
          alt="Pokéball" 
          class="splash-image"
        />
      </div>
    </div>
  </transition>
</template>

<style scoped>
.splash-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: var(--pokemon-black, #000);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.splash-image-wrapper {
  width: 150px;
  height: 150px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.splash-image {
  width: 100%;
  height: auto;
  animation: float-pulse 3s ease-in-out infinite;
}

/* Animation combinant flottaison et pulsation */
@keyframes float-pulse {
  0% {
    transform: translateY(0) scale(1);
    filter: drop-shadow(0 5px 15px rgba(227, 53, 13, 0.7));
  }
  50% {
    transform: translateY(-20px) scale(1.1);
    filter: drop-shadow(0 20px 25px rgba(227, 53, 13, 0.5));
  }
  100% {
    transform: translateY(0) scale(1);
    filter: drop-shadow(0 5px 15px rgba(227, 53, 13, 0.7));
  }
}

/* Animation de transition */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
