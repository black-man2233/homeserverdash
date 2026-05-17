# homeserverdash — Claude context

## What this is
A personal home server dashboard. Shows all self-hosted Docker services as clickable cards grouped by category. Supports three network modes: Local LAN, Tailscale VPN, and Live (Cloudflare subdomains).

## Stack
- Vue 3 + Vite + Pinia (no TypeScript)
- Icons: `@iconify/vue` — format is `"simple-icons:jellyfin"` or `"lucide:music-2"`
- Served by Nginx inside Docker (multistage build)
- Host port: **8020**

## Deploy command — ALWAYS use this after any change
```bash
docker compose build --no-cache && docker compose up -d && docker image prune -f
```
- `--no-cache` is mandatory — regular `--build` reuses Docker cache and silently skips file changes
- Prune clears leftover dangling images after rebuild

## Key files
| File | Role |
|---|---|
| `services.json` | Runtime config — network addresses + service list. Mounted as Docker volume. **Gitignored — copy from services.example.json** |
| `services.example.json` | Safe template to copy on a fresh deploy |
| `src/config.js` | Fallback network config if services.json isn't loaded. Has placeholder values — update locally, never commit real values |
| `scan.js` | Node script — runs `docker ps`, auto-builds services.json |
| `src/stores/dashboard.js` | Pinia store — loads services.json, persists to localStorage, all CRUD |
| `src/stores/ui.js` | Modal open/close state only |
| `src/composables/useSeason.js` | Seasonal accent colours by month (spring/summer/autumn/winter) |
| `docker-compose.yml` | Dashboard container only — mounts services.json as read-only volume |
| `Dockerfile` | Multistage: node:20-alpine builds Vite → nginx:alpine serves dist |

## services.json schema
```json
{
  "config": {
    "local": "192.168.x.x",
    "ts": "yourserver.tailnet.ts.net",
    "live": { "host": "yourdomain.com", "https": true, "mode": "subdomain" }
  },
  "cats": [
    { "id": "monitoring", "label": "Monitoring", "icon": "lucide:activity", "color": "#22d3ee" }
  ],
  "services": [
    { "id": 1234, "cat": "monitoring", "name": "Beszel", "icon": "lucide:monitor-dot", "port": 3031, "path": "", "cf": "" }
  ]
}
```
- `cf` = Cloudflare subdomain slug (empty = no live URL, shows "no url" badge)
- `path` = URL suffix e.g. `/admin`
- `source: "scan"` = auto-added by scan.js (dropped on next scan if container is gone)

## Data flow
1. Dashboard fetches `/services.json` at runtime
2. Pinia store: if localStorage empty → seeds from services.json; otherwise uses localStorage
3. Network mode toggle (local / ts / live) changes URL generation in `svcURL()`
4. User edits (add/edit/delete) persist to localStorage only
5. Reset button restores from services.json snapshot

## Categories (default)
`monitoring`, `network`, `media`, `books`, `photos`, `ai`

## Seasonal theming
`useSeason.js` sets CSS vars `--acc` and `--acc2` on `<html>` + `data-season` attribute:
- Spring (Mar–May): green + pink
- Summer (Jun–Aug): amber + cyan
- Autumn (Sep–Nov): orange + purple
- Winter (Dec–Feb): blue + lavender

## Adding / updating services
Option A — Edit `services.json` directly, then redeploy.  
Option B — Run `node scan.js` to auto-detect all running Docker containers, then redeploy.

## Fresh deploy on a new machine
```bash
cp services.example.json services.json
# Edit services.json: fill in your LAN IP, Tailscale hostname, domain
# Also update src/config.js with your real values (used as fallback)
node scan.js   # optional: auto-populate from running containers
docker compose build --no-cache && docker compose up -d && docker image prune -f
```

## Security / .gitignore
- `services.json` — gitignored (has real IPs/hostnames)
- `node_modules/`, `dist/`, `.claude/`, `.env*` — all gitignored
- `src/config.js` — tracked but must keep placeholder values in git; update locally only
- The big docker-compose.yml with VPN/service passwords lives outside this repo — keep it there

## Known services on Kevin's server (reference)
| Container | Port | Category |
|---|---|---|
| beszel | 3031 | monitoring |
| goaccess | 8081 | monitoring |
| speedtest-tracker | 8766 | monitoring |
| myspeed | 8765 | monitoring |
| nginx-proxy-manager | 443 | network |
| portainer | 9443 | network |
| flaresolverr | 3019 | network (via VPN) |
| sc-dev-dashboard | 5174 | network |
| navidrome | 3007 | media (cf: music) |
| jellyfin | 3011 | media (cf: jellyfin) |
| sonarr | 3013 | media (cf: sonarr) |
| radarr | 3014 | media (cf: radarr) |
| lidarr | 3010 | media (cf: lidarr) |
| prowlarr | 3015 | media (via VPN) |
| bazarr | 3020 | media |
| transmission | 3016 | media (via VPN) |
| slskd | 3008 | media (via VPN, Soulseek) |
| beets | 3017 | media |
| kavita | 3022 | books |
| booklore | 6060 | books |
| audiomuse | 3021 | ai |

VPN-routed (Gluetun/NordVPN): transmission, slskd, prowlarr, flaresolverr — ports exposed via the `vpn` container.
