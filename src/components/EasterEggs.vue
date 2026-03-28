<template>
  <div class="ee-root">
    <!-- Toast notifications -->
    <div class="ee-toasts">
      <TransitionGroup name="ee-toast">
        <div v-for="t in toasts" :key="t.id" class="ee-toast">{{ t.msg }}</div>
      </TransitionGroup>
    </div>

    <!-- Matrix rain canvas -->
    <canvas v-if="matrixActive" ref="matrixEl" class="ee-canvas" />

    <!-- Party confetti canvas -->
    <canvas v-if="partyActive" ref="partyEl" class="ee-canvas ee-party-canvas" />

    <!-- Disco strobe overlay -->
    <div v-if="discoActive" class="disco-overlay" />

    <!-- Hack terminal -->
    <div v-if="hackActive" ref="hackEl" class="hack-terminal">
      <div class="hack-title">▶ COOLSERVER — ACCESS GRANTED — LEVEL 9</div>
      <pre ref="hackLogEl" class="hack-log"></pre>
    </div>

    <!-- 404 glitch -->
    <div v-if="e404Active" class="glitch-404">
      <div class="g404-main" data-text="404">404</div>
      <div class="g404-sub">PAGE NOT FOUND<br><em>…just kidding 😏</em></div>
    </div>

    <!-- FPS overlay -->
    <div v-if="fpsActive" class="fps-overlay">⚡ {{ fps }} fps</div>

    <!-- Readme modal -->
    <Transition name="backdrop">
      <div v-if="showReadme" class="ee-backdrop" @click.self="showReadme = false">
        <Transition name="modal" appear>
          <div v-if="showReadme" class="readme-modal">
            <div class="readme-hdr">
              <div class="readme-title">🥚 Easter Eggs</div>
              <button class="readme-close" @click="showReadme = false">✕</button>
            </div>
            <p class="readme-intro">
              <strong>{{ EGGS.length }}</strong> secrets are hidden in coolserver.<br>
              <span class="found-ct">Found: {{ found.size }}/{{ EGGS.length }}</span>
              <span v-if="found.size === EGGS.length" class="all-found">🏆 COMPLETE!</span>
            </p>
            <div class="egg-list">
              <div
                v-for="egg in EGGS" :key="egg.id"
                class="egg-entry"
                :class="{ found: found.has(egg.id) }"
              >
                <span class="egg-check">{{ found.has(egg.id) ? '✓' : '○' }}</span>
                <div class="egg-info">
                  <div class="egg-trigger">{{ egg.trigger }}</div>
                  <div class="egg-desc">{{ egg.desc }}</div>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import { gsap } from 'gsap'

// ── Easter egg catalogue ──
const EGGS = [
  { id: 'konami',      trigger: '↑ ↑ ↓ ↓ ← → ← → B A',            desc: 'The legendary cheat code' },
  { id: 'matrix',      trigger: 'Type  "matrix"',                    desc: 'There is no spoon' },
  { id: 'party',       trigger: 'Type  "party"',                     desc: 'Let\'s celebrate 🎉' },
  { id: 'disco',       trigger: 'Type  "disco"',                     desc: '🕺 Saturday Night Fever' },
  { id: 'hack',        trigger: 'Type  "hack"',                      desc: 'Access the mainframe' },
  { id: 'coolserver',  trigger: 'Type  "coolserver"',                desc: 'Say the magic name' },
  { id: '404',         trigger: 'Type  "404"',                       desc: 'Something\'s missing...' },
  { id: 'dot5x',       trigger: 'Click the glowing dot  5×  fast',   desc: 'Persistence pays off' },
  { id: 'shake',       trigger: 'Shake your mouse rapidly',          desc: 'The cards got dizzy' },
  { id: 'idle',        trigger: 'Go AFK for 60 seconds',             desc: 'Still here? 😴' },
  { id: 'dblclick',    trigger: 'Double-click the star background',  desc: 'Create a supernova 💥' },
  { id: 'f2',          trigger: 'Press F2',                          desc: 'For devs only 🧑‍💻' },
  { id: 'readme',      trigger: 'Type "?" or press Shift+/',         desc: 'You found the guide!' },
]

