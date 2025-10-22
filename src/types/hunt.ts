// Types de base pour la chasse au trésor
export interface BaseStep {
  id: string
  title: string
  prompt: string
  success?: string
  hint?: string
  photo?: string
  lat?: number
  lng?: number
  radius?: number
  answer?: string
  choices?: string[]
  correctIndex?: number
  bonusType?: string
  targetColor?: string
  targetTheme?: string
  targetElement?: string
  targetMemory?: string
  targetAction?: string
  targetConcept?: string
}

// Types spécifiques pour chaque type d'étape
export interface RiddleStep extends BaseStep {
  type: 'riddle'
  answer: string
}

export interface ChoiceStep extends BaseStep {
  type: 'choice'
  choices: string[]
  correctIndex: number
}

export interface BonusStep extends BaseStep {
  type: 'bonus'
  bonusType: string
  targetColor?: string
  targetTheme?: string
  targetElement?: string
  targetMemory?: string
  targetAction?: string
  targetConcept?: string
}

// Union type pour tous les types d'étapes
export type HuntStep = RiddleStep | ChoiceStep | BonusStep

// Types pour la géolocalisation
export interface GeolocationPosition {
  latitude: number
  longitude: number
  accuracy: number
  timestamp?: number
}

export interface GeolocationError {
  code: number
  message: string
}

// Types pour le store de progression
export interface ProgressState {
  currentIndex: number
  done: Set<string>
  stepValidation: Map<string, boolean>
}

// Types pour les composables
export interface GameImageConfig {
  path: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  format: 'jpg' | 'jpeg' | 'png' | 'svg' | 'webp'
  maxWidth?: number
  external?: boolean
}

export interface StepState {
  feedback: string
  showHint: boolean
  showSuccessPopup: boolean
  showPhotoBonus: boolean
  isFeedbackSuccess: boolean

  // État spécifique au type d'étape
  answer?: string
  selectedChoice?: number | null
  battleState?: string
  playerHP?: number
  opponentHP?: number

  // État de validation
  validationAttempts: number
  lastValidationTime?: number
}

// Types pour la configuration du jeu
export interface GameConfig {
  title: string
  steps: HuntStep[]
  totalSteps: number
  bonusSteps: number
  estimatedDuration?: number
}

// Types pour les métriques de performance
export interface PerformanceMetrics {
  geolocationUpdates: number
  imageLoadTime: number
  componentLoadTime: number
  cacheHits: number
  cacheMisses: number
}

export interface CacheStats {
  cacheSize: number
  lastUpdate: number | null
  totalDistance: number
}

// Types d'événements pour le système de navigation
export interface NavigationEvent {
  from: string
  to: string
  timestamp: number
  stepId?: string
  userAgent?: string
}

// Types pour la validation
export interface ValidationResult {
  isValid: boolean
  confidence: number
  method: 'exact' | 'similarity' | 'choice'
  attempts: number
  timestamp: number
}

// Types pour les photos et médias
export interface PhotoMetadata {
  stepId: string
  timestamp: number
  location?: GeolocationPosition
  size?: number
  format?: string
  url?: string
}

// Types utilitaires pour améliorer la sécurité des types
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P]
}

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>

// Types pour la configuration des badges Pokémon
export interface BadgeConfig {
  name: string
  image: string
  description: string
  color: string
  stepRequirement: number
}

// Types pour les animations et transitions
export interface AnimationConfig {
  duration: number
  easing: string
  delay?: number
  iterations?: number
}

// Types pour la configuration responsive
export interface ResponsiveConfig {
  mobile: {
    maxWidth: number
    imageSizes: Record<string, number>
    animations: boolean
  }
  tablet: {
    maxWidth: number
    imageSizes: Record<string, number>
    animations: boolean
  }
  desktop: {
    maxWidth: number
    imageSizes: Record<string, number>
    animations: boolean
  }
}

// Types pour la persistance
export interface PersistedData {
  progress: ProgressState
  preferences: {
    soundEnabled: boolean
    animationsEnabled: boolean
    language: string
    theme: 'light' | 'dark' | 'pokemon'
  }
  cache: {
    geolocation: GeolocationPosition[]
    images: string[]
    lastCleanup: number
  }
}

// Types d'erreurs personnalisés
export class HuntError extends Error {
  constructor(
    message: string,
    public code: 'GEOLOCATION' | 'VALIDATION' | 'NAVIGATION' | 'STORAGE' | 'NETWORK',
    public stepId?: string
  ) {
    super(message)
    this.name = 'HuntError'
  }
}

export class ValidationError extends HuntError {
  constructor(message: string, stepId: string, public attempts: number) {
    super(message, 'VALIDATION', stepId)
    this.name = 'ValidationError'
  }
}

// Types pour les tests
export interface TestStep extends BaseStep {
  expectedAnswer: string | number
  tolerance?: number
  validationType: 'exact' | 'similarity' | 'choice'
}
