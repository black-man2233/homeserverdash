<template>
  <div class="app-shell">
    <AppSidebar />
    <RouterView />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import AppSidebar from './components/AppSidebar.vue'
import { useSeason } from './composables/useSeason'

onMounted(() => {
  const s    = useSeason()
  const root = document.documentElement
  root.style.setProperty('--acc',  s.acc)
  root.style.setProperty('--acc2', s.acc2)
  root.dataset.season = s.name
})
</script>

<style scoped>
.app-shell {
  display: flex;
  min-height: 100vh;
}
</style>
