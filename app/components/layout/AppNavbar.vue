<template>
  <nav class="navbar navbar-expand-lg bg-white border-bottom sticky-top py-2.5" id="main-app-navbar">
    <div :class="containerClass">
      <!-- Brand Logo with AI Research Badge -->
      <NuxtLink :to="variant === 'public' ? '/' : '/dashboard'" class="navbar-brand fw-bold fs-4 d-flex align-items-center gap-2" style="color: #0E3B43;">
        <span>QwizHub</span>
        <span class="badge rounded-pill py-1 px-2 fw-medium" style="background-color: #EBF5F3; color: #137A7F; font-size: 0.65rem;">
          AI Research
        </span>
      </NuxtLink>
      
      <div class="d-flex align-items-center gap-2 gap-lg-3 order-lg-3">
        <button class="navbar-toggler border-0 shadow-none p-1" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>

        <!-- User Dropdown (always visible in header) -->
        <template v-if="user">
          <div class="dropdown">
            <a 
              class="nav-link dropdown-toggle d-flex align-items-center gap-1 py-1 px-2 rounded-3 text-decoration-none" 
              href="#" 
              id="navbarDropdown" 
              role="button" 
              data-bs-toggle="dropdown"
              style="color: #17212B;"
            >
              <img 
                v-if="user.image" 
                :src="user.image" 
                class="rounded-circle border" 
                width="32" 
                height="32" 
                alt="Profile"
                style="border-color: #E2E8F0; object-fit: cover;"
              >
              <div 
                v-else 
                class="rounded-circle text-white d-flex align-items-center justify-content-center fw-bold shadow-sm"
                style="width: 32px; height: 32px; font-size: 0.8rem; background-color: #0E3B43;"
              >
                {{ (user.name || 'U').charAt(0).toUpperCase() }}
              </div>
              <span class="fw-semibold small d-none d-sm-inline" style="color: #17212B;">{{ user.name }}</span>
            </a>
            <ul class="dropdown-menu dropdown-menu-end shadow-sm rounded-3 border p-1 position-absolute" style="border-color: #E2E8F0; min-width: 220px; z-index: 1021 !important;">
              <li class="px-3 py-2 border-bottom mb-1 bg-light rounded-top">
                <div class="fw-bold text-dark small text-truncate">{{ user.name }}</div>
                <div class="text-secondary" style="font-size: 0.75rem;">{{ user.email || (user.role === 'peneliti' ? 'Peneliti' : 'Responden') }}</div>
              </li>
              <li>
                <NuxtLink to="/profile" class="dropdown-item py-1.5 px-3 rounded-2 d-flex align-items-center gap-2 small">
                  <i class="bi bi-person text-secondary"></i>
                  <span>Profile</span>
                </NuxtLink>
              </li>
              <li><hr class="dropdown-divider my-1"></li>
              <li>
                <a class="dropdown-item text-danger py-1.5 px-3 rounded-2 d-flex align-items-center gap-2 small" href="#" @click.prevent="handleLogout">
                  <i class="bi bi-box-arrow-right"></i>
                  <span>Logout</span>
                </a>
              </li>
            </ul>
          </div>
        </template>
      </div>
      
      <div class="collapse navbar-collapse order-lg-2" id="navbarNav">
        <ul class="navbar-nav ms-auto align-items-center gap-1 gap-lg-2">
          <!-- Public Navigation -->
          <template v-if="variant === 'public' && !user">
            <li class="nav-item">
              <NuxtLink to="/login" class="btn btn-outline-secondary px-3 py-1.5 fw-semibold rounded-3 bg-white" style="border-color: #D1D9D6; color: #17212B;">Login</NuxtLink>
            </li>
            <li class="nav-item">
              <NuxtLink to="/register" class="btn text-white px-3 py-1.5 fw-semibold rounded-3 shadow-sm" style="background-color: #0E3B43;">Get Started</NuxtLink>
            </li>
          </template>

          <!-- Private Navigation -->
          <template v-if="variant === 'private' && user">
            <!-- Mobile Navigation Links -->
            <li class="nav-item d-lg-none w-100">
              <NuxtLink to="/dashboard" class="nav-link py-2 text-secondary fw-semibold">
                <i class="bi bi-speedometer2 me-2"></i>Dashboard
              </NuxtLink>
            </li>
            <li v-if="user.role === 'responden'" class="nav-item d-lg-none w-100">
              <NuxtLink to="/questionnaires" class="nav-link py-2 text-secondary fw-semibold">
                <i class="bi bi-clipboard-check me-2"></i>My Surveys
              </NuxtLink>
            </li>
            <template v-if="user.role === 'peneliti'">
              <li class="nav-item d-lg-none w-100">
                <NuxtLink to="/projects" class="nav-link py-2 text-secondary fw-semibold">
                  <i class="bi bi-folder me-2"></i>My Projects
                </NuxtLink>
              </li>
              <li class="nav-item d-lg-none w-100">
                <NuxtLink to="/payments" class="nav-link py-2 text-secondary fw-semibold d-flex justify-content-between align-items-center">
                  <div>
                    <i class="bi bi-coin me-2"></i>Top Up Token AI
                  </div>
                  <div class="ai-token-badge rounded-pill px-2 py-1 d-flex align-items-center gap-1" :class="isLowBalance ? 'token-badge-low' : 'token-badge-ok'" style="font-size: 0.7rem;">
                    <span>🪙</span>
                    <span class="fw-bold">{{ tokenLoading ? '...' : tokenBalance }}</span>
                    <span v-if="isLowBalance" class="ms-1 pulse-dot" style="width: 4px; height: 4px;"></span>
                  </div>
                </NuxtLink>
              </li>
              
              <!-- Desktop Token Pill -->
              <li class="nav-item me-2 d-none d-lg-block">
                <NuxtLink
                  to="/payments"
                  class="ai-token-badge d-flex align-items-center gap-1.5 text-decoration-none rounded-pill px-3 py-1.5"
                  :class="isLowBalance ? 'token-badge-low' : 'token-badge-ok'"
                  title="Saldo Token AI — Klik untuk Top Up"
                >
                  <span class="token-icon">🪙</span>
                  <span class="token-balance-text fw-bold">
                    {{ tokenLoading ? '...' : tokenBalance }}
                  </span>
                  <span class="token-label">&nbsp;Token</span>
                  <span v-if="isLowBalance" class="ms-1 pulse-dot"></span>
                </NuxtLink>
              </li>
            </template>
            <li class="nav-item d-lg-none w-100">
              <NuxtLink to="/" class="nav-link py-2 text-secondary fw-semibold">
                <i class="bi bi-globe me-2"></i>Beranda Publik
              </NuxtLink>
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

