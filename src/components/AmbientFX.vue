<template>
  <canvas ref="trailEl" class="trail-canvas" />
  <!-- Ambient scan line (GSAP-driven, appended to body by JS) -->
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { gsap } from 'gsap'

const trailEl = ref(null)

// ───────────────────────────────────────────
//  MOUSE TRAIL SPARKLES (canvas)
// ───────────────────────────────────────────
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

// ───────────────────────────────────────────
//  RANDOM CARD GLOW PULSES
// ───────────────────────────────────────────
let cardGlowTimer = null
function scheduleCardGlow() {
  cardGlowTimer = setTimeout(() => {
    const cards = document.querySelectorAll('.service-card:not(.dead)')
    if (cards.length) {
      const card = cards[Math.floor(Math.random() * cards.length)]
      const hue = 240 + Math.random() * 100
      gsap.to(card, {
        boxShadow: `0 0 28px hsla(${hue},82%,65%,.45), 0 0 60px hsla(${hue},82%,65%,.15)`,
        duration: 0.5, ease: 'power2.out', yoyo: true, repeat: 1,
        onComplete: () => gsap.set(card, { clearProps: 'boxShadow' }),
      })
    }
    scheduleCardGlow()
  }, 2400 + Math.random() * 3400)
}

// ───────────────────────────────────────────
//  SCAN LINE SWEEP
// ───────────────────────────────────────────
let scanTimer = null
function scheduleScan() {
  scanTimer = setTimeout(() => {
    const el = document.createElement('div')
    Object.assign(el.style, {
      position: 'fixed', left: '0', right: '0', top: '-3px', height: '2px',
      background: 'linear-gradient(90deg, transparent 5%, var(--acc2) 50%, transparent 95%)',
      boxShadow: '0 0 16px var(--acc2), 0 0 40px color-mix(in srgb, var(--acc2) 40%, transparent)',
      pointerEvents: 'none', zIndex: '200', opacity: '0',
    })
    document.body.appendChild(el)
    gsap.fromTo(el,
      { top: '-3px', opacity: 0 },
      { top: '100vh', opacity: 1, duration: 2.5, ease: 'linear', onComplete: () => el.remove() }
    )
    scheduleScan()
  }, 18000 + Math.random() * 14000)
}

// ───────────────────────────────────────────
//  FLOATING PARTICLES FROM CARDS
// ───────────────────────────────────────────
let floatTimer = null
function scheduleFloat() {
  floatTimer = setTimeout(() => {
    const cards = document.querySelectorAll('.service-card')
    if (cards.length) {
      const card = cards[Math.floor(Math.random() * cards.length)]
      const r = card.getBoundingClientRect()
      for (let i = 0; i < 2 + Math.floor(Math.random() * 4); i++) {
        const el = document.createElement('div')
        const size = 2 + Math.random() * 4
        Object.assign(el.style, {
          position: 'fixed',
          left: `${r.left + Math.random() * r.width - size / 2}px`,
          top:  `${r.top  + Math.random() * r.height - size / 2}px`,
          width: `${size}px`, height: `${size}px`, borderRadius: '50%',
          background: `hsl(${240 + Math.random() * 120}, 80%, 72%)`,
          pointerEvents: 'none', zIndex: '15',
        })
        document.body.appendChild(el)
        gsap.fromTo(el,
          { opacity: 0.85, scale: 1, x: 0, y: 0 },
          {
            y: -(55 + Math.random() * 110), x: (Math.random() - 0.5) * 35,
            opacity: 0, scale: 0.2, duration: 1.8 + Math.random(),
            delay: i * 0.16, ease: 'power1.out', onComplete: () => el.remove(),
          }
        )
      }
    }
    scheduleFloat()
  }, 3800 + Math.random() * 5000)
}

// ───────────────────────────────────────────
//  RANDOM ICON BOUNCE
// ───────────────────────────────────────────
let iconTimer = null
function scheduleIcon() {
  iconTimer = setTimeout(() => {
    const icons = document.querySelectorAll('.cicon')
    if (icons.length) {
      const icon = icons[Math.floor(Math.random() * icons.length)]
      gsap.to(icon, {
        y: -7, scale: 1.25, duration: 0.35, ease: 'power2.out',
        yoyo: true, repeat: 1, onComplete: () => gsap.set(icon, { clearProps: 'all' }),
      })
    }
    scheduleIcon()
  }, 5500 + Math.random() * 7000)
}

