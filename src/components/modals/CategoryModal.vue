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
  background: rgba(0,0,0,0.7); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center; padding: 1rem;
}
.modal {
  background: var(--surf); border: 1px solid var(--bdr2);
  border-radius: 14px; padding: 1.5rem; width: 100%; max-width: 420px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.5);
}
.modal-sm { max-width: 340px }
.modal-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem }
.modal-head h2 { font-size: 0.95rem; font-weight: 700 }
.close-x { background: none; border: none; color: var(--muted); font-size: 1.2rem; cursor: pointer; line-height: 1; transition: color 0.15s }
.close-x:hover { color: var(--text) }
.field { margin-bottom: 0.875rem }
.field label { display: block; font-size: 0.68rem; font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 0.35rem }
.field input {
  width: 100%; background: var(--bg); border: 1px solid var(--bdr);
  border-radius: var(--r-sm); padding: 0.48rem 0.7rem; color: var(--text);
  font-size: 0.82rem; font-family: inherit; outline: none; transition: border-color 0.15s;
}
.field input:focus { border-color: var(--acc) }
.field input::placeholder { color: var(--muted) }
.field input[type=color] { padding: 0.3rem 0.4rem; height: 36px; cursor: pointer }
.field-row { display: flex; gap: 0.5rem }
.field-row .field { flex: 1; margin-bottom: 0 }
.form-actions { display: flex; gap: 0.5rem; justify-content: flex-end; margin-top: 1.25rem; padding-top: 0.875rem; border-top: 1px solid var(--bdr) }
.btn { display: inline-flex; align-items: center; border: 1px solid var(--bdr); background: var(--bg); color: var(--muted); border-radius: var(--r-sm); padding: 0.4rem 0.8rem; font-size: 0.78rem; font-weight: 600; cursor: pointer; font-family: inherit; transition: background 0.15s, color 0.15s }
.btn:hover { background: var(--bdr); color: var(--text) }
.btn-prime { background: var(--acc); border-color: transparent; color: #fff }
.btn-prime:hover { opacity: 0.85 }
</style>
