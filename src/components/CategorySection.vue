<template>
  <div class="section" :style="`--cat-c: ${category.color}`" ref="sectionEl">
    <div class="sec-head">
      <span class="sec-icon">{{ category.icon }}</span>
      <span class="sec-label">{{ category.label }}</span>
      <span class="sec-count" ref="countEl">{{ services.length }}</span>
    </div>

    <TransitionGroup name="card-list" tag="div" class="grid">
      <ServiceCard
        v-for="svc in services"
        :key="svc.id"
        class="service-card"
        :service="svc"
        :href="store.svcURL(svc)"
        :dead="store.svcURL(svc) === null"
        :color="category.color"
        :net="store.net"
        @edit="emit('edit', $event)"
        @delete="emit('delete', $event)"
        @launch="emit('launch', $event)"
      />
    </TransitionGroup>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { gsap } from 'gsap'
import ServiceCard from './ServiceCard.vue'
import { useDashboardStore } from '../stores/dashboard'

defineProps({
  category: { type: Object, required: true },
  services: { type: Array,  required: true },
})

const emit    = defineEmits(['edit', 'delete', 'launch'])
const store   = useDashboardStore()
const sectionEl = ref(null)
const countEl   = ref(null)

let io = null

onMounted(() => {
  // Scroll-reveal: set up after a delay to avoid conflicting with intro stagger
  setTimeout(() => {
    if (!sectionEl.value) return
    let revealed = false

    io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !revealed) {
          revealed = true

          // Count badge bounce
          if (countEl.value) {
            gsap.from(countEl.value, { scale: 1.5, opacity: 0, duration: 0.3, ease: 'back.out(2)' })
          }

          // Shimmer pass on section header line
          const head = sectionEl.value?.querySelector('.sec-head')
          if (head) {
            gsap.fromTo(head, { opacity: 0.5 }, { opacity: 1, duration: 0.3 })
          }

          io?.disconnect()
          io = null
        }
      })
    }, { threshold: 0.2 })

    io.observe(sectionEl.value)
  }, 1800)
})

onUnmounted(() => { io?.disconnect() })
</script>

<style scoped>
.section { margin-bottom: 2.5rem }

.sec-head {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding-bottom: 0.65rem;
  border-bottom: 1px solid var(--bdr);
  position: relative;
}
.sec-head::after {
  content: '';
  position: absolute;
  bottom: -1px; left: 0;
  width: 40px; height: 1px;
  background: var(--cat-c, var(--acc));
  box-shadow: 0 0 8px var(--cat-c, var(--acc));
  animation: shimmer-pass 4s ease-in-out infinite;
}

.sec-icon  { font-size: 0.85rem }
.sec-label {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: var(--cat-c, var(--muted));
}
.sec-count {
  font-size: 0.65rem;
  color: var(--muted);
  margin-left: 0.25rem;
  background: var(--faint);
  padding: 0.1rem 0.4rem;
  border-radius: 6px;
  display: inline-block;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(168px, 1fr));
  gap: 0.85rem;
  position: relative;
}

@media (max-width: 640px) {
  .grid { grid-template-columns: repeat(auto-fill, minmax(145px, 1fr)); gap: 0.7rem }
}
</style>
