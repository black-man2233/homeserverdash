<template>
  <Teleport to="body">
    <Transition name="backdrop">
      <div v-if="show" class="overlay" @click.self="emit('close')">
        <Transition name="modal" appear>
          <div v-if="show" class="modal modal-sm">
            <div class="modal-head"><h2>Delete service?</h2></div>
            <div class="confirm-body">
              <p>This will remove <strong>{{ serviceName }}</strong> from your dashboard.</p>
            </div>
            <div class="form-actions">
              <button class="btn" @click="emit('close')">Cancel</button>
              <button class="btn btn-danger" @click="onConfirm">Delete</button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
const props = defineProps({
  show:        { type: Boolean, required: true },
  serviceName: { type: String,  default: ''    },
  serviceId:   { type: Number,  default: null  },
})
const emit = defineEmits(['close', 'confirmed'])

function onConfirm() {
  emit('confirmed', props.serviceId)
  emit('close')
}
</script>

<style scoped>
.overlay {
  position: fixed; inset: 0; z-index: 100;
  background: rgba(0,0,0,0.7); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center; padding: 1rem;
}
.modal {
  background: var(--surf); border: 1px solid var(--bdr2);
  border-radius: 14px; padding: 1.5rem; width: 100%; max-width: 420px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.5);
}
.modal-sm { max-width: 340px }
.modal-head { margin-bottom: 0.875rem }
.modal-head h2 { font-size: 0.95rem; font-weight: 700 }
.confirm-body { margin-bottom: 1.25rem }
.confirm-body p { color: var(--muted); font-size: 0.85rem; margin-top: 0.35rem }
.confirm-body strong { color: var(--text) }
.form-actions { display: flex; gap: 0.5rem; justify-content: flex-end; padding-top: 0.875rem; border-top: 1px solid var(--bdr) }
.btn { display: inline-flex; align-items: center; border: 1px solid var(--bdr); background: var(--bg); color: var(--muted); border-radius: var(--r-sm); padding: 0.4rem 0.8rem; font-size: 0.78rem; font-weight: 600; cursor: pointer; font-family: inherit; transition: background 0.15s, color 0.15s }
.btn:hover { background: var(--bdr); color: var(--text) }
.btn-danger { background: #dc2626; border-color: transparent; color: #fff }
.btn-danger:hover { opacity: 0.85 }
</style>
