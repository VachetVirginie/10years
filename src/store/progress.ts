import { defineStore } from 'pinia'
import { useHunt } from '../composables/useHunt'

export const useProgress = defineStore('progress', {
  state: () => ({
    currentIndex: 0,
    done: new Set<string>(),
    stepValidation: new Map<string, boolean>()
  }),
  getters: {
    isHuntCompleted: (state) => {
      const { steps } = useHunt()
      return steps.length > 0 && state.done.size === steps.length
    },
    canGoNext: (state) => {
      const { steps } = useHunt()
      if (state.currentIndex >= steps.length - 1) return false
      const currentStep = steps[state.currentIndex]
      return currentStep ? state.done.has(currentStep.id) : false
    },
    canGoPrevious: (state) => {
      return state.currentIndex > 0
    },
    isStepCompleted: (state) => {
      return (stepId: string) => state.done.has(stepId)
    },
    // Nouvelle méthode pour obtenir l'ID de l'étape actuelle
    currentStepId: (state) => {
      const { steps } = useHunt()
      return state.currentIndex < steps.length ? steps[state.currentIndex].id : '1'
    },
    // Nouvelle méthode pour obtenir l'ID de l'étape suivante (ou la même si c'est la dernière)
    nextStepId: (state) => {
      const { steps } = useHunt()
      // Si c'est la dernière étape, on reste dessus
      const nextIndex = state.currentIndex < steps.length - 1 ? state.currentIndex + 1 : state.currentIndex
      return steps[nextIndex]?.id || '1'
    },
    // Indique l'index auquel reprendre la progression
    resumeIndex: (state) => {
      const { steps } = useHunt()
      // Vérifier si l'étape actuelle est terminée
      if (state.currentIndex < steps.length) {
        const currentStep = steps[state.currentIndex]
        // Si l'étape actuelle est déjà terminée, nous voulons passer à la suivante
        if (currentStep && state.done.has(currentStep.id)) {
          // Mais seulement s'il y a une étape suivante
          return state.currentIndex < steps.length - 1 ? state.currentIndex + 1 : state.currentIndex
        }
      }
      return state.currentIndex
    }
  },
  actions: {
    load() {
      const raw = localStorage.getItem('progress')
      if (raw) {
        const { currentIndex, done, stepValidation } = JSON.parse(raw)
        this.currentIndex = currentIndex || 0
        this.done = new Set(done || [])
        this.stepValidation = new Map(stepValidation || [])
      }
    },
    save() {
      localStorage.setItem('progress', JSON.stringify({
        currentIndex: this.currentIndex,
        done: Array.from(this.done),
        stepValidation: Array.from(this.stepValidation.entries())
      }))
    },
    markDone(id: string) {
      this.done.add(id)
      this.stepValidation.set(id, true)
      
      // Mettre à jour currentIndex pour correspondre à cette étape complétée
      const { steps } = useHunt()
      const stepIndex = steps.findIndex(s => s.id === id)
      if (stepIndex !== -1) {
        this.currentIndex = stepIndex
      }
      
      this.save()
    },
    goNext() {
      const { steps } = useHunt()
      if (this.canGoNext && this.currentIndex < steps.length - 1) {
        this.currentIndex++
        this.save()
      }
    },
    goPrevious() {
      if (this.canGoPrevious) {
        this.currentIndex--
        this.save()
      }
    },
    goToStep(index: number) {
      const { steps } = useHunt()
      if (index >= 0 && index < steps.length) {
        this.currentIndex = index
        this.save()
      }
    },
    reset() {
      this.currentIndex = 0
      this.done = new Set()
      this.stepValidation = new Map()
      localStorage.clear()
      this.save()
    }
  }
})
