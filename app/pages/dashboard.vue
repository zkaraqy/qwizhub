<template>
  <LayoutPrivateLayout :user="userProfile" active-item="dashboard" @logout="handleSignOut">
    <!-- Hero Welcome Section -->
    <div class="hero-section fade-in mb-4">
      <div class="position-relative" style="z-index: 1;">
        <h1 class="display-6 fw-bold mb-2">Welcome back, {{ userProfile?.name || 'User' }}! 👋</h1>
        <p v-if="userProfile?.role === 'peneliti'" class="lead mb-4 opacity-90">Here's what's happening with your research projects today.</p>
        <button v-if="userProfile?.role === 'peneliti'" class="btn btn-light btn-lg px-4 fw-semibold shadow-sm"
          @click="handleCreateSurvey">
          <i class="bi bi-plus-lg me-2"></i>New Project
        </button>
      </div>
    </div>

    <!-- Verification Banner -->
    <DashboardVerificationBanner :verification-status="(data?.user as any)?.verificationStatus"
      :role="(data?.user as any)?.role" class="mb-4 fade-in stagger-1" />

    <!-- Stats Cards with Glass-morphism -->
    <div class="row g-4 mb-4">
      <!-- Peneliti stats -->
      <template v-if="userProfile?.role === 'peneliti'">
        <div class="col-md-3 col-sm-6 fade-in stagger-1">
          <div class="stat-card">
            <div class="stat-icon primary">
              <i class="bi bi-folder2-open"></i>
            </div>
            <div class="text-muted fw-semibold text-uppercase mb-1" style="font-size: 0.75rem; letter-spacing: 0.05em;">
              Total Projects</div>
            <h2 class="fw-bold mb-0 display-6">{{ stats.projects }}</h2>
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
            <div class="text-muted fw-semibold text-uppercase mb-1" style="font-size: 0.75rem; letter-spacing: 0.05em;">
              Questionnaires</div>
            <h2 class="fw-bold mb-0 display-6">{{ stats.questionnaires }}</h2>
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
            <div class="text-muted fw-semibold text-uppercase mb-1" style="font-size: 0.75rem; letter-spacing: 0.05em;">
              Published</div>
            <h2 class="fw-bold mb-0 display-6">{{ stats.published }}</h2>
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
            <div class="text-muted fw-semibold text-uppercase mb-1" style="font-size: 0.75rem; letter-spacing: 0.05em;">
              Total Responses</div>
            <h2 class="fw-bold mb-0 display-6">{{ stats.responses }}</h2>
            <div class="mt-2 text-info small">
              <i class="bi bi-graph-up"></i> Collected
            </div>
          </div>
        </div>
      </template>

      <!-- Responden stats -->
      <template v-else-if="userProfile?.role === 'responden'">
        <div class="col-md-6 col-sm-12 fade-in stagger-1">
          <div class="stat-card">
            <div class="stat-icon primary">
              <i class="bi bi-card-checklist"></i>
            </div>
            <div class="text-muted fw-semibold text-uppercase mb-1" style="font-size: 0.75rem; letter-spacing: 0.05em;">
              Total Questionnaires Answered</div>
            <h2 class="fw-bold mb-0 display-6">{{ stats.totalQuestionnairesAnswered }}</h2>
            <div class="mt-2 text-success small">
              <i class="bi bi-check2-all"></i> Completed
            </div>
          </div>
        </div>

        <div class="col-md-6 col-sm-12 fade-in stagger-2">
          <div class="stat-card">
            <div class="stat-icon success">
              <i class="bi bi-cash-stack"></i>
            </div>
            <div class="text-muted fw-semibold text-uppercase mb-1" style="font-size: 0.75rem; letter-spacing: 0.05em;">
              Total Honor Earned</div>
            <h2 class="fw-bold mb-0 display-6">{{ stats.totalHonorEarned }}</h2>
            <div class="mt-2 text-muted small">
              <i class="bi bi-cash"></i> Earned
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- Quick Actions -->
    <div class="row mb-4 fade-in stagger-2">
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
            <!-- <button class="btn btn-outline-success" @click="router.push('/profile')">
              <i class="bi bi-person-circle me-2"></i>Edit Profile
            </button> -->
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="row fade-in stagger-3">
      <div class="col-12">
        <div class="card glass-card border-0 shadow-sm rounded-4 overflow-hidden">

          <!-- Header -->
          <div
            class="card-header bg-transparent border-bottom-0 d-flex justify-content-between align-items-center pt-2 p-4 pb-2">
            <h5 class="fw-bold mb-0 text-dark">
              <i class="bi bi-clock-history me-2 text-primary"></i>Recent Activity
            </h5>
            <button class="btn btn-sm btn-light text-primary fw-medium rounded-pill px-3"
              @click="router.push('/projects')">
              View All <i class="bi bi-arrow-right ms-1"></i>
            </button>
          </div>

          <div class="card-body p-0">

            <!-- Loading State (Menggunakan Placeholder Bawaan BS5) -->
            <div v-if="loadingActivities" class="p-4">
              <div class="placeholder-glow mb-3">
                <span class="placeholder col-12 rounded-3" style="height: 70px;"></span>
              </div>
              <div class="placeholder-glow mb-3">
                <span class="placeholder col-12 rounded-3" style="height: 70px;"></span>
              </div>
              <div class="placeholder-glow">
                <span class="placeholder col-12 rounded-3" style="height: 70px;"></span>
              </div>
            </div>

            <!-- Empty State -->
            <div v-else-if="recentActivities.length === 0" class="text-center p-5">
              <div class="mb-3">
                <div class="d-inline-flex align-items-center justify-content-center bg-light rounded-circle"
                  style="width: 80px; height: 80px;">
                  <i class="bi bi-inbox fs-1 text-muted opacity-50"></i>
                </div>
              </div>
              <h6 class="fw-bold text-dark mb-1">No recent activity found</h6>
              <p class="text-muted small mb-4">Start by creating your first project to see updates here.</p>
              <button v-if="userProfile?.role === 'peneliti'" class="btn btn-primary rounded-pill px-4 shadow-sm"
                @click="handleCreateSurvey">
                <i class="bi bi-plus-lg me-2"></i>Create Project
              </button>
            </div>

            <!-- Activity List -->
            <div v-else class="list-group list-group-flush border-top">
              <button v-for="activity in recentActivities" :key="activity.id || activity.entityId"
                class="list-group-item list-group-item-action d-flex align-items-center p-3 p-md-4 border-bottom"
                @click="navigateToDetail(activity)">

                <!-- Icon Box -->
                <div class="flex-shrink-0 me-3 me-md-4">
                  <div
                    class="stat-icon bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center"
                    style="width: 48px; height: 48px;">
                    <i class="bi bi-file-earmark-text fs-5"></i>
                  </div>
                </div>

                <!-- Content Area -->
                <div class="flex-grow-1 overflow-hidden pe-3">
                  <div class="d-flex justify-content-between align-items-center mb-1">
                    <h6 class="mb-0 fw-bold text-dark text-truncate">{{ activity.title }}</h6>

                    <!-- Date (Desktop View) -->
                    <small class="text-muted text-nowrap ms-2 d-none d-sm-flex align-items-center">
                      <i class="bi bi-calendar-event me-1"></i> {{ formatDateTimeShort(activity.date) }}
                    </small>
                  </div>

                  <p class="mb-0 text-muted small text-truncate">{{ activity.description }}</p>

                  <!-- Date (Mobile View) -->
                  <small class="text-muted d-flex d-sm-none align-items-center mt-2" style="font-size: 0.75rem;">
                    <i class="bi bi-calendar-event me-1"></i> {{ formatDateTimeShort(activity.date) }}
                  </small>
                </div>

                <!-- Action Arrow -->
                <div v-if="getDetailUrl(activity)" class="flex-shrink-0 ms-2">
                  <div class="btn btn-sm btn-light rounded-circle d-flex align-items-center justify-content-center"
                    style="width: 32px; height: 32px; padding: 0;">
                    <i class="bi bi-chevron-right text-muted"></i>
                  </div>
                </div>

              </button>
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
import { useFetch } from '#app'
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