// ───────────────────────────────────────────
//  RANDOM CARD BORDER RIPPLE
// ───────────────────────────────────────────
let rippleTimer = null
function scheduleRipple() {
  rippleTimer = setTimeout(() => {
    const cards = document.querySelectorAll('.service-card')
    if (cards.length) {
      const card = cards[Math.floor(Math.random() * cards.length)]
      const r = card.getBoundingClientRect()
      const ring = document.createElement('div')
      Object.assign(ring.style, {
        position: 'fixed',
        left: `${r.left + r.width / 2}px`, top: `${r.top + r.height / 2}px`,
        width: `${r.width}px`, height: `${r.height}px`,
        border: '1px solid var(--acc)', borderRadius: 'var(--r)',
        pointerEvents: 'none', zIndex: '10',
        transform: 'translate(-50%, -50%)',
      })
      document.body.appendChild(ring)
      gsap.fromTo(ring,
        { scale: 1, opacity: 0.6 },
        { scale: 1.5, opacity: 0, duration: 0.8, ease: 'power2.out', onComplete: () => ring.remove() }
      )
    }
    scheduleRipple()
  }, 7000 + Math.random() * 9000)
}

// ───────────────────────────────────────────
//  AURORA SHIMMER WAVE ACROSS SECTIONS
// ───────────────────────────────────────────
let auroraWaveTimer = null
function scheduleAuroraWave() {
  auroraWaveTimer = setTimeout(() => {
    const heads = document.querySelectorAll('.sec-head')
    if (heads.length) {
      gsap.fromTo(heads,
        { filter: 'brightness(1)' },
        { filter: 'brightness(1.4)', duration: 0.3, stagger: 0.12, yoyo: true, repeat: 1,
          onComplete: () => gsap.set(heads, { clearProps: 'filter' }) }
      )
    }
    scheduleAuroraWave()
  }, 15000 + Math.random() * 10000)
}

// ───────────────────────────────────────────
//  BACKGROUND PULSE (very subtle)
// ───────────────────────────────────────────
let bgPulseTimer = null
function scheduleBgPulse() {
  bgPulseTimer = setTimeout(() => {
    const el = document.createElement('div')
    const x = Math.random() * window.innerWidth
    const y = Math.random() * window.innerHeight
    Object.assign(el.style, {
      position: 'fixed', left: `${x}px`, top: `${y}px`,
      width: '1px', height: '1px',
      borderRadius: '50%',
      background: `hsl(${260 + Math.random() * 80}, 80%, 65%)`,
      pointerEvents: 'none', zIndex: '2',
      boxShadow: `0 0 0 0 hsl(${260 + Math.random() * 80}, 80%, 65%)`,
    })
    document.body.appendChild(el)
    gsap.to(el, {
      boxShadow: `0 0 60px 30px transparent`,
      scale: 200, opacity: 0,
      duration: 2, ease: 'power2.out',
      transformOrigin: '50% 50%',
      onComplete: () => el.remove(),
    })
    scheduleBgPulse()
  }, 12000 + Math.random() * 18000)
}

// ───────────────────────────────────────────
//  CARD SHIMMER WAVE (periodic stagger glow)
// ───────────────────────────────────────────
let shimmerWaveTimer = null
function scheduleShimmerWave() {
  shimmerWaveTimer = setTimeout(() => {
    const cards = document.querySelectorAll('.service-card')
    if (cards.length) {
      gsap.to(cards, {
        boxShadow: '0 0 12px var(--acc)30',
        duration: 0.25, stagger: 0.05, ease: 'sine.out',
        yoyo: true, repeat: 1,
        onComplete: () => gsap.set(cards, { clearProps: 'boxShadow' }),
      })
    }
    scheduleShimmerWave()
  }, 20000 + Math.random() * 15000)
}

// ───────────────────────────────────────────
//  RANDOM STAR BURST AT CURSOR POSITION (rare)
// ───────────────────────────────────────────
let cursorX = 0, cursorY = 0
function onMouseMoveCursor(e) { cursorX = e.clientX; cursorY = e.clientY }

let starBurstTimer = null
function scheduleStarBurst() {
  starBurstTimer = setTimeout(() => {
    if (cursorX && cursorY) {
      const size = 4 + Math.random() * 6
      const el = document.createElement('div')
      Object.assign(el.style, {
        position: 'fixed', left: `${cursorX - size / 2}px`, top: `${cursorY - size / 2}px`,
        width: `${size}px`, height: `${size}px`, borderRadius: '50%',
        background: `hsl(${50 + Math.random() * 40}, 100%, 70%)`,
        boxShadow: `0 0 ${size * 3}px hsl(${50 + Math.random() * 40}, 100%, 70%)`,
        pointerEvents: 'none', zIndex: '499',
      })
      document.body.appendChild(el)
      gsap.fromTo(el,
        { scale: 0.2, opacity: 1 },
        { scale: 4, opacity: 0, duration: 0.6, ease: 'power2.out', onComplete: () => el.remove() }
      )
    }
    scheduleStarBurst()
  }, 4000 + Math.random() * 6000)
}

