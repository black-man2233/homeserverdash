<template>
  <div class="intro-overlay" ref="overlayEl">
    <!-- Particle ring -->
    <div class="intro-stage" ref="stageEl">
      <div class="intro-particles" ref="particlesEl">
        <div v-for="p in particles" :key="p.id" class="particle"
          :style="`--size:${p.size}px;--col:${p.col};`"
          :ref="el => { if(el) particleRefs[p.id] = el }"
        />
      </div>

      <!-- Dot + brand -->
      <div class="intro-dot" ref="dotEl" />

      <div class="intro-brand" ref="brandEl">
        <div class="intro-wordmark">coolserver</div>
        <div class="intro-sub">home dashboard</div>
      </div>

      <!-- Scanner line -->
      <div class="intro-scanner" ref="scannerEl" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { gsap } from 'gsap'

const emit = defineEmits(['done'])

const overlayEl  = ref(null)
const stageEl    = ref(null)
const dotEl      = ref(null)
const brandEl    = ref(null)
const scannerEl  = ref(null)
const particlesEl = ref(null)
const particleRefs = reactive({})

const particles = Array.from({ length: 48 }, (_, i) => ({
  id:   i,
  size: 2 + Math.random() * 4,
  col:  `hsl(${255 + (i % 6) * 18}, 80%, ${60 + Math.random() * 25}%)`,
}))

onMounted(() => {
  const tl = gsap.timeline({ onComplete: () => emit('done') })

  // Initial states
  gsap.set(dotEl.value,     { scale: 0, opacity: 0 })
  gsap.set(brandEl.value,   { scale: 0.6, opacity: 0, filter: 'blur(8px)' })
  gsap.set(scannerEl.value, { scaleX: 0, opacity: 0, transformOrigin: 'left center' })
  gsap.set(Object.values(particleRefs), { opacity: 0, x: 0, y: 0 })

  // Phase 1 — glowing dot materializes
  tl.to(dotEl.value, {
    scale: 1, opacity: 1, duration: 0.45,
    ease: 'back.out(2)',
  })
  tl.to(dotEl.value, {
    scale: 1.3, duration: 0.2, yoyo: true, repeat: 1,
    ease: 'power2.inOut',
  })

  // Phase 2 — dot → wordmark
  tl.to(dotEl.value, { scale: 0, opacity: 0, duration: 0.25, ease: 'power3.in' }, '+=0.05')
  tl.to(brandEl.value, {
    scale: 1, opacity: 1, filter: 'blur(0px)', duration: 0.5,
    ease: 'back.out(1.5)',
  }, '-=0.1')

  // Phase 3 — scanner sweep
  tl.to(scannerEl.value, { opacity: 1, scaleX: 1, duration: 0.55, ease: 'power2.inOut' }, '+=0.05')
  tl.to(scannerEl.value, { opacity: 0, duration: 0.2 }, '+=0.05')

  // Phase 4 — particles burst
  const pEls = Object.values(particleRefs)
  if (pEls.length) {
    const DEG = Math.PI / 180
    tl.set(pEls, { opacity: 1 }, '-=0.1')
    tl.to(pEls, {
      x: (i) => {
        const ang = (i / pEls.length) * 360 + (Math.random() - 0.5) * 25
        return Math.cos(ang * DEG) * (90 + Math.random() * 130)
      },
      y: (i) => {
        const ang = (i / pEls.length) * 360 + (Math.random() - 0.5) * 25
        return Math.sin(ang * DEG) * (70 + Math.random() * 100)
      },
      opacity: 0,
      duration: 0.85,
      stagger: 0.008,
      ease: 'power2.out',
    }, '-=0.05')
  }

  // Phase 5 — brand charges up and flashes
  tl.to(brandEl.value, {
    filter: 'brightness(2.5) blur(1px)', scale: 1.08,
    duration: 0.3, ease: 'power2.in',
  }, '-=0.25')

  // Phase 6 — white flash → fade out overlay
  tl.to(overlayEl.value, {
    backgroundColor: '#ffffff',
    duration: 0.12, ease: 'power4.in',
  })
  tl.to(overlayEl.value, {
    opacity: 0, duration: 0.4, ease: 'power2.out',
  })
})
</script>

<style scoped>
.intro-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: #04040b;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.intro-stage {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 400px;
  height: 200px;
}

.intro-dot {
  position: absolute;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #7c3aed;
  box-shadow: 0 0 24px #7c3aed, 0 0 60px #7c3aed80, 0 0 120px #7c3aed40;
  will-change: transform, opacity;
}

.intro-brand {
  position: absolute;
  text-align: center;
  will-change: transform, opacity, filter;
}

.intro-wordmark {
  font-size: 2.8rem;
  font-weight: 800;
  letter-spacing: -0.05em;
  background: linear-gradient(135deg, #fff 30%, #06b6d4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: none;
  filter: drop-shadow(0 0 20px #7c3aed80);
}

.intro-sub {
  font-size: 0.75rem;
  color: #5a6080;
  letter-spacing: 0.12em;
  margin-top: 4px;
}

.intro-scanner {
  position: absolute;
  left: -80px;
  right: -80px;
  height: 2px;
  background: linear-gradient(90deg, transparent, #7c3aed, #06b6d4, transparent);
  box-shadow: 0 0 12px #7c3aed, 0 0 30px #06b6d460;
  will-change: transform, opacity;
}

.intro-particles {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.particle {
  position: absolute;
  width: var(--size);
  height: var(--size);
  border-radius: 50%;
  background: var(--col);
  box-shadow: 0 0 6px var(--col);
  will-change: transform, opacity;
}
</style>
