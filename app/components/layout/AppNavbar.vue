<template>
  <nav :class="navbarClasses">
    <div :class="containerClass">
      <NuxtLink :to="variant === 'public' ? '/' : '/dashboard'" class="navbar-brand fw-bold" :class="brandClass">
        <span class="fs-4">QwizHub</span>
      </NuxtLink>
      
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
        <span class="navbar-toggler-icon"></span>
      </button>
      
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav ms-auto align-items-center">
          <!-- Public Navigation -->
          <template v-if="variant === 'public' && !user">
            <li class="nav-item me-2">
              <NuxtLink to="/login" class="btn btn-outline-primary">Login</NuxtLink>
            </li>
            <li class="nav-item">
              <NuxtLink to="/register" class="btn btn-primary">Get Started</NuxtLink>
            </li>
          </template>

          <!-- Private Navigation -->
          <template v-if="variant === 'private' && user">
            <li v-if="user.role === 'peneliti'" class="nav-item">
              <NuxtLink to="/projects" class="nav-link">My Projects</NuxtLink>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#">Surveys</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#">Analytics</a>
            </li>
          </template>

          <!-- User Dropdown (both public when logged in and private) -->
          <template v-if="user">
            <li class="nav-item dropdown">
              <a 
                class="nav-link dropdown-toggle d-flex align-items-center" 
                href="#" 
                id="navbarDropdown" 
                role="button" 
                data-bs-toggle="dropdown"
              >
                <img 
                  v-if="user.image" 
                  :src="user.image" 
                  class="rounded-circle me-2" 
                  width="32" 
                  height="32" 
                  alt="Profile"
                >
                <span 
                  v-else 
                  class="badge rounded-circle me-2"
                  :class="variant === 'public' ? 'bg-secondary' : 'bg-light text-primary'"
                  style="width: 32px; height: 32px; line-height: 32px;"
                >
                  {{ user.name?.charAt(0) || 'U' }}
                </span>
                <span>{{ user.name }}</span>
              </a>
              <ul class="dropdown-menu dropdown-menu-end">
                <li><NuxtLink to="/dashboard" class="dropdown-item">Dashboard</NuxtLink></li>
                <li><NuxtLink to="/profile" class="dropdown-item">Profile</NuxtLink></li>
                <li v-if="variant === 'private'"><NuxtLink to="/" class="dropdown-item">Home</NuxtLink></li>
                <li><hr class="dropdown-divider"></li>
                <li>
                  <a class="dropdown-item text-danger" href="#" @click.prevent="handleLogout">
                    Logout
                  </a>
                </li>
              </ul>
            </li>
          </template>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
interface User {
  id?: string
  name?: string
  email?: string
  image?: string | null
  role?: 'peneliti' | 'responden'
}

interface Props {
  variant?: 'public' | 'private'
  user?: User | null
  transparent?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'private',
  user: null,
  transparent: false
})

const emit = defineEmits<{
  logout: []
}>()

const navbarClasses = computed(() => {
  const classes = ['navbar', 'navbar-expand-lg', 'shadow-sm']
  
  if (props.variant === 'public') {
    classes.push('navbar-light', 'bg-white')
  } else {
    classes.push('navbar-dark', 'bg-primary')
  }
  
  return classes.join(' ')
})

const containerClass = computed(() => {
  return props.variant === 'public' ? 'container' : 'container-fluid'
})

const brandClass = computed(() => {
  return props.variant === 'public' ? 'text-primary' : ''
})

const handleLogout = () => {
  emit('logout')
}
</script>

<style scoped>
.navbar-brand {
  transition: opacity 0.2s ease;
}

.navbar-brand:hover {
  opacity: 0.8;
}
</style>
