<template>
  <LayoutPrivateLayout :user="userProfile" active-item="dashboard" @logout="handleSignOut">
    <!-- Hero Welcome Section -->
    <div class="hero-section fade-in mb-5">
      <div class="position-relative" style="z-index: 1;">
        <h1 class="display-5 fw-bold mb-2">Welcome back, {{ userProfile?.name || 'User' }}! 👋</h1>
        <p class="lead mb-4 opacity-90">Here's what's happening with your research projects today.</p>
        <button v-if="userProfile?.role === 'peneliti'" class="btn btn-light btn-lg px-4 fw-semibold shadow-sm" @click="handleCreateSurvey">
          <i class="bi bi-plus-lg me-2"></i>New Project
        </button>
      </div>
    </div>

    <!-- Verification Banner -->
    <DashboardVerificationBanner 
      :verification-status="(data?.user as any)?.verificationStatus"
      :role="(data?.user as any)?.role" 
      class="mb-4 fade-in stagger-1" 
    />

    <!-- Stats Cards with Glass-morphism -->
    <div class="row g-4 mb-5">
      <div class="col-md-3 col-sm-6 fade-in stagger-1">
        <div class="stat-card">
          <div class="stat-icon primary">
            <i class="bi bi-folder2-open"></i>
          </div>
          <div class="text-muted fw-semibold text-uppercase mb-1" style="font-size: 0.75rem; letter-spacing: 0.05em;">Total Projects</div>
          <h2 class="fw-bold mb-0 display-5">{{ stats.projects }}</h2>
          <div class="mt-2 text-success small">
            <i class="bi bi-arrow-up"></i> Active
          </div>
        </div>
      </div>

      <div class="col-md-3 col-sm-6 fade-in stagger-2">
        <div class="stat-card">
          <div class="stat-icon success">
            <i class="bi bi-ui-checks-grid"></i>
          </div>
          <div class="text-muted fw-semibold text-uppercase mb-1" style="font-size: 0.75rem; letter-spacing: 0.05em;">Questionnaires</div>
          <h2 class="fw-bold mb-0 display-5">{{ stats.questionnaires }}</h2>
          <div class="mt-2 text-muted small">
            <i class="bi bi-files"></i> Total created
          </div>
        </div>
      </div>

      <div class="col-md-3 col-sm-6 fade-in stagger-3">
        <div class="stat-card">
          <div class="stat-icon info">
            <i class="bi bi-globe2"></i>
          </div>
          <div class="text-muted fw-semibold text-uppercase mb-1" style="font-size: 0.75rem; letter-spacing: 0.05em;">Published</div>
          <h2 class="fw-bold mb-0 display-5">{{ stats.published }}</h2>
          <div class="mt-2 text-primary small">
            <i class="bi bi-check-circle"></i> Live now
          </div>
        </div>
      </div>

      <div class="col-md-3 col-sm-6 fade-in stagger-4">
        <div class="stat-card">
          <div class="stat-icon warning">
            <i class="bi bi-people-fill"></i>
          </div>
          <div class="text-muted fw-semibold text-uppercase mb-1" style="font-size: 0.75rem; letter-spacing: 0.05em;">Total Responses</div>
          <h2 class="fw-bold mb-0 display-5">{{ stats.responses }}</h2>
          <div class="mt-2 text-info small">
            <i class="bi bi-graph-up"></i> Collected
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="row mb-5 fade-in stagger-2">
      <div class="col-12">
        <div class="glass-card p-4">
          <h5 class="fw-bold mb-3">
            <i class="bi bi-lightning-charge-fill text-warning me-2"></i>Quick Actions
          </h5>
          <div class="d-flex flex-wrap gap-3">
            <button v-if="userProfile?.role === 'peneliti'" class="btn btn-gradient" @click="handleCreateSurvey">
              <i class="bi bi-plus-circle me-2"></i>Create New Project
            </button>
            <button class="btn btn-outline-primary" @click="router.push('/projects')">
              <i class="bi bi-folder2-open me-2"></i>View All Projects
            </button>
            <button class="btn btn-outline-success" @click="router.push('/profile')">
              <i class="bi bi-person-circle me-2"></i>Edit Profile
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="row fade-in stagger-3">
      <div class="col-12">
        <div class="glass-card">
          <div class="card-header bg-transparent border-0 d-flex justify-content-between align-items-center p-4">
            <h5 class="fw-bold mb-0">
              <i class="bi bi-clock-history me-2 text-primary"></i>Recent Activity
            </h5>
            <button class="btn btn-sm btn-link text-decoration-none" @click="router.push('/projects')">
              View All <i class="bi bi-arrow-right ms-1"></i>
            </button>
          </div>
          <div class="card-body p-0">
            <div v-if="loadingActivities" class="text-center p-5">
              <div class="skeleton" style="height: 60px; width: 100%; margin-bottom: 1rem;"></div>
              <div class="skeleton" style="height: 60px; width: 100%; margin-bottom: 1rem;"></div>
              <div class="skeleton" style="height: 60px; width: 100%;"></div>
            </div>
            <div v-else-if="recentActivities.length === 0" class="text-center p-5">
              <div class="mb-4">
                <i class="bi bi-inbox display-1 text-muted opacity-25"></i>
              </div>
              <h6 class="fw-semibold text-muted mb-2">No recent activity found</h6>
              <p class="text-muted small mb-3">Start by creating your first project</p>
              <button v-if="userProfile?.role === 'peneliti'" class="btn btn-gradient-info btn-sm" @click="handleCreateSurvey">
                <i class="bi bi-plus-lg me-2"></i>Create Project
              </button>
            </div>
            <div v-else class="list-group list-group-flush">
              <div v-for="(activity, index) in recentActivities" :key="activity.id" 
                   class="list-group-item list-group-item-action p-4 border-0"
                   :class="{'border-bottom': index < recentActivities.length - 1}"
                   style="transition: all 0.2s;">
                <div class="d-flex w-100 justify-content-between align-items-center">
                  <div class="d-flex align-items-start">
                    <div class="stat-icon primary me-3" style="width: 40px; height: 40px; font-size: 1.2rem;">
                      <i class="bi bi-file-earmark-text"></i>
                    </div>
                    <div>
                      <h6 class="mb-1 fw-semibold">{{ activity.title }}</h6>
                      <small class="text-muted">{{ activity.description }}</small>
                    </div>
                  </div>
                  <small class="text-muted">{{ activity.date }}</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </LayoutPrivateLayout>
</template>

<script lang="ts" setup>
definePageMeta({
  auth: {
    unauthenticatedOnly: false
  }
})

const { data, signOut, refresh } = useAuth()
const router = useRouter()

const userProfile = computed(() => {
  if (!data.value?.user) return null
  return {
    id: (data.value.user as any).id,
    name: data.value.user.name || '',
    email: data.value.user.email || '',
    image: data.value.user.image,
    role: (data.value.user as any).role
  }
})

const stats = ref({
  projects: 0,
  questionnaires: 0,
  published: 0,
  responses: 0
})

const recentActivities = ref<any[]>([])
const loadingActivities = ref(false)

onMounted(async () => {
  await refresh()
  if (userProfile.value?.role === 'peneliti') {
    stats.value = {
      projects: 3,
      questionnaires: 5,
      published: 2,
      responses: 124
    }
  }
})

const handleSignOut = async () => {
  await signOut({ callbackUrl: '/login' })
}

const handleCreateSurvey = () => {
  if ((data.value?.user as any)?.role === 'peneliti') {
    router.push('/projects/create')
  }
}
</script>

<style scoped>
.list-group-item:hover {
  background: rgba(102, 126, 234, 0.03);
  cursor: pointer;
}
</style>
