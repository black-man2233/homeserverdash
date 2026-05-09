import { createApp }  from 'vue'
import { createPinia } from 'pinia'
import App    from './App.vue'
import router from './router'
import './style.css'
import { useDashboardStore } from './stores/dashboard'

const pinia = createPinia()
const app   = createApp(App).use(pinia).use(router)

;(async () => {
  try {
    const res = await fetch('/services.json')
    if (res.ok) useDashboardStore().init(await res.json())
  } catch {}
  app.mount('#app')
})()
