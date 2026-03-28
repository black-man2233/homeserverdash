<template>
  <canvas ref="canvasEl" class="space-canvas" />
</template>

<script setup>
import { ref } from 'vue'
import { useSpaceCanvas } from '../composables/useSpaceCanvas'

const canvasEl = ref(null)
useSpaceCanvas(canvasEl)
</script>

<style scoped>
.space-canvas {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}
</style>
