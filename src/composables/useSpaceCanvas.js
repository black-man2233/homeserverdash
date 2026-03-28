import { onMounted, onUnmounted } from 'vue'

export function useSpaceCanvas(canvasRef) {
  let animId = null
  let W, H
  let mouseX = 0.5, mouseY = 0.5
  let targetX = 0.5, targetY = 0.5

  const COLORS = ['#ffffff', '#c7d2fe', '#bae6fd', '#e9d5ff', '#fbcfe8']

  const stars = Array.from({ length: 320 }, () => ({
    x:     Math.random(),
    y:     Math.random(),
    r:     Math.random() * 1.5 + 0.2,
    phase: Math.random() * Math.PI * 2,
    spd:   Math.random() * 0.6 + 0.2,
    max:   Math.random() * 0.6 + 0.3,
    col:   COLORS[Math.floor(Math.random() * COLORS.length)],
  }))

  const nebulae = [
    { x: 0.12, y: 0.20, r: 380, col: [120, 30, 220],  a: 0.09, dx:  0.000025, dy:  0.000015 },
    { x: 0.85, y: 0.15, r: 300, col: [20, 100, 220],   a: 0.07, dx: -0.000020, dy:  0.000020 },
    { x: 0.50, y: 0.85, r: 420, col: [80, 0, 180],     a: 0.08, dx:  0.000015, dy: -0.000010 },
    { x: 0.70, y: 0.55, r: 260, col: [160, 20, 120],   a: 0.05, dx: -0.000030, dy:  0.000025 },
    { x: 0.30, y: 0.60, r: 200, col: [40, 160, 200],   a: 0.04, dx:  0.000018, dy: -0.000012 },
  ]

  // Aurora beams — slow horizontal bands of color
  const auroras = [
    { y: 0.18, hue: 268, phase: 0.0, spd: 0.00022, amp: 0.07, a: 0.048 },
    { y: 0.52, hue: 195, phase: 2.1, spd: 0.00016, amp: 0.09, a: 0.035 },
    { y: 0.75, hue: 290, phase: 3.8, spd: 0.00028, amp: 0.05, a: 0.030 },
  ]

  // Ember particles — tiny dots floating upward
  const embers = Array.from({ length: 35 }, () => ({
    x:      Math.random(),
    y:      Math.random(),
    r:      Math.random() * 1.1 + 0.4,
    vy:     Math.random() * 0.00025 + 0.00012,
    wobble: Math.random() * Math.PI * 2,
    wSpd:   (Math.random() - 0.5) * 0.022,
    hue:    255 + Math.random() * 90,
    alpha:  Math.random() * 0.45 + 0.15,
  }))

  const shoots = []
  function spawnShoot() {
    shoots.push({
      x: Math.random() * 0.6 * W, y: Math.random() * 0.4 * H,
      len: Math.random() * 130 + 60,
      spd: Math.random() * 10 + 8,
      ang: Math.PI * 0.25 + (Math.random() - 0.5) * 0.35,
      life: 1,
      decay: Math.random() * 0.02 + 0.012,
    })
  }

  let t = 0
  let shootTimer

  function draw() {
    const cv = canvasRef.value
    if (!cv) return
    const cx = cv.getContext('2d')
    cx.clearRect(0, 0, W, H)

    // Smooth mouse interpolation
    mouseX += (targetX - mouseX) * 0.04
    mouseY += (targetY - mouseY) * 0.04

    // Nebulae
    nebulae.forEach(n => {
      n.x = ((n.x + n.dx) % 1.4) - 0.2
      n.y = ((n.y + n.dy) % 1.4) - 0.2
      const g = cx.createRadialGradient(n.x * W, n.y * H, 0, n.x * W, n.y * H, n.r)
      const [r, gv, b] = n.col
      g.addColorStop(0, `rgba(${r},${gv},${b},${n.a})`)
      g.addColorStop(1, `rgba(${r},${gv},${b},0)`)
      cx.fillStyle = g
      cx.fillRect(0, 0, W, H)
    })

    // Aurora beams
    auroras.forEach(a => {
      const cy  = (a.y + Math.sin(t * a.spd * 1200 + a.phase) * a.amp) * H
      const bw  = H * 0.22
      const g   = cx.createLinearGradient(0, cy - bw, 0, cy + bw)
      g.addColorStop(0,    `hsla(${a.hue}, 85%, 65%, 0)`)
      g.addColorStop(0.35, `hsla(${a.hue}, 85%, 65%, ${a.a * 0.55})`)
      g.addColorStop(0.5,  `hsla(${a.hue}, 85%, 65%, ${a.a})`)
      g.addColorStop(0.65, `hsla(${a.hue}, 85%, 65%, ${a.a * 0.55})`)
      g.addColorStop(1,    `hsla(${a.hue}, 85%, 65%, 0)`)
      cx.fillStyle = g
      cx.fillRect(0, cy - bw, W, bw * 2)
    })

    // Stars with parallax
    stars.forEach(s => {
      const alpha = s.max * (0.45 + 0.55 * Math.sin(t * s.spd + s.phase))
      const px = (s.x + (mouseX - 0.5) * s.r * 0.035) * W
      const py = (s.y + (mouseY - 0.5) * s.r * 0.035) * H
      cx.beginPath()
      cx.arc(px, py, s.r, 0, Math.PI * 2)
      cx.fillStyle = s.col
      cx.globalAlpha = alpha
      cx.fill()
    })
    cx.globalAlpha = 1

    // Embers (floating upward with wobble)
    embers.forEach(e => {
      e.y       -= e.vy
      e.wobble  += e.wSpd
      if (e.y < -0.02) { e.y = 1.02; e.x = Math.random() }
      const px = (e.x + Math.sin(e.wobble) * 0.013) * W
      const py = e.y * H
      cx.beginPath()
      cx.arc(px, py, e.r, 0, Math.PI * 2)
      cx.fillStyle = `hsl(${e.hue}, 80%, 72%)`
      cx.globalAlpha = e.alpha * (0.4 + 0.6 * Math.abs(Math.sin(t * 1.8 + e.wobble * 2)))
      cx.fill()
    })
    cx.globalAlpha = 1

    // Shooting stars
    for (let i = shoots.length - 1; i >= 0; i--) {
      const s = shoots[i]
      const tail = {
        x: s.x - Math.cos(s.ang) * s.len * s.life,
        y: s.y - Math.sin(s.ang) * s.len * s.life,
      }
      const g = cx.createLinearGradient(tail.x, tail.y, s.x, s.y)
      g.addColorStop(0, 'rgba(255,255,255,0)')
      g.addColorStop(1, `rgba(255,255,255,${s.life * 0.9})`)
      cx.beginPath()
      cx.moveTo(tail.x, tail.y)
      cx.lineTo(s.x, s.y)
      cx.strokeStyle = g
      cx.lineWidth = 1.5
      cx.stroke()
      cx.beginPath()
      cx.arc(s.x, s.y, 1.5 * s.life, 0, Math.PI * 2)
      cx.fillStyle = `rgba(255,255,255,${s.life})`
      cx.fill()

      s.x += Math.cos(s.ang) * s.spd
      s.y += Math.sin(s.ang) * s.spd
      s.life -= s.decay
      if (s.life <= 0) shoots.splice(i, 1)
    }

    t += 0.016
    animId = requestAnimationFrame(draw)
  }

  function resize() {
    const cv = canvasRef.value
    if (!cv) return
    W = cv.width  = window.innerWidth
    H = cv.height = window.innerHeight
  }

  function onMouseMove(e) {
    targetX = e.clientX / window.innerWidth
    targetY = e.clientY / window.innerHeight
  }

  onMounted(() => {
    resize()
    spawnShoot()
    shootTimer = setInterval(() => spawnShoot(), 4500 + Math.random() * 3000)
    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', onMouseMove)
    draw()
  })

  onUnmounted(() => {
    cancelAnimationFrame(animId)
    clearInterval(shootTimer)
    window.removeEventListener('resize', resize)
    window.removeEventListener('mousemove', onMouseMove)
  })
}
