<template>
  <LayoutPrivateLayout :user="userProfile" active-item="projects" @logout="handleSignOut">
    <!-- Hero Header - Compact & Transparent -->
    <div class="hero-section-transparent fade-in mb-3">
      <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
        <div>
          <h3 class="fw-bold mb-1 text-dark">My Research Projects</h3>
          <p class="mb-0 text-muted small">Manage and monitor all your research questionnaires</p>
        </div>
        <button class="btn bg-primary text-white btn-sm px-3 fw-semibold" @click="router.push('/projects/create')">
          <i class="bi bi-plus-lg me-1"></i>Create New Project
        </button>
      </div>
    </div>

    <div v-if="loading" class="text-center py-5">
      <div class="row g-4">
        <div v-for="i in 3" :key="i" class="col-md-6 col-lg-4">
          <div class="skeleton" style="height: 280px; border-radius: 20px;"></div>
        </div>
      </div>
    </div>

    <div v-else-if="error" class="alert alert-danger glass-card fade-in">
      <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ error }}
    </div>

    <div v-else-if="projects.length === 0" class="text-center py-5 fade-in">
      <div class="glass-card p-5">
        <i class="bi bi-folder2-open display-1 text-muted opacity-25 mb-4 d-block"></i>
        <h4 class="fw-bold mb-3">No Projects Yet</h4>
        <p class="text-muted mb-4">Start by creating your first research project</p>
        <button class="btn btn-gradient btn-lg" @click="router.push('/projects/create')">
          <i class="bi bi-plus-circle me-2"></i>Create Your First Project
        </button>
      </div>
    </div>

    <div v-else class="row g-4">
      <div v-for="(project, index) in projects" :key="project.id" 
           class="col-md-6 col-lg-4 fade-in"
           :class="`stagger-${(index % 4) + 1}`">
        <div class="project-card">
          <div class="card-body p-4">
            <div class="d-flex justify-content-between align-items-start mb-3">
              <div class="stat-icon primary">
                <i class="bi bi-folder2-open"></i>
              </div>
            </div>
            
            <h5 class="fw-bold mb-2">{{ project.title }}</h5>
            <p class="text-muted small mb-3" style="min-height: 40px;">
              {{ project.description || 'No description provided' }}
            </p>
            
            <div class="d-flex align-items-center text-muted small mb-4">
              <i class="bi bi-calendar3 me-2"></i>
              <span>Created: {{ formatDate(project.createdAt) }}</span>
            </div>

            <div class="d-flex gap-2">
              <button class="btn bg-primary text-white btn-sm flex-grow-1" @click="router.push(`/projects/manage/${project.id}`)">
                <i class="bi bi-kanban me-2"></i>Manage
              </button>
              <button class="btn btn-outline-danger btn-sm" @click="deleteProject(project.id)" :disabled="deleting === project.id">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </LayoutPrivateLayout>
</template>

<script setup lang="ts">
const { signOut } = useAuth()
const { data: session } = useAuth()
const router = useRouter()
const projects = ref<any[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const deleting = ref<string | null>(null)
import Swal from 'sweetalert2'

const userProfile = computed(() => {
  if (!session.value?.user) return null
  return {
    id: session.value.user.id,
    name: session.value.user.name || '',
    email: session.value.user.email || '',
    image: session.value.user.image,
    role: session.value.user.role
  }
})

const handleSignOut = async () => {
  await signOut({ callbackUrl: '/login' })
}

onMounted(async () => {
  await fetchProjects()
})

async function fetchProjects() {
  loading.value = true
  error.value = null
  
  try {
    const response = await $fetch('/api/projects', {
      method: 'GET'
    })
    projects.value = response.projects
  } catch (err: any) {
    error.value = err.data?.statusMessage || 'Failed to load projects'
  } finally {
    loading.value = false
  }
}

async function deleteProject(projectId: string) {
  const result = await Swal.fire({
    title: 'Delete Project?',
    text: "This action cannot be undone!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc3545',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'Cancel'
  })

  if (!result.isConfirmed) return

  deleting.value = projectId
  
  try {
    await $fetch(`/api/projects/${projectId}`, {
      method: 'DELETE'
    })
    await fetchProjects()
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Project deleted successfully',
      showConfirmButton: false,
      timer: 3000
    })
  } catch (err: any) {
    Swal.fire('Error', err.data?.statusMessage || 'Failed to delete project', 'error')
  } finally {
    deleting.value = null
  }
}

function statusBadgeClass(status: string) {
  switch (status) {
    case 'draft': return 'badge bg-secondary'
    case 'published': return 'badge badge-success-gradient'
    case 'closed': return 'badge bg-danger'
    default: return 'badge bg-secondary'
  }
}

function statusLabel(status: string) {
  switch (status) {
    case 'draft': return 'Draft'
    case 'published': return 'Published'
    case 'closed': return 'Closed'
    default: return status
  }
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('id-ID', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  })
}
</script>

<style scoped>
/* Hero Section - Transparent Glass Effect */
.hero-section-transparent {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(228, 233, 231, 0.8);
  border-radius: 16px;
  padding: 1.25rem 1.5rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
}

.hero-section-transparent:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  border-color: rgba(42, 127, 121, 0.3);
}

.hero-section-transparent h3 {
  font-size: 1.5rem;
  letter-spacing: -0.02em;
  line-height: 1.3;
  color: #17212B;
}

.hero-section-transparent p {
  font-size: 0.875rem;
  line-height: 1.5;
  color: #66727C;
}

@media (max-width: 768px) {
  .hero-section-transparent {
    padding: 1rem 1.25rem;
  }
  
  .hero-section-transparent h3 {
    font-size: 1.25rem;
  }
  
  .hero-section-transparent p {
    font-size: 0.8125rem;
    margin-bottom: 0.75rem !important;
  }
  
  .hero-section-transparent .btn {
    width: 100%;
  }
}
</style>
