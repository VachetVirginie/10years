import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'

// Vuetify
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import 'vuetify/styles'

// Leaflet CSS
import 'leaflet/dist/leaflet.css'

// Thème personnalisé Pokémon
import './assets/theme.css'
// Styles globaux pour mobile
import './assets/global-mobile.css'
// Styles pour les écrans splash et overlays
import './assets/splash-screens.css'

const vuetify = createVuetify({ components, directives })

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(vuetify)
app.mount('#app')
