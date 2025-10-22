import { defineStore } from 'pinia'
import { useHunt } from '../composables/useHunt'
import type { ProgressState, HuntStep } from '../types/hunt'

export const useProgress = defineStore('progress', {
  state: (): ProgressState => ({
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
      return (stepId: string): boolean => state.done.has(stepId)
    },

    // Nouvelle méthode pour obtenir l'ID de l'étape actuelle
    currentStepId: (state): string => {
      const { steps } = useHunt()
      return state.currentIndex < steps.length ? steps[state.currentIndex].id : '1'
    },

    // Nouvelle méthode pour obtenir l'ID de l'étape suivante (ou la même si c'est la dernière)
    nextStepId: (state): string => {
      const { steps } = useHunt()
      // Si c'est la dernière étape, on reste dessus
      const nextIndex = state.currentIndex < steps.length - 1 ? state.currentIndex + 1 : state.currentIndex
      return steps[nextIndex]?.id || '1'
    },

    // Indique l'index auquel reprendre la progression
    resumeIndex: (state): number => {
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
    },

    // Métriques de progression
    progressMetrics: (state) => {
      const { steps } = useHunt()
      return {
        completedSteps: state.done.size,
        totalSteps: steps.length,
        completionPercentage: steps.length > 0 ? Math.round((state.done.size / steps.length) * 100) : 0,
        currentStepIndex: state.currentIndex,
        remainingSteps: steps.length - state.done.size,
        averageStepsPerSession: state.stepValidation.size > 0
          ? Array.from(state.stepValidation.values()).filter(Boolean).length / Math.max(state.stepValidation.size, 1)
          : 0
      }
    }
  },

  actions: {
    load(): void {
      const raw = localStorage.getItem('progress')
      if (raw) {
        try {
          const { currentIndex, done, stepValidation } = JSON.parse(raw)
          this.currentIndex = currentIndex || 0
          this.done = new Set(done || [])
          this.stepValidation = new Map(stepValidation || [])
        } catch (error) {
          console.warn('Erreur lors du chargement de la progression:', error)
          this.reset()
        }
      }
    },

    save(): void {
      try {
        localStorage.setItem('progress', JSON.stringify({
          currentIndex: this.currentIndex,
          done: Array.from(this.done),
          stepValidation: Array.from(this.stepValidation.entries())
        }))
      } catch (error) {
        console.warn('Erreur lors de la sauvegarde de la progression:', error)
      }
    },

    markDone(id: string): void {
      this.done.add(id)
      this.stepValidation.set(id, true)

      // Mettre à jour currentIndex pour correspondre à cette étape complétée
      const { steps } = useHunt()
      const stepIndex = steps.findIndex((s: HuntStep) => s.id === id)
      if (stepIndex !== -1) {
        this.currentIndex = stepIndex
      }

      this.save()
    },

    goNext(): void {
      const { steps } = useHunt()
      if (this.canGoNext && this.currentIndex < steps.length - 1) {
        this.currentIndex++
        this.save()
      }
    },

    goPrevious(): void {
      if (this.canGoPrevious) {
        this.currentIndex--
        this.save()
      }
    },

    goToStep(index: number): void {
      const { steps } = useHunt()
      if (index >= 0 && index < steps.length) {
        this.currentIndex = index
        this.save()
      }
    },

    reset(): void {
      this.currentIndex = 0
      this.done = new Set()
      this.stepValidation = new Map()
      try {
        localStorage.removeItem('progress')
      } catch (error) {
        console.warn('Erreur lors de la réinitialisation:', error)
      }
      this.save()
    },

    // Nouvelle méthode pour marquer une étape comme invalidée
    markInvalid(stepId: string): void {
      this.stepValidation.set(stepId, false)
      this.save()
    },

    // Nouvelle méthode pour obtenir les statistiques détaillées
    getDetailedStats(): {
      completedSteps: string[]
      failedSteps: string[]
      totalAttempts: number
      averageAttemptsPerStep: number
    } {
      const completedSteps = Array.from(this.stepValidation.entries())
        .filter(([, isValid]) => isValid)
        .map(([stepId]) => stepId)

      const failedSteps = Array.from(this.stepValidation.entries())
        .filter(([, isValid]) => !isValid)
        .map(([stepId]) => stepId)

      const totalAttempts = this.stepValidation.size
      const averageAttemptsPerStep = totalAttempts > 0 ? totalAttempts / this.done.size : 0

      return {
        completedSteps,
        failedSteps,
        totalAttempts,
        averageAttemptsPerStep
      }
    }
  }
})
