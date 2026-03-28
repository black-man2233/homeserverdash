<template>
  <div class="login-page">
    <SpaceCanvas />

    <div class="login-wrap">
      <div class="login-card" ref="cardEl" :class="{ shake: shaking }">
        <div class="login-brand">
          <div class="login-dot" />
          <div class="login-title">coolserver</div>
          <div class="login-sub">home dashboard</div>
        </div>

        <form @submit.prevent="onSubmit">
          <div class="field">
            <label>Password</label>
            <input
              v-model="password"
              type="password"
              placeholder="Enter password"
              autocomplete="current-password"
              autofocus
              ref="inputEl"
            >
          </div>

          <button
            type="submit"
            class="login-btn"
            :disabled="loading"
            ref="btnEl"
          >
            <span v-if="loading" class="spinner" />
            <span v-else>Unlock</span>
          </button>

          <div class="login-error" :class="{ show: error }">
            Incorrect password. Please try again.
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { gsap } from 'gsap'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import SpaceCanvas from '../components/SpaceCanvas.vue'

const router = useRouter()
const auth   = useAuthStore()

const password = ref('')
const loading  = ref(false)
const error    = ref(false)
const shaking  = ref(false)
const cardEl   = ref(null)
const btnEl    = ref(null)
const inputEl  = ref(null)

onMounted(() => {
  gsap.from(cardEl.value, {
    y: 32, opacity: 0, scale: 0.92, filter: 'blur(8px)',
    duration: 0.6, ease: 'back.out(1.7)',
  })

  // Magnetic button
  btnEl.value?.addEventListener('mousemove', (e) => {
    const r = btnEl.value.getBoundingClientRect()
    const x = (e.clientX - r.left - r.width  / 2) * 0.2
    const y = (e.clientY - r.top  - r.height / 2) * 0.2
    gsap.to(btnEl.value, { x, y, duration: 0.25, ease: 'power2.out' })
  })
  btnEl.value?.addEventListener('mouseleave', () => {
    gsap.to(btnEl.value, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.4)' })
  })
})

async function onSubmit() {
  if (loading.value) return
  error.value   = false
  loading.value = true

  gsap.to(btnEl.value, { scale: 0.95, duration: 0.1 })
  const ok = await auth.login(password.value)
  gsap.to(btnEl.value, { scale: 1, duration: 0.2, ease: 'back.out(2)' })

  if (ok) {
    // Card flies upward before routing
    gsap.to(cardEl.value, {
      y: -80, opacity: 0, scale: 0.9, filter: 'blur(6px)',
      duration: 0.45, ease: 'power3.in',
      onComplete: () => router.push('/dashboard'),
    })
  } else {
    loading.value = false
    error.value   = true
    shaking.value = true

    // Border flash red
    gsap.to(cardEl.value, {
      boxShadow: '0 0 0 2px #dc2626, 0 0 30px #dc262640',
      duration: 0.15,
      yoyo: true,
      repeat: 3,
      onComplete: () => {
        shaking.value = false
        gsap.set(cardEl.value, { boxShadow: '' })
      },
    })

    password.value = ''
    setTimeout(() => inputEl.value?.focus(), 400)
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
}

.login-wrap {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.login-card {
  background: var(--surf);
  border: 1px solid var(--bdr2);
  border-radius: 24px;
  padding: 2.5rem 2rem;
  width: 100%;
  max-width: 360px;
  box-shadow: 0 32px 96px #00000090;
  will-change: transform, opacity;
}

.login-card.shake { animation: shake 0.4s ease }

.login-brand {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 2rem;
}

.login-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--acc);
  box-shadow: 0 0 14px var(--acc), 0 0 40px color-mix(in srgb, var(--acc) 60%, transparent);
  animation: pulse-glow 2.5s ease-in-out infinite;
}

.login-title {
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: -0.04em;
  background: linear-gradient(135deg, #fff 30%, var(--acc2));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.login-sub {
  font-size: 0.7rem;
  color: var(--muted);
  letter-spacing: 0.1em;
}

.field {
  margin-bottom: 1.25rem;
}

.field label {
  display: block;
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 0.5rem;
}

.field input {
  width: 100%;
  background: var(--surf2);
  border: 1px solid var(--bdr);
  border-radius: 12px;
  padding: 0.7rem 1rem;
  color: var(--text);
  font-size: 0.95rem;
  font-family: inherit;
  transition: border-color 0.15s, box-shadow 0.15s;
  outline: none;
}
.field input:focus {
  border-color: var(--acc);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--acc) 20%, transparent);
}
.field input::placeholder { color: var(--muted) }

.login-btn {
  width: 100%;
  background: linear-gradient(135deg, var(--acc), #5b21b6);
  border: none;
  border-radius: 12px;
  padding: 0.75rem;
  color: #fff;
  font-size: 0.9rem;
  font-weight: 700;
  font-family: inherit;
  letter-spacing: 0.02em;
  cursor: pointer;
  box-shadow: 0 4px 24px color-mix(in srgb, var(--acc) 50%, transparent);
  transition: filter 0.18s ease, box-shadow 0.18s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 46px;
  will-change: transform;
}
.login-btn:hover:not(:disabled) {
  filter: brightness(1.12);
  box-shadow: 0 6px 32px color-mix(in srgb, var(--acc) 65%, transparent);
}
.login-btn:disabled { opacity: 0.65; cursor: not-allowed }

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

.login-error {
  margin-top: 1rem;
  padding: 0.65rem 1rem;
  background: #dc262618;
  border: 1px solid #dc262640;
  border-radius: 10px;
  color: #f87171;
  font-size: 0.8rem;
  text-align: center;
  opacity: 0;
  transform: translateY(-4px);
  transition: opacity 0.2s, transform 0.2s;
  pointer-events: none;
}
.login-error.show {
  opacity: 1;
  transform: none;
  pointer-events: auto;
}
</style>
