<template>
  <div class="app-sidebar-wrapper">
    <!-- Navigation Items -->
    <div class="sidebar-nav-list flex-grow-1">
      <div class="nav-section-label">MENU UTAMA</div>

      <!-- Dashboard -->
      <NuxtLink
        to="/dashboard"
        class="sidebar-nav-item"
        :class="{ active: activeItem === 'dashboard' }"
      >
        <span v-if="activeItem === 'dashboard'" class="active-bar"></span>
        <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" fill="currentColor" class="nav-icon bi bi-speedometer2" viewBox="0 0 16 16">
          <path d="M8 4a.5.5 0 0 1 .5.5V6a.5.5 0 0 1-1 0V4.5A.5.5 0 0 1 8 4M3.732 5.732a.5.5 0 0 1 .707 0l.915.914a.5.5 0 1 1-.708.708l-.914-.915a.5.5 0 0 1 0-.707M2 10a.5.5 0 0 1 .5-.5h1.586a.5.5 0 0 1 0 1H2.5A.5.5 0 0 1 2 10m9.5 0a.5.5 0 0 1 .5-.5h1.5a.5.5 0 0 1 0 1H12a.5.5 0 0 1-.5-.5m.754-4.246a.39.39 0 0 0-.527-.02L7.547 9.31a.91.91 0 1 0 1.302 1.258l3.434-4.297a.39.39 0 0 0-.029-.518z" />
          <path fill-rule="evenodd" d="M0 10a8 8 0 1 1 15.547 2.661c-.442 1.253-1.845 1.602-2.932 1.25C11.309 13.488 9.475 13 8 13c-1.474 0-3.31.488-4.615.911-1.087.352-2.49.003-2.932-1.25A8 8 0 0 1 0 10m8-7a7 7 0 0 0-6.603 9.329c.203.575.923.876 1.68.63C4.397 12.533 6.358 12 8 12s3.604.532 4.923.96c.757.245 1.477-.056 1.68-.631A7 7 0 0 0 8 3" />
        </svg>
        <span>Dashboard</span>
      </NuxtLink>

      <div v-if="user?.role !== 'admin'" class="nav-section-label mt-3">RISET & DATA</div>

      <!-- My Projects (Peneliti) -->
      <NuxtLink
        v-if="user?.role === 'peneliti'"
        to="/projects"
        class="sidebar-nav-item"
        :class="{ active: activeItem === 'projects' }"
      >
        <span v-if="activeItem === 'projects'" class="active-bar"></span>
        <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" fill="currentColor" class="nav-icon bi bi-folder" viewBox="0 0 16 16">
          <path d="M.54 3.87.5 3a2 2 0 0 1 2-2h3.672a2 2 0 0 1 1.414.586l.828.828A2 2 0 0 0 9.828 3h3.982a2 2 0 0 1 1.992 2.181l-.637 7A2 2 0 0 1 13.174 14H2.826a2 2 0 0 1-1.991-1.819l-.637-7a2 2 0 0 1 .342-1.31zM2.19 4a1 1 0 0 0-.996 1.09l.637 7a1 1 0 0 0 .995.91h10.348a1 1 0 0 0 .995-.91l.637-7A1 1 0 0 0 13.81 4zm4.69-1.707A1 1 0 0 0 6.172 2H2.5a1 1 0 0 0-1 .981l.006.139q.323-.119.684-.12h5.396z" />
        </svg>
        <span>My Projects</span>
      </NuxtLink>

      <!-- My Surveys (Responden) -->
      <NuxtLink
        v-if="user?.role === 'responden'"
        to="/questionnaires"
        class="sidebar-nav-item"
        :class="{ active: activeItem === 'surveys' }"
      >
        <span v-if="activeItem === 'surveys'" class="active-bar"></span>
        <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" fill="currentColor" class="nav-icon bi bi-clipboard-check" viewBox="0 0 16 16">
          <path fill-rule="evenodd" d="M10.854 7.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 9.793l2.646-2.647a.5.5 0 0 1 .708 0" />
          <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1z" />
          <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0z" />
        </svg>
        <span>My Surveys</span>
      </NuxtLink>

      <!-- Pencairan Honor (Responden) -->
      <NuxtLink
        v-if="user?.role === 'responden'"
        to="/honor"
        class="sidebar-nav-item"
        :class="{ active: activeItem === 'honor' }"
      >
        <span v-if="activeItem === 'honor'" class="active-bar"></span>
        <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" fill="currentColor" class="nav-icon bi bi-cash" viewBox="0 0 16 16">
          <path d="M3 4a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2h1a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2H2a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1z" />
          <path d="M2 5v6h1V5zm11 0v6h-1V5z" />
          <path d="M8 5.5a2 2 0 1 0 0 4 2 2 0 0 0 0-4m0 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2" />
          <path d="M8.5 4.5h-1v.75H7a.5.5 0 0 0 0 1h.5v1.5H7a.5.5 0 0 0 0 1h.5v.75h1v-.75H9a.5.5 0 0 0 0-1h-.5v-1.5H9a.5.5 0 0 0 0-1h-.5z" />
        </svg>
        <span>Pencairan Honor</span>
      </NuxtLink>

      <!-- Top Up Token AI (Peneliti) -->
      <NuxtLink
        v-if="user?.role === 'peneliti'"
        to="/payments"
        class="sidebar-nav-item"
        :class="{ active: activeItem === 'payments' }"
      >
        <span v-if="activeItem === 'payments'" class="active-bar"></span>
        <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" fill="currentColor" class="nav-icon" viewBox="0 0 16 16">
          <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2m3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2" />
        </svg>
        <span>Top Up Token AI</span>
        <span class="ms-auto token-sidebar-badge" :class="isLowBalance ? 'badge-low' : 'badge-normal'">
          🪙 {{ tokenLoading ? '…' : tokenBalance }}
        </span>
      </NuxtLink>

      <div class="nav-section-label mt-3">PENGATURAN</div>

      <!-- Profile -->
      <NuxtLink
        to="/profile"
        class="sidebar-nav-item"
        :class="{ active: activeItem === 'profile' }"
      >
        <span v-if="activeItem === 'profile'" class="active-bar"></span>
        <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" fill="currentColor" class="nav-icon bi bi-person" viewBox="0 0 16 16">
          <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z" />
        </svg>
        <span>Profile</span>
      </NuxtLink>
    </div>

    <!-- Sidebar Bottom Status Card (Matching Reference SaaS layout) -->
    <div class="sidebar-footer">
      <div class="sidebar-user-card">
        <div class="d-flex align-items-center justify-content-between mb-1">
          <span class="text-secondary small fw-medium" style="font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.05em;">Role Aktif</span>
          <span class="badge-role-pill" :class="user?.role === 'peneliti' ? 'role-peneliti' : 'role-responden'">
            {{ user?.role === 'peneliti' ? 'Peneliti' : 'Responden' }}
          </span>
        </div>
        <div class="fw-semibold text-dark text-truncate" style="font-size: 0.8rem;">
          {{ user?.name || 'User QwizHub' }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface User {
  id?: string
  name?: string
  email?: string
  role?: 'peneliti' | 'responden' | 'admin'
}

interface Props {
  activeItem?: 'dashboard' | 'projects' | 'surveys' | 'analytics' | 'profile' | 'payments' | 'honor'
  user?: User | null
}

const props = withDefaults(defineProps<Props>(), {
  activeItem: 'dashboard',
  user: null
})

const { balance: tokenBalance, loading: tokenLoading, isLowBalance, fetchBalance } = useAITokens()

onMounted(() => {
  if (props.user?.role === 'peneliti') {
    fetchBalance()
  }
})
</script>

<style scoped>
.app-sidebar-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 1.25rem 0.75rem 1rem 0.75rem;
}