const containerClass = computed(() => {
  return props.variant === 'public' ? 'container' : 'container-fluid px-3 px-lg-4'
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
  opacity: 0.85;
}

/* AI Token Badge */
.ai-token-badge {
  font-size: 0.78rem;
  transition: all 0.2s ease;
}

.token-badge-ok {
  background: #EBF5F3;
  color: #137A7F;
  border: 1px solid rgba(19, 122, 127, 0.25);
}

.token-badge-ok:hover {
  background: #def0ec;
  color: #0E3B43;
}

.token-badge-low {
  background: #FEE2E2;
  color: #DC2626;
  border: 1px solid rgba(220, 38, 38, 0.3);
  animation: badge-pulse 2s infinite;
}

.token-badge-low:hover {
  background: #fecaca;
  color: #b91c1c;
}

.token-icon {
  font-size: 0.95rem;
}

.token-balance-text {
  font-variant-numeric: tabular-nums;
  min-width: 1.5ch;
  text-align: right;
  letter-spacing: -0.01em;
}

.token-label {
  opacity: 0.85;
  font-size: 0.72rem;
  font-weight: 500;
}

.pulse-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  background: #ef4444;
  border-radius: 50%;
  animation: pulse-dot-anim 1.5s infinite;
}

.dropdown-item:hover, .dropdown-item:focus {
  background-color: #EBF5F3;
  color: #137A7F;
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
