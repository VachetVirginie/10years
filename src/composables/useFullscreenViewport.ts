import { onMounted, onUnmounted } from 'vue'

/**
 * Options pour le composable useFullscreenViewport
 */
interface UseFullscreenViewportOptions {
  preventScroll?: boolean;      // Empêcher le défilement pendant l'affichage
  recalculateOnResize?: boolean; // Recalculer à chaque redimensionnement
  recalculateDelays?: number[];  // Délais additionnels pour recalculer (en ms)
}

/**
 * Composable pour gérer l'affichage plein écran avec correction de hauteur pour mobile
 * Résout les problèmes courants de hauteur sur mobile et iOS
 * 
 * @param options - Options de configuration
 */
export function useFullscreenViewport(options: UseFullscreenViewportOptions = {}) {
  const {
    preventScroll = true,
    recalculateOnResize = true,
    recalculateDelays = [100, 500]
  } = options
  
  /**
   * Calcule et applique la hauteur correcte pour les appareils mobiles
   * Utilise une variable CSS personnalisée --vh pour calculer correctement les hauteurs
   * et ajoute des classes CSS pour contrôler le défilement si nécessaire
   */
  const setViewportHeight = () => {
    // Calculer et définir la variable --vh basée sur la hauteur réelle de la fenêtre
    const vh = window.innerHeight * 0.01
    document.documentElement.style.setProperty('--vh', `${vh}px`)
    
    // Ajouter des classes pour bloquer le défilement globalement SEULEMENT si preventScroll est activé
    if (preventScroll) {
      document.documentElement.classList.add('splash-active')
      document.body.classList.add('splash-active')
      // Forcer une mise à jour immédiate des hauteurs
      document.body.style.height = `${window.innerHeight}px`
      document.documentElement.style.height = `${window.innerHeight}px`
    } else {
      // Si le preventScroll n'est pas actif, s'assurer que les classes sont supprimées
      document.documentElement.classList.remove('splash-active')
      document.body.classList.remove('splash-active')
      // Restaurer le comportement normal
      document.body.style.height = ''
      document.documentElement.style.height = ''
    }
  }
  
  /**
   * Empêche le défilement pendant l'affichage plein écran
   */
  const preventScrollHandler = (e: Event) => {
    e.preventDefault()
  }
  
  /**
   * Configuration au montage du composant
   */
  onMounted(() => {
    // Appliquer immédiatement
    setViewportHeight()
    
    // Ajouter les écouteurs d'événements si nécessaire
    if (recalculateOnResize) {
      window.addEventListener('resize', setViewportHeight)
      window.addEventListener('orientationchange', setViewportHeight)
    }
    
    // Bloquer le défilement si demandé
    if (preventScroll) {
      window.addEventListener('scroll', preventScrollHandler, { passive: false })
    }
    
    // Planifier des recalculs additionnels après des délais spécifiés
    recalculateDelays.forEach(delay => {
      setTimeout(setViewportHeight, delay)
    })
  })
  
  /**
   * Nettoyage au démontage du composant
   */
  onUnmounted(() => {
    // Retirer les événements
    if (recalculateOnResize) {
      window.removeEventListener('resize', setViewportHeight)
      window.removeEventListener('orientationchange', setViewportHeight)
    }
    
    if (preventScroll) {
      window.removeEventListener('scroll', preventScrollHandler)
    }
    
    // Retirer les classes CSS globales et s'assurer que le scroll est restauré
    document.documentElement.classList.remove('splash-active')
    document.body.classList.remove('splash-active')
    // Restaurer les hauteurs normales
    document.body.style.height = ''
    document.documentElement.style.height = ''
    // S'assurer que overflow est restauré
    document.body.style.overflow = ''
    document.documentElement.style.overflow = ''
  })
  
  return {
    setViewportHeight
  }
}
