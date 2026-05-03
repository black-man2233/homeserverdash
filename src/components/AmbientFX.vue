<template>
  <canvas ref="trailEl" class="trail-canvas" />
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { gsap } from 'gsap'

const trailEl = ref(null)

// ── Mouse trail sparkles ──
const trail = []
let trailRaf = null, trailW = 0, trailH = 0

function resizeTrail() {
  if (!trailEl.value) return
  trailW = trailEl.value.width  = window.innerWidth
  trailH = trailEl.value.height = window.innerHeight
}

function onMouseMove(e) {
  if (Math.random() < 0.45) {
    trail.push({
      x: e.clientX + (Math.random() - 0.5) * 14,
      y: e.clientY + (Math.random() - 0.5) * 14,
      r: Math.random() * 2.8 + 0.6,
      vx: (Math.random() - 0.5) * 1.8,
      vy: -(Math.random() * 2.2 + 0.4),
      alpha: 0.7 + Math.random() * 0.3,
      hue: 255 + Math.random() * 100,
    })
    if (trail.length > 140) trail.shift()
  }
}

function drawTrail() {
  const cv = trailEl.value
  if (!cv) return
  const cx = cv.getContext('2d')
  cx.clearRect(0, 0, trailW, trailH)
  for (let i = trail.length - 1; i >= 0; i--) {
    const p = trail[i]
    p.x += p.vx; p.y += p.vy; p.alpha -= 0.025
    if (p.alpha <= 0) { trail.splice(i, 1); continue }
    cx.beginPath()
    cx.arc(p.x, p.y, p.r * p.alpha, 0, Math.PI * 2)
    cx.fillStyle = `hsla(${p.hue}, 82%, 72%, ${p.alpha})`
    cx.fill()
  }
  trailRaf = requestAnimationFrame(drawTrail)
}

// ── Subtle random card glow ──
let cardGlowTimer = null
function scheduleCardGlow() {
  cardGlowTimer = setTimeout(() => {
    const cards = document.querySelectorAll('.service-card:not(.dead)')
    if (cards.length) {
      const card = cards[Math.floor(Math.random() * cards.length)]
      const hue = 240 + Math.random() * 100
      gsap.to(card, {
        boxShadow: `0 0 28px hsla(${hue},82%,65%,.4), 0 0 60px hsla(${hue},82%,65%,.12)`,
        duration: 0.5, ease: 'power2.out', yoyo: true, repeat: 1,
        onComplete: () => gsap.set(card, { clearProps: 'boxShadow' }),
      })
    }
    scheduleCardGlow()
  }, 3000 + Math.random() * 4000)
}

onMounted(() => {
  resizeTrail()
  window.addEventListener('resize', resizeTrail)
  window.addEventListener('mousemove', onMouseMove)
  drawTrail()
  scheduleCardGlow()
})

onUnmounted(() => {
  cancelAnimationFrame(trailRaf)
  window.removeEventListener('resize', resizeTrail)
  window.removeEventListener('mousemove', onMouseMove)
  clearTimeout(cardGlowTimer)
})
</script>

<style scoped>
.trail-canvas {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 500;
}
</style>