// ── Toast system ──
const toasts = ref([])
let toastId = 0
function toast(msg, dur = 3500) {
  const id = ++toastId
  toasts.value.push({ id, msg })
  setTimeout(() => { toasts.value = toasts.value.filter(t => t.id !== id) }, dur)
}

// ── Found tracking (persisted) ──
const found = reactive(new Set(
  (() => { try { return JSON.parse(localStorage.getItem('ee_found') || '[]') } catch { return [] } })()
))
function markFound(id) {
  if (!found.has(id)) {
    found.add(id)
    try { localStorage.setItem('ee_found', JSON.stringify([...found])) } catch {}
  }
}

// ── State flags ──
const matrixActive = ref(false)
const partyActive  = ref(false)
const discoActive  = ref(false)
const hackActive   = ref(false)
const e404Active   = ref(false)
const fpsActive    = ref(false)
const showReadme   = ref(false)
const fps          = ref(0)

const matrixEl  = ref(null)
const partyEl   = ref(null)
const hackEl    = ref(null)
const hackLogEl = ref(null)

// ── Konami tracker ──
const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a']
let konamiIdx = 0

// ── Word buffer ──
let wordBuf = ''

// ── Brand dot 5x click ──
let dotClicks = 0, dotResetTimer = null

// ── Mouse shake ──
let lastMX = 0, lastMY = 0, shakeCount = 0, shakeResetTimer = null

// ── Idle screensaver ──
const IDLE_MS = 60000
let idleTimer = null, idleActive = false

// ── FPS counter ──
let fpsFrameCount = 0, fpsLastTime = 0, fpsRafId = null
function runFPS() {
  fpsFrameCount++
  const now = performance.now()
  if (now - fpsLastTime >= 1000) {
    fps.value = fpsFrameCount
    fpsFrameCount = 0
    fpsLastTime = now
  }
  if (fpsActive.value) fpsRafId = requestAnimationFrame(runFPS)
}

// ── Disco interval ──
let discoInterval = null

// ────────────────────────────────────────
//  Easter egg triggers
// ────────────────────────────────────────

function startMatrix() {
  if (matrixActive.value) return
  markFound('matrix')
  toast('💊 There is no spoon…')
  matrixActive.value = true
  nextTick(() => {
    const cv = matrixEl.value
    if (!cv) return
    cv.width = window.innerWidth; cv.height = window.innerHeight
    const cx = cv.getContext('2d')
    const cols = Math.floor(cv.width / 14)
    const drops = Array(cols).fill(1)
    let rafId
    function step() {
      cx.fillStyle = 'rgba(4,4,11,0.05)'
      cx.fillRect(0, 0, cv.width, cv.height)
      cx.fillStyle = '#00ff41'; cx.font = '13px monospace'
      drops.forEach((y, i) => {
        cx.fillText(String.fromCharCode(0x30A0 + Math.random() * 96), i * 14, y * 14)
        if (y * 14 > cv.height && Math.random() > 0.975) drops[i] = 0
        drops[i]++
      })
      if (matrixActive.value) rafId = requestAnimationFrame(step)
      else cancelAnimationFrame(rafId)
    }
    rafId = requestAnimationFrame(step)
  })
  setTimeout(() => { matrixActive.value = false }, 7000)
}

function startParty() {
  if (partyActive.value) return
  markFound('party')
  toast('🎉 PARTY TIME! 🥳')
  partyActive.value = true
  gsap.to('.service-card', {
    y: -10, duration: 0.2, stagger: { amount: 0.5, from: 'random' },
    ease: 'power2.out', yoyo: true, repeat: 3,
  })
  nextTick(() => {
    const cv = partyEl.value
    if (!cv) return
    cv.width = window.innerWidth; cv.height = window.innerHeight
    const cx = cv.getContext('2d')
    const pieces = Array.from({ length: 200 }, () => ({
      x: Math.random() * cv.width, y: -20 - Math.random() * cv.height * 0.4,
      vx: (Math.random() - 0.5) * 5, vy: 2.5 + Math.random() * 5,
      w: 6 + Math.random() * 10, h: 4 + Math.random() * 8,
      rot: Math.random() * 360, rotV: (Math.random() - 0.5) * 10,
      hue: Math.random() * 360,
    }))
    let rafId
    function step() {
      cx.clearRect(0, 0, cv.width, cv.height)
      let alive = false
      pieces.forEach(p => {
        if (p.y > cv.height + 20) return
        alive = true
        p.x += p.vx; p.y += p.vy; p.vy += 0.07; p.rot += p.rotV
        cx.save()
        cx.translate(p.x, p.y); cx.rotate(p.rot * Math.PI / 180)
        cx.fillStyle = `hsl(${p.hue},80%,60%)`
        cx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
        cx.restore()
      })
      if (alive && partyActive.value) rafId = requestAnimationFrame(step)
      else { cancelAnimationFrame(rafId); partyActive.value = false }
    }
    rafId = requestAnimationFrame(step)
  })
  setTimeout(() => { partyActive.value = false }, 9000)
}

