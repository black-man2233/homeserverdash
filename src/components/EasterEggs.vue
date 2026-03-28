<template>
  <div class="ee-root">

    <!-- ── Toasts ── -->
    <div class="ee-toasts">
      <TransitionGroup name="ee-toast">
        <div v-for="t in toasts" :key="t.id" class="ee-toast">{{ t.msg }}</div>
      </TransitionGroup>
    </div>

    <!-- ── Canvas overlays ── -->
    <canvas v-if="matrixActive" ref="matrixEl" class="ee-canvas" />
    <canvas v-if="partyActive"  ref="partyEl"  class="ee-canvas" />
    <canvas v-if="rainActive"   ref="rainEl"   class="ee-canvas" />
    <canvas v-if="snowActive"   ref="snowEl"   class="ee-canvas" />
    <canvas v-if="retroActive"  ref="retroEl"  class="ee-canvas ee-crt" />

    <!-- ── Effect overlays ── -->
    <div v-if="discoActive" class="disco-overlay" />

    <div v-if="bsodActive" class="bsod-overlay">
      <div class="bsod-sad">:(</div>
      <div class="bsod-h1">Your coolserver ran into a problem</div>
      <div class="bsod-body">We're just collecting some error info,<br>and then we'll restart for you (not really).</div>
      <div class="bsod-pct" ref="bsodPctEl">0% complete</div>
      <div class="bsod-code">STOP CODE: EASTER_EGG_DISCOVERED_0x0000COOL</div>
    </div>

    <div v-if="hackActive" ref="hackEl" class="hack-terminal">
      <div class="hack-title">▶ COOLSERVER // ACCESS GRANTED // LEVEL 9</div>
      <pre ref="hackLogEl" class="hack-log"></pre>
    </div>

    <div v-if="e404Active" class="glitch-404">
      <div class="g404-main" data-text="404">404</div>
      <div class="g404-sub">PAGE NOT FOUND<br><em>…just kidding 😏</em></div>
    </div>

    <div v-if="bossActive" class="boss-bar">
      <div class="boss-label">👹 FINAL BOSS — coolserver.exe</div>
      <div class="boss-track"><div class="boss-fill" ref="bossHpEl" /></div>
    </div>

    <div v-if="chadActive" class="chad-overlay">
      <div class="chad-text" ref="chadEl">GIGACHAD</div>
    </div>

    <div v-if="susActive" class="sus-overlay">
      <div class="sus-text">📮 sus…</div>
    </div>

    <div v-if="vibeActive" class="vibe-overlay" />

    <div v-if="fpsActive" class="fps-overlay">⚡ {{ fps }} fps</div>

    <!-- ── Custom context menu ── -->
    <div v-if="ctx.show" class="ctx-menu"
      :style="`left:${ctx.x}px;top:${ctx.y}px`"
      @mouseleave="ctx.show=false">
      <div class="ctx-item" @click="ctxDo('inspect')">🔍 Inspect coordinates</div>
      <div class="ctx-item" @click="ctxDo('copy')">📋 Copy position</div>
      <div class="ctx-item" @click="ctxDo('eggs')">🥚 View egg list</div>
      <div class="ctx-sep"/>
      <div class="ctx-item ctx-dim" @click="ctx.show=false">✕ Dismiss</div>
    </div>

    <!-- ── Readme modal ── -->
    <Transition name="backdrop">
      <div v-if="showReadme" class="ee-backdrop" @click.self="showReadme=false">
        <Transition name="modal" appear>
          <div v-if="showReadme" class="readme-modal">
            <div class="readme-hdr">
              <div class="readme-title">🥚 Easter Eggs</div>
              <div class="readme-progress">{{ found.size }}/{{ EGGS.length }}</div>
              <button class="readme-close" @click="showReadme=false">✕</button>
            </div>
            <p class="readme-intro">
              <span class="found-ct">{{ found.size }} found</span> of {{ EGGS.length }} total.
              <span v-if="found.size===EGGS.length" class="all-found">🏆 COMPLETE!</span>
            </p>
            <div class="egg-list">
              <div v-for="egg in EGGS" :key="egg.id"
                class="egg-entry" :class="{found:found.has(egg.id)}">
                <span class="egg-chk">{{ found.has(egg.id)?'✓':'○' }}</span>
                <div>
                  <div class="egg-trigger">{{ egg.trigger }}</div>
                  <div class="egg-desc">{{ egg.desc }}</div>
                </div>
              </div>
            </div>
            <div class="readme-foot">
              <button class="btn-reset-eggs" @click="resetEggs">↺ Reset progress</button>
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

// ───────────────────────────────────────────────
//  EGGS REGISTRY  (shown in readme)
// ───────────────────────────────────────────────
const EGGS = [
  // ── Keyboard typed words ──
  { id:'matrix',    trigger:'Type "matrix"',       desc:'There is no spoon 🐍' },
  { id:'party',     trigger:'Type "party"',         desc:"Confetti time 🎉" },
  { id:'disco',     trigger:'Type "disco"',         desc:'🕺 Saturday Night Fever' },
  { id:'hack',      trigger:'Type "hack"',          desc:'Access the mainframe' },
  { id:'coolserver',trigger:'Type "coolserver"',    desc:'Say the magic name 🌈' },
  { id:'404',       trigger:'Type "404"',           desc:"Something's missing..." },
  { id:'spin',      trigger:'Type "spin"',          desc:'🌀 Cards spin 360°' },
  { id:'dance',     trigger:'Type "dance"',         desc:'🕺 Choreographed card dance' },
  { id:'zoom',      trigger:'Type "zoom"',          desc:'ZOOM in ZOOM out' },
  { id:'flip',      trigger:'Type "flip"',          desc:'🔄 Flip the whole board' },
  { id:'rain',      trigger:'Type "rain"',          desc:'🌧️ Rainy day vibes' },
  { id:'snow',      trigger:'Type "snow"',          desc:'❄️ Let it snow' },
  { id:'fire',      trigger:'Type "fire"',          desc:'🔥 Everything is fine' },
  { id:'rainbow',   trigger:'Type "rainbow"',       desc:'🌈 Roy G Biv' },
  { id:'retro',     trigger:'Type "retro"',         desc:'📺 CRT scanlines mode' },
  { id:'glitch',    trigger:'Type "glitch"',        desc:'GL1TCH m0d3' },
  { id:'laser',     trigger:'Type "laser"',         desc:'🔴 Pew pew!' },
  { id:'thunder',   trigger:'Type "thunder"',       desc:'⚡ Lightning strike' },
  { id:'boom',      trigger:'Type "boom"',          desc:'💥 Big explosion' },
  { id:'windows',   trigger:'Type "windows"',       desc:'Famous BSOD 💙' },
  { id:'boss',      trigger:'Type "boss"',          desc:'⚔️ Boss battle' },
  { id:'lag',       trigger:'Type "lag"',           desc:'💀 Fake freeze' },
  { id:'nyan',      trigger:'Type "nyan"',          desc:'🌈 Rainbow cursor trail' },
  { id:'1337',      trigger:'Type "1337"',          desc:'1337 5p34k m0d3' },
  { id:'yeet',      trigger:'Type "yeet"',          desc:'✈️ Cards go flying' },
  { id:'yolo',      trigger:'Type "yolo"',          desc:'🚀 YOLO launch all' },
  { id:'vim',       trigger:'Type "vim"',           desc:'Classic editor trap 😅' },
  { id:'nano',      trigger:'Type "nano"',          desc:'The sensible choice' },
  { id:'git',       trigger:'Type "git"',           desc:'Commit to the bit' },
  { id:'sudo',      trigger:'Type "sudo"',          desc:'With great power...' },
  { id:'ls',        trigger:'Type "ls"',            desc:'List everything 📁' },
  { id:'pwd',       trigger:'Type "pwd"',           desc:'Where are you? 📍' },
  { id:'whoami',    trigger:'Type "whoami"',        desc:'Existential crisis' },
  { id:'ping',      trigger:'Type "ping"',          desc:'Network check 📡' },
  { id:'ssh',       trigger:'Type "ssh"',           desc:'Secure shell vibes 🔐' },
  { id:'htop',      trigger:'Type "htop"',          desc:'Pretty process viewer' },
  { id:'grep',      trigger:'Type "grep"',          desc:'Find the pattern 🔍' },
  { id:'kill',      trigger:'Type "kill"',          desc:'kill -9 boredom' },
  { id:'reboot',    trigger:'Type "reboot"',        desc:'Have you tried turning it off?' },
  { id:'update',    trigger:'Type "update"',        desc:'Fake Windows Update ⚙️' },
  { id:'rm',        trigger:'Type "rm"',            desc:'rm -rf feelings' },
  { id:'root',      trigger:'Type "root"',          desc:'Root access 👑' },
  { id:'debug',     trigger:'Type "debug"',         desc:'Debug overlay 🐛' },
  { id:'42',        trigger:'Type "42"',            desc:'The Ultimate Answer 🌌' },
  { id:'nice',      trigger:'Type "nice"',          desc:'69 👀' },
  { id:'007',       trigger:'Type "007"',           desc:'Shaken, not stirred 🍸' },
  { id:'3000',      trigger:'Type "3000"',          desc:'React dev detected ⚛️' },
  { id:'8080',      trigger:'Type "8080"',          desc:'Port 8080 open?' },
  { id:'443',       trigger:'Type "443"',           desc:'HTTPS secured 🔒' },
  { id:'22',        trigger:'Type "22"',            desc:'SSH port gang 🔑' },
  { id:'gg',        trigger:'Type "gg"',            desc:'Good game! 🎮' },
  { id:'ez',        trigger:'Type "ez"',            desc:'Too easy 😎' },
  { id:'rip',       trigger:'Type "rip"',           desc:'Press F in chat 😢' },
  { id:'omg',       trigger:'Type "omg"',           desc:'OH MY SERVERS!' },
  { id:'wow',       trigger:'Type "wow"',           desc:'Much wow. Very cool. 🐕' },
  { id:'bruh',      trigger:'Type "bruh"',          desc:'Bruh moment 💀' },
  { id:'based',     trigger:'Type "based"',         desc:'Based ✓' },
  { id:'pog',       trigger:'Type "pog"',           desc:'POGGERS! 🎉' },
  { id:'sus',       trigger:'Type "sus"',           desc:'That is sus 📮' },
  { id:'chad',      trigger:'Type "chad"',          desc:'GIGACHAD energy 💪' },
  { id:'simp',      trigger:'Type "simp"',          desc:'Hearts everywhere 💕' },
  { id:'goat',      trigger:'Type "goat"',          desc:'Greatest Of All Time 🐐' },
  { id:'sheesh',    trigger:'Type "sheesh"',        desc:'Sheeeesh 🥶' },
  { id:'uwu',       trigger:'Type "uwu"',           desc:'Maximum cuteness 🌸' },
  { id:'slay',      trigger:'Type "slay"',          desc:'SLAY QUEEN ✨' },
  { id:'vibe',      trigger:'Type "vibe"',          desc:'Chill mode activated 😌' },
  { id:'copium',    trigger:'Type "copium"',        desc:'*inhales copium*' },
  { id:'mid',       trigger:'Type "mid"',           desc:'mid 😐' },
  { id:'skill',     trigger:'Type "skill"',         desc:'Skill issue confirmed 🤷' },
  { id:'noice',     trigger:'Type "noice"',         desc:'NOICE 👌' },
  { id:'bussin',    trigger:'Type "bussin"',        desc:"It's bussin fr fr 🍔" },
  { id:'yikes',     trigger:'Type "yikes"',         desc:'Big yikes energy 😬' },
  { id:'lowkey',    trigger:'Type "lowkey"',        desc:'Lowkey legendary find' },
  { id:'ngl',       trigger:'Type "ngl"',           desc:'Not gonna lie...' },
  { id:'fr',        trigger:'Type "fr"',            desc:'For real for real' },
  { id:'irl',       trigger:'Type "irl"',           desc:'In real life though...' },
  { id:'tbh',       trigger:'Type "tbh"',           desc:'To be honest with you' },
  { id:'idk',       trigger:'Type "idk"',           desc:"I don't know either" },
  { id:'npc',       trigger:'Type "npc"',           desc:'NPC behaviour detected' },
  { id:'hello',     trigger:'Type "hello"',         desc:'👋 A friendly greeting' },
  { id:'bye',       trigger:'Type "bye"',           desc:"Don't leave! 😢" },
  { id:'love',      trigger:'Type "love"',          desc:'Love is in the air 💕' },
  { id:'hot',       trigger:'Type "hot"',           desc:'🔥 Too hot to handle' },
  { id:'cold',      trigger:'Type "cold"',          desc:'❄️ Brrrr' },
  { id:'coffee',    trigger:'Type "coffee"',        desc:'Developer fuel ☕' },
  { id:'sleep',     trigger:'Type "sleep"',         desc:'ZZZ... 😴' },
  { id:'wake',      trigger:'Type "wake"',          desc:'Rise and shine! ☀️' },
  { id:'stonks',    trigger:'Type "stonks"',        desc:'📈 Stonks only go up' },
  { id:'oof',       trigger:'Type "oof"',           desc:'Big oof energy' },
  { id:'cope',      trigger:'Type "cope"',          desc:'Touching grass recommended' },
  { id:'ratio',     trigger:'Type "ratio"',         desc:'Ratioed!' },
  { id:'poggers',   trigger:'Type "poggers"',       desc:'POGGERS (2nd form)' },
  { id:'linux',     trigger:'Type "linux"',         desc:'btw I run coolserver on Linux' },
  { id:'react',     trigger:'Type "react"',         desc:'Have you tried Vue? 🤔' },
  { id:'vue',       trigger:'Type "vue"',           desc:'✨ You chose wisely!' },
  { id:'vite',      trigger:'Type "vite"',          desc:'⚡ Blazing fast!' },
  { id:'gsap',      trigger:'Type "gsap"',          desc:'The animation wizard 🧙' },
  { id:'pinia',     trigger:'Type "pinia"',         desc:'🍍 The pineapple store' },
  { id:'docker',    trigger:'Type "docker"',        desc:'🐋 It works on my machine' },
  { id:'nginx',     trigger:'Type "nginx"',         desc:'🔀 The silent router' },
  { id:'home',      trigger:'Type "home"',          desc:'There is no place like 127.0.0.1' },
  { id:'server',    trigger:'Type "server"',        desc:'The server is always fine 🟢' },
  { id:'password',  trigger:'Type "password"',      desc:'Security is my passion 🔒' },
  { id:'secret',    trigger:'Type "secret"',        desc:'Shhhh 🤫' },
  { id:'magic',     trigger:'Type "magic"',         desc:'✨ Abracadabra!' },
  { id:'please',    trigger:'Type "please"',        desc:'Since you asked nicely...' },
  { id:'thanks',    trigger:'Type "thanks"',        desc:"You're welcome! 🙏" },
  { id:'sorry',     trigger:'Type "sorry"',         desc:'Apology accepted 🤗' },
  { id:'help',      trigger:'Type "help"',          desc:'--help flag received' },
  { id:'why',       trigger:'Type "why"',           desc:'Why not? 🤷' },
  { id:'what',      trigger:'Type "what"',          desc:'What indeed.' },
  { id:'how',       trigger:'Type "how"',           desc:'Very carefully.' },

  // ── Key combos ──
  { id:'konami',    trigger:'↑ ↑ ↓ ↓ ← → ← → B A',         desc:'The legendary cheat code' },
  { id:'f2',        trigger:'Press F2',                       desc:'FPS counter 🧑‍💻' },
  { id:'f1',        trigger:'Press F1',                       desc:'Help! F1 for help' },
  { id:'f5',        trigger:'Press F5',                       desc:'Reload animation ♻️' },
  { id:'altf4',     trigger:'Press Alt+F4',                   desc:'Nice try 😉' },
  { id:'ctrlz',     trigger:'Press Ctrl+Z',                   desc:"Can't undo awesome" },
  { id:'ctrlc',     trigger:'Press Ctrl+C',                   desc:'^C — copied nothing' },
  { id:'esc5',      trigger:'Press Escape 5 times fast',      desc:'PANIC mode 😱' },
  { id:'tab3',      trigger:'Press Tab 3 times fast',         desc:'Tab autocomplete' },

  // ── Click / interaction ──
  { id:'dot5x',     trigger:'Click the glowing brand dot 5×', desc:'Persistence pays off 💥' },
  { id:'shake',     trigger:'Shake mouse rapidly',            desc:'Dizzy cards 😵' },
  { id:'idle',      trigger:'Idle for 60 seconds',           desc:'Screensaver mode 😴' },
  { id:'dblclick',  trigger:'Double-click the star background',desc:'Supernova explosion 💥' },
  { id:'corners',   trigger:'Click all 4 screen corners (TL→TR→BR→BL)', desc:'The ancient ritual' },
  { id:'logo3x',    trigger:'Triple-click the "coolserver" wordmark', desc:'Say my name 3× 🔮' },
  { id:'rightbg',   trigger:'Right-click the star background', desc:'Secret context menu 🖱️' },
  { id:'readme',    trigger:'Type "?" or Shift+/',            desc:'This guide! 🥚' },
]

// ── Toast system ──
const toasts = ref([])
let toastId = 0
function toast(msg, dur = 3500) {
  const id = ++toastId
  toasts.value.push({ id, msg })
  setTimeout(() => { toasts.value = toasts.value.filter(t => t.id !== id) }, dur)
}

// ── Found tracking ──
const found = reactive(new Set(
  (() => { try { return JSON.parse(localStorage.getItem('ee_found') || '[]') } catch { return [] } })()
))
function mark(id) {
  if (!found.has(id)) {
    found.add(id)
    try { localStorage.setItem('ee_found', JSON.stringify([...found])) } catch {}
  }
}
function resetEggs() {
  found.clear()
  try { localStorage.removeItem('ee_found') } catch {}
  toast('↺ Progress reset')
}

// ── State flags ──
const matrixActive = ref(false), partyActive  = ref(false), rainActive   = ref(false)
const snowActive   = ref(false), retroActive  = ref(false), discoActive  = ref(false)
const bsodActive   = ref(false), hackActive   = ref(false), e404Active   = ref(false)
const bossActive   = ref(false), chadActive   = ref(false), susActive    = ref(false)
const vibeActive   = ref(false), fpsActive    = ref(false)
const showReadme   = ref(false)
const fps          = ref(0)
const ctx          = reactive({ show: false, x: 0, y: 0 })

// Canvas refs
const matrixEl = ref(null), partyEl = ref(null), rainEl  = ref(null)
const snowEl   = ref(null), retroEl = ref(null)
// DOM refs
const hackEl   = ref(null), hackLogEl = ref(null), bsodPctEl = ref(null)
const bossHpEl = ref(null), chadEl  = ref(null)

// ── FPS ──
let fpsFrames = 0, fpsLast = 0, fpsRaf = null
function runFPS() {
  fpsFrames++
  const now = performance.now()
  if (now - fpsLast >= 1000) { fps.value = fpsFrames; fpsFrames = 0; fpsLast = now }
  if (fpsActive.value) fpsRaf = requestAnimationFrame(runFPS)
}

// ── Disco interval + nyan timer ──
let discoInterval = null, nyanTimer = null, nyanActive = false

// ── Helpers ──
const CX = () => window.innerWidth  / 2
const CY = () => window.innerHeight / 2

function burst(x, y, color, n = 30) {
  for (let i = 0; i < n; i++) {
    const el = document.createElement('div')
    const s = 3 + Math.random() * 7
    Object.assign(el.style, {
      position:'fixed', left:`${x-s/2}px`, top:`${y-s/2}px`,
      width:`${s}px`, height:`${s}px`, borderRadius:'50%',
      background: color || `hsl(${Math.random()*360},90%,65%)`,
      pointerEvents:'none', zIndex:'9999',
    })
    document.body.appendChild(el)
    const a = Math.random() * Math.PI * 2, d = 50 + Math.random() * 220
    gsap.fromTo(el, { x:0,y:0,scale:0,opacity:1 }, {
      x:Math.cos(a)*d, y:Math.sin(a)*d, scale:1, opacity:0,
      duration:.7+Math.random()*.5, ease:'power2.out', onComplete:()=>el.remove()
    })
  }
}

function flashBorder(color) {
  const el = document.createElement('div')
  Object.assign(el.style, {
    position:'fixed',inset:'0',border:`3px solid ${color}`,
    boxShadow:`inset 0 0 40px ${color}30`,pointerEvents:'none',zIndex:'9990'
  })
  document.body.appendChild(el)
  gsap.fromTo(el,{opacity:1},{opacity:0,duration:.8,onComplete:()=>el.remove()})
}

function screenShake() {
  gsap.to(document.body,{x:6,duration:.05,yoyo:true,repeat:8,ease:'none',
    onComplete:()=>gsap.set(document.body,{x:0})})
}

function emojiRain(emojis, count=20) {
  for(let i=0;i<count;i++){
    setTimeout(()=>{
      const el=document.createElement('div')
      el.textContent=emojis[Math.floor(Math.random()*emojis.length)]
      Object.assign(el.style,{
        position:'fixed',left:`${Math.random()*100}vw`,top:'-40px',
        fontSize:`${1.4+Math.random()*1.4}rem`,pointerEvents:'none',zIndex:'9998',
        userSelect:'none',
      })
      document.body.appendChild(el)
      gsap.to(el,{y:window.innerHeight+60,opacity:0,
        duration:1.8+Math.random(),ease:'power1.in',onComplete:()=>el.remove()})
    },i*100)
  }
}

function goldBurst() { for(let i=0;i<3;i++) setTimeout(()=>burst(CX(),CY(),'#f59e0b',20),i*150) }

// ────────────────────────────────────────────────
//  COMPLEX EFFECTS
// ────────────────────────────────────────────────

// Canvas effect factory
function canvasEffect(activeRef, canvasRef, drawFn, initFn, duration) {
  activeRef.value = true
  nextTick(() => {
    const cv = canvasRef.value; if (!cv) return
    cv.width = window.innerWidth; cv.height = window.innerHeight
    if (initFn) initFn(cv)
    const cx = cv.getContext('2d')
    let raf; const t = { v: 0 }
    function step() {
      drawFn(cx, cv.width, cv.height, t.v); t.v += 0.016
      if (activeRef.value) raf = requestAnimationFrame(step)
      else cancelAnimationFrame(raf)
    }
    raf = requestAnimationFrame(step)
  })
  setTimeout(() => { activeRef.value = false }, duration)
}

function startMatrix() {
  if (matrixActive.value) return; mark('matrix'); toast('💊 There is no spoon…')
  let drops = []
  canvasEffect(matrixActive, matrixEl,
    (cx, W, H) => {
      cx.fillStyle='rgba(4,4,11,0.05)'; cx.fillRect(0,0,W,H)
      cx.fillStyle='#00ff41'; cx.font='13px monospace'
      drops.forEach((y,i)=>{
        cx.fillText(String.fromCharCode(0x30A0+Math.random()*96),i*14,y*14)
        if(y*14>H&&Math.random()>.975) drops[i]=0; drops[i]++
      })
    },
    (cv) => { drops=Array(Math.floor(cv.width/14)).fill(1) },
    7000
  )
}

function startParty() {
  if (partyActive.value) return; mark('party'); toast('🎉 PARTY TIME! 🥳')
  gsap.to('.service-card',{y:-10,duration:.2,stagger:{amount:.5,from:'random'},ease:'power2.out',yoyo:true,repeat:3})
  let pieces = []
  canvasEffect(partyActive, partyEl,
    (cx, W, H) => {
      cx.clearRect(0,0,W,H)
      let alive=false
      pieces.forEach(p=>{
        if(p.y>H+20) return; alive=true
        p.x+=p.vx; p.y+=p.vy; p.vy+=.07; p.rot+=p.rotV
        cx.save(); cx.translate(p.x,p.y); cx.rotate(p.rot*Math.PI/180)
        cx.fillStyle=`hsl(${p.hue},80%,60%)`; cx.fillRect(-p.w/2,-p.h/2,p.w,p.h); cx.restore()
      })
      if (!alive) partyActive.value = false
    },
    (cv) => {
      pieces=Array.from({length:220},()=>({
        x:Math.random()*cv.width, y:-20-Math.random()*cv.height*.4,
        vx:(Math.random()-.5)*5, vy:2.5+Math.random()*5,
        w:6+Math.random()*10, h:4+Math.random()*8,
        rot:Math.random()*360, rotV:(Math.random()-.5)*10,
        hue:Math.random()*360,
      }))
    },
    9000
  )
}

function startDisco() {
  if(discoActive.value) return; mark('disco'); toast('🕺 DISCO MODE 🪩')
  discoActive.value=true; let hue=0
  discoInterval=setInterval(()=>{
    hue=(hue+45)%360
    gsap.to('.service-card',{
      boxShadow:`0 0 30px hsl(${hue},90%,60%),0 0 60px hsl(${(hue+120)%360},90%,50%)`,
      duration:.25,stagger:.02,ease:'none'
    })
  },350)
  setTimeout(()=>{
    clearInterval(discoInterval);discoInterval=null;discoActive.value=false
    gsap.to('.service-card',{boxShadow:'',duration:.6})
  },9000)
}

const HACK_LINES = [
  'Initializing breach protocol v4.2.0...',
  'Scanning 192.168.0.0/24...',
  'Target identified: coolserver.local',
  'Loading exploit CVE-2024-LEET...',
  'sudo -s ← permission granted (obviously) ✓',
  'Mounting /dev/brain...',
  'Dumping /etc/shadow...',
  '  root:$6$[REDACTED]',
  '  coolserver:$6$[REDACTED]',
  'Establishing encrypted tunnel — 3ms ✓',
  'Deploying payload.sh...',
  'Mining $COOL tokens... 0.00003 mined',
  'Staging rickroll.sh...',
  '  ♪ Never gonna give you up ♪',
  '  ♪ Never gonna let you down ♪',
  '  ♪ Never gonna run around and desert you ♪',
  '',
  '██████  EASTER EGG FOUND! ██████',
]
function startHack() {
  if(hackActive.value) return; mark('hack'); toast('💻 ACCESS GRANTED')
  hackActive.value=true
  nextTick(()=>{
    if(hackEl.value) gsap.from(hackEl.value,{y:'100%',duration:.5,ease:'power3.out'})
    if(!hackLogEl.value) return
    let i=0
    const iv=setInterval(()=>{
      if(!hackLogEl.value){clearInterval(iv);return}
      if(i<HACK_LINES.length){
        hackLogEl.value.textContent+=HACK_LINES[i]+'\n'
        hackLogEl.value.scrollTop=hackLogEl.value.scrollHeight; i++
      } else {
        clearInterval(iv)
        setTimeout(()=>{
          if(hackEl.value) gsap.to(hackEl.value,{y:'100%',opacity:0,duration:.4,ease:'power2.in',
            onComplete:()=>{hackActive.value=false}})
        },2500)
      }
    },175)
  })
}

function startCoolserver() {
  mark('coolserver'); toast('🌈 You named it well.')
  const hues=[0,30,60,120,180,240,300]
  hues.forEach((h,s)=>{
    gsap.to('.service-card',{
      boxShadow:`0 0 20px hsl(${h},90%,60%)`,
      duration:.2,delay:s*.2,stagger:.025,ease:'none'
    })
  })
  gsap.to('.service-card',{boxShadow:'',duration:.5,delay:hues.length*.2+.1})
}

function start404() {
  if(e404Active.value) return; mark('404'); toast('🚧 404 — but you found this!')
  e404Active.value=true; setTimeout(()=>{e404Active.value=false},3200)
}

function startBSOD() {
  if(bsodActive.value) return; mark('windows')
  bsodActive.value=true
  let pct=0
  const iv=setInterval(()=>{
    pct+=Math.floor(Math.random()*8)+1
    if(pct>=100){ pct=100; clearInterval(iv)
      setTimeout(()=>{bsodActive.value=false;toast('✅ Restarted! (not really)')},1200)
    }
    if(bsodPctEl.value) bsodPctEl.value.textContent=`${pct}% complete`
  },120)
}

function startBoss() {
  if(bossActive.value) return; mark('boss'); toast('⚔️ BOSS BATTLE!'); bossActive.value=true
  nextTick(()=>{
    if(!bossHpEl.value) return
    gsap.fromTo(bossHpEl.value,{width:'100%'},{
      width:'0%',duration:4,ease:'none',
      onComplete:()=>{toast('🏆 BOSS DEFEATED! +9999 XP');bossActive.value=false}
    })
  })
}

function startRain() {
  if(rainActive.value) return; mark('rain'); toast('🌧️ It is raining…')
  let drops=[]
  canvasEffect(rainActive, rainEl,
    (cx,W,H)=>{
      cx.clearRect(0,0,W,H)
      drops.forEach(d=>{
        cx.beginPath(); cx.moveTo(d.x,d.y); cx.lineTo(d.x-1,d.y+d.len)
        cx.strokeStyle=`rgba(147,210,255,${d.a})`; cx.lineWidth=1; cx.stroke()
        d.y+=d.spd; if(d.y>H){d.y=-d.len;d.x=Math.random()*W}
      })
    },
    (cv)=>{drops=Array.from({length:160},()=>({
      x:Math.random()*cv.width, y:Math.random()*cv.height,
      spd:8+Math.random()*10, len:10+Math.random()*18, a:.25+Math.random()*.35
    }))},
    9000
  )
}

function startSnow() {
  if(snowActive.value) return; mark('snow'); toast('❄️ Let it snow…')
  let flakes=[]
  canvasEffect(snowActive, snowEl,
    (cx,W,H,t)=>{
      cx.clearRect(0,0,W,H)
      flakes.forEach(f=>{
        f.y+=f.spd; f.x+=f.drift+Math.sin(t*1.5+f.r)*.4
        if(f.y>H){f.y=-10;f.x=Math.random()*W}
        cx.beginPath(); cx.arc(f.x,f.y,f.r,0,Math.PI*2)
        cx.fillStyle=`rgba(210,235,255,${f.a})`; cx.fill()
      })
    },
    (cv)=>{flakes=Array.from({length:130},()=>({
      x:Math.random()*cv.width, y:Math.random()*cv.height,
      r:1+Math.random()*3.5, spd:.8+Math.random()*2, drift:(Math.random()-.5)*.4,
      a:.4+Math.random()*.5
    }))},
    10000
  )
}

function startFire() {
  mark('fire'); toast('🔥 Everything is fine!')
  for(let i=0;i<10;i++){
    setTimeout(()=>{
      for(let j=0;j<8;j++){
        const el=document.createElement('div')
        const s=10+Math.random()*22
        const x=Math.random()*window.innerWidth
        Object.assign(el.style,{
          position:'fixed',left:`${x}px`,top:`${window.innerHeight}px`,
          width:`${s}px`,height:`${s}px`,borderRadius:'50%',
          background:`hsl(${15+Math.random()*25},100%,${50+Math.random()*20}%)`,
          boxShadow:`0 0 ${s*1.5}px hsl(${10+Math.random()*20},100%,50%)`,
          pointerEvents:'none',zIndex:'9000',
        })
        document.body.appendChild(el)
        gsap.to(el,{y:-(120+Math.random()*350),x:(Math.random()-.5)*80,
          scale:0,opacity:0,duration:1.2+Math.random(),ease:'power1.out',
          onComplete:()=>el.remove()})
      }
    },i*180)
  }
}

function startRetro() {
  if(retroActive.value) return; mark('retro'); toast('📺 CRT mode ON')
  canvasEffect(retroActive, retroEl,
    (cx,W,H)=>{
      cx.clearRect(0,0,W,H)
      for(let y=0;y<H;y+=4){cx.fillStyle='rgba(0,0,0,0.13)';cx.fillRect(0,y,W,2)}
      cx.fillStyle=`rgba(0,0,0,${Math.random()*.04})`; cx.fillRect(0,0,W,H)
    },
    null, 10000
  )
  setTimeout(()=>toast('📺 CRT mode OFF'),10000)
}

function startGlitch() {
  mark('glitch'); toast('GL1TCH m0d3 4ct1v4t3d')
  const tl=gsap.timeline()
  for(let i=0;i<10;i++){
    tl.to('.app',{
      x:(Math.random()-.5)*25,
      filter:`hue-rotate(${Math.random()*200}deg) contrast(${1.5+Math.random()*.8})`,
      duration:.04,ease:'none'
    })
  }
  tl.to('.app',{x:0,filter:'none',duration:.1})
}

function fireLaser() {
  mark('laser'); toast('🔴 Pew pew!')
  const el=document.createElement('div')
  Object.assign(el.style,{
    position:'fixed',left:'0',right:'0',
    top:`${window.innerHeight/2}px`,height:'3px',
    background:'linear-gradient(90deg,transparent,#ef4444,#f97316,transparent)',
    boxShadow:'0 0 20px #ef4444,0 0 40px #f9730860',
    pointerEvents:'none',zIndex:'9000',
  })
  document.body.appendChild(el)
  gsap.fromTo(el,{scaleX:0,transformOrigin:'left center'},{
    scaleX:1,duration:.3,ease:'power3.out',
    onComplete:()=>gsap.to(el,{opacity:0,duration:.2,onComplete:()=>el.remove()})
  })
}

function startThunder() {
  mark('thunder'); toast('⚡ THUNDER!')
  for(let i=0;i<5;i++){
    setTimeout(()=>{
      const el=document.createElement('div')
      Object.assign(el.style,{position:'fixed',inset:'0',
        background:`rgba(255,255,255,${.15+Math.random()*.15})`,
        pointerEvents:'none',zIndex:'9500'})
      document.body.appendChild(el)
      gsap.to(el,{opacity:0,duration:.08+Math.random()*.08,onComplete:()=>el.remove()})
    },i*200+Math.random()*100)
  }
}

function startKonami() {
  mark('konami'); toast('⬆⬆⬇⬇⬅➡⬅➡🅱🅰 CHEAT ACTIVATED!',4500)
  burst(CX(),CY(),null,120)
  gsap.to('.service-card',{y:-14,rotation:(i)=>(i%2?4:-4),duration:.2,stagger:{amount:.5,from:'random'},ease:'power2.out',yoyo:true,repeat:1})
}

function startLag() {
  mark('lag'); toast('💀 L4G DETECTED… system freezing…')
  gsap.globalTimeline.timeScale(.05)
  setTimeout(()=>{gsap.globalTimeline.timeScale(1);toast('✅ Lag fixed! (it was a joke)')},2800)
}

function startLeet() {
  mark('1337'); toast('1337 5P34K M0D3 4CT1V4T3D')
  const els=document.querySelectorAll('.cname,.brand-name')
  const orig=[]; els.forEach(el=>orig.push(el.textContent))
  els.forEach(el=>{
    el.textContent=el.textContent
      .replace(/a/gi,'4').replace(/e/gi,'3')
      .replace(/i/gi,'1').replace(/o/gi,'0')
      .replace(/s/gi,'5').replace(/t/gi,'7')
  })
  setTimeout(()=>{els.forEach((el,i)=>{el.textContent=orig[i]});toast('l33t m0d3: 0ff')},4500)
}

function yeetCards(yolo) {
  mark(yolo?'yolo':'yeet'); toast(yolo?'🚀 YOLO! Cards LAUNCHED!':'✈️ Yeet!')
  gsap.to('.service-card',{
    x:()=>(Math.random()-.5)*window.innerWidth*(yolo?2:1.6),
    y:()=>(Math.random()-.5)*window.innerHeight*(yolo?1.6:1.2),
    rotation:()=>(Math.random()-.5)*180,
    opacity:0,duration:.8,stagger:{amount:.4,from:'random'},ease:'power3.in',
    onComplete:()=>gsap.fromTo('.service-card',
      {opacity:0,y:20,x:0,rotation:0,scale:.8},
      {opacity:1,y:0,scale:1,duration:.6,stagger:{amount:.5,from:'random'},ease:'back.out(1.4)'}
    )
  })
}

function startNyan() {
  mark('nyan'); toast('🌈 NYAN CAT MODE!')
  nyanActive=true
  function loop(){
    if(!nyanActive) return
    const el=document.createElement('div')
    const s=5+Math.random()*8
    const hue=(Date.now()*.4)%360
    Object.assign(el.style,{
      position:'fixed',left:`${lastMX-s/2}px`,top:`${lastMY-s/2}px`,
      width:`${s}px`,height:`${s}px`,borderRadius:'50%',
      background:`hsl(${hue},90%,65%)`,
      boxShadow:`0 0 8px hsl(${hue},90%,65%)`,
      pointerEvents:'none',zIndex:'500',
    })
    document.body.appendChild(el)
    gsap.to(el,{y:-(8+Math.random()*18),opacity:0,scale:0,
      duration:.35+Math.random()*.2,ease:'power2.out',onComplete:()=>el.remove()})
    nyanTimer=setTimeout(loop,25)
  }
  loop()
  setTimeout(()=>{nyanActive=false;clearTimeout(nyanTimer);toast('🌈 Nyan cat gone 😿')},8000)
}

function startWindowsUpdate() {
  mark('update')
  const el=document.createElement('div')
  Object.assign(el.style,{
    position:'fixed',inset:'0',background:'#0078d4',
    display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
    zIndex:'9999',color:'#fff',fontFamily:'Segoe UI,sans-serif'
  })
  el.innerHTML=`
    <div style="font-size:4rem;margin-bottom:1rem">⚙️</div>
    <div style="font-size:1.5rem;font-weight:700;margin-bottom:2rem">Working on updates  0%</div>
    <div style="width:300px;height:4px;background:rgba(255,255,255,.2);border-radius:2px;overflow:hidden">
      <div style="height:100%;width:0;background:#fff;border-radius:2px;transition:width .1s"></div>
    </div>
    <div style="margin-top:1rem;font-size:.85rem;opacity:.7">Don't turn off your server</div>
  `
  document.body.appendChild(el)
  const bar=el.querySelector('div div')
  const lbl=el.querySelector('div:nth-child(2)')
  let p=0
  const iv=setInterval(()=>{
    p+=Math.floor(Math.random()*8)+1
    if(p>=100){p=100;clearInterval(iv)
      lbl.textContent='Complete! Just kidding.'
      setTimeout(()=>gsap.to(el,{opacity:0,duration:.4,onComplete:()=>el.remove()}),1500)
    }
    bar.style.width=p+'%'; lbl.textContent=`Working on updates  ${p}%`
  },140)
}

function startJamesBond() {
  mark('007')
  const el=document.createElement('div')
  Object.assign(el.style,{
    position:'fixed',left:'50%',top:'50%',
    width:'60px',height:'60px',borderRadius:'50%',
    background:'#000',pointerEvents:'none',zIndex:'9800',
    transform:'translate(-50%,-50%)'
  })
  document.body.appendChild(el)
  const max=Math.max(window.innerWidth,window.innerHeight)*2.8
  gsap.to(el,{width:max,height:max,duration:.45,ease:'power2.in',
    onComplete:()=>gsap.to(el,{opacity:0,duration:1,delay:.5,onComplete:()=>el.remove()})
  })
}

function startChad() {
  if(chadActive.value) return; mark('chad'); toast('GIGACHAD HAS ENTERED THE CHAT 💪')
  chadActive.value=true
  nextTick(()=>{
    if(chadEl.value) gsap.from(chadEl.value,{scale:5,opacity:0,duration:.4,ease:'power3.out'})
  })
  setTimeout(()=>{chadActive.value=false},2800)
}

function startSus() {
  if(susActive.value) return; mark('sus'); toast('⚠️ that is pretty sus 📮')
  susActive.value=true
  flashBorder('#ef4444')
  setTimeout(()=>{susActive.value=false},2500)
}

function startVibe() {
  mark('vibe'); toast('Vibing 😌'); vibeActive.value=true
  gsap.to('.service-card',{y:-6,duration:1.8,stagger:.12,ease:'sine.inOut',yoyo:true,repeat:3,
    onComplete:()=>{vibeActive.value=false;gsap.to('.service-card',{y:0,duration:.5})}})
}

// ── Simple effect helpers ──
function spinCards()  { mark('spin');  toast('🌀 Wheeeee!');  gsap.to('.service-card',{rotation:360,duration:.7,stagger:.04,ease:'power2.inOut',onComplete:()=>gsap.set('.service-card',{rotation:0})}) }
function danceCards() {
  mark('dance'); toast('🕺 Cards got moves!')
  const tl=gsap.timeline()
  tl.to('.service-card',{y:-16,duration:.18,stagger:.04,ease:'power2.out'})
    .to('.service-card',{y:0,duration:.2,stagger:.04,ease:'bounce.out'})
    .to('.service-card',{rotation:8,duration:.12,stagger:.04})
    .to('.service-card',{rotation:-8,duration:.12,stagger:.04})
    .to('.service-card',{rotation:0,duration:.14,stagger:.04})
    .to('.service-card',{scale:1.06,duration:.15,stagger:.03,yoyo:true,repeat:1})
}
function zoomEffect() { mark('zoom');  toast('🔍 ZOOM!'); gsap.to('.app',{scale:1.12,duration:.3,ease:'power2.out',yoyo:true,repeat:1}) }
function flipCards()  { mark('flip');  toast('🔄 Flipped!'); gsap.to('.main-content',{scaleY:-1,duration:.4,ease:'power2.inOut',yoyo:true,repeat:1,onComplete:()=>gsap.set('.main-content',{clearProps:'all'})}) }
function rainbowCards(){ mark('rainbow'); toast('🌈 All the colors!'); const cards=document.querySelectorAll('.service-card'); cards.forEach((c,i)=>gsap.to(c,{boxShadow:`0 0 22px hsl(${i/cards.length*360},90%,60%)`,duration:.3,delay:i*.04,yoyo:true,repeat:3,onComplete:()=>gsap.set(c,{clearProps:'boxShadow'})})) }

// ── Word trigger map ──
const WTRIG = {
  matrix:     ()=>{startMatrix()},
  party:      ()=>{startParty()},
  disco:      ()=>{startDisco()},
  hack:       ()=>{startHack()},
  coolserver: ()=>{startCoolserver()},
  '404':      ()=>{start404()},
  spin:       ()=>{spinCards()},
  dance:      ()=>{danceCards()},
  zoom:       ()=>{zoomEffect()},
  flip:       ()=>{flipCards()},
  rain:       ()=>{startRain()},
  snow:       ()=>{startSnow()},
  fire:       ()=>{startFire()},
  rainbow:    ()=>{rainbowCards()},
  retro:      ()=>{startRetro()},
  glitch:     ()=>{startGlitch()},
  laser:      ()=>{fireLaser()},
  thunder:    ()=>{startThunder()},
  boom:       ()=>{mark('boom');toast('💥 BOOM!');burst(CX(),CY(),'#ef4444',70)},
  windows:    ()=>{startBSOD()},
  boss:       ()=>{startBoss()},
  lag:        ()=>{startLag()},
  nyan:       ()=>{startNyan()},
  '1337':     ()=>{startLeet()},
  leet:       ()=>{startLeet()},
  yeet:       ()=>{yeetCards(false)},
  yolo:       ()=>{yeetCards(true)},
  vim:        ()=>{mark('vim');  toast('Stuck in vim? :wq saves, :q! rage quits 😅')},
  nano:       ()=>{mark('nano'); toast('GNU nano 7.2  New Buffer   ^X Exit, ^O Write')},
  git:        ()=>{mark('git');  toast('git commit -m "✨ feat: easter egg found"'); burst(CX(),CY(),'#f97316',20)},
  sudo:       ()=>{mark('sudo'); toast('✓ sudo: permission granted'); flashBorder('#22c55e')},
  ls:         ()=>{mark('ls');   toast('📁 $ ls\nservices/  config/  logs/  .secrets ← nice try')},
  pwd:        ()=>{mark('pwd');  toast('📍 /home/coolserver/dashboard')},
  whoami:     ()=>{mark('whoami');toast('coolserver (uid=1000 gid=1000 groups=docker,sudo)')},
  ping:       ()=>{mark('ping'); toast('📡 PING coolserver: 64B time=0.3ms  time=0.4ms  time=0.2ms')},
  ssh:        ()=>{mark('ssh');  toast('🔐 ssh coolserver@localhost ←  Connected! Welcome back.')},
  htop:       ()=>{mark('htop'); toast('htop 3.2.1  Uptime: 42 days  Load: 0.01')},
  grep:       ()=>{mark('grep'); toast('grep -r "easter_egg" / → coolserver/dashboard (113 found)')},
  kill:       ()=>{mark('kill'); toast('kill -9 boredom ✓'); gsap.to('.service-card',{x:()=>(Math.random()-.5)*10,duration:.08,yoyo:true,repeat:5,onComplete:()=>gsap.set('.service-card',{x:0})})},
  reboot:     ()=>{mark('reboot');toast('🔄 Rebooting… just kidding 😅');gsap.to('.app',{opacity:0,scale:.95,duration:.3,onComplete:()=>gsap.to('.app',{opacity:1,scale:1,duration:.5,ease:'back.out(1.4)'})})},
  update:     ()=>{startWindowsUpdate()},
  rm:         ()=>{mark('rm');   toast('rm -rf feelings ← please don\'t')},
  root:       ()=>{mark('root'); toast('# root: "With great power… you know the rest." 🕸️'); flashBorder('#ef4444')},
  debug:      ()=>{mark('debug');toast(`🐛 DEBUG INFO\nCards: ${document.querySelectorAll('.service-card').length}  Eggs: ${found.size}/${EGGS.length}\nScreen: ${window.innerWidth}×${window.innerHeight}`,5000)},
  '42':       ()=>{mark('42');   toast('42 — The Answer to Life, the Universe, and Everything 🌌'); burst(CX(),CY(),'#8b5cf6',42)},
  nice:       ()=>{mark('nice'); toast('69 👀 nice')},
  '007':      ()=>{startJamesBond();toast('Bond. James Bond. 🎩🍸')},
  '3000':     ()=>{mark('3000');toast('⚛️ React developer detected. Have you tried Vue?')},
  '8080':     ()=>{mark('8080');toast('Port 8080: OPEN ✓ — Hope it\'s behind a firewall…')},
  '443':      ()=>{mark('443'); toast('🔒 HTTPS 443 — You\'re already secure!');flashBorder('#22c55e')},
  '22':       ()=>{mark('22');  toast('🔑 SSH port 22 — old faithful. Change it pls.')},
  gg:         ()=>{mark('gg');  toast('🎮 GG! Well played. EZ NGL.'); burst(CX(),CY(),null,40)},
  ez:         ()=>{mark('ez');  toast('😎 Too easy. Try harder next time.')},
  rip:        ()=>{mark('rip'); toast('F in chat 😢'); gsap.to('.app',{filter:'grayscale(60%) brightness(.8)',duration:.5,yoyo:true,repeat:1})},
  omg:        ()=>{mark('omg'); toast('OMG IT\'S HAPPENING 😱'); screenShake()},
  wow:        ()=>{mark('wow'); toast('✨ Much wow. Very coolserver.'); for(let i=0;i<20;i++) setTimeout(()=>burst(Math.random()*window.innerWidth,Math.random()*window.innerHeight,null,5),i*60)},
  bruh:       ()=>{mark('bruh');toast('bruh 💀'); gsap.to('.service-card',{rotation:-10,duration:.3,stagger:.05,ease:'power2.out',onComplete:()=>gsap.to('.service-card',{rotation:0,duration:.5,stagger:.05,ease:'bounce.out'})})},
  based:      ()=>{mark('based');toast('Based ✓  Ratio + L + Touch grass')},
  pog:        ()=>{mark('pog'); toast('POGGERS! 🎉'); burst(CX(),CY(),null,50)},
  poggers:    ()=>{mark('poggers');toast('DOUBLE POGGERS!! 🎉🎉');burst(CX(),CY(),null,80)},
  sus:        ()=>{startSus()},
  chad:       ()=>{startChad()},
  simp:       ()=>{mark('simp'); toast('💕 Hearts everywhere!'); emojiRain(['💕','💖','💗','💝','💓'])},
  goat:       ()=>{mark('goat'); toast('🐐 Greatest Of All Time!'); goldBurst()},
  sheesh:     ()=>{mark('sheesh');toast('Sheeeesh 🥶');gsap.to('.service-card',{boxShadow:'0 0 30px #bae6fd',borderColor:'#bae6fd',duration:.3,stagger:.05,yoyo:true,repeat:1,onComplete:()=>gsap.to('.service-card',{boxShadow:'',borderColor:'',duration:.4})})},
  uwu:        ()=>{mark('uwu'); toast('uwu what\'s this? 🌸');gsap.to('.service-card',{borderRadius:'50%',duration:.4,stagger:.04,yoyo:true,repeat:1,onComplete:()=>gsap.set('.service-card',{clearProps:'borderRadius'})})},
  slay:       ()=>{mark('slay'); toast('SLAY QUEEN ✨'); goldBurst()},
  vibe:       ()=>{startVibe()},
  copium:     ()=>{mark('copium');toast('*inhales copium* 😤');gsap.to('.app',{scale:1.02,duration:.9,ease:'sine.inOut',yoyo:true,repeat:2})},
  mid:        ()=>{mark('mid');   toast('mid 😐'); gsap.to('.app',{filter:'grayscale(50%)',duration:.3,yoyo:true,repeat:1})},
  skill:      ()=>{mark('skill');toast('skill issue 🤷  (finding this took skill tho)')},
  noice:      ()=>{mark('noice');toast('NOICE 👌');burst(CX(),CY(),'#06b6d4',35)},
  bussin:     ()=>{mark('bussin');toast("It's bussin fr fr 🍔");emojiRain(['🍔','🍕','🌮','🍜','🍣','🌯'])},
  yikes:      ()=>{mark('yikes');toast('Big yikes energy 😬'); screenShake()},
  lowkey:     ()=>{mark('lowkey');toast('lowkey legendary find 😌');gsap.to('.app',{opacity:.5,duration:.5,yoyo:true,repeat:1})},
  ngl:        ()=>{mark('ngl');  toast('ngl you just typed ngl and i respect that')},
  fr:         ()=>{mark('fr');   toast('for real for real 🗣️')},
  irl:        ()=>{mark('irl');  toast('in real life this dashboard is 10/10')},
  tbh:        ()=>{mark('tbh');  toast('tbh this is the best dashboard ✨')},
  idk:        ()=>{mark('idk');  toast('idk either but keep clicking things 🤷')},
  npc:        ()=>{mark('npc');  toast('NPC behaviour detected 🤖'); gsap.to('.service-card',{y:-4,duration:.5,ease:'none',yoyo:true,repeat:3})},
  hello:      ()=>{mark('hello');toast('👋 Hello to you too! Welcome to coolserver.');burst(CX(),CY(),'#06b6d4',20)},
  bye:        ()=>{mark('bye');  toast("Don't go! 😢 The server needs you!");gsap.to('.app',{filter:'grayscale(60%) brightness(.8)',duration:.5,yoyo:true,repeat:1})},
  love:       ()=>{mark('love'); toast('Love is in the air 💕'); emojiRain(['💕','💖','💗','💝','💓','❤️','🫶'])},
  hot:        ()=>{startFire();toast('🔥 Too hot to handle')},
  cold:       ()=>{startSnow();toast('❄️ Brrrr…')},
  coffee:     ()=>{mark('coffee');toast('☕ Coffee loaded. Productivity +9000');emojiRain(['☕'],10)},
  sleep:      ()=>{mark('sleep');toast('ZZZ… 😴');emojiRain(['💤','😴','Zzz'],12);gsap.to('.service-card',{filter:'blur(2px)',opacity:.5,duration:1,yoyo:true,repeat:1,onComplete:()=>gsap.set('.service-card',{clearProps:'all'})})},
  wake:       ()=>{mark('wake'); toast('Rise and shine! ☀️');emojiRain(['☀️','⭐','✨'],10);gsap.from('.service-card',{scale:.9,opacity:0,duration:.5,stagger:.03,ease:'back.out(1.4)'})},
  stonks:     ()=>{mark('stonks');toast('📈 STONKS ONLY GO UP');emojiRain(['📈','💹','💰','🚀'],15)},
  oof:        ()=>{mark('oof');  toast('Big oof energy 😬'); screenShake()},
  cope:       ()=>{mark('cope'); toast('Touch grass: recommended 🌿')},
  ratio:      ()=>{mark('ratio');toast('Ratio! 📊'); gsap.to('.service-card:first-child',{scale:1.3,duration:.3,yoyo:true,repeat:1})},
  linux:      ()=>{mark('linux');toast('btw I run coolserver on Linux 🐧');flashBorder('#f97316')},
  react:      ()=>{mark('react');toast('⚛️ React detected. Have you tried Vue? It\'s better here.')},
  vue:        ()=>{mark('vue');  toast('✨ You chose wisely! Vue is beautiful.'); burst(CX(),CY(),'#42b883',40)},
  vite:       ()=>{mark('vite'); toast('⚡ Blazing fast! Vite is the way.'); burst(CX(),CY(),'#646cff',30)},
  gsap:       ()=>{mark('gsap'); toast('🧙 GSAP — the animation wizard. It powers all of this!'); rainbowCards()},
  pinia:      ()=>{mark('pinia');toast('🍍 Pinia — the delicious state manager!');emojiRain(['🍍'],8)},
  docker:     ()=>{mark('docker');toast('🐋 It works on my machine™');emojiRain(['🐋'],5)},
  nginx:      ()=>{mark('nginx');toast('🔀 nginx: the silent guardian of port 80')},
  home:       ()=>{mark('home'); toast('There is no place like 127.0.0.1 🏠');window.scrollTo({top:0,behavior:'smooth'})},
  server:     ()=>{mark('server');toast('The server is always fine 🟢');flashBorder('#22c55e')},
  password:   ()=>{mark('password');toast('🔒 Security is my passion (don\'t leak it)')},
  secret:     ()=>{mark('secret');toast('Shhhhh 🤫');burst(CX(),CY(),'#7c3aed',25)},
  magic:      ()=>{mark('magic'); toast('✨ Abracadabra!'); rainbowCards(); emojiRain(['✨','⭐','🌟','💫'],15)},
  please:     ()=>{mark('please');toast('Since you said please… ✨');burst(CX(),CY(),null,30)},
  thanks:     ()=>{mark('thanks');toast("You're welcome! Anytime 🙏");burst(CX(),CY(),'#22c55e',20)},
  sorry:      ()=>{mark('sorry'); toast('Apology accepted 🤗'); emojiRain(['🤗','💙'],10)},
  help:       ()=>{mark('help');  toast('--help  Available tricks: type anything! 🤷');showReadme.value=true},
  why:        ()=>{mark('why');   toast('Why not? 🤷  Everything has a reason. Or does it?')},
  what:       ()=>{mark('what');  toast('What indeed. Quite the philosophical question.')},
  how:        ()=>{mark('how');   toast('Very carefully. 🎯')},
}

// ── Keyboard input ──
const KONAMI=['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a']
let konamiIdx=0, wordBuf='', escCount=0, escTimer=null, tabCount=0, tabTimer=null

function onKeyDown(e) {
  const tag=e.target.tagName
  if((tag==='INPUT'||tag==='TEXTAREA')&&e.key!=='Escape') return

  // Konami
  if(e.key===KONAMI[konamiIdx]){konamiIdx++;if(konamiIdx===KONAMI.length){konamiIdx=0;startKonami()}}
  else konamiIdx=0

  // Special keys
  if(e.key==='Escape'){
    wordBuf=''
    escCount++; clearTimeout(escTimer)
    escTimer=setTimeout(()=>{escCount=0},1800)
    if(escCount>=5){escCount=0;mark('esc5');toast('😱 PANIC MODE!');screenShake();gsap.to('.service-card',{rotation:()=>(Math.random()-.5)*22,duration:.2,onComplete:()=>gsap.to('.service-card',{rotation:0,duration:.4,ease:'back.out(1.4)'})})}
    return
  }
  if(e.key==='Tab'){
    tabCount++; clearTimeout(tabTimer)
    tabTimer=setTimeout(()=>{tabCount=0},600)
    if(tabCount>=3){tabCount=0;mark('tab3');toast('Tab ↹  Autocomplete: nothing found… or everything found?')}
    return
  }
  if(e.key==='F2'){e.preventDefault();fpsActive.value=!fpsActive.value;if(fpsActive.value){mark('f2');toast('⚡ FPS counter ON');fpsLast=performance.now();requestAnimationFrame(runFPS)}else{toast('⚡ FPS counter OFF');cancelAnimationFrame(fpsRaf)};return}
  if(e.key==='F1'){e.preventDefault();mark('f1');toast('F1: Help! → try typing "?" for the egg list');showReadme.value=true;return}
  if(e.key==='F5'){e.preventDefault();mark('f5');toast('♻️ Refreshing… (just kidding)');gsap.to('.app',{opacity:0,y:-10,duration:.3,ease:'power2.in',onComplete:()=>gsap.to('.app',{opacity:1,y:0,duration:.4,ease:'power2.out'})});return}
  if(e.altKey&&e.key==='F4'){e.preventDefault();mark('altf4');toast('Nice try 😉 Alt+F4 does nothing here!');return}
  if(e.ctrlKey&&e.key==='z'){mark('ctrlz');toast('Ctrl+Z → Can\'t undo awesome. 😎');return}
  if(e.ctrlKey&&e.key==='c'){mark('ctrlc');toast('^C — Copied absolutely nothing to clipboard.');return}
  if(e.shiftKey&&e.key==='?'){showReadme.value=!showReadme.value;if(showReadme.value)mark('readme');return}

  // Word buffer
  if(e.key.length===1) wordBuf=(wordBuf+e.key.toLowerCase()).slice(-18)

  // Check all triggers
  const match=Object.keys(WTRIG).find(w=>wordBuf.endsWith(w))
  if(match){wordBuf='';WTRIG[match]()}
  else if(wordBuf.endsWith('?')){wordBuf='';mark('readme');showReadme.value=true}
}

// ── Mouse / shake / dot ──
let lastMX=0,lastMY=0,shakeCount=0,shakeTimer=null,dotClicks=0,dotTimer=null
function onMouseMove(e){
  const dx=Math.abs(e.clientX-lastMX),dy=Math.abs(e.clientY-lastMY)
  if(dx+dy>55){
    shakeCount++;clearTimeout(shakeTimer)
    shakeTimer=setTimeout(()=>{shakeCount=0},1000)
    if(shakeCount>=9){shakeCount=0;mark('shake');toast('😵 Dizzy cards!');
      gsap.to('.service-card',{x:()=>(Math.random()-.5)*20,y:()=>(Math.random()-.5)*20,rotation:()=>(Math.random()-.5)*12,duration:.14,stagger:.015,ease:'power2.out',yoyo:true,repeat:4,
        onComplete:()=>gsap.to('.service-card',{x:0,y:0,rotation:0,duration:.5,ease:'back.out(1.4)'})})
    }
  }
  lastMX=e.clientX;lastMY=e.clientY
}
function onClickFx(e){
  if(e.target.closest('.brand-dot')){
    dotClicks++;clearTimeout(dotTimer)
    dotTimer=setTimeout(()=>{dotClicks=0},1800)
    if(dotClicks>=5){dotClicks=0;mark('dot5x');toast('💥 You unleashed the dot!')
      const dot=document.querySelector('.brand-dot')
      if(dot){gsap.to(dot,{scale:35,opacity:0,duration:.6,ease:'power3.in',onComplete:()=>gsap.set(dot,{scale:1,opacity:1})})
        const r=dot.getBoundingClientRect()
        burst(r.left+r.width/2,r.top+r.height/2,'var(--acc)',55)}
    }
  }
  // Logo triple-click
  if(e.target.closest('.brand-name,.brand-wordmark')){
    logoClickCt++;clearTimeout(logoTimer)
    logoTimer=setTimeout(()=>{logoClickCt=0},700)
    if(logoClickCt>=3){logoClickCt=0;mark('logo3x');toast('🔮 You said the name 3 times!')
      const b=document.querySelector('.brand');if(b){const r=b.getBoundingClientRect();burst(r.left+r.width/2,r.top+r.height/2,'#7c3aed',50)}
    }
  }
  checkCorner(e.clientX,e.clientY)
  ctx.show=false
}
let logoClickCt=0,logoTimer=null

// ── Corners ──
const CORNER_SEQ=['tl','tr','br','bl']
let cornerIdx=0,cornerTimer=null
function checkCorner(x,y){
  const m=90,w=window.innerWidth,h=window.innerHeight
  let c=null
  if(x<m&&y<m)c='tl'; else if(x>w-m&&y<m)c='tr'
  else if(x>w-m&&y>h-m)c='br'; else if(x<m&&y>h-m)c='bl'
  if(!c)return
  if(c===CORNER_SEQ[cornerIdx]){
    cornerIdx++;clearTimeout(cornerTimer)
    cornerTimer=setTimeout(()=>{cornerIdx=0},5000)
    if(cornerIdx===4){cornerIdx=0;mark('corners');toast('🔮 Ancient ritual complete!');
      burst(w/2,h/2,null,80);rainbowCards()}
  } else { cornerIdx=c===CORNER_SEQ[0]?1:0 }
}

// ── Right-click context menu ──
function onContextMenu(e){
  if(e.target.closest('.service-card,.btn,.app-header,.toolbar,.overlay,.readme-modal,.ctx-menu')) return
  e.preventDefault();mark('rightbg')
  ctx.show=true
  ctx.x=Math.min(e.clientX,window.innerWidth-190)
  ctx.y=Math.min(e.clientY,window.innerHeight-140)
}
function ctxDo(action){
  ctx.show=false
  if(action==='inspect') toast(`🔍 Position: ${ctx.x}×${ctx.y}  Stars: countless`)
  if(action==='copy') { try{navigator.clipboard.writeText(`${ctx.x},${ctx.y}`)}catch{}; toast('📋 Coordinates copied!') }
  if(action==='eggs') { showReadme.value=true }
}

// ── Double-click supernova ──
function onDblClick(e){
  if(e.target.closest('.service-card,.btn,.app-header,.toolbar,.overlay')) return
  mark('dblclick')
  const{clientX:x,clientY:y}=e
  const colors=['#7c3aed','#06b6d4','#f59e0b','#10b981','#ef4444','#8b5cf6','#ec4899']
  for(let i=0;i<7;i++){
    const sz=50+i*55;const ring=document.createElement('div')
    Object.assign(ring.style,{position:'fixed',left:`${x-sz/2}px`,top:`${y-sz/2}px`,
      width:`${sz}px`,height:`${sz}px`,borderRadius:'50%',
      border:`2px solid ${colors[i%colors.length]}`,pointerEvents:'none',zIndex:'8999'})
    document.body.appendChild(ring)
    gsap.fromTo(ring,{scale:0,opacity:.9},{scale:2.8,opacity:0,duration:1.1,delay:i*.09,ease:'power2.out',transformOrigin:'50% 50%',onComplete:()=>ring.remove()})
  }
  burst(x,y,null,45)
}

// ── Idle screensaver ──
const IDLE_MS=60000
let idleTimer=null,idleActive=false
function startIdle(){
  if(idleActive)return;idleActive=true;mark('idle');toast('😴 Screensaver mode… (move mouse to wake)')
  gsap.to('.service-card',{y:60,opacity:0,scale:.85,duration:2,stagger:{amount:1.2,from:'random'},ease:'power2.inOut'})
  gsap.to('.sec-head,.toolbar,.app-header',{opacity:.06,duration:1.5})
}
function wakeIdle(){
  if(!idleActive)return;idleActive=false
  gsap.to('.service-card',{y:0,opacity:1,scale:1,duration:.8,stagger:{amount:.6,from:'random'},ease:'back.out(1.6)'})
  gsap.to('.sec-head,.toolbar,.app-header',{opacity:1,duration:.5})
}
function resetIdle(){
  if(idleActive)wakeIdle()
  clearTimeout(idleTimer);idleTimer=setTimeout(startIdle,IDLE_MS)
}

// ── Console easter egg ──
function printConsoleEgg() {
  const s='color:#7c3aed;font-weight:700;font-size:14px'
  const m='color:#dde2f0;font-size:12px'
  console.log('%c🥚 coolserver Easter Eggs',s)
  console.log('%c113 secrets are hidden in this dashboard.',m)
  console.log('%cType "?" anywhere to see the guide.',m)
  console.log('%cHint: try the Konami code ↑↑↓↓←→←→BA',m)
  console.log('%cHint: type "matrix", "party", "hack", "disco"…',m)
  console.log('%cHint: click the glowing dot 5× fast',m)
}

// ── Lifecycle ──
onMounted(() => {
  printConsoleEgg()
  window.addEventListener('keydown',  onKeyDown)
  window.addEventListener('mousemove',onMouseMove,{passive:true})
  window.addEventListener('click',    onClickFx)
  window.addEventListener('dblclick', onDblClick)
  window.addEventListener('contextmenu',onContextMenu)
  window.addEventListener('mousemove',resetIdle,{passive:true})
  window.addEventListener('keydown',  resetIdle,{passive:true})
  window.addEventListener('click',    resetIdle,{passive:true})
  resetIdle()
})
onUnmounted(() => {
  window.removeEventListener('keydown',  onKeyDown)
  window.removeEventListener('mousemove',onMouseMove)
  window.removeEventListener('click',    onClickFx)
  window.removeEventListener('dblclick', onDblClick)
  window.removeEventListener('contextmenu',onContextMenu)
  window.removeEventListener('mousemove',resetIdle)
  window.removeEventListener('keydown',  resetIdle)
  window.removeEventListener('click',    resetIdle)
  clearTimeout(idleTimer);clearTimeout(dotTimer);clearTimeout(shakeTimer)
  clearTimeout(logoTimer);clearTimeout(cornerTimer);clearTimeout(escTimer);clearTimeout(tabTimer)
  clearInterval(discoInterval);clearTimeout(nyanTimer)
  cancelAnimationFrame(fpsRaf)
})
</script>

<style scoped>
/* ── Canvas overlays ── */
.ee-canvas { position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:400 }
.ee-crt    { z-index:420;mix-blend-mode:multiply }

/* ── Disco ── */
.disco-overlay {
  position:fixed;inset:0;pointer-events:none;z-index:390;
  animation:disco-strobe .35s steps(1) infinite;
}
@keyframes disco-strobe {
  0%  {background:rgba(255,0,128,.04)}
  25% {background:rgba(0,255,200,.04)}
  50% {background:rgba(255,200,0,.04)}
  75% {background:rgba(128,0,255,.04)}
}

/* ── BSOD ── */
.bsod-overlay {
  position:fixed;inset:0;background:#0078d4;z-index:9999;
  display:flex;flex-direction:column;align-items:flex-start;justify-content:center;
  padding:8vw;font-family:'Segoe UI',system-ui,sans-serif;color:#fff;
}
.bsod-sad  {font-size:8rem;font-weight:300;margin-bottom:1rem}
.bsod-h1   {font-size:1.4rem;font-weight:700;margin-bottom:1.5rem;max-width:600px}
.bsod-body {font-size:.9rem;opacity:.9;margin-bottom:2rem;line-height:1.8}
.bsod-pct  {font-size:1rem;margin-bottom:3rem}
.bsod-code {font-size:.75rem;opacity:.7;font-family:monospace}

/* ── Hack terminal ── */
.hack-terminal {
  position:fixed;bottom:0;left:0;right:0;max-height:45vh;
  background:#000;border-top:2px solid #00ff41;box-shadow:0 -4px 40px #00ff4130;
  z-index:450;padding:.75rem 1rem 1rem;font-family:'Fira Code','SF Mono',monospace;
}
.hack-title {font-size:.72rem;color:#00ff41;font-weight:700;letter-spacing:.1em;margin-bottom:.5rem;text-shadow:0 0 8px #00ff41}
.hack-log   {font-size:.7rem;color:#00cc33;line-height:1.7;max-height:calc(45vh - 2.5rem);overflow-y:auto;white-space:pre-wrap}

/* ── 404 ── */
.glitch-404 {
  position:fixed;inset:0;display:flex;flex-direction:column;
  align-items:center;justify-content:center;pointer-events:none;z-index:460;
}
.g404-main {
  font-size:12rem;font-weight:900;color:var(--text);position:relative;
  animation:g404-glitch .6s steps(2) infinite;text-shadow:0 0 40px var(--acc);letter-spacing:-.05em;
}
.g404-main::before,.g404-main::after {
  content:attr(data-text);position:absolute;top:0;left:0;width:100%;height:100%;
}
.g404-main::before {color:#06b6d4;left:3px;clip-path:inset(30% 0 40% 0);animation:g404-shift .4s steps(2) infinite alternate}
.g404-main::after  {color:#ef4444;left:-3px;clip-path:inset(60% 0 10% 0);animation:g404-shift .3s steps(2) infinite alternate-reverse}
.g404-sub {font-size:.9rem;color:var(--muted);letter-spacing:.15em;text-align:center;margin-top:1rem;animation:fade-up .3s ease}
@keyframes g404-glitch {0%{transform:skewX(0)}40%{transform:skewX(-1.5deg)}60%{transform:skewX(1.5deg)}100%{transform:skewX(0)}}
@keyframes g404-shift  {0%{transform:translateX(-4px)}100%{transform:translateX(4px)}}

/* ── Boss bar ── */
.boss-bar {
  position:fixed;top:0;left:0;right:0;z-index:480;
  background:var(--surf);border-bottom:1px solid var(--bdr2);
  padding:.5rem 1rem;
}
.boss-label {font-size:.75rem;font-weight:700;color:#ef4444;margin-bottom:.4rem;letter-spacing:.05em}
.boss-track {height:8px;background:var(--faint);border-radius:99px;overflow:hidden}
.boss-fill  {height:100%;background:linear-gradient(90deg,#ef4444,#f97316);border-radius:99px;box-shadow:0 0 12px #ef4444}

/* ── Chad overlay ── */
.chad-overlay {
  position:fixed;inset:0;display:flex;align-items:center;justify-content:center;
  pointer-events:none;z-index:470;
}
.chad-text {
  font-size:9rem;font-weight:900;letter-spacing:-.05em;
  background:linear-gradient(135deg,#f59e0b,#ef4444);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
  filter:drop-shadow(0 0 40px #f59e0b);
}

/* ── Sus ── */
.sus-overlay {
  position:fixed;inset:0;display:flex;align-items:center;justify-content:center;
  pointer-events:none;z-index:470;background:rgba(220,38,38,.08);
  animation:sus-pulse .5s ease-in-out infinite alternate;
}
@keyframes sus-pulse {from{background:rgba(220,38,38,.05)}to{background:rgba(220,38,38,.15)}}
.sus-text {font-size:4rem;text-shadow:0 0 30px #ef4444;animation:sus-float 1s ease-in-out infinite alternate}
@keyframes sus-float {from{transform:translateY(-10px)}to{transform:translateY(10px)}}

/* ── Vibe ── */
.vibe-overlay {
  position:fixed;inset:0;pointer-events:none;z-index:5;
  background:radial-gradient(ellipse at center,rgba(124,58,237,.06) 0%,transparent 70%);
  animation:vibe-pulse 2s ease-in-out infinite;
}
@keyframes vibe-pulse {0%,100%{opacity:.5}50%{opacity:1}}

/* ── FPS ── */
.fps-overlay {
  position:fixed;bottom:1rem;right:1rem;background:var(--surf2);border:1px solid var(--bdr2);
  color:#00ff41;font-family:monospace;font-size:.75rem;padding:.3rem .6rem;border-radius:8px;
  z-index:9999;pointer-events:none;box-shadow:0 0 12px #00ff4120;
}

/* ── Context menu ── */
.ctx-menu {
  position:fixed;z-index:9990;background:var(--surf2);border:1px solid var(--bdr2);
  border-radius:12px;padding:.4rem;min-width:180px;box-shadow:0 8px 32px #00000080;
}
.ctx-item {
  padding:.45rem .75rem;font-size:.78rem;border-radius:8px;cursor:pointer;
  color:var(--text);transition:background .15s;
}
.ctx-item:hover {background:var(--surf)}
.ctx-item.ctx-dim {color:var(--muted)}
.ctx-sep {height:1px;background:var(--bdr);margin:.3rem 0}

/* ── Toasts ── */
.ee-toasts {
  position:fixed;bottom:2rem;left:50%;transform:translateX(-50%);
  z-index:9998;display:flex;flex-direction:column;gap:.5rem;align-items:center;pointer-events:none;
}
.ee-toast {
  background:var(--surf2);border:1px solid var(--bdr2);color:var(--text);
  padding:.5rem 1.1rem;border-radius:100px;font-size:.82rem;font-weight:600;white-space:pre;
  box-shadow:0 4px 20px #00000060,0 0 12px color-mix(in srgb,var(--acc) 20%,transparent);
  max-width:90vw;text-overflow:ellipsis;overflow:hidden;
}
.ee-toast-enter-active {transition:all .3s var(--spring)}
.ee-toast-leave-active {transition:all .25s ease}
.ee-toast-enter-from  {opacity:0;transform:translateY(12px) scale(.9)}
.ee-toast-leave-to    {opacity:0;transform:translateY(-8px) scale(.9)}

/* ── Readme modal ── */
.ee-backdrop {
  position:fixed;inset:0;z-index:500;background:#000000cc;
  backdrop-filter:blur(12px);display:flex;align-items:center;justify-content:center;padding:1rem;
}
.readme-modal {
  background:var(--surf);border:1px solid var(--bdr2);
  border-radius:20px;padding:1.75rem;width:100%;max-width:500px;
  box-shadow:0 24px 80px #00000080;max-height:85vh;overflow-y:auto;
}
.readme-hdr {display:flex;align-items:center;gap:.75rem;margin-bottom:1rem}
.readme-title {font-size:1.05rem;font-weight:800;letter-spacing:-.02em;flex:1}
.readme-progress {font-size:.78rem;color:var(--acc);font-weight:700;font-family:monospace}
.readme-close {
  width:28px;height:28px;border-radius:8px;border:1px solid var(--bdr2);background:var(--surf2);
  color:var(--muted);font-size:.75rem;cursor:pointer;display:flex;align-items:center;justify-content:center;
  transition:all .15s;
}
.readme-close:hover {color:var(--text);background:var(--surf)}
.readme-intro {font-size:.82rem;color:var(--muted);margin-bottom:1.25rem;line-height:1.6}
.found-ct  {color:var(--acc);font-weight:700}
.all-found {color:#f59e0b;font-weight:700}
.egg-list  {display:flex;flex-direction:column;gap:.45rem}
.egg-entry {
  display:flex;align-items:flex-start;gap:.7rem;
  background:var(--faint);border:1px solid var(--bdr);
  border-radius:10px;padding:.55rem .8rem;transition:border-color .2s;
}
.egg-entry.found {border-color:var(--acc);background:color-mix(in srgb,var(--acc) 8%,var(--faint))}
.egg-chk {font-size:.78rem;color:var(--muted);padding-top:2px;flex-shrink:0;width:14px}
.egg-entry.found .egg-chk {color:var(--acc)}
.egg-trigger {font-size:.76rem;font-weight:700;color:var(--text);font-family:'SF Mono',monospace;display:block;margin-bottom:1px}
.egg-desc {font-size:.7rem;color:var(--muted)}
.readme-foot {margin-top:1rem;padding-top:1rem;border-top:1px solid var(--bdr);text-align:center}
.btn-reset-eggs {
  font-size:.72rem;color:var(--muted);background:none;border:1px solid var(--bdr);
  border-radius:8px;padding:.3rem .7rem;cursor:pointer;transition:all .15s;font-family:inherit;
}
.btn-reset-eggs:hover {color:var(--text);border-color:var(--bdr2)}
</style>
