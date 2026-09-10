<template>
  <div class="min-vh-100 d-flex align-items-center bg-light">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-lg-10">
          <div class="card shadow-lg border-0 rounded-4">
            <div class="row g-0">
              <!-- Form Section (Left) -->
              <div class="col-md-6 p-5">
                <div class="mb-4">
                  <NuxtLink to="/" class="text-decoration-none">
                    <h2 class="text-primary fw-bold">QwizHub</h2>
                  </NuxtLink>
                </div>
                
                <h3 class="fw-bold mb-2">Forgot Password?</h3>
                <p class="text-muted mb-4">Enter your email address and we'll send you a link to reset your password.</p>

                <!-- Error Alert -->
                <div v-if="errorMessage" class="alert alert-danger alert-dismissible fade show" role="alert">
                  {{ errorMessage }}
                  <button type="button" class="btn-close" @click="errorMessage = ''"></button>
                </div>

                <!-- Success Alert -->
                <div v-if="successMessage" class="alert alert-success" role="alert">
                  <div class="d-flex align-items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="me-2 flex-shrink-0" viewBox="0 0 16 16">
                      <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                    </svg>
                    <div>{{ successMessage }}</div>
                  </div>
                </div>

                <!-- Forgot Password Form -->
                <form v-if="!successMessage" @submit.prevent="handleForgotPassword">
                  <div class="mb-4">
                    <label for="email" class="form-label">Email address</label>
                    <input 
                      v-model="email"
                      type="email" 
                      class="form-control form-control-lg" 
                      id="email"
                      placeholder="Enter your email"
                      required
                      :disabled="loading"
                    >
                  </div>

                  <button 
                    type="submit" 
                    class="btn btn-primary w-100 py-2 mb-3"
                    :disabled="loading"
                  >
                    <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                    {{ loading ? 'Sending...' : 'Send Reset Link' }}
                  </button>
                </form>

                <div class="text-center mt-4">
                  <NuxtLink to="/login" class="text-decoration-none">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="me-1" viewBox="0 0 16 16">
                      <path fill-rule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
                    </svg>
                    Back to Login
                  </NuxtLink>
                </div>
              </div>

              <!-- Illustration Section (Right) -->
              <div class="col-md-6 d-none d-md-block bg-warning bg-gradient p-5 rounded-end-4 position-relative">
                <div class="d-flex flex-column justify-content-center align-items-center h-100 text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" class="mb-4" style="max-width: 320px;">
                    <circle cx="200" cy="150" r="120" fill="#ffffff" opacity="0.1"/>
                    <rect x="120" y="90" width="160" height="120" rx="8" fill="#ffffff" opacity="0.9"/>
                    <circle cx="200" cy="130" r="20" fill="#ffc107"/>
                    <path d="M200 145 L200 165" stroke="#ffc107" stroke-width="4" stroke-linecap="round"/>
                    <circle cx="200" cy="180" r="3" fill="#ffc107"/>
                    <rect x="150" y="100" width="100" height="8" rx="4" fill="#ffc107" opacity="0.4"/>
                  </svg>
                  <h4 class="fw-bold mb-3">Reset Your Password</h4>
                  <p class="text-center opacity-75">We'll help you get back into your account</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

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
    errorMessage.value = 'Email is required'
    return
  }
  
  loading.value = true
  
  try {
    await $fetch('/api/auth/forgot-password', {
      method: 'POST',
      body: { email: email.value }
    })
    
    successMessage.value = 'If an account with that email exists, a password reset link has been sent. Please check your email.'
  } catch (error: any) {
    console.error('Forgot password error:', error)
    errorMessage.value = error.data?.statusMessage || 'Failed to send reset link. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.rounded-4 {
  border-radius: 1rem !important;
}

.rounded-end-4 {
  border-top-right-radius: 1rem !important;
  border-bottom-right-radius: 1rem !important;
}
</style>