function startDisco() {
  if (discoActive.value) return
  markFound('disco')
  toast('🕺 DISCO MODE ACTIVATED 🪩')
  discoActive.value = true
  let hue = 0
  discoInterval = setInterval(() => {
    hue = (hue + 45) % 360
    const cards = document.querySelectorAll('.service-card')
    gsap.to(cards, {
      boxShadow: `0 0 30px hsl(${hue},90%,60%), 0 0 60px hsl(${(hue+120)%360},90%,50%)`,
      duration: 0.25, stagger: 0.02, ease: 'none',
    })
  }, 350)
  setTimeout(() => {
    clearInterval(discoInterval); discoInterval = null
    discoActive.value = false
    gsap.to('.service-card', { boxShadow: '', duration: 0.6 })
  }, 9000)
}

const HACK_LINES = [
  'Initializing breach protocol v4.2.0 ...',
  'Scanning 192.168.0.0/24 for open ports ...',
  'Found target: coolserver.local',
  'Loading exploit: CVE-2024-LEET ...',
  'sudo access granted (obviously) ✓',
  'Mounting /dev/sda1 ...',
  'Dumping /etc/shadow ...',
  'root:$6$Wt7m...:[redacted]',
  'coolserver:$6$Xp2n...:[redacted]',
  'Establishing encrypted tunnel — latency: 3ms',
  'Deploying payload ...',
  'Mining $COOL tokens ... 0.00001 mined',
  'Staging rickroll.sh ...',
  '  ♪ Never gonna give you up ♪',
  '  ♪ Never gonna let you down ♪',
  '',
  '██████  You found the HACK egg! ██████',
]

function startHack() {
  if (hackActive.value) return
  markFound('hack')
  toast('💻 ACCESS GRANTED')
  hackActive.value = true
  nextTick(() => {
    if (hackEl.value) gsap.from(hackEl.value, { y: '100%', duration: 0.5, ease: 'power3.out' })
    if (!hackLogEl.value) return
    let i = 0
    const iv = setInterval(() => {
      if (!hackLogEl.value) { clearInterval(iv); return }
      if (i < HACK_LINES.length) {
        hackLogEl.value.textContent += HACK_LINES[i] + '\n'
        hackLogEl.value.scrollTop = hackLogEl.value.scrollHeight
        i++
      } else {
        clearInterval(iv)
        setTimeout(() => {
          if (hackEl.value) {
            gsap.to(hackEl.value, {
              y: '100%', opacity: 0, duration: 0.4, ease: 'power2.in',
              onComplete: () => { hackActive.value = false },
            })
          }
        }, 2500)
      }
    }, 180)
  })
}

function startCoolserver() {
  markFound('coolserver')
  toast('🌈 You named it well.')
  const cards = document.querySelectorAll('.service-card')
  const hues = [0, 30, 60, 120, 180, 240, 300]
  hues.forEach((h, step) => {
    gsap.to(cards, {
      boxShadow: `0 0 20px hsl(${h},90%,60%)`,
      borderColor: `hsl(${h},90%,60%)50`,
      duration: 0.22, delay: step * 0.22, stagger: 0.025, ease: 'none',
    })
  })
  gsap.to(cards, { boxShadow: '', borderColor: '', duration: 0.5, delay: hues.length * 0.22 + 0.1 })
}

function start404() {
  if (e404Active.value) return
  markFound('404')
  toast('🚧 404 — but you found this!')
  e404Active.value = true
  setTimeout(() => { e404Active.value = false }, 3200)
}

