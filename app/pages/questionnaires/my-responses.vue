<template>
  <LayoutPrivateLayout :user="userProfile" active-item="surveys" @logout="handleSignOut">
    <div class="row mb-4">
      <div class="col">
        <h1 class="h3 mb-3" style="font-weight: bold;">Riwayat Jawaban Saya</h1>
      </div>
    </div>
    <div class="row mb-4">
      <div class="col-md-4">
        <div class="card bg-primary text-white">
          <div class="card-body">
            <h6 class="card-subtitle mb-2">Total Respon</h6>
            <h2 class="card-title mb-0">{{ summary.totalResponses }}</h2>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card bg-success text-white">
          <div class="card-body">
            <h6 class="card-subtitle mb-2">Selesai</h6>
            <h2 class="card-title mb-0">{{ summary.completedResponses }}</h2>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card bg-warning text-white">
          <div class="card-body">
            <h6 class="card-subtitle mb-2">Total Honor</h6>
            <h2 class="card-title mb-0">Rp {{ formatCurrency(summary.totalHonorEarned) }}</h2>
          </div>
        </div>
      </div>
    </div>
    <div class="row mb-4">
      <div class="col-md-6">
        <select v-model="statusFilter" @change="loadResponses" class="form-select">
          <option value="">Semua Status</option>
          <option value="completed">Selesai</option>
          <option value="in_progress">Dalam Proses</option>
        </select>
      </div>
      <div class="col-md-6 text-end">
        <NuxtLink to="/questionnaires" class="btn btn-primary">
          <i class="bi bi-clipboard-check me-2"></i>Cari Kuesioner Baru
        </NuxtLink>
      </div>
    </div>
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
    </div>
    <div v-else-if="responses.length > 0" class="row g-3">
      <div v-for="response in responses" :key="response.id" class="col-12">
        <div class="card shadow-sm">
          <div class="card-body">
            <div class="row align-items-center">
              <div class="col-md-6">
                <h5 class="mb-1">{{ response.questionnaire?.topic }}</h5>
                <p class="text-muted small mb-2">{{ response.questionnaire?.project?.title }}</p>
                <div class="d-flex gap-2 flex-wrap">
                  <span class="badge" :class="response.status === 'completed' ? 'bg-success' : 'bg-warning'">
                    {{ response.status === 'completed' ? 'Selesai' : 'Dalam Proses' }}
                  </span>
                  <span v-if="response.honorPaid" class="badge bg-info">
                    <i class="bi bi-cash me-1"></i>Honor Dibayar
                  </span>
                </div>
              </div>
              <div class="col-md-3">
                <small class="text-muted d-block">Pertanyaan Dijawab</small>
                <div class="fw-semibold">{{ response.answeredQuestions }} pertanyaan</div>
                <small class="text-muted d-block mt-2">Honor</small>
                <div class="fw-semibold text-success">Rp {{ formatCurrency(response.honorAmount) }}</div>
              </div>
              <div class="col-md-3 text-end">
                <small class="text-muted d-block">
                  {{ response.status === 'completed' ? 'Selesai pada' : 'Dimulai pada' }}
                </small>
                <div class="small">
                  {{ formatDate(response.status === 'completed' ? response.completedAt : response.startedAt) }}
                </div>
                <div v-if="response.status === 'completed' && response.timeSpent" class="small text-muted mt-1">
                  Waktu: {{ formatTime(response.timeSpent) }}
                </div>
                <button v-if="response.status === 'in_progress'" @click="continueResponse(response.questionnaire?.id)"
                  class="btn btn-sm btn-primary mt-2">
                  <i class="bi bi-play-circle me-1"></i>Lanjutkan
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="text-center py-5">
      <i class="bi bi-inbox display-1 text-muted"></i>
      <p class="text-muted mt-3">Anda belum mengerjakan kuesioner apapun</p>
      <NuxtLink to="/questionnaires" class="btn btn-primary">Mulai Mengerjakan Kuesioner</NuxtLink>
    </div>
  </LayoutPrivateLayout>
</template>

<script setup lang="ts">
definePageMeta({
  auth: {
    unauthenticatedOnly: false
  }
})

const { data, signOut } = useAuth()
const router = useRouter()
const responses = ref<any[]>([])
const summary = ref({ totalResponses: 0, completedResponses: 0, totalHonorEarned: 0 })

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

const handleSignOut = async () => {
  await signOut({ callbackUrl: '/login' })
}
const loading = ref(false)
const statusFilter = ref('')
const currentPage = ref(1)
const limit = 10

const loadResponses = async () => {
  loading.value = true
  try {
    const response = await $fetch('/api/responses/my-responses', {
      query: { status: statusFilter.value, page: currentPage.value, limit }
    })
    responses.value = response.data
    summary.value = response.summary
  } catch (error: any) {
    console.error('Failed to load responses:', error)
  } finally {
    loading.value = false
  }
}

const continueResponse = (questionnaireId: string) => {
  router.push(`/questionnaires/${questionnaireId}/work`)
}

const formatCurrency = (value: number) => new Intl.NumberFormat('id-ID').format(value)

const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('id-ID', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  })
}

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${minutes}m ${secs}s`
}

onMounted(() => loadResponses())
</script>
