<template>
  <CursorGlow />
  <AmbientFX />
  <EasterEggs />
  <RouterView v-slot="{ Component }">
    <Transition name="page" mode="out-in">
      <component :is="Component" />
    </Transition>
  </RouterView>
</template>

<script setup>
import CursorGlow  from './components/CursorGlow.vue'
import AmbientFX   from './components/AmbientFX.vue'
import EasterEggs  from './components/EasterEggs.vue'
</script>