function startKonami() {
  markFound('konami')
  toast('⬆⬆⬇⬇⬅➡⬅➡🅱🅰 CHEAT ACTIVATED!', 4500)
  const cx = window.innerWidth / 2, cy = window.innerHeight / 2
  for (let i = 0; i < 100; i++) {
    const el = document.createElement('div')
    const size = 4 + Math.random() * 8
    Object.assign(el.style, {
      position: 'fixed', left: `${cx - size / 2}px`, top: `${cy - size / 2}px`,
      width: `${size}px`, height: `${size}px`,
      borderRadius: '50%',
      background: `hsl(${Math.random() * 360},90%,65%)`,
      pointerEvents: 'none', zIndex: '9999',
    })
    document.body.appendChild(el)
    const ang = Math.random() * Math.PI * 2
    const dist = 120 + Math.random() * 350
    gsap.fromTo(el,
      { x: 0, y: 0, scale: 0, opacity: 1 },
      { x: Math.cos(ang) * dist, y: Math.sin(ang) * dist, scale: 1, opacity: 0,
        duration: 0.9 + Math.random() * 0.7, ease: 'power2.out', onComplete: () => el.remove() }
    )
  }
  gsap.to('.service-card', {
    y: -12, rotation: (i) => (i % 2 === 0 ? 4 : -4),
    duration: 0.2, ease: 'power2.out',
    stagger: { amount: 0.5, from: 'random' },
    yoyo: true, repeat: 1,
  })
}

function triggerDot5x() {
  dotClicks++
  clearTimeout(dotResetTimer)
  dotResetTimer = setTimeout(() => { dotClicks = 0 }, 1800)
  if (dotClicks < 5) return
  dotClicks = 0
  markFound('dot5x')
  toast('💥 You unleashed the dot!')
  const dot = document.querySelector('.brand-dot')
  if (dot) {
    gsap.to(dot, {
      scale: 35, opacity: 0, duration: 0.6, ease: 'power3.in',
      onComplete: () => gsap.set(dot, { scale: 1, opacity: 1 }),
    })
    const r = dot.getBoundingClientRect()
    const px = r.left + r.width / 2, py = r.top + r.height / 2
    for (let i = 0; i < 50; i++) {
      const el = document.createElement('div')
      const s = 3 + Math.random() * 6
      Object.assign(el.style, {
        position: 'fixed', left: `${px - s / 2}px`, top: `${py - s / 2}px`,
        width: `${s}px`, height: `${s}px`, borderRadius: '50%',
        background: 'var(--acc)', boxShadow: '0 0 8px var(--acc)',
        pointerEvents: 'none', zIndex: '9999',
      })
      document.body.appendChild(el)
      const ang = Math.random() * Math.PI * 2, d = 60 + Math.random() * 200
      gsap.fromTo(el,
        { x: 0, y: 0, opacity: 1, scale: 1 },
        { x: Math.cos(ang) * d, y: Math.sin(ang) * d, opacity: 0, scale: 0,
          duration: 0.8, ease: 'power2.out', onComplete: () => el.remove() }
      )
    }
  }
}

function triggerShake() {
  markFound('shake')
  toast('😵 Woah, dizzy cards!')
  gsap.to('.service-card', {
    x: () => (Math.random() - 0.5) * 22,
    y: () => (Math.random() - 0.5) * 22,
    rotation: () => (Math.random() - 0.5) * 12,
    duration: 0.14, stagger: 0.015, ease: 'power2.out',
    yoyo: true, repeat: 4,
    onComplete: () => gsap.to('.service-card', { x: 0, y: 0, rotation: 0, duration: 0.5, ease: 'back.out(1.4)' }),
  })
}

function startIdle() {
  if (idleActive) return
  idleActive = true
  markFound('idle')
  toast('😴 Screensaver mode…  (move mouse to wake)')
  gsap.to('.service-card', {
    y: 60, opacity: 0, scale: 0.85,
    duration: 2, stagger: { amount: 1.2, from: 'random' }, ease: 'power2.inOut',
  })
  gsap.to('.sec-head, .toolbar, .app-header', { opacity: 0.08, duration: 1.5 })
}

