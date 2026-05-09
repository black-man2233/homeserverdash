<template>
  <div class="net-switcher">
    <button
      v-for="opt in OPTIONS"
      :key="opt.value"
      class="net-pill"
      :class="{ active: store.net === opt.value }"
      @click="store.net = opt.value"
    >
      {{ opt.label }}
    </button>
  </div>
</template>

<script setup>
import { useDashboardStore } from '../stores/dashboard'

const store = useDashboardStore()

const OPTIONS = [
  { label: '🏠 Local',     value: 'local' },
  { label: '🔒 Tailscale', value: 'ts'    },
  { label: '☁️ Live',      value: 'live'  },
]
</script>

<style scoped>
.net-switcher {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-bottom: 1rem;
}

.net-pill {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0.45rem 0.75rem;
  border-radius: var(--r-sm);
  border: 1px solid transparent;
  background: transparent;
  color: var(--muted);
  font-size: 0.78rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  text-align: left;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}

.net-pill:hover { background: rgba(255,255,255,0.05); color: var(--text) }

.net-pill.active {
  background: color-mix(in srgb, var(--acc) 15%, transparent);
  border-color: color-mix(in srgb, var(--acc) 30%, transparent);
  color: var(--acc);
}
</style>
