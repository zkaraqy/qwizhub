<template>
  <div class="container">
    <h1>Nuxt Auth Google OAuth Demo</h1>
    
    <div v-if="pending">Loading...</div>
    
    <div v-else-if="data">
      <div class="user-info">
        <h2>User Information</h2>
        <NuxtImg v-if="data?.user?.image" :src="`${data.user.image}`" class="avatar" alt="User profile picture" />
        <p><strong>Name:</strong> {{ data?.user?.name || 'Not available' }}</p>
        <p><strong>Email:</strong> {{ data?.user?.email || 'Not available' }}</p>
      </div>
      <button class="logout-btn" @click="handleSignOut">Logout</button>
    </div>
    
    <div v-else>
      <p>You are not logged in.</p>
      <button class="login-btn" @click="handleSignIn">Login with Google</button>
    </div>
  </div>
</template>

<script lang="ts" setup>
// Protect this page for authenticated users only
definePageMeta({
  auth: {
    unauthenticatedOnly: false
  }
})

const { data, status, signOut } = useAuth()
const router = useRouter()
const pending = computed(() => status.value === 'loading')

const handleSignOut = async () => {
  await signOut({ callbackUrl: '/login' })
}

const handleSignIn = () => {
  router.push('/login')
}

onMounted(() => {
  console.log(data.value)
})
</script>

<style>
.container {
  max-width: 800px;
  margin: 40px auto;
  padding: 20px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
}

h1 {
  color: #333;
  margin-bottom: 30px;
}

.user-info {
  margin: 20px 0;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 8px;
  text-align: left;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  display: block;
  margin: 0 auto 15px auto;
}

button {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  margin-top: 15px;
}

.login-btn {
  background-color: #4285F4;
  color: white;
}

.logout-btn {
  background-color: #f44336;
  color: white;
}
</style>