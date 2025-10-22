import { ref, computed } from 'vue'
import { useProgress } from '../store/progress'
import { useHunt } from './useHunt'
import { useTextValidation } from './useTextValidation'
import type { StepState } from '../types/hunt'

// Configuration par défaut pour l'état d'une étape

export function useStepState() {
  const store = useProgress()
  const { steps } = useHunt()
  const { validateAnswer, validateChoice } = useTextValidation()

  // État actuel de l'étape
  const currentState = ref<StepState>({
    feedback: '',
    showHint: false,
    showSuccessPopup: false,
    showPhotoBonus: false,
    isFeedbackSuccess: false,
    validationAttempts: 0
  })

  // Actions de réinitialisation
  const resetState = (customDefaults?: Partial<StepState>) => {
    currentState.value = {
      feedback: '',
      showHint: false,
      showSuccessPopup: false,
      showPhotoBonus: false,
      isFeedbackSuccess: false,
      validationAttempts: 0,
      ...customDefaults
    }
  }

  // Actions de validation communes
  const validateStep = (stepId: string, isValid: boolean, successMessage?: string) => {
    currentState.value.validationAttempts++
    currentState.value.lastValidationTime = Date.now()

    if (isValid) {
      currentState.value.isFeedbackSuccess = true
      currentState.value.feedback = successMessage || 'Bravo ! Réponse correcte !'
      store.markDone(stepId)
      currentState.value.showSuccessPopup = true
    } else {
      currentState.value.isFeedbackSuccess = false
      currentState.value.feedback = 'Mauvaise réponse. Essaie encore.'
    }
  }

  // Validation spécialisée pour les énigmes
  const validateRiddleAnswer = (userAnswer: string, correctAnswer: string, stepId: string, successMessage?: string) => {
    currentState.value.answer = userAnswer

    const validation = validateAnswer(userAnswer, correctAnswer)
    currentState.value.validationAttempts = validation.attempts

    validateStep(stepId, validation.isValid, successMessage)
  }

  // Validation spécialisée pour les choix
  const validateChoiceAnswer = (selectedIndex: number, correctIndex: number, stepId: string, successMessage?: string) => {
    currentState.value.selectedChoice = selectedIndex

    const validation = validateChoice(selectedIndex, correctIndex)
    currentState.value.validationAttempts = validation.attempts

    validateStep(stepId, validation.isValid, successMessage)
  }

  // Navigation vers l'étape suivante
  const navigateToNext = (currentStepId: string, totalSteps: any[], photoInstruction?: string) => {
    currentState.value.showSuccessPopup = false

    setTimeout(() => {
      const currentIndex = totalSteps.findIndex((s: any) => s.id === currentStepId)
      const currentId = Number(currentStepId)
      const isLastStep = currentIndex === totalSteps.length - 1

      // Logique de navigation
      if (isLastStep) {
        // Dernière étape - vers l'écran de fin avec animations
        window.location.href = '/mission-complete'
      } else {
        // Vérifier étape bonus
        const nextBonusStep = `${currentId}b`
        const bonusStepExists = totalSteps.find((s: any) => s.id === nextBonusStep)

        if (bonusStepExists) {
          window.location.href = `/step/${nextBonusStep}`
        } else {
          const nextId = currentId + 1
          window.location.href = `/step/${nextId}`
        }
      }
    }, 300)
  }

  // Navigation vers l'étape précédente
  const navigateToPrevious = (currentStepId: string) => {
    currentState.value.showSuccessPopup = false

    setTimeout(() => {
      const currentId = Number(currentStepId)
      if (currentId > 1) {
        const prevId = currentId - 1
        window.location.href = `/step/${prevId}`
      }
    }, 300)
  }

  // Gestion du bonus photo
  const handlePhotoBonus = (photoInstruction?: string) => {
    currentState.value.showSuccessPopup = false
    currentState.value.showPhotoBonus = true
  }

  // Gestion de la fin du bonus photo
  const completePhotoBonus = () => {
    currentState.value.showPhotoBonus = false
    // Ici on pourrait sauvegarder la photo
  }

  // Gestion de l'ignorance du bonus photo
  const skipPhotoBonus = () => {
    currentState.value.showPhotoBonus = false
  }

  return {
    // État
    currentState: computed(() => currentState.value),

    // Actions génériques
    resetState,
    validateStep,

    // Actions spécialisées
    validateRiddle: validateRiddleAnswer,
    validateChoice: validateChoiceAnswer,
    navigateToNext,
    navigateToPrevious,
    handlePhotoBonus,
    completePhotoBonus,
    skipPhotoBonus
  }
}
