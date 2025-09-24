/**
 * Composable pour réinitialiser toutes les restrictions de scroll
 * qui pourraient avoir été ajoutées par les écrans splash et intro
 */
export function useResetScroll() {
  /**
   * Fonction utilitaire pour réinitialiser toutes les restrictions de scroll
   * et restaurer le comportement normal de défilement
   */
  const resetScrollRestrictions = () => {
    // Supprimer les classes qui bloquent le scroll
    document.documentElement.classList.remove('splash-active');
    document.body.classList.remove('splash-active');
    document.documentElement.classList.remove('no-scroll');
    document.body.classList.remove('no-scroll');
    
    // Réinitialiser les styles inline qui bloquent le scroll
    document.body.style.height = '';
    document.documentElement.style.height = '';
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
    document.body.style.overscrollBehavior = '';
    document.documentElement.style.overscrollBehavior = '';
    document.body.style.position = '';
    document.documentElement.style.position = '';
    document.body.style.touchAction = '';
    document.documentElement.style.touchAction = '';
  };

  return {
    resetScrollRestrictions
  };
}
