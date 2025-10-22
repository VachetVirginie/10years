import { ref, computed, nextTick } from 'vue'
import { useProgress } from '../store/progress'
import { useHunt } from './useHunt'

// Composants critiques à précharger (imports statiques)
import PokemonDialog from '../components/PokemonDialog.vue'
import PokemonHealthBar from '../components/PokemonHealthBar.vue'

// Composants de jeu (imports dynamiques pour le lazy loading)
const loadStepComponent = () => import('../pages/Step.vue')
const loadMapComponent = () => import('../pages/Map.vue')
const loadJournalComponent = () => import('../pages/TrainerJournal.vue')
const loadSummaryComponent = () => import('../pages/Summary.vue')
const loadOurStoryComponent = () => import('../pages/OurStory.vue')

// Composants UI supplémentaires
const loadPokemonBadges = () => import('../components/PokemonBadges.vue')
const loadPokemonMenu = () => import('../components/PokemonMenu.vue')

interface ComponentLoader {
  name: string
  loader: () => Promise<any>
  priority: 'critical' | 'high' | 'medium' | 'low'
  loaded: boolean
  loading: boolean
  error?: string
}

export function useAdvancedPreloader() {
  const store = useProgress()
  const { steps } = useHunt()
  const isPreloading = ref(false)

  // État des composants
  const componentStates = ref<Map<string, ComponentLoader>>(new Map([
    // Composants critiques (chargés immédiatement)
    ['PokemonDialog', {
      name: 'PokemonDialog',
      loader: () => Promise.resolve(PokemonDialog),
      priority: 'critical',
      loaded: false,
      loading: false
    }],
    ['PokemonHealthBar', {
      name: 'PokemonHealthBar',
      loader: () => Promise.resolve(PokemonHealthBar),
      priority: 'critical',
      loaded: false,
      loading: false
    }],

    // Composants de jeu (lazy loading)
    ['Step', {
      name: 'Step',
      loader: loadStepComponent,
      priority: 'high',
      loaded: false,
      loading: false
    }],
    ['Map', {
      name: 'Map',
      loader: loadMapComponent,
      priority: 'medium',
      loaded: false,
      loading: false
    }],
    ['TrainerJournal', {
      name: 'TrainerJournal',
      loader: loadJournalComponent,
      priority: 'low',
      loaded: false,
      loading: false
    }],
    ['Summary', {
      name: 'Summary',
      loader: loadSummaryComponent,
      priority: 'low',
      loaded: false,
      loading: false
    }],
    ['OurStory', {
      name: 'OurStory',
      loader: loadOurStoryComponent,
      priority: 'low',
      loaded: false,
      loading: false
    }],

    // Composants UI
    ['PokemonBadges', {
      name: 'PokemonBadges',
      loader: loadPokemonBadges,
      priority: 'medium',
      loaded: false,
      loading: false
    }],
    ['PokemonMenu', {
      name: 'PokemonMenu',
      loader: loadPokemonMenu,
      priority: 'medium',
      loaded: false,
      loading: false
    }]
  ]))

  // Composants à précharger selon la progression
  const componentsToPreload = computed(() => {
    const progress = store.done.size
    const components: ComponentLoader[] = []

    // Toujours précharger les composants critiques
    componentStates.value.forEach(component => {
      if (component.priority === 'critical') {
        components.push(component)
      }
    })

    // Précharger selon la progression
    if (progress > 0) {
      componentStates.value.forEach(component => {
        if (component.priority === 'high' || component.priority === 'medium') {
          components.push(component)
        }
      })
    }

    if (progress > steps.length * 0.5) {
      componentStates.value.forEach(component => {
        if (component.priority === 'low') {
          components.push(component)
        }
      })
    }

    // Filtrer les composants non encore chargés
    return components.filter(c => !c.loaded && !c.loading)
  })

  // Précharger un composant spécifique
  const preloadComponent = async (componentName: string): Promise<any> => {
    const componentState = componentStates.value.get(componentName)
    if (!componentState) {
      throw new Error(`Composant ${componentName} non trouvé`)
    }

    if (componentState.loaded) {
      return componentState.loader()
    }

    if (componentState.loading) {
      // Attendre que le chargement en cours se termine
      return new Promise((resolve, reject) => {
        const checkLoaded = () => {
          if (componentState.loaded) {
            resolve(componentState.loader())
          } else if (componentState.error) {
            reject(new Error(componentState.error))
          } else {
            setTimeout(checkLoaded, 10)
          }
        }
        checkLoaded()
      })
    }

    componentState.loading = true

    try {
      const component = await componentState.loader()
      componentState.loaded = true
      componentState.loading = false

      console.log(`✅ Composant ${componentName} préchargé avec succès`)
      return component
    } catch (error) {
      componentState.loading = false
      componentState.error = error instanceof Error ? error.message : 'Erreur inconnue'

      console.warn(`⚠️ Échec du préchargement de ${componentName}:`, error)
      throw error
    }
  }

  // Précharger tous les composants prioritaires
  const preloadHighPriority = async (): Promise<void> => {
    if (isPreloading.value) return

    isPreloading.value = true

    try {
      const criticalComponents = Array.from(componentStates.value.values())
        .filter(c => c.priority === 'critical')

      await Promise.allSettled(
        criticalComponents.map(c => preloadComponent(c.name))
      )
    } finally {
      isPreloading.value = false
    }
  }

  // Précharger selon la progression
  const preloadForProgression = async (): Promise<void> => {
    const componentsToLoad = componentsToPreload.value

    if (componentsToLoad.length === 0) return

    // Précharger par priorité
    const sortedComponents = componentsToLoad.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    })

    // Charger séquentiellement pour éviter la surcharge
    for (const component of sortedComponents) {
      await nextTick() // Laisser le temps à l'interface de respirer
      try {
        await preloadComponent(component.name)
        // Petit délai entre les chargements
        await new Promise(resolve => setTimeout(resolve, 50))
      } catch (error) {
        // Ignorer les erreurs de préchargement
        console.warn(`Préchargement ignoré pour ${component.name}`)
      }
    }
  }

  // Précharger un composant spécifique
  const preloadSpecific = async (componentName: string): Promise<any> => {
    return await preloadComponent(componentName)
  }

  // Obtenir l'état d'un composant
  const getComponentState = (componentName: string) => {
    return componentStates.value.get(componentName)
  }

  // Forcer le rechargement d'un composant
  const reloadComponent = async (componentName: string): Promise<any> => {
    const componentState = componentStates.value.get(componentName)
    if (componentState) {
      componentState.loaded = false
      componentState.loading = false
      componentState.error = undefined
      return await preloadComponent(componentName)
    }
    throw new Error(`Composant ${componentName} non trouvé`)
  }

  // Statistiques de préchargement
  const getPreloadStats = () => {
    const states = Array.from(componentStates.value.values())

    return {
      totalComponents: states.length,
      loadedCount: states.filter(c => c.loaded).length,
      loadingCount: states.filter(c => c.loading).length,
      errorCount: states.filter(c => c.error).length,
      isPreloading: isPreloading.value,
      componentsByPriority: {
        critical: states.filter(c => c.priority === 'critical').length,
        high: states.filter(c => c.priority === 'high').length,
        medium: states.filter(c => c.priority === 'medium').length,
        low: states.filter(c => c.priority === 'low').length
      },
      availableComponents: states.map(c => c.name)
    }
  }

  return {
    preloadHighPriority,
    preloadForProgression,
    preloadSpecific,
    reloadComponent,
    getComponentState,
    getPreloadStats,
    componentsToPreload,
    isPreloading: computed(() => isPreloading.value)
  }
}
