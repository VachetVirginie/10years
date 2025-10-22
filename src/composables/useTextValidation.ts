import { computed } from 'vue'
import type { ValidationResult } from '../types/hunt'

// Configuration de validation
export interface ValidationConfig {
  similarityThreshold: number
  maxAttempts: number
  allowPartialMatch: boolean
  caseSensitive: boolean
  trimWhitespace: boolean
}

// Configuration par défaut
const DEFAULT_CONFIG: ValidationConfig = {
  similarityThreshold: 0.7,
  maxAttempts: 3,
  allowPartialMatch: true,
  caseSensitive: false,
  trimWhitespace: true
}

export function useTextValidation(customConfig?: Partial<ValidationConfig>) {
  const config = { ...DEFAULT_CONFIG, ...customConfig }

  // Normaliser le texte selon la configuration
  const normalizeText = (text: string): string => {
    let normalized = text

    if (config.trimWhitespace) {
      normalized = normalized.trim()
    }

    if (!config.caseSensitive) {
      normalized = normalized.toLowerCase()
    }

    // Suppression des accents
    normalized = normalized.normalize("NFD").replace(/[\u0300-\u036f]/g, "")

    // Suppression des caractères spéciaux et de ponctuation
    normalized = normalized.replace(/[^a-z0-9]/g, '')

    return normalized
  }

  // Calculer la similarité entre deux chaînes
  const calculateSimilarity = (str1: string, str2: string): number => {
    const s1 = normalizeText(str1)
    const s2 = normalizeText(str2)

    // Match exact
    if (s1 === s2) return 1.0

    // Match partiel (inclusion)
    if (config.allowPartialMatch && (s1.includes(s2) || s2.includes(s1))) {
      return 0.9
    }

    // Différence de longueur trop importante
    if (Math.abs(s1.length - s2.length) > 3) return 0.0

    // Calcul de similarité par caractères
    let matches = 0
    for (let i = 0; i < s1.length; i++) {
      if (s2.includes(s1[i])) matches++
    }

    return matches / Math.max(s1.length, s2.length)
  }

  // Valider une réponse texte
  const validateAnswer = (
    userAnswer: string,
    correctAnswer: string,
    attempts: number = 1
  ): ValidationResult => {
    const similarity = calculateSimilarity(userAnswer, correctAnswer)
    const exactMatch = normalizeText(userAnswer) === normalizeText(correctAnswer)

    const isValid = exactMatch || similarity >= config.similarityThreshold
    const method: 'exact' | 'similarity' = exactMatch ? 'exact' : 'similarity'

    return {
      isValid,
      confidence: similarity,
      method,
      attempts,
      timestamp: Date.now()
    }
  }

  // Valider un choix multiple
  const validateChoice = (
    selectedIndex: number,
    correctIndex: number,
    attempts: number = 1
  ): ValidationResult => {
    const isValid = selectedIndex === correctIndex

    return {
      isValid,
      confidence: isValid ? 1.0 : 0.0,
      method: 'choice',
      attempts,
      timestamp: Date.now()
    }
  }

  // Obtenir des suggestions pour une réponse incorrecte
  const getSuggestions = (userAnswer: string, possibleAnswers: string[]): string[] => {
    return possibleAnswers
      .map(answer => ({
        answer,
        similarity: calculateSimilarity(userAnswer, answer)
      }))
      .filter(({ similarity }) => similarity >= 0.5)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 3)
      .map(({ answer }) => answer)
  }

  // Vérifier si un utilisateur peut encore essayer
  const canRetry = (attempts: number): boolean => {
    return attempts < config.maxAttempts
  }

  // Obtenir le seuil de validation
  const getThreshold = (): number => config.similarityThreshold

  // Mettre à jour la configuration
  const updateConfig = (newConfig: Partial<ValidationConfig>): void => {
    Object.assign(config, newConfig)
  }

  return {
    validateAnswer,
    validateChoice,
    getSuggestions,
    canRetry,
    getThreshold,
    updateConfig,
    normalizeText,
    calculateSimilarity,
    config: computed(() => ({ ...config }))
  }
}
