<template>
  <div>
    <LayoutAppNavbar variant="private" :user="user" @logout="handleLogout" />
    
    <div class="container-fluid py-4">
      <div class="row">
        <!-- Sidebar -->
        <div class="col-lg-2 d-none d-lg-block">
          <LayoutAppSidebar :active-item="activeItem" :user="user" />
        </div>

        <!-- Main Content -->
        <div class="col-lg-10">
          <slot />
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
  image?: string | null
  role?: 'peneliti' | 'responden'
}

interface Props {
  user?: User | null
  activeItem?: 'dashboard' | 'projects' | 'surveys' | 'analytics' | 'profile'
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
