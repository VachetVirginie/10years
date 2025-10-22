import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home.vue'
import { useProgress } from '../store/progress'

// Lazy loading des composants de jeu
const Step = () => import('../pages/Step.vue')
const Summary = () => import('../pages/Summary.vue')
const Map = () => import('../pages/Map.vue')
const TrainerJournal = () => import('../pages/TrainerJournal.vue')
const OurStory = () => import('../pages/OurStory.vue')

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: Home },
    {
      path: '/step/:id',
      name: 'step',
      component: Step,
      props: true
    },
    {
      path: '/map',
      name: 'map',
      component: Map
    },
    {
      path: '/journal',
      name: 'journal',
      component: TrainerJournal
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
