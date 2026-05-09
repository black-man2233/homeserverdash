<template>
  <div class="category-section" :style="`--c: ${category.color}`" ref="sectionEl">
    <div class="sec-header">
      <span class="sec-bar" />
      <span class="sec-label">{{ category.label }}</span>
      <span class="sec-count">{{ services.length }}</span>
    </div>

    <TransitionGroup name="card-list" tag="div" class="cards-grid">
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
import ServiceCard from './ServiceCard.vue'
import { useDashboardStore } from '../stores/dashboard'

defineProps({
  category: { type: Object, required: true },
  services: { type: Array,  required: true },
})

const emit  = defineEmits(['edit', 'delete', 'launch'])
const store = useDashboardStore()
</script>

<style scoped>
.category-section {
  margin-bottom: 2.5rem;
  scroll-margin-top: 1.5rem;
}

.sec-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.sec-bar {
  width: 3px; height: 16px;
  border-radius: 2px;
  background: var(--c, var(--acc));
  flex-shrink: 0;
}

.sec-label {
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--muted);
}

.sec-count {
  font-size: 0.63rem;
  color: var(--muted);
  background: var(--bdr);
  padding: 0.08rem 0.32rem;
  border-radius: 4px;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(165px, 1fr));
  gap: 0.75rem;
  position: relative;
}
</style>
