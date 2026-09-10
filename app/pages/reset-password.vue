<template>
  <div class="container">
    <h1>Reset Password</h1>
    
    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>
    
    <div v-if="successMessage" class="success-message">
      {{ successMessage }}
      <p><NuxtLink to="/login">Go to Login</NuxtLink></p>
    </div>
    
    <form v-if="!successMessage" @submit.prevent="handleResetPassword" class="auth-form">
      <div class="form-group">
        <label for="password">New Password</label>
        <input 
          id="password"
          v-model="formData.password" 
          type="password" 
          placeholder="Enter your new password (min. 6 characters)"
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
          placeholder="Confirm your new password"
          required
        />
      </div>
      
      <button type="submit" class="submit-btn" :disabled="loading">
        {{ loading ? 'Resetting...' : 'Reset Password' }}
      </button>
    </form>
    
    <div class="auth-links">
      <p><NuxtLink to="/login">Back to Login</NuxtLink></p>
    </div>
  </div>
</template>

<script lang="ts" setup>
definePageMeta({
  auth: {
    unauthenticatedOnly: true,
    navigateAuthenticatedTo: '/'
  }
})

const route = useRoute()
const token = computed(() => route.query.token as string)

const formData = ref({
  password: '',
  confirmPassword: ''
})

const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

onMounted(() => {
  if (!token.value) {
    errorMessage.value = 'Invalid reset token. Please request a new password reset link.'
  }
})

const handleResetPassword = async () => {
  errorMessage.value = ''
  successMessage.value = ''
  
  if (!token.value) {
    errorMessage.value = 'Invalid reset token'
    return
  }
  
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
    await $fetch('/api/auth/reset-password', {
      method: 'POST',
      body: {
        token: token.value,
        password: formData.value.password
      }
    })
    
    successMessage.value = 'Password has been reset successfully! You can now login with your new password.'
  } catch (error: any) {
    console.error('Reset password error:', error)
    errorMessage.value = error.data?.statusMessage || 'Failed to reset password. The token may be invalid or expired.'
  } finally {
    loading.value = false
  }
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

.success-message a {
  color: #2a8;
  font-weight: bold;
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
</style>
