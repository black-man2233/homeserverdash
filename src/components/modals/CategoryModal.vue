<template>
  <Teleport to="body">
    <Transition name="backdrop">
      <div v-if="show" class="overlay" @click.self="emit('close')">
        <Transition name="modal" appear>
          <div v-if="show" class="modal modal-sm">
            <div class="modal-head">
              <h2>Add Category</h2>
              <button class="close-x" @click="emit('close')">×</button>
            </div>
            <form @submit.prevent="onSubmit">
              <div class="field-row">
                <div class="field" style="flex: 0 0 60px">
                  <label>Icon</label>
                  <input v-model="form.icon" type="text" placeholder="📁" maxlength="4">
                </div>
                <div class="field">
                  <label>Name</label>
                  <input v-model="form.label" type="text" placeholder="My Category" required>
                </div>
                <div class="field" style="flex: 0 0 48px">
                  <label>Color</label>
                  <input v-model="form.color" type="color">
                </div>
              </div>
              <div class="form-actions">
                <button type="button" class="btn" @click="emit('close')">Cancel</button>
                <button type="submit" class="btn btn-prime">Add</button>
              </div>
            </form>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { reactive, watch } from 'vue'
import { useDashboardStore } from '../../stores/dashboard'

const props = defineProps({ show: { type: Boolean, required: true } })
const emit  = defineEmits(['close'])
const store = useDashboardStore()
const form  = reactive({ icon: '📁', label: '', color: '#7c3aed' })

watch(() => props.show, (v) => {
  if (v) Object.assign(form, { icon: '📁', label: '', color: '#7c3aed' })
})

function onSubmit() {
  store.addCat({ label: form.label, icon: form.icon || '📁', color: form.color })
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
.modal-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem }
.modal-head h2 { font-size: 1rem; font-weight: 700; letter-spacing: -0.02em }
.close-x { background: none; border: none; color: var(--muted); font-size: 1.3rem; cursor: pointer; padding: 0.2rem; line-height: 1; transition: color 0.15s }
.close-x:hover { color: var(--text) }
.field { margin-bottom: 1rem }
.field label { display: block; font-size: 0.72rem; font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.45rem }
.field input {
  width: 100%; background: var(--surf2); border: 1px solid var(--bdr);
  border-radius: 10px; padding: 0.55rem 0.8rem; color: var(--text);
  font-size: 0.875rem; font-family: inherit;
  transition: border-color 0.15s, box-shadow 0.15s; outline: none;
}
.field input:focus { border-color: var(--acc); box-shadow: 0 0 0 3px color-mix(in srgb, var(--acc) 20%, transparent) }
.field input::placeholder { color: var(--muted) }
.field input[type=color] { padding: 0.35rem 0.5rem; height: 38px; cursor: pointer; border-radius: 8px }
.field-row { display: flex; gap: 0.5rem }
.field-row .field { flex: 1; margin-bottom: 0 }
.form-actions { display: flex; gap: 0.6rem; justify-content: flex-end; margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid var(--bdr) }
.btn { display: inline-flex; align-items: center; gap: 0.4rem; border: 1px solid var(--bdr); background: var(--surf); color: var(--muted); border-radius: 10px; padding: 0.42rem 0.85rem; font-size: 0.78rem; font-weight: 600; cursor: pointer; transition: all 0.18s ease; font-family: inherit }
.btn:hover { background: var(--surf2); border-color: var(--bdr2); color: var(--text) }
.btn-prime { background: linear-gradient(135deg, var(--acc), #5b21b6); border-color: transparent; color: #fff; box-shadow: 0 4px 20px color-mix(in srgb, var(--acc) 50%, transparent) }
.btn-prime:hover { filter: brightness(1.1) }
</style>
