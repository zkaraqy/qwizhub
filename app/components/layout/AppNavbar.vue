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
            <!-- AI Token Balance Badge -->
            <li v-if="user.role === 'peneliti'" class="nav-item me-2">
              <NuxtLink
                to="/payments"
                class="ai-token-badge d-flex align-items-center gap-1 text-decoration-none rounded-pill px-3 py-1"
                :class="isLowBalance ? 'token-badge-low' : 'token-badge-ok'"
                title="Saldo Token AI — Klik untuk Top Up"
              >
                <span class="token-icon">🪙</span>
                <span class="token-balance-text fw-semibold">
                  {{ tokenLoading ? '...' : tokenBalance }}
                </span>
                <span class="token-label">token</span>
                <span v-if="isLowBalance" class="ms-1 pulse-dot"></span>
              </NuxtLink>
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

const { balance: tokenBalance, loading: tokenLoading, isLowBalance, fetchBalance } = useAITokens()

const handleLogout = () => {
  emit('logout')
}

onMounted(() => {
  if (props.variant === 'private' && props.user?.role === 'peneliti') {
    fetchBalance()
  }
})
</script>

<style scoped>
.navbar-brand {
  transition: opacity 0.2s ease;
}

.navbar-brand:hover {
  opacity: 0.8;
}

/* AI Token Badge */
.ai-token-badge {
  font-size: 0.78rem;
  transition: all 0.2s ease;
  border: 1px solid rgba(255, 255, 255, 0.25);
}

.token-badge-ok {
  background: rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.95);
}

.token-badge-ok:hover {
  background: rgba(255, 255, 255, 0.22);
  color: #fff;
}

.token-badge-low {
  background: rgba(239, 68, 68, 0.2);
  color: #fca5a5;
  border-color: rgba(239, 68, 68, 0.4);
  animation: badge-pulse 2s infinite;
}

.token-badge-low:hover {
  background: rgba(239, 68, 68, 0.35);
  color: #fecaca;
}

.token-icon {
  font-size: 0.9rem;
}

.token-balance-text {
  font-variant-numeric: tabular-nums;
  min-width: 1.5ch;
  text-align: right;
}

.token-label {
  opacity: 0.8;
  font-size: 0.72rem;
}

.pulse-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  background: #ef4444;
  border-radius: 50%;
  animation: pulse-dot-anim 1.5s infinite;
}

@keyframes badge-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.3); }
  50% { box-shadow: 0 0 0 4px rgba(239, 68, 68, 0); }
}

@keyframes pulse-dot-anim {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(0.7); }
}
</style>
