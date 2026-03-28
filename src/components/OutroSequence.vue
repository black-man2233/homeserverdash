<template>
  <div class="outro-overlay" ref="overlayEl">
    <div class="outro-stage" ref="stageEl">
      <div class="outro-particles">
        <div v-for="p in particles" :key="p.id" class="particle"
          :style="`--size:${p.size}px;--col:${p.col}`"
          :ref="el => { if(el) particleRefs[p.id] = el }"
        />
      </div>
      <div class="outro-dot"      ref="dotEl"     />
      <div class="outro-brand"    ref="brandEl">
        <div class="outro-wordmark">coolserver</div>
        <div class="outro-sub">see you soon</div>
      </div>
      <div class="outro-scanner"  ref="scannerEl" />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { gsap } from 'gsap'

const emit = defineEmits(['done'])

const overlayEl  = ref(null)
const stageEl    = ref(null)
const dotEl      = ref(null)
const brandEl    = ref(null)
const scannerEl  = ref(null)
const particleRefs = reactive({})

const particles = Array.from({ length: 40 }, (_, i) => ({
  id:   i,
  size: 2 + Math.random() * 4,
  col:  `hsl(${260 + (i % 8) * 12}, 80%, ${55 + Math.random() * 25}%)`,
}))

onMounted(() => {
  const tl = gsap.timeline({ onComplete: () => emit('done') })

  gsap.set(overlayEl.value, { opacity: 0, backgroundColor: 'transparent' })
  gsap.set(dotEl.value,     { scale: 0, opacity: 0 })
  gsap.set(brandEl.value,   { scale: 0.6, opacity: 0, filter: 'blur(8px)' })
  gsap.set(scannerEl.value, { scaleX: 0, opacity: 0, transformOrigin: 'left center' })
  gsap.set(Object.values(particleRefs), { opacity: 0, x: 0, y: 0 })

  // Phase 1 — scatter all cards outward
  tl.to('.service-card', {
    x: () => (Math.random() - 0.5) * window.innerWidth * 1.2,
    y: () => (Math.random() - 0.5) * window.innerHeight * 0.9,
    rotation: () => (Math.random() - 0.5) * 120,
    scale: 0.2,
    opacity: 0,
    duration: 0.65,
    stagger: { amount: 0.4, from: 'random' },
    ease: 'power3.in',
  })

  // Section headers & toolbar slide away
  tl.to('.sec-head', {
    x: -80, opacity: 0, duration: 0.3, stagger: 0.04, ease: 'power2.in',
  }, '-=0.4')
  tl.to('.app-header, .toolbar, .switcher', {
    y: -30, opacity: 0, duration: 0.28, stagger: 0.04, ease: 'power2.in',
  }, '-=0.3')

  // Phase 2 — dark overlay fills
  tl.to(overlayEl.value, {
    opacity: 1, backgroundColor: '#04040b', duration: 0.35,
  }, '-=0.1')

  // Phase 3 — wordmark materializes
  tl.to(brandEl.value, {
    scale: 1, opacity: 1, filter: 'blur(0px)',
    duration: 0.5, ease: 'back.out(1.6)',
  }, '+=0.1')

  // Phase 4 — scanner sweep
  tl.to(scannerEl.value, {
    opacity: 1, scaleX: 1, duration: 0.55, ease: 'power2.inOut',
  }, '+=0.05')
  tl.to(scannerEl.value, { opacity: 0, duration: 0.2 }, '+=0.05')

  // Phase 5 — particles burst
  const pEls = Object.values(particleRefs)
  if (pEls.length) {
    const DEG = Math.PI / 180
    tl.set(pEls, { opacity: 1 }, '-=0.1')
    tl.to(pEls, {
      x: (i) => Math.cos((i / pEls.length) * 360 * DEG) * (80 + Math.random() * 120),
      y: (i) => Math.sin((i / pEls.length) * 360 * DEG) * (60 + Math.random() * 100),
      opacity: 0, duration: 0.8, stagger: 0.008, ease: 'power2.out',
    }, '-=0.1')
  }

  // Phase 6 — wordmark → dot → gone
  tl.to(brandEl.value, {
    scale: 0.05, opacity: 0, filter: 'blur(4px)',
    duration: 0.45, ease: 'power3.in',
  }, '-=0.3')
  tl.to(dotEl.value, { scale: 1, opacity: 1, duration: 0.2, ease: 'back.out(2)' }, '-=0.1')
  tl.to(dotEl.value, { scale: 4, opacity: 0, duration: 0.4, ease: 'power2.in' })

  // Phase 7 — final black out
  tl.to(overlayEl.value, { backgroundColor: '#000000', duration: 0.25 }, '-=0.2')
})
</script>

<style scoped>
.outro-overlay {
  position: fixed; inset: 0; z-index: 500;
  display: flex; align-items: center; justify-content: center;
  pointer-events: none;
}

.outro-stage {
  position: relative;
  display: flex; align-items: center; justify-content: center;
  width: 400px; height: 200px;
}

.outro-dot {
  position: absolute;
  width: 18px; height: 18px;
  border-radius: 50%;
  background: var(--acc);
  box-shadow: 0 0 24px var(--acc), 0 0 60px color-mix(in srgb, var(--acc) 50%, transparent);
  will-change: transform, opacity;
}

.outro-brand {
  position: absolute; text-align: center;
  will-change: transform, opacity, filter;
}

.outro-wordmark {
  font-size: 2.8rem; font-weight: 800; letter-spacing: -0.05em;
  background: linear-gradient(135deg, #fff 30%, var(--acc2));
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  filter: drop-shadow(0 0 20px rgba(124,58,237,0.5));
}

.outro-sub {
  font-size: 0.75rem; color: var(--muted); letter-spacing: 0.12em; margin-top: 4px;
}

.outro-scanner {
  position: absolute; left: -80px; right: -80px; height: 2px;
  background: linear-gradient(90deg, transparent, var(--acc), var(--acc2), transparent);
  box-shadow: 0 0 12px var(--acc), 0 0 30px color-mix(in srgb, var(--acc2) 40%, transparent);
  will-change: transform, opacity;
}

.outro-particles {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  pointer-events: none;
}

.particle {
  position: absolute; width: var(--size); height: var(--size);
  border-radius: 50%; background: var(--col);
  box-shadow: 0 0 6px var(--col);
  will-change: transform, opacity;
}
</style>
