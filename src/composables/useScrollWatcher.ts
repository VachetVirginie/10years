import { onMounted, onUnmounted } from 'vue';
import { useResetScroll } from './useResetScroll';
/**
 * Composable pour surveiller et restaurer le scroll après les changements de route
 * et autres événements qui pourraient bloquer le scroll
 */

export function useScrollWatcher() {
  const { resetScrollRestrictions } = useResetScroll();

  // Événements à surveiller pour détecter quand restaurer le scroll
  const events = [
    'popstate', // Changement d'histoire (navigation)
    'resize',   // Redimensionnement de la fenêtre
    'orientationchange', // Changement d'orientation de l'appareil
    'touchend', // Fin d'un événement tactile
    'click',    // Clic de l'utilisateur
  ];

  // Fonction pour gérer ces événements
  const handleEvent = () => {
    // Attendre un court instant pour que le DOM soit stabilisé
    setTimeout(() => {
      // Vérifier si le scroll est encore bloqué et le restaurer si nécessaire
      const body = document.body;
      const html = document.documentElement;
      
      const hasScrollRestrictions = 
        body.classList.contains('splash-active') ||
        html.classList.contains('splash-active') ||
        body.style.overflow === 'hidden' ||
        html.style.overflow === 'hidden' ||
        body.style.position === 'fixed' ||
        html.style.position === 'fixed';
      
      // Si des restrictions de scroll sont détectées sans écran de splash visible
      // (vérifions s'il n'y a pas d'élément avec la classe intro-container ou splash-container visible)
      const splashElements = document.querySelectorAll('.intro-container, .splash-container, .enigme-splash');
      const hasVisibleSplash = Array.from(splashElements).some(el => 
        window.getComputedStyle(el).display !== 'none' && 
        window.getComputedStyle(el).visibility !== 'hidden'
      );
      
      if (hasScrollRestrictions && !hasVisibleSplash) {
        resetScrollRestrictions();
      }
    }, 300);
  };

  // Initialisation
  onMounted(() => {
    // Ajouter des écouteurs d'événements
    events.forEach(event => {
      window.addEventListener(event, handleEvent, { passive: true });
    });
    
    // Vérifier et restaurer le scroll initial
    handleEvent();
  });
  
  // Nettoyage
  onUnmounted(() => {
    // Supprimer les écouteurs d'événements
    events.forEach(event => {
      window.removeEventListener(event, handleEvent);
    });
  });

  return {
    resetScrollManually: resetScrollRestrictions
  };
}
