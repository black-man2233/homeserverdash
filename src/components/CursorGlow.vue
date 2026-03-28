<template>
  <div class="cursor-glow" ref="glowEl" />
  <div class="cursor-dot"  ref="dotEl"  />
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { gsap } from 'gsap'

const glowEl = ref(null)
const dotEl  = ref(null)

onMounted(() => {
  const xGlow = gsap.quickTo(glowEl.value, 'x', { duration: 0.65, ease: 'power3.out' })
  const yGlow = gsap.quickTo(glowEl.value, 'y', { duration: 0.65, ease: 'power3.out' })
  const xDot  = gsap.quickTo(dotEl.value,  'x', { duration: 0.12, ease: 'power3.out' })
  const yDot  = gsap.quickTo(dotEl.value,  'y', { duration: 0.12, ease: 'power3.out' })

  const W2 = () => window.innerWidth  / 2
  const H2 = () => window.innerHeight / 2

  function onMove(e) {
    xGlow(e.clientX - W2())
    yGlow(e.clientY - H2())
    xDot(e.clientX - W2())
    yDot(e.clientY - H2())
  }

  function onDown() { gsap.to(dotEl.value, { scale: 0.5, duration: 0.1 }) }
  function onUp()   { gsap.to(dotEl.value, { scale: 1,   duration: 0.25, ease: 'back.out(3)' }) }

  window.addEventListener('mousemove', onMove)
  window.addEventListener('mousedown', onDown)
  window.addEventListener('mouseup',   onUp)

  onUnmounted(() => {
    window.removeEventListener('mousemove', onMove)
    window.removeEventListener('mousedown', onDown)
    window.removeEventListener('mouseup',   onUp)
  })
})
</script>

<style scoped>
.cursor-glow {
  position: fixed;
  top: 50%; left: 50%;
  width: 500px; height: 500px;
  border-radius: 50%;
  background: radial-gradient(circle,
    rgba(124,58,237,0.07) 0%,
    rgba(124,58,237,0.03) 40%,
    transparent 70%
  );
  pointer-events: none;
  z-index: 1;
  transform: translate(-50%, -50%);
  will-change: transform;
  mix-blend-mode: screen;
}

.cursor-dot {
  position: fixed;
  top: 50%; left: 50%;
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--acc);
  box-shadow: 0 0 6px var(--acc), 0 0 12px var(--acc);
  pointer-events: none;
  z-index: 9999;
  transform: translate(-50%, -50%);
  will-change: transform;
  mix-blend-mode: screen;
}
</style>
