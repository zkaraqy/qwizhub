<template>
  <LayoutPrivateLayout :user="userProfile" active-item="projects" @logout="handleSignOut">
    <!-- Hero Header - Standardized SaaS Header -->
    <div class="hero-section-clean fade-in mb-4">
      <div class="d-flex justify-content-between align-items-start align-items-md-center flex-wrap gap-3">
        <div>
          <div class="d-flex align-items-center gap-2 mb-1">
            <span class="text-uppercase fw-bold small" style="color: #137A7F; letter-spacing: 0.08em; font-size: 0.72rem;">
              RISET & KUISIONER
            </span>
          </div>
          <h2 class="fw-bold mb-1" style="color: #0E3B43; letter-spacing: -0.02em;">
            Proyek Penelitian Saya
          </h2>
          <p class="mb-0 text-secondary small">
            Kelola instrumen variabel, kuesioner AI, dan pantau seluruh riset Anda dalam satu tempat.
          </p>
        </div>
        <button 
          class="btn text-white px-3.5 py-2 fw-semibold rounded-3 shadow-sm d-inline-flex align-items-center gap-2" 
          style="background-color: #0E3B43;"
          @click="router.push('/projects/create')"
        >
          <i class="bi bi-plus-lg"></i>
          <span>Buat Proyek Baru</span>
        </button>
      </div>
    </div>

    <!-- Search & Filter Bar -->
    <div v-if="!loading && projects.length > 0" class="card border rounded-4 shadow-sm bg-white p-3 mb-4 fade-in" style="border-color: #E2E8F0;">
      <div class="row g-2 align-items-center">
        <div class="col-md-8 col-lg-9">
          <div class="input-group input-group-sm">
            <span class="input-group-text bg-transparent border-end-0 text-muted">
              <i class="bi bi-search" style="color: #137A7F;"></i>
            </span>
            <input
              v-model="searchQuery"
              type="text"
              class="form-control form-control-sm border-start-0 rounded-end-3"
              placeholder="Cari judul proyek atau deskripsi penelitian..."
            />
            <button v-if="searchQuery" class="btn btn-outline-secondary btn-sm" type="button" @click="searchQuery = ''">
              <i class="bi bi-x"></i>
            </button>
          </div>
        </div>
        <div class="col-md-4 col-lg-3">
          <select v-model="selectedStatus" class="form-select form-select-sm rounded-3">
            <option value="all">Semua Status ({{ projects.length }})</option>
            <option value="draft">Draft</option>
            <option value="published">Aktif / Published</option>
            <option value="closed">Selesai / Ditutup</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Loading Skeletons -->
    <div v-if="loading" class="text-center py-5">
      <div class="row g-4">
        <div v-for="i in 3" :key="i" class="col-md-6 col-lg-4">
          <div class="skeleton card border-0 rounded-4 shadow-sm" style="height: 240px; background-color: #EAEFEF;"></div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="alert alert-danger card border-0 rounded-4 shadow-sm p-3 fade-in d-flex align-items-center gap-2">
      <i class="bi bi-exclamation-triangle-fill text-danger fs-5"></i>
      <div>{{ error }}</div>
    </div>

    <!-- Empty State (No Projects) -->
    <div v-else-if="projects.length === 0" class="text-center py-5 fade-in">
      <div class="card border rounded-4 shadow-sm bg-white p-5 mx-auto" style="max-width: 520px; border-color: #E2E8F0;">
        <div class="mx-auto mb-3 rounded-circle d-flex align-items-center justify-content-center" style="width: 72px; height: 72px; background-color: #EBF5F3;">
          <i class="bi bi-folder2-open display-6" style="color: #137A7F;"></i>
        </div>
        <h4 class="fw-bold mb-2" style="color: #0E3B43;">Belum Ada Proyek Penelitian</h4>
        <p class="text-secondary small mb-4" style="line-height: 1.6;">
          Mulai langkah riset Anda dengan membuat proyek baru dan rancang instrumen kuesioner berkualitas bersama bantuan AI.
        </p>
        <button 
          class="btn text-white px-4 py-2.5 fw-semibold rounded-3 shadow-sm d-inline-flex align-items-center justify-content-center gap-2 mx-auto" 
          style="background-color: #0E3B43;"
          @click="router.push('/projects/create')"
        >
          <i class="bi bi-plus-circle"></i>
          <span>Buat Proyek Pertama</span>
        </button>
      </div>
    </div>

    <!-- Empty State (No Search Match) -->
    <div v-else-if="filteredProjects.length === 0" class="text-center py-5 fade-in">
      <div class="card border rounded-4 shadow-sm bg-white p-4 mx-auto" style="max-width: 450px; border-color: #E2E8F0;">
        <i class="bi bi-search display-6 text-muted mb-2"></i>
        <h5 class="fw-bold mb-1 text-dark">Tidak Ada Proyek yang Cocok</h5>
        <p class="text-secondary small mb-3">Tidak ditemukan proyek dengan kata kunci "{{ searchQuery }}".</p>
        <button class="btn btn-outline-secondary btn-sm rounded-pill px-3 mx-auto" @click="searchQuery = ''; selectedStatus = 'all'">
          Reset Pencarian
        </button>
      </div>
    </div>

    <!-- Project Cards Grid -->
    <div v-else class="row g-4">
      <div 
        v-for="(project, index) in filteredProjects" 
        :key="project.id" 
        class="col-md-6 col-lg-4 fade-in"
        :class="`stagger-${(index % 4) + 1}`"
      >
        <div class="card border rounded-4 shadow-sm bg-white h-100 project-card" style="border-color: #E2E8F0;">
          <div class="card-body p-4 d-flex flex-column">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <div class="stat-icon-folder">
                <i class="bi bi-folder2-open" style="color: #137A7F;"></i>
              </div>
              <span class="badge rounded-pill px-2.5 py-1" :class="statusBadgeClass(project.status)">
                {{ statusLabel(project.status) }}
              </span>
            </div>
            
            <h5 class="fw-bold mb-2 text-dark" style="letter-spacing: -0.01em;">{{ project.title }}</h5>
            <p class="text-muted small mb-3 flex-grow-1" style="line-height: 1.6;">
              {{ project.description || 'Tidak ada deskripsi untuk proyek penelitian ini.' }}
            </p>
            
            <div class="d-flex align-items-center gap-3 text-secondary small mb-4 pt-3 border-top" style="border-color: #F0F4F4; font-size: 0.8rem;">
              <span class="d-flex align-items-center gap-1.5">
                <i class="bi bi-calendar3" style="color: #137A7F;"></i>
                <span>{{ formatDate(project.createdAt) }}</span>
              </span>
              <span v-if="project.questionnaireCount !== undefined" class="d-flex align-items-center gap-1.5 ms-auto">
                <i class="bi bi-clipboard-check" style="color: #137A7F;"></i>
                <span>{{ project.questionnaireCount }} kuesioner</span>
              </span>
            </div>

            <div class="d-flex gap-2 mt-auto">
              <button 
                class="btn text-white btn-sm flex-grow-1 py-2 fw-semibold rounded-3 shadow-sm d-flex align-items-center justify-content-center gap-1.5" 
                style="background-color: #0E3B43;"
                @click="router.push(`/projects/manage/${project.id}`)"
              >
                <i class="bi bi-kanban"></i>
                <span>Kelola Proyek</span>
              </button>
              <button 
                class="btn btn-outline-danger btn-sm px-2.5 rounded-3" 
                @click="deleteProject(project.id)" 
                :disabled="deleting === project.id"
                title="Hapus Proyek"
              >
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
import Swal from 'sweetalert2'

