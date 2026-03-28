import { defineStore } from 'pinia'
import { ref } from 'vue'
import { PASSWORD_HASH } from '../config'

export const useAuthStore = defineStore('auth', () => {
  const authenticated = ref(sessionStorage.getItem('cs_auth') === '1')
  const freshLogin    = ref(false)

  async function login(password) {
    const buf  = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password))
    const hash = [...new Uint8Array(buf)].map(x => x.toString(16).padStart(2, '0')).join('')
    if (hash === PASSWORD_HASH) {
      sessionStorage.setItem('cs_auth', '1')
      authenticated.value = true
      freshLogin.value    = true
      return true
    }
    return false
  }

  function logout() {
    sessionStorage.removeItem('cs_auth')
    authenticated.value = false
    freshLogin.value    = false
  }

  function consumeFreshLogin() {
    const was = freshLogin.value
    freshLogin.value = false
    return was
  }

  return { authenticated, freshLogin, login, logout, consumeFreshLogin }
})
