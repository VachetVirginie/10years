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

// Ajout d'un hook global pour réinitialiser le scroll après chaque navigation
router.afterEach(() => {
  // S'assurer que le scroll est correctement restauré après chaque changement de route
  setTimeout(() => {
    const html = document.documentElement;
    const body = document.body;
    
    // Supprimer les classes qui bloquent le défilement
    html.classList.remove('splash-active');
    body.classList.remove('splash-active');
    html.classList.remove('no-scroll');
    body.classList.remove('no-scroll');
    
    // Forcer l'activation du scroll
    html.classList.add('enable-scroll');
    body.classList.add('enable-scroll');
    
    // Réinitialiser les styles inline qui pourraient bloquer le scroll
    body.style.overflow = '';
    html.style.overflow = '';
    body.style.height = '';
    html.style.height = '';
    body.style.position = '';
    html.style.position = '';
  }, 300);
});

export default router
