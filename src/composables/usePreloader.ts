import { ref, computed } from 'vue'
import { useProgress } from '../store/progress'
import { useHunt } from './useHunt'

// Imports statiques pour les composants (nécessaires pour Vite)
// Note: Vite ne peut pas analyser les imports dynamiques avec des variables (import(component.path))
// Nous utilisons donc des imports statiques avec un mapping pour la compatibilité
import Step from '../pages/Step.vue'
import Map from '../pages/Map.vue'
import TrainerJournal from '../pages/TrainerJournal.vue'
import PokemonDialog from '../components/PokemonDialog.vue'
import PokemonHealthBar from '../components/PokemonHealthBar.vue'
import PokemonBadges from '../components/PokemonBadges.vue'

interface PreloadableComponent {
  name: string
  component: any
  priority: 'high' | 'medium' | 'low'
}

// Mapping des composants avec leurs imports statiques
const componentMap: Record<string, any> = {
  'Step': Step,
  'Map': Map,
  'TrainerJournal': TrainerJournal,
  'PokemonDialog': PokemonDialog,
  'PokemonHealthBar': PokemonHealthBar,
  'PokemonBadges': PokemonBadges
}

// Liste des composants à précharger avec leurs priorités
const componentsToPreload: PreloadableComponent[] = [
  { name: 'Step', component: Step, priority: 'high' },
  { name: 'Map', component: Map, priority: 'medium' },
  { name: 'TrainerJournal', component: TrainerJournal, priority: 'low' },
  { name: 'PokemonDialog', component: PokemonDialog, priority: 'high' },
  { name: 'PokemonHealthBar', component: PokemonHealthBar, priority: 'high' },
  { name: 'PokemonBadges', component: PokemonBadges, priority: 'medium' }
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

  // Préchargement intelligent (simulé car les imports sont déjà statiques)
  const preloadComponent = async (component: PreloadableComponent): Promise<void> => {
    try {
      // Simulation du préchargement (les composants sont déjà importés statiquement)
      await new Promise(resolve => setTimeout(resolve, 10))
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

  // Obtenir un composant préchargé
  const getPreloadedComponent = (componentName: string) => {
    return componentMap[componentName]
  }

  // Statistiques de préchargement
  const getPreloadStats = () => ({
    totalComponents: componentsToPreload.length,
    preloadedCount: preloadedComponents.size,
    remainingCount: componentsToPreload.length - preloadedComponents.size,
    isPreloading: isPreloading.value,
    availableComponents: Object.keys(componentMap)
  })

  return {
    preloadHighPriority,
    preloadForProgression,
    preloadSpecific,
    getPreloadedComponent,
    getPreloadStats,
    componentsToPreloadNow
  }
}
