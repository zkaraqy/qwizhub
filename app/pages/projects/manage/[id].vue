<template>
  <LayoutPrivateLayout :user="userProfile" active-item="projects">
    <!-- Hero Header -->
    <div class="hero-section fade-in mb-5">
      <div class="position-relative" style="z-index: 1;">
        <div class="d-flex align-items-center mb-3">
          <button class="btn btn-light me-3" @click="router.push('/projects')">
            <i class="bi bi-arrow-left"></i>
          </button>
          <div>
            <h1 class="display-6 fw-bold mb-1">{{ project?.title || 'Loading...' }}</h1>
            <p class="lead mb-0 opacity-90">Manage questionnaires for this research project</p>
          </div>
        </div>
        <button class="btn btn-light btn-lg px-4 fw-semibold shadow-sm" @click="createQuestionnaire">
          <i class="bi bi-plus-lg me-2"></i>Create Questionnaire
        </button>
      </div>
    </div>

    <div v-if="loading" class="text-center py-5">
      <div class="skeleton" style="height: 400px; border-radius: 20px;"></div>
    </div>

    <div v-else-if="questionnaires.length === 0" class="text-center py-5 fade-in">
      <div class="glass-card p-5">
        <i class="bi bi-file-earmark-text display-1 text-muted opacity-25 mb-4 d-block"></i>
        <h4 class="fw-bold mb-3">No Questionnaires Yet</h4>
        <p class="text-muted mb-4">Create your first questionnaire to start collecting responses</p>
        <button class="btn btn-gradient btn-lg" @click="createQuestionnaire">
          <i class="bi bi-plus-circle me-2"></i>Create Questionnaire
        </button>
      </div>
    </div>

    <div v-else class="glass-card fade-in">
      <div class="table-responsive">
        <table class="table table-glass mb-0">
          <thead>
            <tr>
              <th class="ps-4 py-4 fw-bold">Topic</th>
              <th class="py-4 fw-bold">Research Objective</th>
              <th class="py-4 fw-bold">Status</th>
              <th class="py-4 fw-bold">Created</th>
              <th class="pe-4 py-4 text-end fw-bold">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="q in questionnaires" :key="q.id">
              <td class="ps-4 py-4">
                <div class="d-flex align-items-center">
                  <div class="stat-icon primary me-3" style="width: 36px; height: 36px; font-size: 1rem;">
                    <i class="bi bi-file-earmark-text"></i>
                  </div>
                  <span class="fw-semibold">{{ q.topic }}</span>
                </div>
              </td>
              <td class="py-4">
                <div class="text-truncate" style="max-width: 300px;" :title="q.researchObjective">
                  {{ q.researchObjective }}
                </div>
              </td>
              <td class="py-4">
                <span :class="statusBadgeClass(q.status)">
                  {{ statusLabel(q.status) }}
                </span>
              </td>
              <td class="py-4 text-muted">
                {{ formatDate(q.createdAt) }}
              </td>
              <td class="pe-4 py-4 text-end">
                <div class="d-flex gap-2 justify-content-end">
                  <button class="btn btn-sm btn-primary" @click="editQuestionnaire(q.id)" title="Edit">
                    <i class="bi bi-pencil me-1"></i>Edit
                  </button>
                  <button class="btn btn-sm btn-outline-danger" @click="deleteQuestionnaire(q.id)" title="Delete">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </LayoutPrivateLayout>
</template>

<script lang="ts" setup>
import Swal from 'sweetalert2'

definePageMeta({
  auth: {
    unauthenticatedOnly: false
  }
})

const { data } = useAuth()
const route = useRoute()
const router = useRouter()
const projectId = route.params.id as string

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

const loading = ref(true)
const project = ref<any>(null)
const questionnaires = ref<any[]>([])

const fetchProjectData = async () => {
  loading.value = true
  try {
    const response = await $fetch(`/api/projects/${projectId}`)
    project.value = response.project
    questionnaires.value = response.project.questionnaires || []
  } catch (error: any) {
    Swal.fire('Error', error.data?.statusMessage || 'Failed to load project', 'error')
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await fetchProjectData();
  console.log(questionnaires.value)
})

const createQuestionnaire = () => {
  router.push(`/projects/${projectId}/questionnaire/create`)
}

const editQuestionnaire = (questionnaireId: string) => {
  router.push(`/projects/${projectId}/questionnaire/${questionnaireId}/edit`)
}

const deleteQuestionnaire = async (questionnaireId: string) => {
  const result = await Swal.fire({
    title: 'Delete Questionnaire?',
    text: "This will permanently delete the questionnaire and all its questions!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc3545',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'Cancel'
  })

  if (!result.isConfirmed) return

  try {
    await $fetch(`/api/projects/${projectId}/questionnaires/${questionnaireId}`, {
      method: 'DELETE'
    })
    await fetchProjectData()
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Questionnaire deleted successfully',
      showConfirmButton: false,
      timer: 3000
    })
  } catch (error: any) {
    Swal.fire('Error', error.data?.statusMessage || 'Failed to delete questionnaire', 'error')
  }
}

function statusBadgeClass(status: string) {
  return status === 'published' ? 'badge badge-success-gradient' : 'badge bg-secondary'
}

function statusLabel(status: string) {
  return status === 'published' ? 'Published' : 'Draft'
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
.rounded-4 {
  border-radius: 1rem !important;
}
.shadow-sm {
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.035) !important;
}
</style>
