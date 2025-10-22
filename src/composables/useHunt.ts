import hunt from '../data/hunt.example.json'
import type { HuntStep, GameConfig } from '../types/hunt'

export function useHunt(): GameConfig {
  return {
    title: hunt.title,
    steps: hunt.steps as HuntStep[],
    totalSteps: hunt.steps.length,
    bonusSteps: hunt.steps.filter(step => step.type === 'bonus').length
  }
}
