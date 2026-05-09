#!/usr/bin/env node
/**
 * scan.js — Discover Docker containers and write services.json
 *
 * Usage:  node scan.js
 * Output: ./services.json  (mounted into the dashboard container)
 *
 * After running, rebuild + redeploy:
 *   docker compose up --build -d
 */

// ─── CONFIGURE THESE (per server) ───────────────────────────────────────────
const CONFIG = {
  local: '192.168.0.170',               // LAN IP of this server
  ts:    'yourserver.tailnet.ts.net',   // Full Tailscale hostname or IP (e.g. 100.x.x.x)
  live: {
    host:  'yourdomain.com',            // Root domain or base host for live access
    https: true,                        // Use HTTPS for live links
    mode:  'subdomain',                 // 'subdomain' → https://sub.host  |  'port' → https://host:port
  },
}
// ─────────────────────────────────────────────────────────────────────────────

import { execSync }  from 'child_process'
import { readFileSync, writeFileSync, existsSync } from 'fs'

// Known container name → service metadata
const KNOWN = {
  // Monitoring
  'uptime-kuma':    { name: 'Uptime Kuma',    cat: 'monitoring', icon: 'simple-icons:uptimekuma',     cf: 'uptime'    },
  'netdata':        { name: 'Netdata',         cat: 'monitoring', icon: 'simple-icons:netdata',         cf: 'netdata'   },
  'scrutiny':       { name: 'Scrutiny',        cat: 'monitoring', icon: 'lucide:hard-drive',            cf: ''          },
  'beszel':         { name: 'Beszel',          cat: 'monitoring', icon: 'lucide:monitor-dot',           cf: ''          },
  'goaccess':       { name: 'GoAccess',        cat: 'monitoring', icon: 'lucide:chart-no-axes-column',  cf: ''          },
  'node-exporter':  { name: 'Node Exporter',   cat: 'monitoring', icon: 'simple-icons:prometheus',      cf: ''          },
  'cadvisor':       { name: 'cAdvisor',        cat: 'monitoring', icon: 'simple-icons:docker',          cf: ''          },
  'prometheus':     { name: 'Prometheus',      cat: 'monitoring', icon: 'simple-icons:prometheus',      cf: ''          },
  'grafana':        { name: 'Grafana',         cat: 'monitoring', icon: 'simple-icons:grafana',         cf: 'grafana'   },
  // Network
  'nginx-proxy-manager': { name: 'Nginx Proxy Mgr', cat: 'network', icon: 'simple-icons:nginx',      cf: 'npm'       },
  'npm':            { name: 'Nginx Proxy Mgr', cat: 'network', icon: 'simple-icons:nginx',             cf: 'npm'       },
  'portainer':      { name: 'Portainer',       cat: 'network', icon: 'simple-icons:portainer',         cf: 'portainer' },
  'pihole':         { name: 'Pi-hole',         cat: 'network', icon: 'simple-icons:pihole',            cf: 'pihole'    },
  'traefik':        { name: 'Traefik',         cat: 'network', icon: 'simple-icons:traefikproxy',      cf: 'traefik'   },
  'flaresolverr':   { name: 'FlareSolverr',    cat: 'network', icon: 'lucide:shield',                  cf: ''          },
  'adguard':        { name: 'AdGuard',         cat: 'network', icon: 'simple-icons:adguard',           cf: 'adguard'   },
  'wireguard':      { name: 'WireGuard',       cat: 'network', icon: 'simple-icons:wireguard',         cf: ''          },
  // Media
  'jellyfin':       { name: 'Jellyfin',        cat: 'media', icon: 'simple-icons:jellyfin',            cf: 'jellyfin'  },
  'plex':           { name: 'Plex',            cat: 'media', icon: 'simple-icons:plex',                cf: 'plex'      },
  'navidrome':      { name: 'Navidrome',       cat: 'media', icon: 'lucide:music-2',                   cf: 'music'     },
  'sonarr':         { name: 'Sonarr',          cat: 'media', icon: 'simple-icons:sonarr',              cf: 'sonarr'    },
  'radarr':         { name: 'Radarr',          cat: 'media', icon: 'simple-icons:radarr',              cf: 'radarr'    },
  'lidarr':         { name: 'Lidarr',          cat: 'media', icon: 'lucide:disc-3',                    cf: 'lidarr'    },
  'prowlarr':       { name: 'Prowlarr',        cat: 'media', icon: 'lucide:search',                    cf: 'prowlarr'  },
  'bazarr':         { name: 'Bazarr',          cat: 'media', icon: 'lucide:captions',                  cf: ''          },
  'transmission':   { name: 'Transmission',    cat: 'media', icon: 'simple-icons:transmission',        cf: ''          },
  'qbittorrent':    { name: 'qBittorrent',     cat: 'media', icon: 'simple-icons:qbittorrent',         cf: ''          },
  'slskd':          { name: 'slskd',           cat: 'media', icon: 'lucide:music',                     cf: ''          },
  'restreamer':     { name: 'Restreamer',      cat: 'media', icon: 'lucide:radio',                     cf: ''          },
  'beets':          { name: 'Beets',           cat: 'media', icon: 'lucide:tag',                       cf: ''          },
  // Books
  'kavita':         { name: 'Kavita',          cat: 'books', icon: 'lucide:book-open',                 cf: ''          },
  'booklore':       { name: 'Booklore',        cat: 'books', icon: 'lucide:library',                   cf: ''          },
  'calibre':        { name: 'Calibre',         cat: 'books', icon: 'lucide:book-open',                 cf: ''          },
  // Photos
  'immich':         { name: 'Immich',          cat: 'photos', icon: 'simple-icons:immich',             cf: 'photos'    },
  'immich-server':  { name: 'Immich',          cat: 'photos', icon: 'simple-icons:immich',             cf: 'photos'    },
  'nextcloud':      { name: 'Nextcloud',       cat: 'photos', icon: 'simple-icons:nextcloud',          cf: ''          },
  'syncthing':      { name: 'Syncthing',       cat: 'photos', icon: 'simple-icons:syncthing',          cf: ''          },
  // AI
  'invokeai':       { name: 'InvokeAI',        cat: 'ai',    icon: 'lucide:bot',                       cf: 'invokeai'  },
  'ollama':         { name: 'Ollama',          cat: 'ai',    icon: 'lucide:bot',                       cf: ''          },
  'open-webui':     { name: 'Open WebUI',      cat: 'ai',    icon: 'lucide:bot',                       cf: ''          },
  'vaultwarden':    { name: 'Vaultwarden',     cat: 'network', icon: 'simple-icons:vaultwarden',       cf: ''          },
  'gitea':          { name: 'Gitea',           cat: 'network', icon: 'simple-icons:gitea',             cf: ''          },
  'homeassistant':  { name: 'Home Assistant',  cat: 'network', icon: 'simple-icons:homeassistant',     cf: ''          },
}

