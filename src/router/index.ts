import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home.vue'
import Step from '../pages/Step.vue'
import Summary from '../pages/Summary.vue'
import OurStory from '../pages/OurStory.vue'
import { useProgress } from '../store/progress'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: Home },
    { path: '/step/:id', name: 'step', component: Step, props: true },
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

// Ajout d'un hook simple pour iOS
router.afterEach(() => {
  // S'assurer que les classes de splash sont supprimées
  setTimeout(() => {
    document.documentElement.classList.remove('splash-active');
    document.body.classList.remove('splash-active');
  }, 100);
});

export default router
