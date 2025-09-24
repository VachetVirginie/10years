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
    
    // SUPER-HACK pour les boutons dans IntroScreen sur iOS
    // Cet observateur de mutation vérifie si le bouton "COMMENCER L'AVENTURE" est visible
    // et y ajoute des écouteurs d'événements supplémentaires
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        const skipButtons = document.querySelectorAll('.skip-button');
        skipButtons.forEach(function(button) {
          // S'assurer que le bouton est cliquable
          button.style.zIndex = '99999';
          button.style.position = 'relative';
          button.style.opacity = '1';
          button.style.pointerEvents = 'auto';
          button.style.touchAction = 'auto';
          
          // Ajouter plusieurs types d'écouteurs d'événements
          const eventTypes = ['touchend', 'touchstart', 'click'];
          
          eventTypes.forEach(function(eventType) {
            button.addEventListener(eventType, function(e) {
              // Pour éviter plusieurs déclenchements
              e.stopPropagation();
              
              console.log('iOS: Bouton cliqué via', eventType);
              
              // Débloquer le scroll et nettoyer
              document.documentElement.classList.remove('splash-active', 'no-scroll');
              document.body.classList.remove('splash-active', 'no-scroll');
              document.documentElement.classList.add('ios-scroll');
              document.body.classList.add('ios-scroll');
              
              // Déclencher un événement de clic si ce n'est pas déjà un clic
              if (eventType !== 'click') {
                button.click();
              }
            }, { capture: true });
          });
        });
      });
    });
    
    // Observer tout le body pour détecter l'ajout de boutons
    observer.observe(document.body, { childList: true, subtree: true });
    
    // Améliorer la réactivité des boutons en général
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
        
        // Pour iOS Safari, force un petit délai avant de traiter le clic
        setTimeout(function() {
          el.click();
        }, 10);
      }
    }, { capture: true });
    
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