function wakeFromIdle() {
  if (!idleActive) return
  idleActive = false
  gsap.to('.service-card', {
    y: 0, opacity: 1, scale: 1,
    duration: 0.8, stagger: { amount: 0.6, from: 'random' }, ease: 'back.out(1.6)',
  })
  gsap.to('.sec-head, .toolbar, .app-header', { opacity: 1, duration: 0.5 })
}

function resetIdleTimer() {
  if (idleActive) wakeFromIdle()
  clearTimeout(idleTimer)
  idleTimer = setTimeout(startIdle, IDLE_MS)
}

function triggerDblClick(e) {
  if ((e.target).closest('.service-card,.btn,.app-header,.toolbar,.overlay')) return
  markFound('dblclick')
  const { clientX: x, clientY: y } = e
  const colors = ['#7c3aed','#06b6d4','#f59e0b','#10b981','#ef4444','#8b5cf6']
  for (let i = 0; i < 7; i++) {
    const size = 50 + i * 55
    const ring = document.createElement('div')
    Object.assign(ring.style, {
      position: 'fixed',
      left: `${x - size / 2}px`, top: `${y - size / 2}px`,
      width: `${size}px`, height: `${size}px`,
      borderRadius: '50%', border: `2px solid ${colors[i % colors.length]}`,
      pointerEvents: 'none', zIndex: '8999',
    })
    document.body.appendChild(ring)
    gsap.fromTo(ring,
      { scale: 0, opacity: 0.9 },
      { scale: 2.5, opacity: 0, duration: 1.1, delay: i * 0.09, ease: 'power2.out',
        transformOrigin: '50% 50%', onComplete: () => ring.remove() }
    )
  }
  for (let i = 0; i < 40; i++) {
    const p = document.createElement('div')
    const s = 2 + Math.random() * 5
    Object.assign(p.style, {
      position: 'fixed', left: `${x - s / 2}px`, top: `${y - s / 2}px`,
      width: `${s}px`, height: `${s}px`, borderRadius: '50%',
      background: colors[Math.floor(Math.random() * colors.length)],
      pointerEvents: 'none', zIndex: '9000',
    })
    document.body.appendChild(p)
    const ang = Math.random() * Math.PI * 2, d = 60 + Math.random() * 180
    gsap.fromTo(p,
      { x: 0, y: 0, opacity: 1 },
      { x: Math.cos(ang) * d, y: Math.sin(ang) * d, opacity: 0, scale: 0,
        duration: 0.9, ease: 'power2.out', onComplete: () => p.remove() }
    )
  }
}

// ── Key handler ──
function onKeyDown(e) {
  const tag = e.target.tagName
  if ((tag === 'INPUT' || tag === 'TEXTAREA') && e.key !== 'Escape') return

  // Konami
  if (e.key === KONAMI[konamiIdx]) { konamiIdx++; if (konamiIdx === KONAMI.length) { konamiIdx = 0; startKonami() } }
  else konamiIdx = 0

  // F2
  if (e.key === 'F2') {
    e.preventDefault()
    fpsActive.value = !fpsActive.value
    if (fpsActive.value) { markFound('f2'); toast('⚡ FPS counter ON'); fpsLastTime = performance.now(); requestAnimationFrame(runFPS) }
    else { toast('⚡ FPS counter OFF'); cancelAnimationFrame(fpsRafId) }
    return
  }

  // Shift+? opens readme
  if (e.shiftKey && e.key === '?') {
    showReadme.value = !showReadme.value
    if (showReadme.value) markFound('readme')
    return
  }

  // Word buffer
  if (e.key.length === 1) wordBuf = (wordBuf + e.key.toLowerCase()).slice(-15)
  if (e.key === 'Escape') { wordBuf = ''; return }

  if      (wordBuf.endsWith('matrix'))     { wordBuf = ''; startMatrix() }
  else if (wordBuf.endsWith('party'))      { wordBuf = ''; startParty() }
  else if (wordBuf.endsWith('disco'))      { wordBuf = ''; startDisco() }
  else if (wordBuf.endsWith('hack'))       { wordBuf = ''; startHack() }
  else if (wordBuf.endsWith('coolserver')) { wordBuf = ''; startCoolserver() }
  else if (wordBuf.endsWith('404'))        { wordBuf = ''; start404() }
  else if (wordBuf.endsWith('?'))          { wordBuf = ''; showReadme.value = true; markFound('readme') }
}

