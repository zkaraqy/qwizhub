<template>
  <div class="container mt-5">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>Proyek Penelitian Saya</h1>
      <NuxtLink to="/projects/create" class="btn btn-primary">
        + Buat Proyek Baru
      </NuxtLink>
    </div>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <div v-else-if="error" class="alert alert-danger">
      {{ error }}
    </div>

    <div v-else-if="projects.length === 0" class="alert alert-info">
      Anda belum memiliki proyek. Klik tombol "Buat Proyek Baru" untuk memulai.
    </div>

    <div v-else class="row">
      <div v-for="project in projects" :key="project.id" class="col-md-6 col-lg-4 mb-4">
        <div class="card h-100">
          <div class="card-body">
            <h5 class="card-title">{{ project.title }}</h5>
            <p class="card-text text-muted">
              {{ project.description || 'Tidak ada deskripsi' }}
            </p>
            <span :class="['badge', statusBadgeClass(project.status)]">
              {{ statusLabel(project.status) }}
            </span>
            <p class="card-text mt-2">
              <small class="text-muted">
                Dibuat: {{ formatDate(project.createdAt) }}
              </small>
            </p>
          </div>
          <div class="card-footer bg-white">
            <NuxtLink 
              :to="`/projects/${project.id}/questionnaire/generate`" 
              class="btn btn-sm btn-outline-primary me-2"
            >
              Kelola Kuesioner
            </NuxtLink>
            <button 
              @click="deleteProject(project.id)" 
              class="btn btn-sm btn-outline-danger"
              :disabled="deleting === project.id"
            >
              {{ deleting === project.id ? 'Menghapus...' : 'Hapus' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

const { data: session } = useAuth()
const projects = ref<any[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const deleting = ref<string | null>(null)

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
    error.value = err.data?.statusMessage || 'Gagal memuat proyek'
  } finally {
    loading.value = false
  }
}

async function deleteProject(projectId: string) {
  if (!confirm('Apakah Anda yakin ingin menghapus proyek ini?')) {
    return
  }

  deleting.value = projectId
  
  try {
    await $fetch(`/api/projects/${projectId}`, {
      method: 'DELETE'
    })
    await fetchProjects()
  } catch (err: any) {
    alert(err.data?.statusMessage || 'Gagal menghapus proyek')
  } finally {
    deleting.value = null
  }
}

function statusBadgeClass(status: string) {
  switch (status) {
    case 'draft': return 'bg-secondary'
    case 'published': return 'bg-success'
    case 'closed': return 'bg-danger'
    default: return 'bg-secondary'
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
  return new Date(dateString).toLocaleDateString('id-ID')
}
</script>
