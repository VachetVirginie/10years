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
