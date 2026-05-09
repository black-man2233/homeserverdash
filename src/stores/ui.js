import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useDashboardStore } from './dashboard'

export const useUIStore = defineStore('ui', () => {
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
    const store = useDashboardStore()
    editingService.value = store.svcs.find(s => s.id === id) ?? null
    showSvcModal.value   = true
  }

  function openDeleteSvc(id) {
    const store = useDashboardStore()
    const svc   = store.svcs.find(s => s.id === id)
    deletingId.value   = id
    deletingName.value = svc?.name ?? ''
    showDelModal.value = true
  }

  return { showSvcModal, showCatModal, showDelModal, editingService, deletingId, deletingName, openAddSvc, openEditSvc, openDeleteSvc }
})
