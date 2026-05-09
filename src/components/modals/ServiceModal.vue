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
              <!-- Icon picker -->
              <div class="field">
                <label>Icon</label>
                <div class="icon-row">
                  <div class="icon-preview">
                    <Icon v-if="isIconifyIcon" :icon="form.icon" width="22" height="22" />
                    <span v-else>{{ form.icon || '?' }}</span>
                  </div>
                  <input v-model="form.icon" type="text" class="icon-input" placeholder="simple-icons:jellyfin or lucide:server" @input="iconSearch = ''">
                </div>
                <div class="icon-search-row">
                  <input v-model="iconSearch" type="text" class="search-input" placeholder="Search icons…">
                </div>
                <div class="icon-grid">
                  <button
                    v-for="ic in filteredPresets"
                    :key="ic.name"
                    type="button"
                    class="icon-chip"
                    :class="{ active: form.icon === ic.name }"
                    :title="ic.label"
                    @click="form.icon = ic.name"
                  >
                    <Icon :icon="ic.name" width="18" height="18" />
                  </button>
                </div>
              </div>

              <div class="field-row">
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
                <label>Cloudflare Subdomain <small>optional</small></label>
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
import { reactive, ref, computed, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { useDashboardStore } from '../../stores/dashboard'

const props = defineProps({
  show:    { type: Boolean, required: true },
  service: { type: Object,  default: null  },
})
const emit  = defineEmits(['close', 'saved'])
const store = useDashboardStore()
const isEdit = computed(() => !!props.service)

const form   = reactive({ icon: 'lucide:server', name: '', catId: '', port: '', path: '', cf: '' })
const newCat = reactive({ label: '', icon: '📁', color: '#7c3aed' })
const iconSearch = ref('')

const isIconifyIcon = computed(() => form.icon?.includes(':'))

// All verified to exist via Iconify API
const PRESETS = [
  // Media — simple-icons verified
  { name: 'simple-icons:jellyfin',      label: 'Jellyfin' },
  { name: 'simple-icons:plex',          label: 'Plex' },
  { name: 'simple-icons:kodi',          label: 'Kodi' },
  { name: 'simple-icons:sonarr',        label: 'Sonarr' },
  { name: 'simple-icons:radarr',        label: 'Radarr' },
  { name: 'simple-icons:transmission',  label: 'Transmission' },
  { name: 'simple-icons:qbittorrent',   label: 'qBittorrent' },
  // Media — lucide fallbacks (no simple-icon exists)
  { name: 'lucide:disc-3',              label: 'Lidarr' },
  { name: 'lucide:search',              label: 'Prowlarr' },
  { name: 'lucide:music-2',             label: 'Navidrome' },
  { name: 'lucide:captions',            label: 'Bazarr' },
  { name: 'lucide:radio',               label: 'Restreamer' },
  { name: 'lucide:music',               label: 'Music' },
  // Monitoring — verified
  { name: 'simple-icons:uptimekuma',    label: 'Uptime Kuma' },
  { name: 'simple-icons:netdata',       label: 'Netdata' },
  { name: 'simple-icons:grafana',       label: 'Grafana' },
  { name: 'simple-icons:prometheus',    label: 'Prometheus' },
  { name: 'lucide:hard-drive',          label: 'Scrutiny' },
  { name: 'lucide:monitor-dot',         label: 'Beszel' },
  { name: 'lucide:chart-no-axes-column',label: 'GoAccess' },
  { name: 'lucide:activity',            label: 'Activity' },
  // Network — verified
  { name: 'simple-icons:pihole',        label: 'Pi-hole' },
  { name: 'simple-icons:adguard',       label: 'AdGuard' },
  { name: 'simple-icons:nginx',         label: 'Nginx' },
  { name: 'simple-icons:traefikproxy',  label: 'Traefik' },
  { name: 'simple-icons:cloudflare',    label: 'Cloudflare' },
  { name: 'simple-icons:wireguard',     label: 'WireGuard' },
  { name: 'simple-icons:tailscale',     label: 'Tailscale' },
  { name: 'simple-icons:portainer',     label: 'Portainer' },
  // Photos / Files — verified
  { name: 'simple-icons:immich',        label: 'Immich' },
  { name: 'simple-icons:nextcloud',     label: 'Nextcloud' },
  { name: 'simple-icons:syncthing',     label: 'Syncthing' },
  // Books
  { name: 'lucide:book-open',           label: 'Kavita' },
  { name: 'lucide:library',             label: 'Booklore' },
  // Infra — verified
  { name: 'simple-icons:docker',        label: 'Docker' },
  { name: 'simple-icons:gitea',         label: 'Gitea' },
  { name: 'simple-icons:homeassistant', label: 'Home Assistant' },
  { name: 'simple-icons:vaultwarden',   label: 'Vaultwarden' },
  { name: 'simple-icons:bitwarden',     label: 'Bitwarden' },
  { name: 'simple-icons:mariadb',       label: 'MariaDB' },
  // Generic lucide
  { name: 'lucide:server',              label: 'Server' },
  { name: 'lucide:database',            label: 'Database' },
  { name: 'lucide:globe',               label: 'Globe' },
  { name: 'lucide:shield',              label: 'Shield' },
  { name: 'lucide:cpu',                 label: 'CPU' },
  { name: 'lucide:camera',              label: 'Camera' },
  { name: 'lucide:film',                label: 'Film' },
  { name: 'lucide:image',               label: 'Images' },
  { name: 'lucide:lock',                label: 'Lock' },
  { name: 'lucide:terminal',            label: 'Terminal' },
  { name: 'lucide:bot',                 label: 'AI / Bot' },
  { name: 'lucide:tag',                 label: 'Tag' },
]

const filteredPresets = computed(() => {
  if (!iconSearch.value) return PRESETS
  const q = iconSearch.value.toLowerCase()
  return PRESETS.filter(p => p.label.toLowerCase().includes(q) || p.name.includes(q))
})

watch(() => props.show, (v) => {
  if (!v) return
  iconSearch.value = ''
  if (props.service) {
    Object.assign(form, {
      icon:  props.service.icon,
      name:  props.service.name,
      catId: props.service.cat,
      port:  props.service.port,
      path:  props.service.path || '',
      cf:    props.service.cf   || '',
    })
  } else {
    Object.assign(form, { icon: 'lucide:server', name: '', catId: store.cats[0]?.id || '', port: '', path: '', cf: '' })
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
  const data = { cat: catId, icon: form.icon || 'lucide:server', name: form.name, port: form.port, path: form.path, cf: form.cf }
  if (props.service) store.editSvc(props.service.id, data)
  else               store.addSvc(data)
  emit('saved')
  emit('close')
}
</script>

<style scoped>
.overlay {
  position: fixed; inset: 0; z-index: 100;
  background: rgba(0,0,0,0.7);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center; padding: 1rem;
}

.modal {
  background: var(--surf);
  border: 1px solid var(--bdr2);
  border-radius: 14px;
  padding: 1.5rem;
  width: 100%; max-width: 440px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.5);
  max-height: 90vh;
  overflow-y: auto;
}

.modal-head {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 1.25rem;
}
.modal-head h2 { font-size: 0.95rem; font-weight: 700 }

.close-x {
  background: none; border: none; color: var(--muted);
  font-size: 1.2rem; cursor: pointer; line-height: 1;
  transition: color 0.15s;
}
.close-x:hover { color: var(--text) }

.field { margin-bottom: 0.875rem }
.field label {
  display: block; font-size: 0.68rem; font-weight: 600;
  color: var(--muted); text-transform: uppercase; letter-spacing: 0.08em;
  margin-bottom: 0.35rem;
}
.field label small { font-size: 0.65rem; font-weight: 400; text-transform: none; opacity: 0.7 }

.field input, .field select {
  width: 100%; background: var(--bg); border: 1px solid var(--bdr);
  border-radius: var(--r-sm); padding: 0.48rem 0.7rem; color: var(--text);
  font-size: 0.82rem; font-family: inherit;
  transition: border-color 0.15s; outline: none;
}
.field input:focus, .field select:focus { border-color: var(--acc) }
.field input::placeholder { color: var(--muted) }
.field select option { background: var(--surf) }
.field input[type=color] { padding: 0.3rem 0.4rem; height: 36px; cursor: pointer }

.field-row { display: flex; gap: 0.5rem }
.field-row .field { flex: 1; margin-bottom: 0 }

/* Icon picker */
.icon-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.icon-preview {
  width: 36px; height: 36px;
  border-radius: var(--r-sm);
  border: 1px solid var(--bdr);
  background: var(--bg);
  display: flex; align-items: center; justify-content: center;
  color: var(--acc);
  font-size: 1.1rem;
  flex-shrink: 0;
}

.icon-input { flex: 1 }

.icon-search-row { margin-bottom: 0.5rem }
.search-input {
  width: 100%; background: var(--bg); border: 1px solid var(--bdr);
  border-radius: var(--r-sm); padding: 0.4rem 0.7rem; color: var(--text);
  font-size: 0.8rem; font-family: inherit; outline: none;
}
.search-input:focus { border-color: var(--acc) }
.search-input::placeholder { color: var(--muted) }

.icon-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
}

.icon-chip {
  width: 34px; height: 34px;
  border-radius: var(--r-sm);
  border: 1px solid var(--bdr);
  background: var(--bg);
  color: var(--muted);
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: color 0.15s, border-color 0.15s, background 0.15s;
}
.icon-chip:hover { color: var(--text); border-color: var(--bdr2) }
.icon-chip.active { border-color: var(--acc); color: var(--acc); background: var(--surf2) }

/* Form actions */
.form-actions {
  display: flex; gap: 0.5rem; justify-content: flex-end;
  margin-top: 1.25rem; padding-top: 0.875rem;
  border-top: 1px solid var(--bdr);
}

.btn {
  display: inline-flex; align-items: center;
  border: 1px solid var(--bdr); background: var(--bg);
  color: var(--muted); border-radius: var(--r-sm);
  padding: 0.4rem 0.8rem;
  font-size: 0.78rem; font-weight: 600; cursor: pointer;
  font-family: inherit; transition: background 0.15s, color 0.15s;
}
.btn:hover { background: var(--bdr); color: var(--text) }

.btn-prime {
  background: var(--acc); border-color: transparent; color: #fff;
}
.btn-prime:hover { opacity: 0.85 }
</style>
