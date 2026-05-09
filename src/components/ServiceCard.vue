<template>
  <div
    class="card"
    :class="{ dead }"
    :style="`--c: ${color}`"
    @click="onClick"
  >
    <div class="card-actions" @click.stop>
      <button class="act-btn" title="Edit"   @click="emit('edit',   service.id)">✏</button>
      <button class="act-btn del" title="Delete" @click="emit('delete', service.id)">✕</button>
    </div>

    <div class="card-icon">
      <Icon v-if="isIconify" :icon="service.icon" width="26" height="26" />
      <span v-else class="emoji-icon">{{ service.icon }}</span>
    </div>

    <div class="card-name">{{ service.name }}</div>

    <div class="card-foot">
      <span v-if="net === 'live' && liveMode === 'subdomain' && !service.cf" class="badge warn">no url</span>
      <span v-else-if="net === 'live' && liveMode === 'subdomain' && service.cf" class="badge">{{ service.cf }}.{{ liveHost }}</span>
      <span v-else class="badge">:{{ service.port }}</span>
      <span v-if="!dead" class="arr">↗</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Icon } from '@iconify/vue'
import { useDashboardStore } from '../stores/dashboard'

const props = defineProps({
  service: { type: Object,  required: true },
  href:    { type: String,  default: null  },
  dead:    { type: Boolean, default: false },
  color:   { type: String,  default: '#64748b' },
  net:     { type: String,  default: 'local' },
})

const emit     = defineEmits(['edit', 'delete', 'launch'])
const store    = useDashboardStore()
const liveHost = computed(() => store.cfg.live?.host ?? '')
const liveMode = computed(() => store.cfg.live?.mode ?? 'subdomain')

const isIconify = computed(() => props.service.icon?.includes(':'))

function onClick() {
  if (props.dead || !props.href) return
  emit('launch', { href: props.href })
}
</script>

<style scoped>
.card {
  --c: var(--acc);

  position: relative;
  background: var(--surf);
  border: 1px solid var(--bdr);
  border-left: 3px solid var(--c);
  border-radius: var(--r);
  padding: 1rem 0.875rem 0.875rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-height: 120px;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}

.card:not(.dead):hover {
  background: var(--surf2);
  border-color: var(--bdr2);
}

.card.dead { opacity: 0.35; cursor: default }

/* Actions */
.card-actions {
  position: absolute;
  top: 0.5rem; right: 0.5rem;
  display: flex; gap: 0.2rem;
  opacity: 0;
  transition: opacity 0.15s;
  pointer-events: none;
}
.card:hover .card-actions { opacity: 1; pointer-events: all }

.act-btn {
  width: 22px; height: 22px;
  border-radius: 5px;
  border: 1px solid var(--bdr);
  background: var(--surf2);
  color: var(--muted);
  font-size: 0.65rem;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: color 0.15s, border-color 0.15s;
}
.act-btn:hover { color: var(--text) }
.act-btn.del:hover { color: #f87171; border-color: rgba(220,38,38,0.4) }

.card-icon {
  color: var(--c);
  line-height: 1;
}
.emoji-icon { font-size: 1.6rem }

.card-name {
  font-size: 0.825rem;
  font-weight: 600;
  color: var(--text);
  letter-spacing: -0.01em;
}

.card-foot {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  margin-top: auto;
}

.badge {
  font-family: ui-monospace, monospace;
  font-size: 0.6rem;
  color: var(--muted);
  background: var(--bdr);
  padding: 0.12rem 0.35rem;
  border-radius: 4px;
}
.badge.warn { color: #f97316; background: rgba(249,115,22,0.1) }

.arr {
  margin-left: auto;
  font-size: 0.7rem;
  color: var(--muted);
  opacity: 0;
  transition: opacity 0.15s;
}
.card:not(.dead):hover .arr { opacity: 1 }
</style>
