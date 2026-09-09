<template>
  <div class="container">
    <h1>Register</h1>
    
    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>
    
    <div v-if="successMessage" class="success-message">
      {{ successMessage }}
    </div>
    
    <form @submit.prevent="handleRegister" class="auth-form">
      <div class="form-group">
        <label for="name">Full Name</label>
        <input 
          id="name"
          v-model="formData.name" 
          type="text" 
          placeholder="Enter your full name"
          required
        />
      </div>
      
      <div class="form-group">
        <label for="email">Email</label>
        <input 
          id="email"
          v-model="formData.email" 
          type="email" 
          placeholder="Enter your email"
          required
        />
      </div>
      
      <div class="form-group">
        <label for="password">Password</label>
        <input 
          id="password"
          v-model="formData.password" 
          type="password" 
          placeholder="Enter your password (min. 6 characters)"
          required
          minlength="6"
        />
      </div>
      
      <div class="form-group">
        <label for="confirmPassword">Confirm Password</label>
        <input 
          id="confirmPassword"
          v-model="formData.confirmPassword" 
          type="password" 
          placeholder="Confirm your password"
          required
        />
      </div>
      
      <button type="submit" class="submit-btn" :disabled="loading">
        {{ loading ? 'Registering...' : 'Register' }}
      </button>
    </form>
    
    <div class="auth-links">
      <p>Already have an account? <NuxtLink to="/login">Login here</NuxtLink></p>
    </div>
    
    <div class="divider">
      <span>OR</span>
    </div>
    
    <button @click="handleGoogleSignIn" class="google-btn">
      <span>Continue with Google</span>
    </button>
  </div>
</template>

<script lang="ts" setup>
definePageMeta({
  auth: {
    unauthenticatedOnly: true,
    navigateAuthenticatedTo: '/'
  }
})

const router = useRouter()
const { signIn } = useAuth()

const formData = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const handleRegister = async () => {
  errorMessage.value = ''
  successMessage.value = ''
  
  // Validasi password match
  if (formData.value.password !== formData.value.confirmPassword) {
    errorMessage.value = 'Passwords do not match'
    return
  }
  
  // Validasi panjang password
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
        password: formData.value.password
      }
    })
    
    successMessage.value = 'Registration successful! Redirecting to login...'
    
    // Redirect ke login setelah 2 detik
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
  await signIn('google', { callbackUrl: '/' })
}
</script>

<style scoped>
.container {
  max-width: 450px;
  margin: 40px auto;
  padding: 30px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

h1 {
  color: #333;
  margin-bottom: 25px;
  text-align: center;
}

.error-message {
  background-color: #fee;
  color: #c33;
  padding: 12px;
  border-radius: 5px;
  margin-bottom: 20px;
  border: 1px solid #fcc;
}

.success-message {
  background-color: #efe;
  color: #3c3;
  padding: 12px;
  border-radius: 5px;
  margin-bottom: 20px;
  border: 1px solid #cfc;
}

.auth-form {
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #555;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
  box-sizing: border-box;
  transition: border-color 0.3s;
}

.form-group input:focus {
  outline: none;
  border-color: #4285F4;
}

.submit-btn {
  width: 100%;
  padding: 12px;
  background-color: #4285F4;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s;
}

.submit-btn:hover:not(:disabled) {
  background-color: #357ae8;
}

.submit-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.auth-links {
  text-align: center;
  margin: 20px 0;
}

.auth-links a {
  color: #4285F4;
  text-decoration: none;
  font-weight: 500;
}

.auth-links a:hover {
  text-decoration: underline;
}

.divider {
  position: relative;
  text-align: center;
  margin: 25px 0;
}

.divider::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  width: 100%;
  height: 1px;
  background-color: #ddd;
}

.divider span {
  position: relative;
  background-color: #fff;
  padding: 0 15px;
  color: #999;
  font-size: 14px;
}

.google-btn {
  width: 100%;
  padding: 12px;
  background-color: white;
  color: #333;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.google-btn:hover {
  background-color: #f8f8f8;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
