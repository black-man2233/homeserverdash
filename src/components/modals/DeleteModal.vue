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
  background: #000000cc; backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
  display: flex; align-items: center; justify-content: center; padding: 1rem;
}
.modal {
  background: var(--surf); border: 1px solid var(--bdr2);
  border-radius: 20px; padding: 1.75rem; width: 100%; max-width: 420px;
  box-shadow: 0 24px 80px #00000080;
}
.modal-sm { max-width: 340px }
.modal-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem }
.modal-head h2 { font-size: 1rem; font-weight: 700; letter-spacing: -0.02em }
.confirm-body { margin-bottom: 1.75rem }
.confirm-body p { color: var(--muted); font-size: 0.88rem; margin-top: 0.4rem }
.confirm-body strong { color: var(--text) }
.form-actions { display: flex; gap: 0.6rem; justify-content: flex-end; padding-top: 1rem; border-top: 1px solid var(--bdr) }
.btn { display: inline-flex; align-items: center; border: 1px solid var(--bdr); background: var(--surf); color: var(--muted); border-radius: 10px; padding: 0.42rem 0.85rem; font-size: 0.78rem; font-weight: 600; cursor: pointer; transition: all 0.18s ease; font-family: inherit }
.btn:hover { background: var(--surf2); border-color: var(--bdr2); color: var(--text) }
.btn-danger { background: linear-gradient(135deg, #dc2626, #991b1b); border-color: transparent; color: #fff; box-shadow: 0 4px 16px #dc262640 }
.btn-danger:hover { filter: brightness(1.1) }
</style>
