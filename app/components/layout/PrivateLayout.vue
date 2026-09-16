<template>
  <div class="app-shell">
    <LayoutAppNavbar variant="private" :user="user" @logout="handleLogout" />
    
    <div class="app-body">
      <!-- Full-Height Integrated Sidebar -->
      <aside class="app-sidebar-pane d-none d-lg-flex">
        <LayoutAppSidebar :active-item="activeItem" :user="user" />
      </aside>

      <!-- Main Content Area -->
      <main class="app-main-pane">
        <slot />
      </main>
    </div>
  </div>
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
  user?: User | null
  activeItem?: 'dashboard' | 'projects' | 'surveys' | 'analytics' | 'profile' | 'payments' | 'honor' | 'admin'
}

withDefaults(defineProps<Props>(), {
  user: null,
  activeItem: 'dashboard'
})

const emit = defineEmits<{
  logout: []
}>()

const handleLogout = () => {
  emit('logout')
}
</script>

<style scoped>
.app-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #F8FAFA;
}

.app-body {
  display: flex;
  flex: 1;
  min-height: calc(100vh - 62px);
  position: relative;
}

.app-sidebar-pane {
  width: 240px;
  min-width: 240px;
  background-color: #FFFFFF;
  border-right: 1px solid #E2E8F0;
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 62px;
  height: calc(100vh - 62px);
  overflow-y: auto;
  z-index: 100;
  box-shadow: 1px 0 0 rgba(0, 0, 0, 0.02);
}

.app-main-pane {
  flex: 1;
  min-width: 0;
  padding: 1.75rem 2rem;
  background-color: #F8FAFA;
}

@media (max-width: 991.98px) {
  .app-main-pane {
    padding: 1.25rem 1rem;
  }
}
</style>
