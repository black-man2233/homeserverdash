<template>
  <div
    class="card"
    :class="{ dead }"
    :style="`--c:${color};--cg:${color}18`"
    @click="onClick"
    @mousemove="onMouseMove"
    @mouseleave="onMouseLeave"
    ref="cardEl"
  >
    <div class="spot" />

    <div class="cactions" @click.stop>
      <button class="caction-btn" title="Edit"   @click="emit('edit',   service.id)">✏</button>
      <button class="caction-btn del" title="Delete" @click="emit('delete', service.id)">✕</button>
    </div>

    <div class="cicon">{{ service.icon }}</div>
    <div class="cname">{{ service.name }}</div>
    <div class="cfoot">
      <span v-if="net === 'cf' && !service.cf" class="cbadge warn">not exposed</span>
      <span v-else-if="net === 'cf'"            class="cbadge">{{ service.cf }}.{{ cfg.cf }}</span>
      <span v-else                               class="cbadge">:{{ service.port }}</span>
      <span v-if="!dead" class="carr">↗</span>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { gsap } from 'gsap'
import { CFG } from '../config'

const props = defineProps({
  service: { type: Object, required: true },
  href:    { type: String, default: null },
  dead:    { type: Boolean, default: false },
  color:   { type: String, default: '#7c3aed' },
  net:     { type: String, default: 'local' },
})

const emit = defineEmits(['edit', 'delete', 'launch'])
const cardEl = ref(null)
const cfg = CFG

function onClick() {
  if (props.dead || !props.href) return
  const r = cardEl.value.getBoundingClientRect()

  // Click squish then emit
  gsap.to(cardEl.value, {
    scale: 0.93, duration: 0.08, ease: 'power2.in',
    onComplete: () => {
      gsap.to(cardEl.value, { scale: 1, duration: 0.3, ease: 'back.out(2)' })
    }
  })

  emit('launch', {
    href:  props.href,
    x:     r.left + r.width  / 2,
    y:     r.top  + r.height / 2,
    color: props.color,
  })
}

function onMouseMove(e) {
  if (props.dead) return
  const r = cardEl.value.getBoundingClientRect()
  const x = e.clientX - r.left
  const y = e.clientY - r.top
  cardEl.value.style.setProperty('--mx', (x / r.width  * 100).toFixed(1) + '%')
  cardEl.value.style.setProperty('--my', (y / r.height * 100).toFixed(1) + '%')
  const dx = (x - r.width  / 2) / r.width  * 2
  const dy = (y - r.height / 2) / r.height * 2
  cardEl.value.style.transform = `perspective(700px) rotateY(${dx * 8}deg) rotateX(${-dy * 8}deg) translateY(-4px) scale(1.02)`
}

function onMouseLeave() {
  if (props.dead) return
  gsap.to(cardEl.value, { rotateX: 0, rotateY: 0, y: 0, scale: 1, duration: 0.4, ease: 'back.out(1.4)', clearProps: 'transform' })
}
</script>

<style scoped>
.card {
  --c: var(--acc);
  --cg: #7c3aed18;
  position: relative;
  overflow: hidden;
  background: var(--surf);
  border: 1px solid var(--bdr);
  border-radius: var(--r);
  padding: 1.1rem 1rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  cursor: pointer;
  transition: border-color 0.2s ease, box-shadow 0.25s ease, background 0.2s ease;
}

.card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 1.5px;
  background: linear-gradient(90deg, transparent, var(--c), transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.card:not(.dead):hover {
  border-color: var(--c);
  background: var(--surf2);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--c) 20%, transparent),
              0 8px 32px var(--cg);
}

.card:not(.dead):hover::before { opacity: 1 }
.card.dead { opacity: 0.3; cursor: default }

/* Spotlight */
.spot {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: radial-gradient(circle at var(--mx, 50%) var(--my, 50%), var(--cg) 0%, transparent 65%);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}
.card:not(.dead):hover .spot { opacity: 1 }

/* Actions */
.cactions {
  position: absolute;
  top: 0.6rem;
  right: 0.6rem;
  display: flex;
  gap: 0.3rem;
  z-index: 10;
  opacity: 0;
  transform: translateY(-4px);
  transition: opacity 0.2s ease, transform 0.2s ease;
  pointer-events: none;
}
.card:hover .cactions { opacity: 1; transform: translateY(0); pointer-events: all }

.caction-btn {
  width: 26px; height: 26px;
  border-radius: 8px;
  border: 1px solid var(--bdr2);
  background: var(--surf2);
  color: var(--muted);
  font-size: 0.75rem;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.15s ease;
}
.caction-btn:hover { background: var(--surf); color: var(--text); transform: scale(1.1) }
.caction-btn.del:hover { border-color: #dc262640; color: #f87171; background: #dc262610 }

/* Content */
.cicon {
  font-size: 1.7rem;
  line-height: 1;
  position: relative;
  z-index: 1;
  transition: transform 0.3s var(--spring);
}
.card:not(.dead):hover .cicon { transform: scale(1.15) }

.cname {
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  position: relative;
  z-index: 1;
}

.cfoot {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-top: auto;
  position: relative;
  z-index: 1;
}

.cbadge {
  font-family: 'SF Mono', 'Fira Code', ui-monospace, monospace;
  font-size: 0.63rem;
  color: var(--muted);
  background: var(--faint);
  padding: 0.18rem 0.45rem;
  border-radius: 6px;
  letter-spacing: 0.02em;
}
.cbadge.warn { color: #f97316aa; background: #f9731610 }

.carr {
  margin-left: auto;
  font-size: 0.75rem;
  color: var(--muted);
  opacity: 0;
  transition: opacity 0.2s, transform 0.2s var(--spring);
}
.card:not(.dead):hover .carr { opacity: 1; transform: translate(2px, -2px) }
</style>
