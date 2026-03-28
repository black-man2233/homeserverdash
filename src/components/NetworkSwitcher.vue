<template>
  <div class="switcher" ref="switcherEl">
    <div class="pill-track" ref="trackEl">
      <div class="pill-thumb" ref="thumbEl" />
      <label
        v-for="(opt, i) in OPTIONS"
        :key="opt.value"
        class="pill-opt"
        :class="{ active: store.net === opt.value }"
        @click="select(i, opt.value)"
      >
        {{ opt.label }}
      </label>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { gsap } from 'gsap'
import { useDashboardStore } from '../stores/dashboard'

const store = useDashboardStore()
const switcherEl = ref(null)
const trackEl    = ref(null)
const thumbEl    = ref(null)

const OPTIONS = [
  { label: '🏠 Local',     value: 'local' },
  { label: '🔒 Tailscale', value: 'ts'    },
  { label: '☁️ Live',      value: 'cf'    },
]

function movePill() {
  nextTick(() => {
    const idx = OPTIONS.findIndex(o => o.value === store.net)
    const opts = trackEl.value?.querySelectorAll('.pill-opt')
    if (!opts || !thumbEl.value) return
    const tR = trackEl.value.getBoundingClientRect()
    const oR = opts[idx].getBoundingClientRect()
    gsap.to(thumbEl.value, {
      width: oR.width,
      x: oR.left - tR.left - 4,
      duration: 0.38,
      ease: 'back.out(1.8)',
    })
  })
}

function select(i, value) {
  store.net = value
  movePill()
}

onMounted(() => {
  gsap.from(switcherEl.value, {
    y: -10, opacity: 0, scale: 0.92, duration: 0.5,
    ease: 'back.out(2)', delay: 0.1,
  })
  setTimeout(movePill, 100)
  window.addEventListener('resize', movePill)
})
</script>

<style scoped>
.switcher {
  display: flex;
  justify-content: center;
  margin-bottom: 3rem;
}

.pill-track {
  position: relative;
  display: inline-flex;
  background: var(--surf);
  border: 1px solid var(--bdr);
  border-radius: 999px;
  padding: 4px;
  gap: 2px;
}

.pill-thumb {
  position: absolute;
  top: 4px;
  left: 4px;
  height: calc(100% - 8px);
  background: linear-gradient(135deg, var(--acc), #4f46e5);
  border-radius: 999px;
  box-shadow: 0 0 16px color-mix(in srgb, var(--acc) 60%, transparent);
  pointer-events: none;
  will-change: transform, width;
}

.pill-opt {
  position: relative;
  z-index: 1;
  padding: 0.45rem 1.25rem;
  border-radius: 999px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--muted);
  transition: color 0.2s ease;
  user-select: none;
  white-space: nowrap;
}

.pill-opt.active { color: #fff }

@media (max-width: 640px) {
  .pill-opt { padding: 0.4rem 0.9rem; font-size: 0.77rem }
}
</style>
