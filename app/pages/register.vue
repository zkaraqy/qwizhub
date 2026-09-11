<script lang="ts" setup>
definePageMeta({
  auth: {
    unauthenticatedOnly: true,
    navigateAuthenticatedTo: '/dashboard'
  }
})

const router = useRouter()
const { signIn } = useAuth()

const formData = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: 'peneliti'
})

const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const handleRegister = async () => {
  errorMessage.value = ''
  successMessage.value = ''
  
  if (formData.value.password !== formData.value.confirmPassword) {
    errorMessage.value = 'Kata sandi dan konfirmasi kata sandi tidak cocok'
    return
  }
  
  if (formData.value.password.length < 6) {
    errorMessage.value = 'Kata sandi minimal harus 6 karakter'
    return
  }
  
  loading.value = true
  
  try {
    const response = await $fetch('/api/auth/register', {
      method: 'POST',
      body: {
        name: formData.value.name,
        email: formData.value.email,
        password: formData.value.password,
        role: formData.value.role
      }
    })
    
    successMessage.value = 'Pendaftaran berhasil! Mengalihkan ke halaman login...'
    
    setTimeout(() => {
      router.push('/login')
    }, 1500)
  } catch (error: any) {
    console.error('Registration error:', error)
    errorMessage.value = error.data?.statusMessage || 'Pendaftaran gagal. Silakan coba beberapa saat lagi.'
  } finally {
    loading.value = false
  }
}

const handleGoogleSignIn = async () => {
  await signIn('google', { callbackUrl: '/dashboard' })
}
</script>

<template>
  <div class="min-vh-100 d-flex align-items-center justify-content-center py-4 py-lg-5" style="background-color: #F8FAFA;">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
          <!-- Main Centered Register Card -->
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
              MULAI RISET ANDA
            </p>
            <h3 class="fw-bold mb-4" style="color: #0E3B43;">Daftar Akun Baru</h3>

            <!-- Error Alert -->
            <div v-if="errorMessage" class="alert alert-danger alert-dismissible fade show d-flex align-items-center gap-2 py-2 px-3 rounded-3 small mb-3" role="alert">
              <i class="bi bi-exclamation-circle-fill flex-shrink-0 text-danger"></i>
              <div>{{ errorMessage }}</div>
              <button type="button" class="btn-close ms-auto p-2" @click="errorMessage = ''" aria-label="Close"></button>
            </div>

            <!-- Success Alert -->
            <div v-if="successMessage" class="alert alert-success alert-dismissible fade show d-flex align-items-center gap-2 py-2 px-3 rounded-3 small mb-3" role="alert">
              <i class="bi bi-check-circle-fill flex-shrink-0 text-success"></i>
              <div>{{ successMessage }}</div>
              <button type="button" class="btn-close ms-auto p-2" @click="successMessage = ''" aria-label="Close"></button>
            </div>

            <!-- Google Sign In -->
            <button 
              type="button" 
              class="btn btn-outline-secondary w-100 mb-3 py-2.5 rounded-3 d-flex align-items-center justify-content-center gap-2 bg-white text-dark qh-google-btn"
              @click="handleGoogleSignIn" 
              :disabled="loading"
            >
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
                <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2.01c-.71.48-1.62.75-2.7.75-2.08 0-3.84-1.4-4.48-3.29H1.83v2.07A8 8 0 0 0 8.98 17z"/>
                <path fill="#FBBC05" d="M4.5 10.51a4.8 4.8 0 0 1 0-3.02V5.42H1.83a8 8 0 0 0 0 7.16l2.67-2.07z"/>
                <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.42L4.5 7.49c.64-1.89 2.4-3.3 4.48-3.3z"/>
              </svg>
              <span class="fw-medium small">Daftar dengan Google</span>
            </button>

            <!-- Divider -->
            <div class="d-flex align-items-center my-2">
              <span class="flex-grow-1" style="height: 1px; background-color: #EEF2F6;"></span>
              <span class="px-3 small" style="color: #94A3B8; font-size: 0.75rem;">atau daftar dengan email</span>
              <span class="flex-grow-1" style="height: 1px; background-color: #EEF2F6;"></span>
            </div>

            <!-- Registration Form -->
            <form @submit.prevent="handleRegister">
              <div class="mb-3">
                <label for="name" class="form-label small fw-semibold text-dark mb-1">Nama Lengkap</label>
                <input 
                  v-model="formData.name"
                  type="text" 
                  class="form-control py-2 rounded-3 qh-input" 
                  id="name"
                  placeholder="Masukkan nama lengkap"
                  required
                  :disabled="loading"
                >
              </div>

              <div class="mb-3">
                <label for="email" class="form-label small fw-semibold text-dark mb-1">Alamat Email</label>
                <input 
                  v-model="formData.email"
                  type="email" 
                  class="form-control py-2 rounded-3 qh-input" 
                  id="email"
                  placeholder="nama@email.com"
                  required
                  :disabled="loading"
                >
              </div>

              <div class="mb-3">
                <label for="role" class="form-label small fw-semibold text-dark mb-1">Tujuan Penggunaan</label>
                <select 
                  v-model="formData.role"
                  class="form-select py-2 rounded-3 qh-input" 
                  id="role"
                  required
                  :disabled="loading"
                >
                  <option value="peneliti">Peneliti / Mahasiswa (Menyusun Instrumen & Riset)</option>
                  <option value="responden">Responden (Mengisi Survei)</option>
                </select>
              </div>

              <div class="row g-2 mb-3">
                <div class="col-12 col-md-6">
                  <label for="password" class="form-label small fw-semibold text-dark mb-1">Kata Sandi</label>
                  <input 
                    v-model="formData.password"
                    type="password" 
                    class="form-control py-2 rounded-3 qh-input" 
                    id="password"
                    placeholder="Min. 6 karakter"
                    required
                    minlength="6"
                    :disabled="loading"
                  >
                </div>
                <div class="col-12 col-md-6">
                  <label for="confirmPassword" class="form-label small fw-semibold text-dark mb-1">Ulangi Sandi</label>
                  <input 
                    v-model="formData.confirmPassword"
                    type="password" 
                    class="form-control py-2 rounded-3 qh-input" 
                    id="confirmPassword"
                    placeholder="Konfirmasi sandi"
                    required
                    :disabled="loading"
                  >
                </div>
              </div>

              <button 
                type="submit" 
                class="btn text-white w-100 py-2.5 fw-semibold rounded-3 shadow-sm d-flex align-items-center justify-content-center gap-2 mt-3"
                style="background-color: #0E3B43;"
                :disabled="loading"
              >
                <span v-if="loading" class="spinner-border spinner-border-sm"></span>
                <span>{{ loading ? 'Mendaftarkan Akun...' : 'Daftar Akun Baru' }}</span>
                <i v-if="!loading" class="bi bi-arrow-right"></i>
              </button>
            </form>

            <!-- Footer Sign In Prompt -->
            <p class="text-center text-secondary small mt-4 mb-0">
              Sudah memiliki akun? 
              <NuxtLink to="/login" class="fw-semibold text-decoration-none" style="color: #137A7F;">
                Masuk ke akun Anda
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
