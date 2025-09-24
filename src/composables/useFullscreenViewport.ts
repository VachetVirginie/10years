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
   */
  const setViewportHeight = () => {
    // Calculer et définir la variable --vh basée sur la hauteur réelle de la fenêtre
    const vh = window.innerHeight * 0.01
    document.documentElement.style.setProperty('--vh', `${vh}px`)
    
    // Sur iOS, les hauteurs fixes causent des problèmes de défilement persistants
    // Utiliser seulement la variable CSS --vh dans les règles CSS
  }
  
  /**
   * Pour iOS, nous utilisons une approche plus simple et compatible
   * au lieu d'empêcher complètement le défilement
   */
  const preventScrollHandler = (e: Event) => {
    // Ne rien faire pour iOS - bloquer les événements de défilement cause des problèmes
    // sur iOS avec les interactions tactiles
    if (!preventScroll) return;
    
    // En mode preventScroll, empêcher uniquement le scroll de propagation
    e.stopPropagation();
  }
  
  /**
   * Configuration au montage du composant
   */
  onMounted(() => {
    // Appliquer immédiatement le calcul de la hauteur
    setViewportHeight()
    
    // Ajouter les écouteurs pour le redimensionnement
    if (recalculateOnResize) {
      window.addEventListener('resize', setViewportHeight)
      window.addEventListener('orientationchange', setViewportHeight)
    }
    
    // Planifier des recalculs additionnels après des délais spécifiés
    // C'est important pour iOS qui peut avoir des délais de rendu
    recalculateDelays.forEach(delay => {
      setTimeout(setViewportHeight, delay)
    })
  })
  
  /**
   * Nettoyage au démontage du composant
   */
  onUnmounted(() => {
    // Retirer les écouteurs d'événements
    if (recalculateOnResize) {
      window.removeEventListener('resize', setViewportHeight)
      window.removeEventListener('orientationchange', setViewportHeight)
    }
  })
  
  return {
    setViewportHeight
  }
}
