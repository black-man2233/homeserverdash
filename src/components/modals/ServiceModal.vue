<template>
  <Teleport to="body">
    <Transition name="backdrop">
      <div v-if="show" class="overlay" @click.self="emit('close')">
        <Transition name="modal" appear>
          <div v-if="show" class="modal">
            <div class="modal-head">
              <h2>{{ isEdit ? 'Edit Service' : 'Add Service' }}</h2>
              <button class="close-x" @click="emit('close')">×</button>
            </div>

            <form @submit.prevent="onSubmit">
              <div class="field-row">
                <div class="field" style="flex: 0 0 80px">
                  <label>Icon</label>
                  <input v-model="form.icon" type="text" placeholder="📡" maxlength="4">
                </div>
                <div class="field">
                  <label>Name</label>
                  <input v-model="form.name" type="text" placeholder="My Service" required>
                </div>
              </div>

              <div class="field">
                <label>Category</label>
                <select v-model="form.catId" @change="onCatChange">
                  <option v-for="c in store.cats" :key="c.id" :value="c.id">{{ c.icon }} {{ c.label }}</option>
                  <option value="__new">+ New category…</option>
                </select>
              </div>

              <div v-if="form.catId === '__new'" class="field">
                <label>New Category</label>
                <div class="field-row">
                  <div class="field"><input v-model="newCat.label" type="text" placeholder="Category name"></div>
                  <div class="field" style="flex:0 0 60px"><input v-model="newCat.icon" type="text" placeholder="📁" maxlength="4"></div>
                  <div class="field" style="flex:0 0 48px"><input v-model="newCat.color" type="color"></div>
                </div>
              </div>

              <div class="field-row">
                <div class="field">
                  <label>Port</label>
                  <input v-model.number="form.port" type="number" placeholder="3000" min="1" max="65535" required>
                </div>
                <div class="field">
                  <label>Path <small>optional</small></label>
                  <input v-model="form.path" type="text" placeholder="/admin">
                </div>
              </div>

              <div class="field">
                <label>Cloudflare Subdomain <small>optional — prefix for bamwesa.org</small></label>
                <input v-model="form.cf" type="text" placeholder="myservice">
              </div>

              <div class="form-actions">
                <button type="button" class="btn" @click="emit('close')">Cancel</button>
                <button type="submit" class="btn btn-prime">Save</button>
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

const props = defineProps({
  show:    { type: Boolean, required: true },
  service: { type: Object,  default: null  },
})
const emit  = defineEmits(['close', 'saved'])
const store = useDashboardStore()
const isEdit = computed(() => !!props.service)

import { computed } from 'vue'

const form = reactive({ icon: '', name: '', catId: '', port: '', path: '', cf: '' })
const newCat = reactive({ label: '', icon: '📁', color: '#7c3aed' })

watch(() => props.show, (v) => {
  if (!v) return
  if (props.service) {
    Object.assign(form, {
      icon: props.service.icon,
      name: props.service.name,
      catId: props.service.cat,
      port: props.service.port,
      path: props.service.path || '',
      cf:   props.service.cf   || '',
    })
  } else {
    Object.assign(form, { icon: '', name: '', catId: store.cats[0]?.id || '', port: '', path: '', cf: '' })
    Object.assign(newCat, { label: '', icon: '📁', color: '#7c3aed' })
  }
})

function onCatChange() {
  if (form.catId !== '__new') newCat.label = ''
}

function onSubmit() {
  let catId = form.catId
  if (catId === '__new') {
    catId = store.addCat({ label: newCat.label || 'Custom', icon: newCat.icon, color: newCat.color })
  }

  const data = { cat: catId, icon: form.icon || '🔧', name: form.name, port: form.port, path: form.path, cf: form.cf }

  if (props.service) store.editSvc(props.service.id, data)
  else               store.addSvc(data)

  emit('saved')
  emit('close')
}
</script>

<style scoped>
.overlay {
  position: fixed; inset: 0; z-index: 100;
  background: #000000cc;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  display: flex; align-items: center; justify-content: center; padding: 1rem;
}

.modal {
  background: var(--surf);
  border: 1px solid var(--bdr2);
  border-radius: 20px;
  padding: 1.75rem;
  width: 100%; max-width: 420px;
  box-shadow: 0 24px 80px #00000080;
}

.modal-head {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 1.5rem;
}
.modal-head h2 { font-size: 1rem; font-weight: 700; letter-spacing: -0.02em }

.close-x {
  background: none; border: none; color: var(--muted);
  font-size: 1.3rem; cursor: pointer; padding: 0.2rem; line-height: 1;
  transition: color 0.15s;
}
.close-x:hover { color: var(--text) }

.field { margin-bottom: 1rem }
.field label {
  display: block; font-size: 0.72rem; font-weight: 600;
  color: var(--muted); text-transform: uppercase; letter-spacing: 0.1em;
  margin-bottom: 0.45rem;
}
.field label small { font-size: 0.68rem; font-weight: 400; text-transform: none; letter-spacing: 0; opacity: 0.7 }
.field input, .field select {
  width: 100%; background: var(--surf2); border: 1px solid var(--bdr);
  border-radius: 10px; padding: 0.55rem 0.8rem; color: var(--text);
  font-size: 0.875rem; font-family: inherit;
  transition: border-color 0.15s, box-shadow 0.15s; outline: none;
}
.field input:focus, .field select:focus {
  border-color: var(--acc);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--acc) 20%, transparent);
}
.field input::placeholder { color: var(--muted) }
.field select option { background: var(--surf2) }
.field input[type=color] { padding: 0.35rem 0.5rem; height: 38px; cursor: pointer; border-radius: 8px }

.field-row { display: flex; gap: 0.5rem }
.field-row .field { flex: 1; margin-bottom: 0 }

.form-actions {
  display: flex; gap: 0.6rem; justify-content: flex-end;
  margin-top: 1.5rem; padding-top: 1rem;
  border-top: 1px solid var(--bdr);
}

.btn {
  display: inline-flex; align-items: center; gap: 0.4rem;
  border: 1px solid var(--bdr); background: var(--surf);
  color: var(--muted); border-radius: 10px; padding: 0.42rem 0.85rem;
  font-size: 0.78rem; font-weight: 600; cursor: pointer;
  transition: all 0.18s ease; white-space: nowrap; font-family: inherit;
}
.btn:hover { background: var(--surf2); border-color: var(--bdr2); color: var(--text) }

.btn-prime {
  background: linear-gradient(135deg, var(--acc), #5b21b6);
  border-color: transparent; color: #fff;
  box-shadow: 0 4px 20px color-mix(in srgb, var(--acc) 50%, transparent);
}
.btn-prime:hover { filter: brightness(1.1) }
</style>
