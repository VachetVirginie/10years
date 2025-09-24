/**
 * Script pour améliorer la gestion des interactions tactiles sur iOS
 * Ce script résout les problèmes courants liés aux événements de clic et tactiles sur iOS,
 * particulièrement pour les éléments avec position: fixed
 */

// Exécuter une fois que le document est chargé
document.addEventListener('DOMContentLoaded', function() {
  // Détecter si nous sommes sur iOS
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  
  if (isIOS) {
    // Ajouter une classe iOS à l'élément HTML pour des styles spécifiques
    document.documentElement.classList.add('ios-device');
    
    // Améliorer la réactivité des boutons
    document.addEventListener('touchend', function(e) {
      // Vérifier si l'élément ou son parent est un bouton
      let el = e.target;
      let isButton = false;
      
      // Remonter jusqu'à 3 niveaux pour trouver un bouton
      for (let i = 0; i < 3; i++) {
        if (!el) break;
        if (
          el.tagName === 'BUTTON' || 
          el.classList.contains('v-btn') ||
          el.classList.contains('skip-button') ||
          el.classList.contains('button') ||
          el.tagName === 'A'
        ) {
          isButton = true;
          break;
        }
        el = el.parentElement;
      }
      
      // Si c'est un bouton, s'assurer que le clic est bien traité
      if (isButton) {
        // Certaines zones peuvent bloquer les interactions
        document.body.classList.remove('splash-active');
        document.documentElement.classList.remove('splash-active');
      }
    });
    
    // Gérer le scroll après chaque geste
    document.addEventListener('touchend', function() {
      setTimeout(function() {
        // Petite astuce pour "réveiller" le défilement si nécessaire
        if (!document.querySelector('.splash-container, .intro-container, .enigme-splash')) {
          window.scrollTo(window.scrollX, window.scrollY + 1);
          window.scrollTo(window.scrollX, window.scrollY - 1);
        }
      }, 300);
    });
  }
});
