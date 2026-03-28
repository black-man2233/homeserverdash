import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { CFG } from '../config'

const DEF_CATS = [
  { id: 'monitoring', label: 'Monitoring', icon: '📡', color: '#22d3ee' },
  { id: 'network',    label: 'Network',    icon: '🌐', color: '#4ade80' },
  { id: 'media',      label: 'Media',      icon: '🎭', color: '#a78bfa' },
  { id: 'photos',     label: 'Photos',     icon: '🖼️',  color: '#f472b6' },
  { id: 'ai',         label: 'AI',         icon: '✨',  color: '#fb923c' },
]

const DEF_SVCS = [
  { id: 1,  cat: 'monitoring', name: 'Uptime Kuma',    icon: '💓', port: 3001, path: '',       cf: 'uptime'   },
  { id: 2,  cat: 'monitoring', name: 'Netdata',         icon: '📊', port: 3004, path: '',       cf: 'netdata'  },
  { id: 3,  cat: 'monitoring', name: 'Node Exporter',   icon: '🔩', port: 3002, path: '',       cf: ''         },
  { id: 4,  cat: 'monitoring', name: 'cAdvisor',        icon: '🐳', port: 3003, path: '',       cf: ''         },
  { id: 5,  cat: 'network',    name: 'Pi-hole',         icon: '🛡️', port: 8080, path: '/admin', cf: 'pihole'   },
  { id: 6,  cat: 'network',    name: 'Nginx Proxy Mgr', icon: '🌐', port: 81,   path: '',       cf: 'npm'      },
  { id: 7,  cat: 'network',    name: 'Traefik',         icon: '🔀', port: 8085, path: '',       cf: 'traefik'  },
  { id: 8,  cat: 'media',      name: 'Jellyfin',        icon: '🎬', port: 3011, path: '',       cf: 'jellyfin' },
  { id: 9,  cat: 'media',      name: 'Navidrome',       icon: '🎵', port: 3007, path: '',       cf: 'music'    },
  { id: 10, cat: 'media',      name: 'Sonarr',          icon: '📺', port: 3013, path: '',       cf: 'sonarr'   },
  { id: 11, cat: 'media',      name: 'Radarr',          icon: '🎞️', port: 3014, path: '',       cf: 'radarr'   },
  { id: 12, cat: 'media',      name: 'Lidarr',          icon: '🎸', port: 3010, path: '',       cf: 'lidarr'   },
  { id: 13, cat: 'media',      name: 'Prowlarr',        icon: '🔍', port: 3015, path: '',       cf: 'prowlarr' },
  { id: 14, cat: 'media',      name: 'Transmission',    icon: '⬇️', port: 3016, path: '',       cf: ''         },
  { id: 15, cat: 'media',      name: 'slskd',           icon: '🎶', port: 3008, path: '',       cf: ''         },
  { id: 16, cat: 'media',      name: 'Beets',           icon: '🌿', port: 3017, path: '',       cf: ''         },
  { id: 17, cat: 'photos',     name: 'Immich',          icon: '📸', port: 2283, path: '',       cf: 'photos'   },
  { id: 18, cat: 'ai',         name: 'InvokeAI',        icon: '🤖', port: 9999, path: '',       cf: 'invokeai' },
]

export const useDashboardStore = defineStore('dashboard', () => {
  const cats  = ref(JSON.parse(localStorage.getItem('cats')) || DEF_CATS)
  const svcs  = ref(JSON.parse(localStorage.getItem('svcs')) || DEF_SVCS)
  const net   = ref('local')

  const catsWithSvcs = computed(() =>
    cats.value.filter(c => svcs.value.some(s => s.cat === c.id))
  )

  function svcsByCategory(catId) {
    return svcs.value.filter(s => s.cat === catId)
  }

  function svcURL(svc, n) {
    n = n ?? net.value
    if (n === 'cf') return svc.cf ? `https://${svc.cf}.${CFG.cf}${svc.path}` : null
    return `http://${n === 'local' ? CFG.local : CFG.ts}:${svc.port}${svc.path}`
  }

  function persist() {
    localStorage.setItem('cats', JSON.stringify(cats.value))
    localStorage.setItem('svcs', JSON.stringify(svcs.value))
  }

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
    cats.value = JSON.parse(JSON.stringify(DEF_CATS))
    svcs.value = JSON.parse(JSON.stringify(DEF_SVCS))
    persist()
  }

  return { cats, svcs, net, catsWithSvcs, svcsByCategory, svcURL, persist, addSvc, editSvc, deleteSvc, addCat, resetData }
})