const { signOut } = useAuth()
const { data: session } = useAuth()
const router = useRouter()
const projects = ref<any[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const deleting = ref<string | null>(null)
const searchQuery = ref('')
const selectedStatus = ref('all')

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

const filteredProjects = computed(() => {
  let list = projects.value
  if (selectedStatus.value !== 'all') {
    list = list.filter(p => p.status === selectedStatus.value)
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(p => 
      (p.title && p.title.toLowerCase().includes(q)) || 
      (p.description && p.description.toLowerCase().includes(q))
    )
  }
  return list
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
    projects.value = response.projects || []
  } catch (err: any) {
    error.value = err.data?.statusMessage || 'Failed to load projects'
  } finally {
    loading.value = false
  }
}

async function deleteProject(projectId: string) {
  const result = await Swal.fire({
    title: 'Hapus Proyek?',
    text: 'Seluruh kuesioner dan data terkait di dalam proyek ini akan dihapus permanen!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#C84B4B',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Ya, Hapus Proyek',
    cancelButtonText: 'Batal'
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
      title: 'Proyek berhasil dihapus',
      showConfirmButton: false,
      timer: 3000
    })
  } catch (err: any) {
    Swal.fire('Error', err.data?.statusMessage || 'Gagal menghapus proyek', 'error')
  } finally {
    deleting.value = null
  }
}

function statusBadgeClass(status: string) {
  switch (status) {
    case 'draft': return 'badge-draft'
    case 'published': return 'badge-published'
    case 'closed': return 'badge-closed'
    default: return 'badge-draft'
  }
}

function statusLabel(status: string) {
  switch (status) {
    case 'draft': return 'Draft'
    case 'published': return '🟢 Aktif'
    case 'closed': return '🔵 Ditutup'
    default: return status
  }
}

function formatDate(dateString: string) {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('id-ID', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  })
}
</script>

<style scoped>
.hero-section-clean {
  padding: 0.25rem 0 0.5rem 0;
}

.stat-icon-folder {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background-color: #EBF5F3;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.project-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.project-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 25px rgba(14, 59, 67, 0.08) !important;
  border-color: rgba(19, 122, 127, 0.35) !important;
}

.badge-draft {
  background-color: #F3F4F6;
  color: #4B5563;
  border: 1px solid #E5E7EB;
}

.badge-published {
  background-color: #DEF7EC;
  color: #0E9F6E;
  border: 1px solid rgba(14, 159, 110, 0.25);
}

.badge-closed {
  background-color: #EBF5F3;
  color: #137A7F;
  border: 1px solid rgba(19, 122, 127, 0.25);
}
</style>
