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
                
                <h3 class="fw-bold mb-2">Welcome back</h3>
                <p class="text-muted mb-4">Sign in to your account to continue</p>

                <!-- Error Alert -->
                <div v-if="error" class="alert alert-danger alert-dismissible fade show" role="alert">
                  {{ error }}
                  <button type="button" class="btn-close" @click="error = null"></button>
                </div>

                <!-- Google Sign In -->
                <button 
                  type="button" 
                  class="btn btn-outline-secondary w-100 mb-3 py-2"
                  @click="signInWithProvider('google')" 
                  :disabled="loading"
                >
                  <svg class="me-2" width="18" height="18" viewBox="0 0 18 18">
                    <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
                    <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2.01c-.71.48-1.62.75-2.7.75-2.08 0-3.84-1.4-4.48-3.29H1.83v2.07A8 8 0 0 0 8.98 17z"/>
                    <path fill="#FBBC05" d="M4.5 10.51a4.8 4.8 0 0 1 0-3.02V5.42H1.83a8 8 0 0 0 0 7.16l2.67-2.07z"/>
                    <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.42L4.5 7.49c.64-1.89 2.4-3.3 4.48-3.3z"/>
                  </svg>
                  Continue with Google
                </button>

                <!-- Divider -->
                <div class="d-flex align-items-center my-4">
                  <hr class="flex-grow-1">
                  <span class="px-3 text-muted small">OR</span>
                  <hr class="flex-grow-1">
                </div>

                <!-- Credentials Form -->
                <form @submit.prevent="signInWithCredentials">
                  <div class="mb-3">
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

                  <div class="mb-3">
                    <label for="password" class="form-label">Password</label>
                    <input 
                      v-model="password"
                      type="password" 
                      class="form-control form-control-lg" 
                      id="password"
                      placeholder="Enter your password"
                      required
                      :disabled="loading"
                    >
                  </div>

                  <div class="d-flex justify-content-between align-items-center mb-4">
                    <div class="form-check">
                      <input class="form-check-input" type="checkbox" id="remember">
                      <label class="form-check-label small" for="remember">
                        Remember me
                      </label>
                    </div>
                    <NuxtLink to="/forgot-password" class="text-decoration-none small">
                      Forgot password?
                    </NuxtLink>
                  </div>

                  <button 
                    type="submit" 
                    class="btn btn-primary w-100 py-2 mb-3"
                    :disabled="loading"
                  >
                    <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                    {{ loading ? 'Signing in...' : 'Sign in' }}
                  </button>
                </form>

                <p class="text-center text-muted mt-4">
                  Don't have an account? 
                  <NuxtLink to="/register" class="text-primary text-decoration-none fw-semibold">
                    Sign up
                  </NuxtLink>
                </p>
              </div>

              <!-- Illustration Section (Right) -->
              <div class="col-md-6 d-none d-md-block bg-primary bg-gradient p-5 rounded-end-4 position-relative">
                <div class="d-flex flex-column justify-content-center align-items-center h-100 text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" class="mb-4" style="max-width: 320px;">
                    <circle cx="200" cy="150" r="120" fill="#ffffff" opacity="0.1"/>
                    <rect x="120" y="80" width="160" height="140" rx="8" fill="#ffffff" opacity="0.9"/>
                    <circle cx="160" cy="120" r="20" fill="#0d6efd"/>
                    <rect x="190" y="110" width="80" height="8" rx="4" fill="#0d6efd" opacity="0.6"/>
                    <rect x="190" y="130" width="60" height="8" rx="4" fill="#0d6efd" opacity="0.4"/>
                    <rect x="140" y="160" width="120" height="40" rx="6" fill="#0d6efd" opacity="0.3"/>
                  </svg>
                  <h4 class="fw-bold mb-3">Welcome to QwizHub</h4>
                  <p class="text-center opacity-75">Access your surveys and insights with a single sign-in</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.rounded-4 {
  border-radius: 1rem !important;
}

.rounded-end-4 {
  border-top-right-radius: 1rem !important;
  border-bottom-right-radius: 1rem !important;
}
</style>

