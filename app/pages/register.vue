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
                
                <h3 class="fw-bold mb-2">Create your account</h3>
                <p class="text-muted mb-4">Join QwizHub and start creating surveys</p>

                <!-- Error Alert -->
                <div v-if="errorMessage" class="alert alert-danger alert-dismissible fade show" role="alert">
                  {{ errorMessage }}
                  <button type="button" class="btn-close" @click="errorMessage = ''"></button>
                </div>

                <!-- Success Alert -->
                <div v-if="successMessage" class="alert alert-success alert-dismissible fade show" role="alert">
                  {{ successMessage }}
                  <button type="button" class="btn-close" @click="successMessage = ''"></button>
                </div>

                <!-- Google Sign In -->
                <button 
                  type="button" 
                  class="btn btn-outline-secondary w-100 mb-3 py-2"
                  @click="handleGoogleSignIn" 
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

                <!-- Registration Form -->
                <form @submit.prevent="handleRegister">
                  <div class="mb-3">
                    <label for="name" class="form-label">Full Name</label>
                    <input 
                      v-model="formData.name"
                      type="text" 
                      class="form-control" 
                      id="name"
                      placeholder="Enter your full name"
                      required
                      :disabled="loading"
                    >
                  </div>

                  <div class="mb-3">
                    <label for="email" class="form-label">Email address</label>
                    <input 
                      v-model="formData.email"
                      type="email" 
                      class="form-control" 
                      id="email"
                      placeholder="Enter your email"
                      required
                      :disabled="loading"
                    >
                  </div>

                  <div class="mb-3">
                    <label for="role" class="form-label">I want to</label>
                    <select 
                      v-model="formData.role"
                      class="form-select" 
                      id="role"
                      required
                      :disabled="loading"
                    >
                      <option value="responden">Take Surveys (Responden)</option>
                      <option value="peneliti">Create Surveys (Peneliti)</option>
                    </select>
                  </div>


                  <div class="mb-3">
                    <label for="password" class="form-label">Password</label>
                    <input 
                      v-model="formData.password"
                      type="password" 
                      class="form-control" 
                      id="password"
                      placeholder="At least 6 characters"
                      required
                      minlength="6"
                      :disabled="loading"
                    >
                  </div>

                  <div class="mb-3">
                    <label for="confirmPassword" class="form-label">Confirm Password</label>
                    <input 
                      v-model="formData.confirmPassword"
                      type="password" 
                      class="form-control" 
                      id="confirmPassword"
                      placeholder="Re-enter your password"
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
                    {{ loading ? 'Creating account...' : 'Create Account' }}
                  </button>
                </form>

                <p class="text-center text-muted mt-4 small">
                  Already have an account? 
                  <NuxtLink to="/login" class="text-primary text-decoration-none fw-semibold">
                    Sign in
                  </NuxtLink>
                </p>
              </div>

              <!-- Illustration Section (Right) -->
              <div class="col-md-6 d-none d-md-block bg-success bg-gradient p-5 rounded-end-4 position-relative">
                <div class="d-flex flex-column justify-content-center align-items-center h-100 text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" class="mb-4" style="max-width: 320px;">
                    <circle cx="200" cy="150" r="120" fill="#ffffff" opacity="0.1"/>
                    <rect x="100" y="70" width="200" height="160" rx="8" fill="#ffffff" opacity="0.9"/>
                    <circle cx="200" cy="110" r="25" fill="#198754"/>
                    <rect x="140" y="155" width="120" height="8" rx="4" fill="#198754" opacity="0.6"/>
                    <rect x="140" y="175" width="90" height="8" rx="4" fill="#198754" opacity="0.4"/>
                    <rect x="140" y="200" width="120" height="12" rx="6" fill="#198754"/>
                  </svg>
                  <h4 class="fw-bold mb-3">Join Our Community</h4>
                  <p class="text-center opacity-75">Start creating and participating in surveys today</p>
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

const router = useRouter()
const { signIn } = useAuth()

const formData = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: 'responden'
})

const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const handleRegister = async () => {
  errorMessage.value = ''
  successMessage.value = ''
  
  if (formData.value.password !== formData.value.confirmPassword) {
    errorMessage.value = 'Passwords do not match'
    return
  }
  
  if (formData.value.password.length < 6) {
    errorMessage.value = 'Password must be at least 6 characters long'
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
    
    successMessage.value = 'Registration successful! Redirecting to login...'
    
    setTimeout(() => {
      router.push('/login')
    }, 2000)
  } catch (error: any) {
    console.error('Registration error:', error)
    errorMessage.value = error.data?.statusMessage || 'Registration failed. Please try again.'
  } finally {
    loading.value = false
  }
}

const handleGoogleSignIn = async () => {
  await signIn('google', { callbackUrl: '/dashboard' })
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