// Stats object contains fields for both roles. Unused fields will stay 0.
const stats = ref({
  // Peneliti fields
  projects: 0,
  questionnaires: 0,
  published: 0,
  responses: 0,
  // Responden fields
  totalQuestionnairesAnswered: 0,
  totalHonorEarned: 0
})

const recentActivities = ref<any[]>([])
const loadingActivities = ref(false)
const loadingDashboard = ref(true)

onMounted(async () => {
  await refresh()
  try {
    if (userProfile.value?.role === 'peneliti') {
      // Load peneliti stats
      const { data: statsData, error: statsError } = await useFetch('/api/dashboard')
      if (!statsError.value && statsData.value?.success) {
        stats.value = statsData.value.stats
      }
      // Load recent activities for peneliti
      const { data: actData, error: actError } = await useFetch('/api/dashboard/recent')
      if (!actError.value && actData.value?.success) {
        recentActivities.value = actData.value.recentActivities
      }
    } else if (userProfile.value?.role === 'responden') {
      // Load responden stats
      const { data: statsData, error: statsError } = await useFetch('/api/dashboard/respondent')
      if (!statsError.value && statsData.value?.success) {
        stats.value.totalQuestionnairesAnswered = statsData.value.stats.totalQuestionnairesAnswered
        stats.value.totalHonorEarned = statsData.value.stats.totalHonorEarned
      }
    }
  } catch (e) {
    console.error('Dashboard load error:', e)
  } finally {
    loadingDashboard.value = false
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

function getDetailUrl(activity: any): string | null {
  if (activity.type === 'project') {
    return `/projects/manage/${activity.entityId}`
  }
  if (activity.type === 'questionnaire') {
    return `/projects/${activity.projectId}/questionnaire/${activity.entityId}/edit`
  }
  return null
}
function navigateToDetail(activity: any) {
  const url = getDetailUrl(activity)
  if (url) {
    router.push(url)
  }
}
</script>

<style scoped>
.list-group-item:hover {
  background: rgba(102, 126, 234, 0.03);
  cursor: pointer;
}
</style>