// ── Mouse handlers ──
function onMouseMoveFx(e) {
  const dx = Math.abs(e.clientX - lastMX), dy = Math.abs(e.clientY - lastMY)
  if (dx + dy > 55) {
    shakeCount++
    clearTimeout(shakeResetTimer)
    shakeResetTimer = setTimeout(() => { shakeCount = 0 }, 1000)
    if (shakeCount >= 9) { shakeCount = 0; triggerShake() }
  }
  lastMX = e.clientX; lastMY = e.clientY
}

function onClick(e) {
  if ((e.target).closest('.brand-dot')) triggerDot5x()
}

// ── Lifecycle ──
onMounted(() => {
  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('mousemove', onMouseMoveFx, { passive: true })
  window.addEventListener('dblclick', triggerDblClick)
  window.addEventListener('click', onClick)
  // Idle reset on any activity
  window.addEventListener('mousemove', resetIdleTimer, { passive: true })
  window.addEventListener('keydown',   resetIdleTimer, { passive: true })
  window.addEventListener('click',     resetIdleTimer, { passive: true })
  resetIdleTimer()
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown)
  window.removeEventListener('mousemove', onMouseMoveFx)
  window.removeEventListener('dblclick', triggerDblClick)
  window.removeEventListener('click', onClick)
  window.removeEventListener('mousemove', resetIdleTimer)
  window.removeEventListener('keydown',   resetIdleTimer)
  window.removeEventListener('click',     resetIdleTimer)
  clearTimeout(idleTimer)
  clearTimeout(dotResetTimer)
  clearTimeout(shakeResetTimer)
  clearInterval(discoInterval)
  cancelAnimationFrame(fpsRafId)
})
</script>

<style scoped>
/* ── Canvas overlays ── */
.ee-canvas {
  position: fixed; inset: 0;
  width: 100vw; height: 100vh;
  pointer-events: none;
  z-index: 400;
}
.ee-party-canvas { z-index: 401 }

/* ── Disco overlay ── */
.disco-overlay {
  position: fixed; inset: 0;
  pointer-events: none;
  z-index: 390;
  background: transparent;
  animation: disco-strobe 0.35s steps(1) infinite;
}
@keyframes disco-strobe {
  0%   { background: rgba(255,0,128,0.04) }
  25%  { background: rgba(0,255,200,0.04) }
  50%  { background: rgba(255,200,0,0.04) }
  75%  { background: rgba(128,0,255,0.04) }
}

/* ── Hack terminal ── */
.hack-terminal {
  position: fixed; bottom: 0; left: 0; right: 0;
  max-height: 45vh;
  background: #000;
  border-top: 2px solid #00ff41;
  box-shadow: 0 -4px 40px #00ff4130;
  z-index: 450;
  padding: 0.75rem 1rem 1rem;
  font-family: 'Fira Code', 'SF Mono', monospace;
  overflow: hidden;
}
.hack-title {
  font-size: 0.72rem; color: #00ff41; font-weight: 700;
  letter-spacing: 0.1em; margin-bottom: 0.5rem; text-shadow: 0 0 8px #00ff41;
}
.hack-log {
  font-size: 0.7rem; color: #00cc33; line-height: 1.7;
  max-height: calc(45vh - 2.5rem); overflow-y: auto;
  white-space: pre-wrap;
}

/* ── 404 glitch ── */
.glitch-404 {
  position: fixed; inset: 0;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  pointer-events: none;
  z-index: 460;
}
.g404-main {
  font-size: 12rem; font-weight: 900;
  color: var(--text);
  position: relative;
  animation: g404-glitch 0.6s steps(2) infinite;
  text-shadow: 0 0 40px var(--acc);
  letter-spacing: -0.05em;
}
.g404-main::before, .g404-main::after {
  content: attr(data-text);
  position: absolute; top: 0; left: 0;
  width: 100%; height: 100%;
}
.g404-main::before {
  color: #06b6d4; left: 3px;
  clip-path: inset(30% 0 40% 0);
  animation: g404-shift 0.4s steps(2) infinite alternate;
}
.g404-main::after {
  color: #ef4444; left: -3px;
  clip-path: inset(60% 0 10% 0);
  animation: g404-shift 0.3s steps(2) infinite alternate-reverse;
}
.g404-sub {
  font-size: 0.9rem; color: var(--muted);
  letter-spacing: 0.15em; text-align: center;
  margin-top: 1rem;
  animation: fade-up 0.3s ease;
}
@keyframes g404-glitch {
  0%  { transform: skewX(0) }
  40% { transform: skewX(-1.5deg) }
  60% { transform: skewX(1.5deg) }
  100%{ transform: skewX(0) }
}
@keyframes g404-shift {
  0%   { transform: translateX(-4px) }
  100% { transform: translateX(4px) }
}

