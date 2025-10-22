import { ref, computed } from 'vue'
import { useProgress } from '../store/progress'
import { useHunt } from './useHunt'

interface PreloadableComponent {
  name: string
  path: string
  priority: 'high' | 'medium' | 'low'
}

// Liste des composants à précharger avec leurs priorités
const componentsToPreload: PreloadableComponent[] = [
  { name: 'Step', path: '../pages/Step.vue', priority: 'high' },
  { name: 'Map', path: '../pages/Map.vue', priority: 'medium' },
  { name: 'TrainerJournal', path: '../pages/TrainerJournal.vue', priority: 'low' },
  { name: 'PokemonDialog', path: '../components/PokemonDialog.vue', priority: 'high' },
  { name: 'PokemonHealthBar', path: '../components/PokemonHealthBar.vue', priority: 'high' },
  { name: 'PokemonBadges', path: '../components/PokemonBadges.vue', priority: 'medium' }
]

// Cache des composants déjà préchargés
const preloadedComponents = new Set<string>()

export function usePreloader() {
  const store = useProgress()
  const { steps } = useHunt()
  const isPreloading = ref(false)

  // Composants à précharger selon la progression
  const componentsToPreloadNow = computed(() => {
    const components: PreloadableComponent[] = []
    const progress = store.done.size

    // Toujours précharger les composants critiques
    components.push(...componentsToPreload.filter(c => c.priority === 'high'))

    // Précharger les composants selon la progression
    if (progress > 0) {
      components.push(...componentsToPreload.filter(c => c.priority === 'medium'))
    }

    if (progress > steps.length * 0.5) {
      components.push(...componentsToPreload.filter(c => c.priority === 'low'))
    }

    return components.filter(c => !preloadedComponents.has(c.name))
  })

  // Préchargement intelligent
  const preloadComponent = async (component: PreloadableComponent): Promise<void> => {
    try {
      await import(component.path)
      preloadedComponents.add(component.name)
      console.log(`✅ Composant ${component.name} préchargé`)
    } catch (error) {
      console.warn(`⚠️ Échec du préchargement de ${component.name}:`, error)
    }
  }

  // Précharger tous les composants prioritaires
  const preloadHighPriority = async (): Promise<void> => {
    if (isPreloading.value) return

    isPreloading.value = true
    const highPriorityComponents = componentsToPreloadNow.value.filter(c => c.priority === 'high')

    try {
      await Promise.allSettled(
        highPriorityComponents.map(preloadComponent)
      )
    } finally {
      isPreloading.value = false
    }
  }

  // Précharger selon la progression
  const preloadForProgression = async (): Promise<void> => {
    const componentsToLoad = componentsToPreloadNow.value

    if (componentsToLoad.length === 0) return

    // Précharger séquentiellement pour ne pas surcharger
    for (const component of componentsToLoad) {
      await new Promise(resolve => setTimeout(resolve, 100)) // Petit délai
      await preloadComponent(component)
    }
  }

  // Précharger un composant spécifique
  const preloadSpecific = async (componentName: string): Promise<void> => {
    const component = componentsToPreload.find(c => c.name === componentName)
    if (component && !preloadedComponents.has(component.name)) {
      await preloadComponent(component)
    }
  }

  // Statistiques de préchargement
  const getPreloadStats = () => ({
    totalComponents: componentsToPreload.length,
    preloadedCount: preloadedComponents.size,
    remainingCount: componentsToPreload.length - preloadedComponents.size,
    isPreloading: isPreloading.value
  })

  return {
    preloadHighPriority,
    preloadForProgression,
    preloadSpecific,
    getPreloadStats,
    componentsToPreloadNow
  }
}
