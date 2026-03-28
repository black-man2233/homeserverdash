<template>
  <!-- Mouse trail canvas -->
  <canvas ref="trailEl" class="trail-canvas" />
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { gsap } from 'gsap'

const trailEl = ref(null)

// ── Mouse trail sparkles ──
const trail = []
let trailRafId = null
let trailMX = 0, trailMY = 0
let trailW = 0, trailH = 0

function resizeTrail() {
  if (!trailEl.value) return
  trailW = trailEl.value.width  = window.innerWidth
  trailH = trailEl.value.height = window.innerHeight
}

function onMouseMove(e) {
  trailMX = e.clientX; trailMY = e.clientY
  // Spawn sparkle
  if (Math.random() < 0.35) {
    trail.push({
      x: trailMX + (Math.random() - 0.5) * 12,
      y: trailMY + (Math.random() - 0.5) * 12,
      r: Math.random() * 2.5 + 0.8,
      vx: (Math.random() - 0.5) * 1.5,
      vy: -(Math.random() * 2 + 0.5),
      alpha: 0.7 + Math.random() * 0.3,
      hue: 260 + Math.random() * 90,
    })
    if (trail.length > 120) trail.shift()
  }
}

function drawTrail() {
  const cv = trailEl.value
  if (!cv) return
  const cx = cv.getContext('2d')
  cx.clearRect(0, 0, trailW, trailH)
  for (let i = trail.length - 1; i >= 0; i--) {
    const p = trail[i]
    p.x += p.vx; p.y += p.vy; p.alpha -= 0.028
    if (p.alpha <= 0) { trail.splice(i, 1); continue }
    cx.beginPath()
    cx.arc(p.x, p.y, p.r * p.alpha, 0, Math.PI * 2)
    cx.fillStyle = `hsla(${p.hue},80%,72%,${p.alpha})`
    cx.fill()
  }
  trailRafId = requestAnimationFrame(drawTrail)
}

// ── Random card glow pulses ──
let cardGlowTimer = null
function scheduleCardGlow() {
  const delay = 2500 + Math.random() * 3500
  cardGlowTimer = setTimeout(() => {
    const cards = document.querySelectorAll('.service-card:not(.dead)')
    if (cards.length) {
      const card = cards[Math.floor(Math.random() * cards.length)]
      const hue = 240 + Math.random() * 100
      gsap.to(card, {
        boxShadow: `0 0 28px hsla(${hue},80%,65%,0.4), 0 0 60px hsla(${hue},80%,65%,0.15)`,
        duration: 0.5, ease: 'power2.out', yoyo: true, repeat: 1,
        onComplete: () => gsap.set(card, { clearProps: 'boxShadow' }),
      })
    }
    scheduleCardGlow()
  }, delay)
}

// ── Scan line sweep ──
let scanTimer = null
function scheduleScan() {
  const delay = 18000 + Math.random() * 12000
  scanTimer = setTimeout(() => {
    const el = document.createElement('div')
    Object.assign(el.style, {
      position: 'fixed', left: '0', right: '0', top: '-3px', height: '2px',
      background: 'linear-gradient(90deg, transparent 5%, var(--acc2) 50%, transparent 95%)',
      boxShadow: '0 0 16px var(--acc2), 0 0 40px color-mix(in srgb, var(--acc2) 40%, transparent)',
      pointerEvents: 'none', zIndex: '200',
      opacity: '0',
    })
    document.body.appendChild(el)
    gsap.fromTo(el,
      { top: '-3px', opacity: 0 },
      { top: '100vh', opacity: 1, duration: 2.5, ease: 'linear',
        onComplete: () => el.remove() }
    )
    scheduleScan()
  }, delay)
}

