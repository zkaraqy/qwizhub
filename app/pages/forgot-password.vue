<script lang="ts" setup>
definePageMeta({
  auth: {
    unauthenticatedOnly: true,
    navigateAuthenticatedTo: '/dashboard'
  }
})

const email = ref('')
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const handleForgotPassword = async () => {
  errorMessage.value = ''
  successMessage.value = ''
  
  if (!email.value) {
    errorMessage.value = 'Alamat email wajib diisi'
    return
  }
  
  loading.value = true
  
  try {
    await $fetch('/api/auth/forgot-password', {
      method: 'POST',
      body: { email: email.value }
    })
    
    successMessage.value = 'Jika akun dengan email tersebut terdaftar, tautan reset kata sandi telah dikirimkan. Silakan periksa kotak masuk atau spam email Anda.'
  } catch (error: any) {
    console.error('Forgot password error:', error)
    errorMessage.value = error.data?.statusMessage || 'Gagal mengirimkan tautan reset kata sandi. Silakan coba lagi.'
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
          <!-- Main Centered Forgot Password Card -->
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
              PEMULIHAN AKUN
            </p>
            <h3 class="fw-bold mb-1" style="color: #0E3B43;">Lupa Kata Sandi?</h3>
            <p class="text-secondary small mb-4">
              Masukkan alamat email Anda dan kami akan mengirimkan tautan untuk mengatur ulang kata sandi.
            </p>

            <!-- Error Alert -->
            <div v-if="errorMessage" class="alert alert-danger alert-dismissible fade show d-flex align-items-center gap-2 py-2 px-3 rounded-3 small mb-3" role="alert">
              <i class="bi bi-exclamation-circle-fill flex-shrink-0 text-danger"></i>
              <div>{{ errorMessage }}</div>
              <button type="button" class="btn-close ms-auto p-2" @click="errorMessage = ''" aria-label="Close"></button>
            </div>

            <!-- Success Alert -->
            <div v-if="successMessage" class="alert alert-success d-flex align-items-start gap-2 py-2.5 px-3 rounded-3 small mb-4" role="alert">
              <i class="bi bi-check-circle-fill flex-shrink-0 text-success fs-5 mt-0.5"></i>
              <div class="lh-sm">{{ successMessage }}</div>
            </div>

            <!-- Forgot Password Form -->
            <form v-if="!successMessage" @submit.prevent="handleForgotPassword">
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

              <button 
                type="submit" 
                class="btn text-white w-100 py-2.5 fw-semibold rounded-3 shadow-sm d-flex align-items-center justify-content-center gap-2 mt-3"
                style="background-color: #0E3B43;"
                :disabled="loading"
              >
                <span v-if="loading" class="spinner-border spinner-border-sm"></span>
                <span>{{ loading ? 'Mengirim Tautan...' : 'Kirim Tautan Reset' }}</span>
                <i v-if="!loading" class="bi bi-arrow-right"></i>
              </button>
            </form>

            <!-- Back to Login Link -->
            <div class="text-center mt-3 pt-1">
              <NuxtLink to="/login" class="text-decoration-none small fw-semibold d-inline-flex align-items-center gap-2" style="color: #137A7F;">
                <i class="bi bi-arrow-left"></i>
                <span>Kembali ke Halaman Masuk</span>
              </NuxtLink>
            </div>
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
</style>