.sidebar-nav-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.nav-section-label {
  font-size: 0.68rem;
  font-weight: 700;
  color: #8896A4;
  letter-spacing: 0.08em;
  padding: 0.5rem 0.75rem 0.25rem 0.75rem;
}

.sidebar-nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.65rem 0.85rem;
  border-radius: 8px;
  color: #4B5563;
  text-decoration: none;
  font-size: 0.86rem;
  font-weight: 500;
  transition: all 0.18s ease;
  position: relative;
}

.sidebar-nav-item:hover {
  color: #0E3B43;
  background-color: #F3F6F6;
}

.sidebar-nav-item.active {
  background-color: #EBF5F3;
  color: #137A7F;
  font-weight: 600;
}

.active-bar {
  position: absolute;
  left: 0;
  top: 6px;
  bottom: 6px;
  width: 3.5px;
  background-color: #137A7F;
  border-radius: 0 4px 4px 0;
}

.nav-icon {
  flex-shrink: 0;
  transition: transform 0.15s ease;
}

.sidebar-nav-item:hover .nav-icon {
  transform: translateX(1px);
}

/* Token sidebar badge */
.token-sidebar-badge {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 20px;
  white-space: nowrap;
}

.badge-normal {
  background-color: #EBF5F3;
  color: #137A7F;
  border: 1px solid rgba(19, 122, 127, 0.25);
}

.badge-low {
  background-color: #FEE2E2;
  color: #DC2626;
  border: 1px solid rgba(220, 38, 38, 0.3);
  animation: badge-wiggle 2s ease infinite;
}

/* Sidebar Footer User Card */
.sidebar-footer {
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid #E4E9E7;
}

.sidebar-user-card {
  background-color: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  padding: 0.75rem 0.85rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
}

.badge-role-pill {
  font-size: 0.68rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 20px;
}

.role-peneliti {
  background-color: #EBF5F3;
  color: #137A7F;
  border: 1px solid rgba(19, 122, 127, 0.2);
}

.role-responden {
  background-color: #F0F4F8;
  color: #0E3B43;
  border: 1px solid rgba(14, 59, 67, 0.15);
}

@keyframes badge-wiggle {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-3deg); }
  75% { transform: rotate(3deg); }
}
</style>