// ── Floating particles from card area ──
let floatTimer = null
function scheduleFloat() {
  const delay = 4000 + Math.random() * 5000
  floatTimer = setTimeout(() => {
    const cards = document.querySelectorAll('.service-card')
    if (cards.length) {
      const card = cards[Math.floor(Math.random() * cards.length)]
      const r = card.getBoundingClientRect()
      for (let i = 0; i < 3 + Math.floor(Math.random() * 4); i++) {
        const el = document.createElement('div')
        const size = 2 + Math.random() * 4
        Object.assign(el.style, {
          position: 'fixed',
          left: `${r.left + Math.random() * r.width - size / 2}px`,
          top:  `${r.top  + Math.random() * r.height - size / 2}px`,
          width: `${size}px`, height: `${size}px`,
          borderRadius: '50%',
          background: `hsl(${240 + Math.random() * 120}, 80%, 70%)`,
          pointerEvents: 'none', zIndex: '15',
        })
        document.body.appendChild(el)
        gsap.fromTo(el,
          { opacity: 0.8, scale: 1, x: 0, y: 0 },
          {
            y: -(50 + Math.random() * 100),
            x: (Math.random() - 0.5) * 30,
            opacity: 0, scale: 0.2,
            duration: 1.8 + Math.random(),
            delay: i * 0.15,
            ease: 'power1.out',
            onComplete: () => el.remove(),
          }
        )
      }
    }
    scheduleFloat()
  }, delay)
}

// ── Ambient card icon float ──
let iconFloatTimer = null
function scheduleIconFloat() {
  const delay = 6000 + Math.random() * 8000
  iconFloatTimer = setTimeout(() => {
    const icons = document.querySelectorAll('.cicon')
    if (icons.length) {
      const icon = icons[Math.floor(Math.random() * icons.length)]
      gsap.to(icon, {
        y: -6, scale: 1.2, duration: 0.4, ease: 'power2.out',
        yoyo: true, repeat: 1,
        onComplete: () => gsap.set(icon, { clearProps: 'all' }),
      })
    }
    scheduleIconFloat()
  }, delay)
}

// ── Ambient section header ripple ──
let secRippleTimer = null
function scheduleSecRipple() {
  const delay = 10000 + Math.random() * 15000
  secRippleTimer = setTimeout(() => {
    const heads = document.querySelectorAll('.sec-head')
    if (heads.length) {
      const head = heads[Math.floor(Math.random() * heads.length)]
      gsap.to(head, {
        backgroundImage: 'linear-gradient(90deg, transparent, var(--acc) 50%, transparent)',
        backgroundSize: '200% 1px',
        duration: 0.3,
        yoyo: true, repeat: 1,
        onComplete: () => gsap.set(head, { clearProps: 'backgroundImage,backgroundSize' }),
      })
    }
    scheduleSecRipple()
  }, delay)
}

// ── Card border shimmer wave (staggered on load) ──
function launchBorderWaves() {
  const cards = document.querySelectorAll('.service-card')
  if (!cards.length) { setTimeout(launchBorderWaves, 1000); return }
  cards.forEach((card, i) => {
    gsap.fromTo(card,
      { '--shimmer-pos': '-100%' },
      { '--shimmer-pos': '200%', duration: 1.2, ease: 'none', delay: i * 0.05, repeat: -1, repeatDelay: 6 + Math.random() * 10 }
    )
  })
}

// ── Lifecycle ──
onMounted(() => {
  resizeTrail()
  window.addEventListener('resize', resizeTrail)
  window.addEventListener('mousemove', onMouseMove, { passive: true })
  trailRafId = requestAnimationFrame(drawTrail)
  // Stagger starts so they don't all fire at once
  setTimeout(scheduleCardGlow, 3000)
  setTimeout(scheduleScan, 8000)
  setTimeout(scheduleFloat, 5000)
  setTimeout(scheduleIconFloat, 7000)
  setTimeout(scheduleSecRipple, 12000)
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeTrail)
  window.removeEventListener('mousemove', onMouseMove)
  cancelAnimationFrame(trailRafId)
  clearTimeout(cardGlowTimer)
  clearTimeout(scanTimer)
  clearTimeout(floatTimer)
  clearTimeout(iconFloatTimer)
  clearTimeout(secRippleTimer)
})
</script>

<style scoped>
.trail-canvas {
  position: fixed; inset: 0;
  width: 100vw; height: 100vh;
  pointer-events: none;
  z-index: 5;
}
</style>
