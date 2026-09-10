<template>
  <div>
    <!-- Navbar -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
      <div class="container-fluid">
        <NuxtLink to="/" class="navbar-brand fw-bold">
          <span class="fs-4">QwizHub</span>
        </NuxtLink>
        
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>
        
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav ms-auto align-items-center">
            <li v-if="(data?.user as any)?.role === 'peneliti'" class="nav-item">
              <NuxtLink to="/projects" class="nav-link">My Projects</NuxtLink>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#">Surveys</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#">Analytics</a>
            </li>
            <li class="nav-item dropdown">
              <a class="nav-link dropdown-toggle d-flex align-items-center" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown">
                <img v-if="data?.user?.image" :src="data.user.image" class="rounded-circle me-2" width="32" height="32" alt="Profile">
                <span v-else class="badge bg-light text-primary rounded-circle me-2" style="width: 32px; height: 32px; line-height: 32px;">{{ data?.user?.name?.charAt(0) || 'U' }}</span>
                <span>{{ data?.user?.name }}</span>
              </a>
              <ul class="dropdown-menu dropdown-menu-end">
                <li><NuxtLink to="/profile" class="dropdown-item">Profile</NuxtLink></li>
                <li><NuxtLink to="/" class="dropdown-item">Home</NuxtLink></li>
                <li><hr class="dropdown-divider"></li>
                <li><a class="dropdown-item text-danger" href="#" @click.prevent="handleSignOut">Logout</a></li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <div class="container-fluid py-4">
      <div class="row">
        <!-- Sidebar -->
        <div class="col-lg-2 d-none d-lg-block">
          <div class="list-group">
            <NuxtLink to="/dashboard" class="list-group-item list-group-item-action active">Dashboard</NuxtLink>
            <NuxtLink v-if="(data?.user as any)?.role === 'peneliti'" to="/projects" class="list-group-item list-group-item-action">
              My Projects
            </NuxtLink>
            <a href="#" class="list-group-item list-group-item-action">My Surveys</a>
            <a href="#" class="list-group-item list-group-item-action">Analytics</a>
            <NuxtLink to="/profile" class="list-group-item list-group-item-action">Profile</NuxtLink>
          </div>
        </div>

        <!-- Main Dashboard Content -->
        <div class="col-lg-10">
          <!-- Welcome Section -->
          <div class="row mb-4">
            <div class="col-12">
              <div class="card border-0 bg-gradient bg-primary text-white">
                <div class="card-body p-4">
                  <h2 class="mb-2">Welcome back, {{ data?.user?.name }}! 👋</h2>
                  <p class="mb-0 opacity-75">Here's what's happening with your surveys today</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Verification Banner -->
          <div v-if="(data?.user as any)?.role === 'responden' && (data?.user as any)?.verificationStatus !== 'verified'" :key="data?.user?.verificationStatus" class="alert alert-warning alert-dismissible fade show" role="alert">
            <div class="d-flex align-items-start">
              <strong>⚠️</strong>
              <div class="ms-3">
                <h5 class="alert-heading mb-1">Your profile is not verified yet!</h5>
                <p class="mb-2">Please complete your demographic profile to access paid surveys.</p>
                <NuxtLink to="/profile" class="btn btn-warning btn-sm">Complete Profile Now</NuxtLink>
              </div>
            </div>
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
          </div>


          <!-- Stats Cards -->
          <div class="row g-3 mb-4">
            <div class="col-md-3 col-sm-6">
              <div class="card border-0 shadow-sm">
                <div class="card-body">
                  <div class="d-flex justify-content-between align-items-center">
                    <div>
                      <p class="text-muted mb-1 small">Total Surveys</p>
                      <h3 class="mb-0">12</h3>
                    </div>
                    <div class="bg-primary bg-opacity-10 rounded p-3">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#0d6efd" viewBox="0 0 16 16">
                        <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="col-md-3 col-sm-6">
              <div class="card border-0 shadow-sm">
                <div class="card-body">
                  <div class="d-flex justify-content-between align-items-center">
                    <div>
                      <p class="text-muted mb-1 small">Responses</p>
                      <h3 class="mb-0">348</h3>
                    </div>
                    <div class="bg-success bg-opacity-10 rounded p-3">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#198754" viewBox="0 0 16 16">
                        <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1H7zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="col-md-3 col-sm-6">
              <div class="card border-0 shadow-sm">
                <div class="card-body">
                  <div class="d-flex justify-content-between align-items-center">
                    <div>
                      <p class="text-muted mb-1 small">Active</p>
                      <h3 class="mb-0">5</h3>
                    </div>
                    <div class="bg-warning bg-opacity-10 rounded p-3">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#ffc107" viewBox="0 0 16 16">
                        <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492z"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="col-md-3 col-sm-6">
              <div class="card border-0 shadow-sm">
                <div class="card-body">
                  <div class="d-flex justify-content-between align-items-center">
                    <div>
                      <p class="text-muted mb-1 small">Completed</p>
                      <h3 class="mb-0">7</h3>
                    </div>
                    <div class="bg-info bg-opacity-10 rounded p-3">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#0dcaf0" viewBox="0 0 16 16">
                        <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Recent Activity -->
          <div class="row">
            <div class="col-12">
              <div class="card border-0 shadow-sm">
                <div class="card-header bg-white border-bottom">
                  <h5 class="mb-0">Recent Activity</h5>
                </div>
                <div class="card-body">
                  <p class="text-muted text-center py-4">No recent activity. Start by creating your first survey!</p>
                  <div class="text-center">
                    <button class="btn btn-primary">Create New Survey</button>
                  </div>
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
    unauthenticatedOnly: false
  }
})

const { data, signOut, refresh } = useAuth()

onMounted(async () => {
  await refresh()
})

const handleSignOut = async () => {
  await signOut({ callbackUrl: '/login' })
}

onMounted(() => {
  console.log('User data:', data.value)
})
</script>

<style scoped>
.list-group-item.active {
  background-color: #0d6efd;
  border-color: #0d6efd;
}
</style>
