import { ref, Ref, onMounted, onUnmounted } from 'vue'

interface UseTypingAnimationOptions {
  speed?: number;        // Vitesse d'animation (ms)
  onComplete?: () => void; // Callback à la fin de l'animation
}

/**
 * Composable pour créer une animation de texte qui s'écrit caractère par caractère
 * @param text Texte complet à animer
 * @param options Options de configuration (vitesse, callback de fin)
 * @returns Objet contenant les états et méthodes liés à l'animation
 */
export function useTypingAnimation(text: string, options: UseTypingAnimationOptions = {}) {
  // Valeurs par défaut
  const { 
    speed = 50,
    onComplete = () => {} 
  } = options
  
  // États
  const displayedText = ref('')
  const isAnimating = ref(false)
  const isPaused = ref(false)
  
  // Variables de contrôle
  let typingInterval: number | null = null
  let currentIndex = 0
  const textArray = text.split('')
  
  // Pré-calculer la hauteur du contenu final pour éviter les sauts de layout
  // qui peuvent causer des problèmes sur iOS
  
  /**
   * Démarrer l'animation
   */
  function start() {
    if (isAnimating.value) return
    
    isAnimating.value = true
    isPaused.value = false
    
    // Placer un espace réservé invisible de la même taille que le texte final
    // pour éviter les sauts de layout sur iOS
    displayedText.value = `<span style="opacity: 0; position: absolute; pointer-events: none;">${text}</span>`
    
    // Démarrer avec un texte vide visible
    displayedText.value += ''
    currentIndex = 0
    
    // Petit délai pour s'assurer que le contenu est stable
    setTimeout(() => {
      typingInterval = window.setInterval(() => {
        if (isPaused.value) return
        
        if (currentIndex < textArray.length) {
          // Ajouter seulement la partie visible du texte
          displayedText.value = `<span style="opacity: 0; position: absolute; pointer-events: none;">${text}</span>${text.substring(0, currentIndex + 1)}`
          currentIndex++
        } else {
          stop()
          onComplete()
        }
      }, speed)
    }, 100)
  }
  
  /**
   * Mettre en pause l'animation
   */
  function pause() {
    isPaused.value = true
  }
  
  /**
   * Reprendre l'animation
   */
  function resume() {
    isPaused.value = false
  }
  
  /**
   * Arrêter l'animation
   */
  function stop() {
    if (typingInterval) {
      clearInterval(typingInterval)
      typingInterval = null
    }
    isAnimating.value = false
  }
  
  /**
   * Terminer immédiatement l'animation en affichant tout le texte
   */
  function complete() {
    stop()
    displayedText.value = text
    onComplete()
  }
  
  // Nettoyage automatique lors du démontage du composant
  onUnmounted(() => {
    stop()
  })
  
  return {
    displayedText,
    isAnimating,
    isPaused,
    start,
    pause,
    resume,
    stop,
    complete
  }
}
