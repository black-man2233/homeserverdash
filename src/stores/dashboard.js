import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { CFG as CFG_STATIC } from '../config'

const DEF_CATS = [
  { id: 'monitoring', label: 'Monitoring', icon: 'lucide:activity',    color: '#22d3ee' },
  { id: 'network',    label: 'Network',    icon: 'lucide:network',     color: '#4ade80' },
  { id: 'media',      label: 'Media',      icon: 'lucide:film',        color: '#a78bfa' },
  { id: 'books',      label: 'Books',      icon: 'lucide:book-open',   color: '#f59e0b' },
  { id: 'photos',     label: 'Photos',     icon: 'lucide:image',       color: '#f472b6' },
  { id: 'ai',         label: 'AI',         icon: 'lucide:bot',         color: '#fb923c' },
]

const DEF_SVCS = [
  { id: 1,  cat: 'monitoring', name: 'Uptime Kuma',    icon: 'simple-icons:uptimekuma',      port: 3001,  path: '', cf: 'uptime'    },
  { id: 2,  cat: 'monitoring', name: 'Netdata',         icon: 'simple-icons:netdata',         port: 3004,  path: '', cf: 'netdata'   },
  { id: 3,  cat: 'monitoring', name: 'Scrutiny',        icon: 'lucide:hard-drive',            port: 3030,  path: '', cf: ''          },
  { id: 4,  cat: 'monitoring', name: 'Beszel',          icon: 'lucide:monitor-dot',           port: 3031,  path: '', cf: ''          },
  { id: 5,  cat: 'monitoring', name: 'GoAccess',        icon: 'lucide:chart-no-axes-column',  port: 8081,  path: '', cf: ''          },
  { id: 6,  cat: 'monitoring', name: 'Node Exporter',   icon: 'simple-icons:prometheus',      port: 3002,  path: '', cf: ''          },
  { id: 7,  cat: 'monitoring', name: 'cAdvisor',        icon: 'simple-icons:docker',          port: 3003,  path: '', cf: ''          },
  { id: 10, cat: 'network',    name: 'Nginx Proxy Mgr', icon: 'simple-icons:nginx',           port: 81,    path: '', cf: 'npm'       },
  { id: 11, cat: 'network',    name: 'Portainer',       icon: 'simple-icons:portainer',       port: 9443,  path: '', cf: 'portainer' },
  { id: 12, cat: 'network',    name: 'Pi-hole',         icon: 'simple-icons:pihole',          port: 8080,  path: '/admin', cf: 'pihole' },
  { id: 13, cat: 'network',    name: 'Traefik',         icon: 'simple-icons:traefikproxy',    port: 8085,  path: '', cf: 'traefik'   },
  { id: 14, cat: 'network',    name: 'FlareSolverr',    icon: 'lucide:shield',                port: 3019,  path: '', cf: ''          },
  { id: 20, cat: 'media',      name: 'Jellyfin',        icon: 'simple-icons:jellyfin',        port: 3011,  path: '', cf: 'jellyfin'  },
  { id: 21, cat: 'media',      name: 'Navidrome',       icon: 'lucide:music-2',               port: 3007,  path: '', cf: 'music'     },
  { id: 22, cat: 'media',      name: 'Sonarr',          icon: 'simple-icons:sonarr',          port: 3013,  path: '', cf: 'sonarr'    },
  { id: 23, cat: 'media',      name: 'Radarr',          icon: 'simple-icons:radarr',          port: 3014,  path: '', cf: 'radarr'    },
  { id: 24, cat: 'media',      name: 'Lidarr',          icon: 'lucide:disc-3',                port: 3010,  path: '', cf: 'lidarr'    },
  { id: 25, cat: 'media',      name: 'Prowlarr',        icon: 'lucide:search',                port: 3015,  path: '', cf: 'prowlarr'  },
  { id: 26, cat: 'media',      name: 'Bazarr',          icon: 'lucide:captions',              port: 3020,  path: '', cf: ''          },
  { id: 27, cat: 'media',      name: 'Transmission',    icon: 'simple-icons:transmission',    port: 3016,  path: '', cf: ''          },
  { id: 28, cat: 'media',      name: 'slskd',           icon: 'lucide:music',                 port: 3008,  path: '', cf: ''          },
  { id: 29, cat: 'media',      name: 'Restreamer',      icon: 'lucide:radio',                 port: 16681, path: '', cf: ''          },
  { id: 30, cat: 'media',      name: 'Beets',           icon: 'lucide:tag',                   port: 3017,  path: '', cf: ''          },
  { id: 40, cat: 'books',      name: 'Kavita',          icon: 'lucide:book-open',             port: 3022,  path: '', cf: ''          },
  { id: 41, cat: 'books',      name: 'Booklore',        icon: 'lucide:library',               port: 6060,  path: '', cf: ''          },
  { id: 50, cat: 'photos',     name: 'Immich',          icon: 'simple-icons:immich',          port: 2283,  path: '', cf: 'photos'    },
  { id: 60, cat: 'ai',         name: 'InvokeAI',        icon: 'lucide:bot',                   port: 9999,  path: '', cf: 'invokeai'  },
]

