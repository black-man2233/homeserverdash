<template>
  <main class="dashboard-main">
    <div class="main-content" ref="mainEl">
      <template v-if="store.catsWithSvcs.length">
        <CategorySection
          v-for="cat in store.catsWithSvcs"
          :key="cat.id"
          :id="'cat-' + cat.id"
          :category="cat"
          :services="store.svcsByCategory(cat.id)"
          @edit="uiStore.openEditSvc"
          @delete="uiStore.openDeleteSvc"
          @launch="onLaunch"
        />
      </template>
      <div v-else class="empty">
        No services yet — click <strong>+ Add Service</strong> in the sidebar.
      </div>
    </div>

    <ServiceModal
      :show="uiStore.showSvcModal"
      :service="uiStore.editingService"
      @close="uiStore.showSvcModal = false"
      @saved="onSvcSaved"
    />
    <CategoryModal
      :show="uiStore.showCatModal"
      @close="uiStore.showCatModal = false"
    />
    <DeleteModal
      :show="uiStore.showDelModal"
      :service-name="uiStore.deletingName"
      :service-id="uiStore.deletingId"
      @close="uiStore.showDelModal = false"
      @confirmed="onDeleteConfirmed"
    />
  </main>
</template>

<script setup>
import { ref, nextTick, watch } from 'vue'
import { useDashboardStore } from '../stores/dashboard'
import { useUIStore } from '../stores/ui'
import CategorySection from '../components/CategorySection.vue'
import ServiceModal    from '../components/modals/ServiceModal.vue'
import CategoryModal   from '../components/modals/CategoryModal.vue'
import DeleteModal     from '../components/modals/DeleteModal.vue'

const store   = useDashboardStore()
const uiStore = useUIStore()
const mainEl  = ref(null)

function onSvcSaved() {}

function onDeleteConfirmed(id) {
  store.deleteSvc(id)
}

function onLaunch({ href }) {
  window.open(href, '_blank', 'noopener')
}

watch(() => store.net, () => {
  // Cards re-render reactively; no animation needed
})

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    uiStore.showSvcModal = false
    uiStore.showCatModal = false
    uiStore.showDelModal = false
  }
})
</script>

<style scoped>
.dashboard-main {
  margin-left: var(--sidebar-w);
  flex: 1;
  min-height: 100vh;
  padding: 2rem 1.75rem 4rem;
}

.main-content {
  max-width: 1050px;
  margin: 0 auto;
}

.empty {
  padding: 4rem 1rem;
  color: var(--muted);
  font-size: 0.875rem;
}
.empty strong { color: var(--text) }

@media (max-width: 768px) {
  .dashboard-main { margin-left: 0; padding: 1.25rem 1rem 3rem }
}
</style>