// ───────────────────────────────────────────
//  FLOATING DATA STREAM LINES
// ───────────────────────────────────────────
let dataStreamTimer = null
function scheduleDataStream() {
  dataStreamTimer = setTimeout(() => {
    const el = document.createElement('div')
    const x = Math.random() * window.innerWidth
    const chars = '01アイウエオカキクケコサシスセソ'
    let text = ''
    for (let i = 0; i < 8 + Math.floor(Math.random() * 12); i++) {
      text += chars[Math.floor(Math.random() * chars.length)]
      if (i % 4 === 3) text += '\n'
    }
    el.textContent = text
    Object.assign(el.style, {
      position: 'fixed', left: `${x}px`, top: '-60px',
      color: `hsla(${260 + Math.random() * 80}, 80%, 65%, 0.15)`,
      fontSize: '0.7rem', fontFamily: 'monospace', lineHeight: '1.4',
      pointerEvents: 'none', zIndex: '3', whiteSpace: 'pre',
    })
    document.body.appendChild(el)
    gsap.to(el, {
      y: window.innerHeight + 80, opacity: 0, duration: 6 + Math.random() * 4,
      ease: 'none', onComplete: () => el.remove(),
    })
    scheduleDataStream()
  }, 3000 + Math.random() * 5000)
}

// ───────────────────────────────────────────
//  NETWORK INDICATOR PING ANIMATION
// ───────────────────────────────────────────
let netPingTimer = null
function scheduleNetPing() {
  netPingTimer = setTimeout(() => {
    const dot = document.querySelector('.brand-dot')
    if (dot) {
      const r = dot.getBoundingClientRect()
      const ping = document.createElement('div')
      Object.assign(ping.style, {
        position: 'fixed',
        left: `${r.left + r.width / 2}px`, top: `${r.top + r.height / 2}px`,
        width: `${r.width}px`, height: `${r.height}px`,
        borderRadius: '50%',
        background: 'var(--acc)',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none', zIndex: '50',
      })
      document.body.appendChild(ping)
      gsap.fromTo(ping,
        { scale: 1, opacity: 0.8 },
        { scale: 4, opacity: 0, duration: 1, ease: 'power2.out', onComplete: () => ping.remove() }
      )
    }
    scheduleNetPing()
  }, 8000 + Math.random() * 12000)
}

// ───────────────────────────────────────────
//  CARD "BREATHE" (very subtle scale)
// ───────────────────────────────────────────
let breatheTimer = null
function scheduleBreath() {
  breatheTimer = setTimeout(() => {
    const cards = document.querySelectorAll('.service-card')
    if (cards.length) {
      // Pick 3 random cards to breathe simultaneously
      const picks = [...cards].sort(() => Math.random() - 0.5).slice(0, 3)
      picks.forEach(card => {
        gsap.to(card, {
          scale: 1.013, duration: 1.5, ease: 'sine.inOut', yoyo: true, repeat: 1,
          onComplete: () => gsap.set(card, { scale: 1 }),
        })
      })
    }
    scheduleBreath()
  }, 6000 + Math.random() * 8000)
}

// ───────────────────────────────────────────
//  LIFECYCLE
// ───────────────────────────────────────────
onMounted(() => {
  resizeTrail()
  window.addEventListener('resize', resizeTrail)
  window.addEventListener('mousemove', onMouseMove,       { passive: true })
  window.addEventListener('mousemove', onMouseMoveCursor, { passive: true })
  trailRaf = requestAnimationFrame(drawTrail)

  // Stagger start times to avoid all firing at once
  setTimeout(scheduleCardGlow,    3000)
  setTimeout(scheduleScan,        9000)
  setTimeout(scheduleFloat,       5000)
  setTimeout(scheduleIcon,        7000)
  setTimeout(scheduleRipple,      11000)
  setTimeout(scheduleAuroraWave,  14000)
  setTimeout(scheduleBgPulse,     20000)
  setTimeout(scheduleShimmerWave, 22000)
  setTimeout(scheduleStarBurst,   4000)
  setTimeout(scheduleDataStream,  6000)
  setTimeout(scheduleNetPing,     8000)
  setTimeout(scheduleBreath,      10000)
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeTrail)
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mousemove', onMouseMoveCursor)
  cancelAnimationFrame(trailRaf)
  clearTimeout(cardGlowTimer); clearTimeout(scanTimer);      clearTimeout(floatTimer)
  clearTimeout(iconTimer);     clearTimeout(rippleTimer);    clearTimeout(auroraWaveTimer)
  clearTimeout(bgPulseTimer);  clearTimeout(shimmerWaveTimer); clearTimeout(starBurstTimer)
  clearTimeout(dataStreamTimer); clearTimeout(netPingTimer); clearTimeout(breatheTimer)
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
