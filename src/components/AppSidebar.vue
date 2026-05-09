<template>
  <aside class="sidebar">
    <div class="brand">
      <div class="brand-dot" />
      <div>
        <div class="brand-name">coolserver</div>
        <div class="brand-sub">home dashboard</div>
      </div>
    </div>

    <nav class="nav">
      <button
        v-for="cat in store.catsWithSvcs"
        :key="cat.id"
        class="nav-item"
        :style="`--c: ${cat.color}`"
        @click="scrollTo(cat.id)"
      >
        <span class="nav-pip" />
        {{ cat.label }}
        <span class="nav-count">{{ store.svcsByCategory(cat.id).length }}</span>
      </button>
    </nav>

    <div class="spacer" />

    <div class="section-label">Network</div>
    <NetworkSwitcher />

    <div class="actions">
      <button class="btn-primary" @click="uiStore.openAddSvc()">+ Add Service</button>
      <button class="btn-ghost" @click="uiStore.showCatModal = true">+ Category</button>
      <button class="btn-ghost" @click="onReset">↺ Reset</button>
    </div>
  </aside>
</template>

<script setup>
import { useDashboardStore } from '../stores/dashboard'
import { useUIStore } from '../stores/ui'
import NetworkSwitcher from './NetworkSwitcher.vue'

const store   = useDashboardStore()
const uiStore = useUIStore()

function scrollTo(id) {
  document.getElementById('cat-' + id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function onReset() {
  if (confirm('Reset everything to defaults?')) store.resetData()
}
</script>

<style scoped>
.sidebar {
  width: var(--sidebar-w);
  flex-shrink: 0;
  position: fixed;
  top: 0; left: 0; bottom: 0;
  background: var(--surf);
  border-right: 1px solid var(--bdr);
  display: flex;
  flex-direction: column;
  padding: 1.25rem 0.875rem;
  overflow-y: auto;
  z-index: 10;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 1.75rem;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid var(--bdr);
}

.brand-dot {
  width: 7px; height: 7px;
  border-radius: 50%;
  background: var(--acc);
  flex-shrink: 0;
}

.brand-name {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text);
  letter-spacing: -0.01em;
}

.brand-sub {
  font-size: 0.68rem;
  color: var(--muted);
  margin-top: 1px;
}

.nav {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.42rem 0.6rem;
  border-radius: var(--r-sm);
  border: none;
  background: transparent;
  color: var(--muted);
  font-size: 0.8rem;
  font-family: inherit;
  cursor: pointer;
  text-align: left;
  transition: background 0.15s, color 0.15s;
}
.nav-item:hover { background: var(--bdr); color: var(--text) }

.nav-pip {
  width: 4px; height: 4px;
  border-radius: 50%;
  background: var(--c, var(--acc));
  flex-shrink: 0;
}

.nav-count {
  margin-left: auto;
  font-size: 0.68rem;
  color: var(--muted);
  background: var(--bdr);
  padding: 0.05rem 0.3rem;
  border-radius: 4px;
}

.spacer { flex: 1 }

.section-label {
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--muted);
  margin-bottom: 0.4rem;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--bdr);
}

.btn-primary {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border-radius: var(--r-sm);
  border: none;
  background: var(--acc);
  color: #fff;
  font-size: 0.78rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: opacity 0.15s;
}
.btn-primary:hover { opacity: 0.85 }

.btn-ghost {
  width: 100%;
  padding: 0.45rem 0.75rem;
  border-radius: var(--r-sm);
  border: 1px solid var(--bdr);
  background: transparent;
  color: var(--muted);
  font-size: 0.75rem;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.btn-ghost:hover { background: var(--bdr); color: var(--text) }

@media (max-width: 768px) {
  .sidebar { display: none }
}
</style>
