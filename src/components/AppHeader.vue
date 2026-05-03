<template>
  <header class="app-header" ref="headerEl">
    <div class="brand">
      <div class="brand-dot" />
      <div>
        <div class="brand-name" ref="nameEl">coolserver</div>
        <div class="brand-sub">home dashboard</div>
      </div>
      <span class="season-badge" :title="season.name">{{ season.icon }}</span>
    </div>
    <div class="hdr-right">
      <button class="btn" @click="onReset" title="Reset to defaults">↺ Reset</button>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { gsap } from 'gsap'
import { useDashboardStore } from '../stores/dashboard'
import { useSeason } from '../composables/useSeason'

const store    = useDashboardStore()
const headerEl = ref(null)
const nameEl   = ref(null)
const season   = useSeason()

function onReset() {
  if (confirm('Reset everything to defaults?')) store.resetData()
}

onMounted(() => {
  gsap.from(headerEl.value, { y: -20, opacity: 0, duration: 0.5, ease: 'power2.out', delay: 0.05 })

  function scheduleGlitch() {
    const delay = 7 + Math.random() * 5
    gsap.delayedCall(delay, () => {
      if (!nameEl.value) return
      const tl = gsap.timeline({ onComplete: scheduleGlitch })
      tl.to(nameEl.value, { skewX: 12, duration: 0.04, ease: 'none' })
        .to(nameEl.value, { skewX: -8, duration: 0.04, ease: 'none' })
        .to(nameEl.value, { skewX:  0, duration: 0.04, ease: 'none' })
        .to(nameEl.value, { x: 3,     duration: 0.04, ease: 'none' }, '<')
        .to(nameEl.value, { x: -3,    duration: 0.04, ease: 'none' })
        .to(nameEl.value, { x: 0,     duration: 0.04, ease: 'none' })
    })
  }
  scheduleGlitch()
})
</script>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 3rem;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.brand-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--acc);
  box-shadow: 0 0 10px var(--acc), 0 0 30px color-mix(in srgb, var(--acc) 50%, transparent);
  animation: pulse-glow 2.5s ease-in-out infinite;
  flex-shrink: 0;
}

.brand-name {
  font-size: 1.25rem;
  font-weight: 800;
  letter-spacing: -0.04em;
  background: linear-gradient(135deg, #fff 30%, var(--acc2));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  display: inline-block;
}

.brand-sub {
  font-size: 0.68rem;
  color: var(--muted);
  letter-spacing: 0.08em;
  margin-top: 1px;
}

.season-badge {
  font-size: 1rem;
  opacity: 0.7;
  cursor: default;
  transition: opacity 0.2s, transform 0.2s;
}
.season-badge:hover { opacity: 1; transform: scale(1.2) }

.hdr-right { display: flex; gap: 0.5rem }

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  border: 1px solid var(--bdr);
  background: var(--surf);
  color: var(--muted);
  border-radius: 10px;
  padding: 0.42rem 0.85rem;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  letter-spacing: 0.02em;
  transition: all 0.18s ease;
  white-space: nowrap;
  font-family: inherit;
}
.btn:hover { background: var(--surf2); border-color: var(--bdr2); color: var(--text); transform: translateY(-1px) }
.btn:active { transform: scale(0.97) }
</style>
