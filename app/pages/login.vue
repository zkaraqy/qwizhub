<script setup lang="ts">
definePageMeta({
  auth: { unauthenticatedOnly: true, navigateAuthenticatedTo: '/dashboard' }
})

const { signIn } = useAuth()

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref<string | null>(null)

const signInWithProvider = async (provider: string) => {
  error.value = null
  loading.value = true
  try {
    await signIn(provider, { callbackUrl: '/dashboard' })
  } catch (err: any) {
    error.value = err?.message ?? 'Sign-in failed'
  } finally {
    loading.value = false
  }
}

const signInWithCredentials = async () => {
  error.value = null
  
  // Validasi input
  if (!email.value || !password.value) {
    error.value = 'Email and password are required'
    return
  }
  
  loading.value = true
  try {
    const result = await signIn('credentials', { 
      email: email.value, 
      password: password.value,
      redirect: false
    })
    
    if (result?.error) {
      error.value = 'Invalid email or password'
    } else {
      // Redirect ke dashboard jika berhasil
      await navigateTo('/dashboard')
    }
  } catch (err: any) {
    error.value = err?.message ?? 'Sign-in failed'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-vh-100 d-flex align-items-center justify-content-center py-4 py-lg-5" style="background-color: #F8FAFA;">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
          <!-- Main Centered Login Card -->
          <div class="card border rounded-4 bg-white shadow-sm p-4 p-md-5" style="border-color: #E2E8F0;">
            <!-- Top Navigation & Brand -->
            <div class="mb-4 d-flex align-items-center justify-content-between">
              <NuxtLink to="/" class="text-decoration-none d-flex align-items-center gap-2">
                <span class="fw-bold fs-4" style="color: #0E3B43;">QwizHub</span>
                <span class="badge rounded-pill py-1 px-2 fw-medium" style="background-color: #EBF5F3; color: #137A7F; font-size: 0.65rem;">
                  AI Research
                </span>
              </NuxtLink>
              <NuxtLink to="/" class="btn btn-sm btn-light border text-secondary rounded-pill px-2.5 py-1 d-inline-flex align-items-center gap-1" style="font-size: 0.75rem;">
                <i class="bi bi-arrow-left"></i>
                <span>Beranda</span>
              </NuxtLink>
            </div>
            
            <!-- Header Text -->
            <p class="text-uppercase fw-bold small mb-1" style="color: #137A7F; letter-spacing: 0.08em; font-size: 0.75rem;">
              SELAMAT DATANG KEMBALI
            </p>
            <h3 class="fw-bold mb-4" style="color: #0E3B43;">Masuk ke Akun</h3>

            <!-- Error Alert -->
            <div v-if="error" class="alert alert-danger alert-dismissible fade show d-flex align-items-center gap-2 py-2 px-3 rounded-3 small mb-3" role="alert">
              <i class="bi bi-exclamation-circle-fill flex-shrink-0 text-danger"></i>
              <div>{{ error }}</div>
              <button type="button" class="btn-close ms-auto p-2" @click="error = null" aria-label="Close"></button>
            </div>

            <!-- Google Sign In -->
            <button 
              type="button" 
              class="btn btn-outline-secondary w-100 mb-3 py-2.5 rounded-3 d-flex align-items-center justify-content-center gap-2 bg-white text-dark qh-google-btn"
              @click="signInWithProvider('google')" 
              :disabled="loading"
            >
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
                <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2.01c-.71.48-1.62.75-2.7.75-2.08 0-3.84-1.4-4.48-3.29H1.83v2.07A8 8 0 0 0 8.98 17z"/>
                <path fill="#FBBC05" d="M4.5 10.51a4.8 4.8 0 0 1 0-3.02V5.42H1.83a8 8 0 0 0 0 7.16l2.67-2.07z"/>
                <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.42L4.5 7.49c.64-1.89 2.4-3.3 4.48-3.3z"/>
              </svg>
              <span class="fw-medium small">Lanjutkan dengan Google</span>
            </button>

            <!-- Divider -->
            <div class="d-flex align-items-center my-2">
              <span class="flex-grow-1" style="height: 1px; background-color: #EEF2F6;"></span>
              <span class="px-3 small" style="color: #94A3B8; font-size: 0.75rem;">atau dengan email</span>
              <span class="flex-grow-1" style="height: 1px; background-color: #EEF2F6;"></span>
            </div>

            <!-- Credentials Form -->
            <form @submit.prevent="signInWithCredentials">
              <div class="mb-3">
                <label for="email" class="form-label small fw-semibold text-dark mb-1">Alamat Email</label>
                <input 
                  v-model="email"
                  type="email" 
                  class="form-control py-2 rounded-3 qh-input" 
                  id="email"
                  placeholder="nama@email.com"
                  required
                  :disabled="loading"
                >
              </div>

              <div class="mb-3">
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <label for="password" class="form-label small fw-semibold text-dark mb-0">Kata Sandi</label>
                  <NuxtLink to="/forgot-password" class="text-decoration-none small" style="color: #137A7F; font-size: 0.8rem;">
                    Lupa password?
                  </NuxtLink>
                </div>
                <input 
                  v-model="password"
                  type="password" 
                  class="form-control py-2 rounded-3 qh-input" 
                  id="password"
                  placeholder="••••••••"
                  required
                  :disabled="loading"
                >
              </div>

              <div class="form-check mb-3">
                <input class="form-check-input qh-checkbox" type="checkbox" id="remember">
                <label class="form-check-label small text-secondary" for="remember">
                  Ingat saya di perangkat ini
                </label>
              </div>

              <button 
                type="submit" 
                class="btn text-white w-100 py-2.5 fw-semibold rounded-3 shadow-sm d-flex align-items-center justify-content-center gap-2"
                style="background-color: #0E3B43;"
                :disabled="loading"
              >
                <span v-if="loading" class="spinner-border spinner-border-sm"></span>
                <span>{{ loading ? 'Memproses...' : 'Masuk ke Dashboard' }}</span>
                <i v-if="!loading" class="bi bi-arrow-right"></i>
              </button>
            </form>

            <!-- Footer Sign Up Prompt -->
            <p class="text-center text-secondary small mt-4 mb-0">
              Belum memiliki akun? 
              <NuxtLink to="/register" class="fw-semibold text-decoration-none" style="color: #137A7F;">
                Daftar akun baru
              </NuxtLink>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.qh-input {
  border-color: #E2E8F0;
  font-size: 0.875rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.qh-input:focus {
  border-color: #137A7F;
  box-shadow: 0 0 0 0.2rem rgba(19, 122, 127, 0.15);
}

.qh-checkbox:checked {
  background-color: #137A7F;
  border-color: #137A7F;
}

.qh-google-btn {
  border-color: #E2E8F0;
  transition: all 0.2s ease;
}

.qh-google-btn:hover {
  background-color: #F8FAFA !important;
  border-color: #CBD5E1 !important;
  color: #0E3B43 !important;
}
</style>

