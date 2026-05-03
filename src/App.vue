<template>
  <AmbientFX />
  <EasterEggs />
  <RouterView />
</template>

<script setup>
import { onMounted } from 'vue'
import AmbientFX  from './components/AmbientFX.vue'
import EasterEggs from './components/EasterEggs.vue'
import { useSeason } from './composables/useSeason'

onMounted(() => {
  const s = useSeason()
  const root = document.documentElement
  root.style.setProperty('--acc',  s.acc)
  root.style.setProperty('--acc2', s.acc2)
  root.dataset.season = s.name
})
</script>
