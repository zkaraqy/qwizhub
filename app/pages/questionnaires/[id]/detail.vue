<template>
  <LayoutPrivateLayout :user="userProfile" active-item="surveys" @logout="handleSignOut">
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <div v-else-if="questionnaire" class="container-fluid">
      <div class="row mb-3">
        <div class="col">
          <button class="btn btn-outline-secondary" @click="router.back()">
            <i class="bi bi-arrow-left me-2"></i>Kembali
          </button>
        </div>
      </div>

      <div class="row mb-4">
        <div class="col">
          <div class="card shadow-sm">
            <div class="card-body">
              <div class="row align-items-center">
                <div class="col-md-8">
                  <h2 class="h3 mb-3">{{ questionnaire.topic }}</h2>
                  <p class="text-muted mb-2">
                    <i class="bi bi-person-circle me-2"></i>
                    <strong>Peneliti:</strong> {{ questionnaire.project?.peneliti?.name || '-' }}
                  </p>
                  <p class="text-muted mb-0">
                    <i class="bi bi-folder me-2"></i>
                    <strong>Project:</strong> {{ questionnaire.project?.title || '-' }}
                  </p>
                </div>
                <div class="col-md-4 text-md-end">
                  <div class="mb-2">
                    <span class="badge bg-success fs-5 px-3 py-2">
                      <i class="bi bi-cash-coin me-2"></i>Rp {{ formatCurrency(questionnaire.honorarium) }}
                    </span>
                  </div>
                  <span v-if="questionnaire.responseStatus === 'completed'" class="badge bg-info fs-6">
                    <i class="bi bi-check-circle me-1"></i>Sudah Dikerjakan
                  </span>
                  <span v-else-if="questionnaire.responseStatus === 'in_progress'" class="badge bg-warning fs-6">
                    <i class="bi bi-hourglass-half me-1"></i>Dalam Proses
                  </span>
                  <span v-else-if="!questionnaire.isAvailable" class="badge bg-secondary fs-6">
                    <i class="bi bi-lock me-1"></i>Slot Penuh
                  </span>
                  <span v-else class="badge bg-primary fs-6">
                    <i class="bi bi-check-circle me-1"></i>Tersedia
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="row mb-4">
        <div class="col-md-3 col-6 mb-3">
          <div class="card text-center">
            <div class="card-body">
              <i class="bi bi-file-earmark-text text-primary fs-1"></i>
              <h5 class="mt-2 mb-0">{{ questionnaire.questionCount }}</h5>
              <small class="text-muted">Pertanyaan</small>
            </div>
          </div>
        </div>
        <div class="col-md-3 col-6 mb-3">
          <div class="card text-center">
            <div class="card-body">
              <i class="bi bi-clock text-warning fs-1"></i>
              <h5 class="mt-2 mb-0">~{{ questionnaire.estimatedTime }}</h5>
              <small class="text-muted">Menit</small>
            </div>
          </div>
        </div>
        <div class="col-md-3 col-6 mb-3">
          <div class="card text-center">
            <div class="card-body">
              <i class="bi bi-people text-info fs-1"></i>
              <h5 class="mt-2 mb-0">{{ questionnaire.currentResponses }}/{{ questionnaire.targetRespondents }}</h5>
              <small class="text-muted">Responden</small>
            </div>
          </div>
        </div>
        <div class="col-md-3 col-6 mb-3">
          <div class="card text-center">
            <div class="card-body">
              <i class="bi bi-hourglass-split text-success fs-1"></i>
              <h5 class="mt-2 mb-0">{{ questionnaire.remainingSlots }}</h5>
              <small class="text-muted">Slot Tersisa</small>
            </div>
          </div>
        </div>
      </div>



      <div class="row mb-4">
        <div class="col">
          <div class="card shadow-sm">
            <div class="card-header bg-primary text-white">
              <h5 class="mb-0 text-white "><i class="bi bi-bullseye me-2"></i>Tujuan Penelitian</h5>
            </div>
            <div class="card-body">
              <p class="mb-0">{{ questionnaire.researchObjective }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="row mb-4">
        <div class="col text-center">
          <div class="d-flex gap-3 justify-content-center flex-wrap">
            <button v-if="questionnaire.responseStatus === 'completed'" class="btn btn-secondary btn-lg px-5" disabled>
              <i class="bi bi-check-circle me-2"></i>Sudah Dikerjakan
            </button>
            <button v-else-if="questionnaire.responseStatus === 'in_progress'" class="btn btn-warning btn-lg px-5" @click="startQuestionnaire">
              <i class="bi bi-arrow-repeat me-2"></i>Lanjutkan Mengerjakan
            </button>
            <button v-else-if="!questionnaire.isAvailable" class="btn btn-secondary btn-lg px-5" disabled>
              <i class="bi bi-lock me-2"></i>Slot Penuh
            </button>
            <button v-else class="btn btn-success btn-lg px-5" @click="startQuestionnaire">
              <i class="bi bi-play-circle me-2"></i>Mulai Mengerjakan
            </button>
            <button class="btn btn-outline-secondary btn-lg px-5" @click="router.back()">
              <i class="bi bi-arrow-left me-2"></i>Kembali
            </button>
          </div>
        </div>
      </div>

      <div class="row">
        <div class="col">
          <div class="alert alert-info">
            <i class="bi bi-info-circle me-2"></i>
            <strong>Informasi Penting:</strong>
            <ul class="mb-0 mt-2">
              <li>Pastikan koneksi internet Anda stabil</li>
              <li>Jawaban akan otomatis tersimpan setiap 30 detik</li>
              <li v-if="questionnaire.responseStatus === 'in_progress'">Anda dapat melanjutkan kuesioner yang belum selesai</li>
              <li>Honor akan diterima setelah menyelesaikan seluruh kuesioner</li>
              <li>Anda hanya dapat mengerjakan kuesioner ini satu kali</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-5">
      <i class="bi bi-exclamation-circle text-danger display-1"></i>
      <h3 class="mt-3">Kuesioner tidak ditemukan</h3>
      <p class="text-muted">Kuesioner yang Anda cari tidak tersedia atau sudah dihapus.</p>
      <button class="btn btn-primary" @click="router.push('/questionnaires')">
        Kembali ke Daftar Kuesioner
      </button>
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
const route = useRoute()

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

const questionnaireId = route.params.id as string
const questionnaire = ref<any>(null)
const loading = ref(true)

const loadQuestionnaireDetail = async () => {
  loading.value = true
  try {
    const { data: detailData, error: detailError } = await useFetch(`/api/questionnaires/${questionnaireId}/detail`)
    
    if (!detailError.value && detailData.value?.success) {
      questionnaire.value = detailData.value.data
    } else {
      console.error('Failed to load questionnaire:', detailError.value)
    }
  } catch (error) {
    console.error('Error loading questionnaire:', error)
  } finally {
    loading.value = false
  }
}

const startQuestionnaire = async () => {
  try {
    const { data: startData, error: startError } = await useFetch(`/api/questionnaires/${questionnaireId}/start`, {
      method: 'POST'
    })
    
    if (!startError.value && startData.value?.success) {
      router.push(`/questionnaires/${questionnaireId}/work?responseId=${startData.value.responseId}`)
    } else {
      alert(startError.value?.data?.statusMessage || 'Gagal memulai kuesioner')
    }
  } catch (error: any) {
    console.error('Error starting questionnaire:', error)
    alert('Terjadi kesalahan saat memulai kuesioner')
  }
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID').format(amount || 0)
}

onMounted(() => {
  loadQuestionnaireDetail()
})
</script>

<style scoped>
.card {
  transition: transform 0.2s;
}

.card:hover {
  transform: translateY(-2px);
}
</style>