/* ── FPS overlay ── */
.fps-overlay {
  position: fixed; bottom: 1rem; right: 1rem;
  background: var(--surf2); border: 1px solid var(--bdr2);
  color: #00ff41; font-family: monospace; font-size: 0.75rem;
  padding: 0.3rem 0.6rem; border-radius: 8px;
  z-index: 9999; pointer-events: none;
  box-shadow: 0 0 12px #00ff4120;
}

/* ── Toasts ── */
.ee-toasts {
  position: fixed; bottom: 2rem; left: 50%; transform: translateX(-50%);
  z-index: 9998; display: flex; flex-direction: column; gap: 0.5rem;
  align-items: center; pointer-events: none;
}
.ee-toast {
  background: var(--surf2); border: 1px solid var(--bdr2);
  color: var(--text); padding: 0.5rem 1.1rem;
  border-radius: 100px; font-size: 0.82rem; font-weight: 600;
  white-space: nowrap;
  box-shadow: 0 4px 20px #00000060, 0 0 12px color-mix(in srgb, var(--acc) 20%, transparent);
}
.ee-toast-enter-active { transition: all 0.3s var(--spring) }
.ee-toast-leave-active { transition: all 0.25s ease }
.ee-toast-enter-from  { opacity: 0; transform: translateY(12px) scale(0.9) }
.ee-toast-leave-to    { opacity: 0; transform: translateY(-8px) scale(0.9) }

/* ── Readme modal ── */
.ee-backdrop {
  position: fixed; inset: 0; z-index: 500;
  background: #000000cc; backdrop-filter: blur(12px);
  display: flex; align-items: center; justify-content: center; padding: 1rem;
}
.readme-modal {
  background: var(--surf); border: 1px solid var(--bdr2);
  border-radius: 20px; padding: 1.75rem; width: 100%; max-width: 480px;
  box-shadow: 0 24px 80px #00000080;
  max-height: 80vh; overflow-y: auto;
}
.readme-hdr {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 1rem;
}
.readme-title { font-size: 1.05rem; font-weight: 800; letter-spacing: -0.02em }
.readme-close {
  width: 28px; height: 28px; border-radius: 8px;
  border: 1px solid var(--bdr2); background: var(--surf2);
  color: var(--muted); font-size: 0.75rem; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.15s;
}
.readme-close:hover { color: var(--text); background: var(--surf) }
.readme-intro {
  font-size: 0.82rem; color: var(--muted); margin-bottom: 1.25rem; line-height: 1.6
}
.found-ct { color: var(--acc); font-weight: 700 }
.all-found { margin-left: 0.5rem; color: #f59e0b; font-weight: 700 }
.egg-list { display: flex; flex-direction: column; gap: 0.55rem }
.egg-entry {
  display: flex; align-items: flex-start; gap: 0.75rem;
  background: var(--faint); border: 1px solid var(--bdr);
  border-radius: 12px; padding: 0.65rem 0.85rem;
  transition: border-color 0.2s;
}
.egg-entry.found { border-color: var(--acc); background: color-mix(in srgb, var(--acc) 8%, var(--faint)) }
.egg-check { font-size: 0.8rem; color: var(--muted); padding-top: 2px; flex-shrink: 0; width: 14px }
.egg-entry.found .egg-check { color: var(--acc) }
.egg-trigger { font-size: 0.78rem; font-weight: 700; color: var(--text); font-family: 'SF Mono', monospace; display: block; margin-bottom: 2px }
.egg-desc { font-size: 0.72rem; color: var(--muted) }
</style>
