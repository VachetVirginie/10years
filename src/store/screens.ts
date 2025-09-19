import { defineStore } from 'pinia'

export const useScreensStore = defineStore('screens', {
  state: () => ({
    hasSeenSplash: false,
    hasSeenIntro: false
  }),
  actions: {
    load() {
      // Charger l'état des écrans depuis localStorage
      this.hasSeenSplash = localStorage.getItem('hasSeenSplash') === 'true'
      this.hasSeenIntro = localStorage.getItem('hasSeenIntro') === 'true'
    },
    
    save() {
      // Sauvegarder l'état des écrans dans localStorage
      localStorage.setItem('hasSeenSplash', this.hasSeenSplash ? 'true' : 'false')
      localStorage.setItem('hasSeenIntro', this.hasSeenIntro ? 'true' : 'false')
    },
    
    markSplashAsSeen() {
      this.hasSeenSplash = true
      this.save()
    },
    
    markIntroAsSeen() {
      this.hasSeenIntro = true
      this.save()
    },
    
    reset() {
      // Réinitialiser l'état des écrans
      this.hasSeenSplash = false
      this.hasSeenIntro = false
      
      // Supprimer explicitement du localStorage
      localStorage.setItem('hasSeenSplash', 'false')
      localStorage.setItem('hasSeenIntro', 'false')
      
      // Vérification pour s'assurer de la suppression
      if (localStorage.getItem('hasSeenSplash')) {
        // Forcer la mise à jour
        window.localStorage.setItem('hasSeenSplash', '')
        window.localStorage.removeItem('hasSeenSplash')
      }
      
    }
  }
})
