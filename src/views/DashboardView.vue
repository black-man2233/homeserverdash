<template>
  <div class="dashboard-page">
    <SpaceCanvas />

    <div class="app" ref="appEl">
      <AppHeader />
      <NetworkSwitcher />

      <div class="toolbar" ref="toolbarEl">
        <button class="btn btn-prime" @click="openAddSvc">+ Add Service</button>
        <button class="btn"           @click="showCatModal = true">⊕ Category</button>
      </div>

      <div class="main-content" ref="mainEl">
        <template v-if="store.catsWithSvcs.length">
          <CategorySection
            v-for="(cat, idx) in store.catsWithSvcs"
            :key="cat.id"
            :category="cat"
            :services="store.svcsByCategory(cat.id)"
            :style="`animation-delay: ${idx * 60}ms`"
            @edit="openEditSvc"
            @delete="openDeleteSvc"
            @launch="onLaunch"
          />
        </template>
        <div v-else class="empty">
          No services yet. Click <strong>+ Add Service</strong> to get started.
        </div>
      </div>
    </div>

    <ServiceModal
      :show="showSvcModal"
      :service="editingService"
      @close="showSvcModal = false"
      @saved="onSvcSaved"
    />
    <CategoryModal :show="showCatModal" @close="showCatModal = false" />
    <DeleteModal
      :show="showDelModal"
      :service-name="deletingName"
      :service-id="deletingId"
      @close="showDelModal = false"
      @confirmed="onDeleteConfirmed"
    />
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted, watch } from 'vue'
import { gsap } from 'gsap'
import { useDashboardStore } from '../stores/dashboard'
import SpaceCanvas     from '../components/SpaceCanvas.vue'
import AppHeader       from '../components/AppHeader.vue'
import NetworkSwitcher from '../components/NetworkSwitcher.vue'
import CategorySection from '../components/CategorySection.vue'
import ServiceModal    from '../components/modals/ServiceModal.vue'
import CategoryModal   from '../components/modals/CategoryModal.vue'
import DeleteModal     from '../components/modals/DeleteModal.vue'

const store = useDashboardStore()

const appEl     = ref(null)
const toolbarEl = ref(null)
const mainEl    = ref(null)

const showSvcModal   = ref(false)
const showCatModal   = ref(false)
const showDelModal   = ref(false)
const editingService = ref(null)
const deletingId     = ref(null)
const deletingName   = ref('')

function openAddSvc() {
  editingService.value = null
  showSvcModal.value   = true
}
function openEditSvc(id) {
  editingService.value = store.svcs.find(s => s.id === id) ?? null
  showSvcModal.value   = true
}
function openDeleteSvc(id) {
  const svc = store.svcs.find(s => s.id === id)
  deletingId.value   = id
  deletingName.value = svc?.name ?? ''
  showDelModal.value = true
}
function onSvcSaved() {
  nextTick(() => animateNewCard())
}
function onDeleteConfirmed(id) {
  const cards = mainEl.value?.querySelectorAll('.service-card')
  let target = null
  cards?.forEach(c => {
    if (c.textContent.includes(store.svcs.find(s => s.id === id)?.name)) target = c
  })
  if (target) {
    gsap.to(target, {
      boxShadow: '0 0 0 2px #dc2626, 0 0 30px #dc262660',
      scale: 0.9, opacity: 0,
      duration: 0.3, ease: 'power2.in',
      onComplete: () => store.deleteSvc(id),
    })
  } else {
    store.deleteSvc(id)
  }
}
function animateNewCard() {
  const cards = mainEl.value?.querySelectorAll('.service-card')
  if (!cards?.length) return
  const last = cards[cards.length - 1]
  gsap.from(last, { scale: 0, rotate: 8, opacity: 0, duration: 0.5, ease: 'back.out(2)' })
}

function onLaunch({ href, x, y, color }) {
  const flash = document.createElement('div')
  Object.assign(flash.style, {
    position: 'fixed',
    left: `${x - 12}px`, top: `${y - 12}px`,
    width: '24px', height: '24px',
    borderRadius: '50%',
    background: color,
    boxShadow: `0 0 40px ${color}, 0 0 80px ${color}60`,
    pointerEvents: 'none', zIndex: '9001',
  })
  document.body.appendChild(flash)
  gsap.fromTo(flash,
    { scale: 0.2, opacity: 1 },
    { scale: 12, opacity: 0, duration: 0.5, ease: 'power2.out',
      transformOrigin: '50% 50%', onComplete: () => flash.remove() }
  )
  for (let i = 0; i < 5; i++) {
    const size = 180 + i * 65
    const ring = document.createElement('div')
    Object.assign(ring.style, {
      position: 'fixed',
      left: `${x - size / 2}px`, top: `${y - size / 2}px`,
      width: `${size}px`, height: `${size}px`,
      borderRadius: '50%',
      border: `${2 - i * 0.2}px solid ${color}`,
      boxShadow: `0 0 ${14 - i * 2}px ${color}90`,
      pointerEvents: 'none', zIndex: '9000',
    })
    document.body.appendChild(ring)
    gsap.fromTo(ring,
      { scale: 0, opacity: 1 - i * 0.1 },
      { scale: 1.8, opacity: 0, duration: 0.75, delay: i * 0.07,
        ease: 'power2.out', transformOrigin: '50% 50%',
        onComplete: () => ring.remove() }
    )
  }
  setTimeout(() => window.open(href, '_blank', 'noopener'), 280)
}

watch(() => store.net, () => {
  const cards = mainEl.value?.querySelectorAll('.service-card')
  if (!cards?.length) return
  gsap.to(cards, {
    rotateY: 90, duration: 0.14, stagger: 0.012, ease: 'power2.in',
    onComplete: () => {
      nextTick(() => {
        gsap.to(cards, { rotateY: 0, duration: 0.2, stagger: 0.012, ease: 'back.out(1.4)' })
      })
    },
  })
})

onMounted(() => {
  gsap.from(appEl.value, { opacity: 0, y: 10, duration: 0.5, ease: 'power2.out' })
})

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    showSvcModal.value = false
    showCatModal.value = false
    showDelModal.value = false
  }
})
</script>

<style scoped>
.dashboard-page { min-height: 100vh }

.app {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2.5rem 1.5rem 6rem;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
}

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

.btn-prime {
  background: linear-gradient(135deg, var(--acc), color-mix(in srgb, var(--acc) 60%, #1e1b4b));
  border-color: transparent;
  color: #fff;
  box-shadow: 0 4px 20px color-mix(in srgb, var(--acc) 40%, transparent);
}
.btn-prime:hover { box-shadow: 0 6px 28px color-mix(in srgb, var(--acc) 60%, transparent); filter: brightness(1.1) }

.empty {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--muted);
  font-size: 0.9rem;
}

@media (max-width: 640px) {
  .app { padding: 1.5rem 1rem 5rem }
}
</style>
