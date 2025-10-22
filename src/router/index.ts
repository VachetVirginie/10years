import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home.vue'
import { useProgress } from '../store/progress'

// Lazy loading des composants de jeu
const Step = () => import('../pages/Step.vue')
const Summary = () => import('../pages/Summary.vue')
const Map = () => import('../pages/Map.vue')
const TrainerJournal = () => import('../pages/TrainerJournal.vue')
const OurStory = () => import('../pages/OurStory.vue')

// Import synchrone pour éviter les problèmes TypeScript
import { usePreloader } from '../composables/usePreloader'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: Home },
    {
      path: '/step/:id',
      name: 'step',
      component: Step,
      props: true,
      // Précharger la carte quand on va vers une étape
      beforeEnter: async (to) => {
        const { preloadSpecific } = usePreloader()
        await preloadSpecific('Map')
      }
    },
    {
      path: '/map',
      name: 'map',
      component: Map,
      // Précharger les composants de progression
      beforeEnter: async () => {
        const { preloadSpecific } = usePreloader()
        await Promise.all([
          preloadSpecific('PokemonBadges'),
          preloadSpecific('PokemonHealthBar')
        ])
      }
    },
    {
      path: '/journal',
      name: 'journal',
      component: TrainerJournal,
      // Précharger les composants Pokémon
      beforeEnter: async () => {
        const { preloadSpecific } = usePreloader()
        await Promise.all([
          preloadSpecific('PokemonDialog'),
          preloadSpecific('PokemonHealthBar')
        ])
      }
    },
    { path: '/our-story', name: 'our-story', component: OurStory },
    {
      path: '/summary',
      name: 'summary',
      component: Summary,
      beforeEnter: (to, from, next) => {
        const store = useProgress()
        store.load()
        if (store.isHuntCompleted) {
          next()
        } else {
          next('/')
        }
      }
    },
    { path: '/:pathMatch(.*)*', redirect: '/' }
  ]
})

export default router