const EMOJI_MAP = {
  '💓': 'simple-icons:uptimekuma',
  '📊': 'simple-icons:netdata',
  '🔩': 'simple-icons:prometheus',
  '🐳': 'simple-icons:docker',
  '🛡️': 'simple-icons:pihole',
  '🌐': 'simple-icons:nginx',
  '🔀': 'simple-icons:traefikproxy',
  '🎬': 'simple-icons:jellyfin',
  '🎵': 'lucide:music-2',
  '📺': 'simple-icons:sonarr',
  '🎞️': 'simple-icons:radarr',
  '🎸': 'lucide:disc-3',
  '🔍': 'lucide:search',
  '⬇️': 'simple-icons:transmission',
  '🎶': 'lucide:music',
  '🌿': 'lucide:tag',
  '📸': 'simple-icons:immich',
  '🤖': 'lucide:bot',
  '📡': 'lucide:activity',
  '📁': 'lucide:folder',
}

function migrateIcons(items) {
  return items.map(item => ({ ...item, icon: EMOJI_MAP[item.icon] ?? item.icon }))
}

export const useDashboardStore = defineStore('dashboard', () => {
  // Track whether localStorage had data at startup so init() knows whether to seed
  const _hadLocalCats = !!localStorage.getItem('cats')
  const _hadLocalSvcs = !!localStorage.getItem('svcs')

  const rawCats = JSON.parse(localStorage.getItem('cats')) || DEF_CATS
  const rawSvcs = JSON.parse(localStorage.getItem('svcs')) || DEF_SVCS

  const cats = ref(migrateIcons(rawCats))
  const svcs = ref(migrateIcons(rawSvcs))
  const net  = ref('local')

  // Reactive config — seeded from config.js, overridden by services.json via init()
  const cfg = ref({ local: CFG_STATIC.local, ts: CFG_STATIC.ts, cf: CFG_STATIC.cf })

  // Snapshot of services.json services, used by resetData()
  let _jsonCats = null
  let _jsonSvcs = null

  function init(data) {
    if (data?.config) {
      if (data.config.local) cfg.value.local = data.config.local
      if (data.config.ts)    cfg.value.ts    = data.config.ts
      if (data.config.cf)    cfg.value.cf    = data.config.cf
    }
    if (data?.cats?.length)     _jsonCats = data.cats
    if (data?.services?.length) _jsonSvcs = data.services

    // Seed from services.json only when localStorage was empty (first run)
    if (!_hadLocalCats && _jsonCats) {
      cats.value = migrateIcons(_jsonCats)
      persist()
    }
    if (!_hadLocalSvcs && _jsonSvcs) {
      svcs.value = migrateIcons(_jsonSvcs)
      persist()
    }
  }

  const catsWithSvcs = computed(() =>
    cats.value.filter(c => svcs.value.some(s => s.cat === c.id))
  )

  function svcsByCategory(catId) {
    return svcs.value.filter(s => s.cat === catId)
  }

  function svcURL(svc, n) {
    n = n ?? net.value
    if (n === 'cf') return svc.cf ? `https://${svc.cf}.${cfg.value.cf}${svc.path}` : null
    return `http://${n === 'local' ? cfg.value.local : cfg.value.ts}:${svc.port}${svc.path}`
  }

  function persist() {
    localStorage.setItem('cats', JSON.stringify(cats.value))
    localStorage.setItem('svcs', JSON.stringify(svcs.value))
  }

  persist()

  function addSvc(data) {
    svcs.value.push({ ...data, id: Date.now() })
    persist()
  }

  function editSvc(id, data) {
    const i = svcs.value.findIndex(s => s.id === id)
    if (i >= 0) svcs.value[i] = { ...svcs.value[i], ...data }
    persist()
  }

  function deleteSvc(id) {
    svcs.value = svcs.value.filter(s => s.id !== id)
    persist()
  }

  function addCat(data) {
    const id = data.label.toLowerCase().replace(/\s+/g, '-')
    if (!cats.value.find(c => c.id === id)) cats.value.push({ ...data, id })
    persist()
    return id
  }

  function resetData() {
    // Prefer services.json data; fall back to built-in defaults
    cats.value = JSON.parse(JSON.stringify(_jsonCats || DEF_CATS))
    svcs.value = JSON.parse(JSON.stringify(_jsonSvcs || DEF_SVCS))
    persist()
  }

  return { cats, svcs, net, cfg, catsWithSvcs, svcsByCategory, svcURL, persist, init, addSvc, editSvc, deleteSvc, addCat, resetData }
})