function scanContainers() {
  try {
    const raw = execSync(
      "docker ps --format '{{.Names}}\\t{{.Ports}}'",
      { encoding: 'utf8' }
    ).trim()
    if (!raw) return []
    return raw.split('\n').map(line => {
      const [name, ports] = line.split('\t')
      return { name: name.trim(), ports: ports?.trim() || '' }
    })
  } catch {
    console.error('Could not run docker ps — is Docker installed and running?')
    return []
  }
}

function extractPort(portsStr) {
  // Parse "0.0.0.0:3001->3001/tcp" → 3001
  const match = portsStr.match(/(?:0\.0\.0\.0:|:::)(\d+)->/)
  return match ? parseInt(match[1], 10) : null
}

function normalize(containerName) {
  return containerName.toLowerCase().replace(/[_\s]+/g, '-')
}

function buildServices(containers, existingSvcs) {
  const existingByName = new Map(existingSvcs.map(s => [s.name.toLowerCase(), s]))
  const seen = new Set()
  const services = []

  for (const ct of containers) {
    const key = normalize(ct.name)

    // Skip the dashboard container itself
    if (key === 'dashboard' || key.includes('homeserverdash')) continue

    const meta = KNOWN[key]
    const port = extractPort(ct.ports)

    if (!port) continue // no exposed port, skip

    if (meta) {
      seen.add(meta.name.toLowerCase())
      const existing = existingByName.get(meta.name.toLowerCase())
      services.push({
        id:     existing?.id   ?? Date.now() + services.length,
        cat:    existing?.cat  ?? meta.cat,
        name:   existing?.name ?? meta.name,
        icon:   existing?.icon ?? meta.icon,
        port,
        path:   existing?.path ?? '',
        cf:     existing?.cf   ?? meta.cf,
        source: 'scan',
      })
    } else {
      // Unknown container — add generically under "network"
      const displayName = ct.name.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
      seen.add(displayName.toLowerCase())
      const existing = existingByName.get(displayName.toLowerCase())
      services.push({
        id:     existing?.id   ?? Date.now() + services.length,
        cat:    existing?.cat  ?? 'network',
        name:   existing?.name ?? displayName,
        icon:   existing?.icon ?? 'lucide:server',
        port,
        path:   existing?.path ?? '',
        cf:     existing?.cf   ?? '',
        source: 'scan',
      })
    }
  }

  // Preserve only manually-added services that weren't found in this docker scan.
  // scan-sourced services from a previous run (or copied from another machine) are dropped.
  for (const svc of existingSvcs) {
    if (!seen.has(svc.name.toLowerCase()) && svc.source !== 'scan') {
      services.push(svc)
    }
  }

  return services
}

// ─── Main ────────────────────────────────────────────────────────────────────

const outPath = new URL('./services.json', import.meta.url).pathname

let existing = { config: {}, cats: [], services: [] }
if (existsSync(outPath)) {
  try { existing = JSON.parse(readFileSync(outPath, 'utf8')) } catch {}
}

const containers = scanContainers()
console.log(`Found ${containers.length} running containers`)

const services = buildServices(containers, existing.services ?? [])
console.log(`Built ${services.length} services`)

const out = {
  config: {
    local: CONFIG.local,
    ts:    CONFIG.ts,
    live:  CONFIG.live,
  },
  cats: existing.cats.length ? existing.cats : [
    { id: 'monitoring', label: 'Monitoring', icon: 'lucide:activity',  color: '#22d3ee' },
    { id: 'network',    label: 'Network',    icon: 'lucide:network',   color: '#4ade80' },
    { id: 'media',      label: 'Media',      icon: 'lucide:film',      color: '#a78bfa' },
    { id: 'books',      label: 'Books',      icon: 'lucide:book-open', color: '#f59e0b' },
    { id: 'photos',     label: 'Photos',     icon: 'lucide:image',     color: '#f472b6' },
    { id: 'ai',         label: 'AI',         icon: 'lucide:bot',       color: '#fb923c' },
  ],
  services,
}

writeFileSync(outPath, JSON.stringify(out, null, 2))
console.log(`✓ Written → ${outPath}`)
console.log('\nServices:')
for (const s of services) {
  console.log(`  [${s.cat}] ${s.name} :${s.port}`)
}
console.log('\nNext: docker compose up --build -d')
