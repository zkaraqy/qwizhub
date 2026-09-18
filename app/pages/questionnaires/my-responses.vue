<template>
  <LayoutPrivateLayout :user="userProfile" active-item="surveys" @logout="handleSignOut">
    <!-- Hero Section - Flat SaaS Header -->
    <div class="hero-section-clean fade-in mb-4">
      <div class="d-flex justify-content-between align-items-start align-items-md-center flex-wrap gap-3">
        <div>
          <div class="d-flex align-items-center gap-2 mb-1">
            <span class="text-uppercase fw-bold small" style="color: var(--qh-accent); letter-spacing: 0.08em; font-size: 0.72rem;">
              RIWAYAT JAWABAN
            </span>
          </div>
          <h2 class="fw-bold mb-1" style="color: var(--qh-primary); letter-spacing: -0.02em;">
            Riwayat Jawaban Saya
          </h2>
          <p class="text-secondary small mb-0">
            Pantau seluruh kuesioner yang telah Anda kerjakan beserta status dan honor yang diterima.
          </p>
        </div>
        <NuxtLink to="/questionnaires" class="btn btn-primary px-3.5 py-2 fw-semibold rounded-3 shadow-sm d-inline-flex align-items-center gap-2">
          <i class="bi bi-clipboard-check"></i>
          <span>Cari Kuesioner Baru</span>
        </NuxtLink>
      </div>
    </div>

    <!-- Stat Cards -->
    <div class="row g-3 mb-4">
      <div class="col-lg-4 col-md-6 col-sm-6 fade-in stagger-1">
        <div class="stat-card p-3">
          <div class="stat-icon primary mb-2">
            <i class="bi bi-chat-left-text-fill"></i>
          </div>
          <div class="stat-sublabel text-muted text-uppercase">Total Respon</div>
          <h3 class="fw-bold mb-0 text-dark">{{ summary.totalResponses }}</h3>
          <div class="stat-footnote text-muted mt-1">
            <small>Dari seluruh kuesioner</small>
          </div>
        </div>
      </div>
      <div class="col-lg-4 col-md-6 col-sm-6 fade-in stagger-2">
        <div class="stat-card p-3">
          <div class="stat-icon success mb-2">
            <i class="bi bi-check2-all"></i>
          </div>
          <div class="stat-sublabel text-muted text-uppercase">Selesai</div>
          <h3 class="fw-bold mb-0" style="color: var(--qh-success);">{{ summary.completedResponses }}</h3>
          <div class="stat-footnote mt-1" style="color: var(--qh-success);">
            <small><i class="bi bi-circle-fill" style="font-size: 0.5rem;"></i>&nbsp;&nbsp;Jawaban lengkap</small>
          </div>
        </div>
      </div>
      <div class="col-lg-4 col-md-6 col-sm-6 fade-in stagger-3">
        <div class="stat-card p-3">
          <div class="stat-icon teal mb-2">
            <i class="bi bi-cash-stack"></i>
          </div>
          <div class="stat-sublabel text-muted text-uppercase">Total Honor</div>
          <h3 class="fw-bold mb-0 text-teal">Rp {{ formatCurrency(summary.totalHonorEarned) }}</h3>
          <div class="stat-footnote text-muted mt-1">
            <small>Akumulasi honor diterima</small>
          </div>
        </div>
      </div>
    </div>

    <!-- Filter Toolbar -->
    <div class="filter-toolbar card border rounded-4 shadow-sm p-3 mb-4 fade-in stagger-1" style="border-color: var(--qh-border);">
      <div class="row g-2 align-items-center">
        <div class="col-md-4">
          <label class="filter-label text-muted small fw-semibold mb-1 d-block">
            <i class="bi bi-funnel me-1" style="color: var(--qh-accent);"></i>Filter Status
          </label>
          <select v-model="statusFilter" @change="loadResponses" class="form-select rounded-3">
            <option value="">Semua Status</option>
            <option value="completed">✅ Selesai</option>
            <option value="in_progress">🟡 Dalam Proses</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary spinner-border-sm me-2"></div>
      Memuat riwayat jawaban...
    </div>

    <!-- Response Cards -->
    <div v-else-if="responses.length > 0" class="row g-3 fade-in stagger-2">
      <div v-for="response in responses" :key="response.id" class="col-12">
        <div class="card border rounded-4 shadow-sm bg-white overflow-hidden" style="border-color: var(--qh-border);">
          <div class="card-body p-3.5 p-md-4">
            <div class="row align-items-center">
              <div class="col-md-6">
                <h5 class="fw-bold text-dark mb-1">{{ response.questionnaire?.topic }}</h5>
                <p class="text-muted small mb-2">{{ response.questionnaire?.project?.title }}</p>
                <div class="d-flex gap-2 flex-wrap">
                  <span v-if="response.status === 'completed'" class="badge bg-success-subtle text-success border border-success-subtle px-2 py-1">
                    <i class="bi bi-check-circle-fill me-1"></i>Selesai
                  </span>
                  <span v-else class="badge bg-warning-subtle text-warning border border-warning-subtle px-2 py-1">
                    <i class="bi bi-clock-fill me-1"></i>Dalam Proses
                  </span>
                  <span v-if="response.honorPaid" class="badge rounded-pill px-2.5 py-1 fw-medium" style="background-color: var(--qh-accent-light); color: var(--qh-accent);">
                    <i class="bi bi-cash me-1"></i>Honor Dibayar
                  </span>
                </div>
              </div>
              <div class="col-md-3">
                <small class="text-muted d-block">Pertanyaan Dijawab</small>
                <div class="fw-semibold text-dark">{{ response.answeredQuestions }} pertanyaan</div>
                <small class="text-muted d-block mt-2">Honor</small>
                <div class="fw-semibold" style="color: var(--qh-accent);">Rp {{ formatCurrency(response.honorAmount) }}</div>
              </div>
              <div class="col-md-3 text-end">
                <small class="text-muted d-block">
                  {{ response.status === 'completed' ? 'Selesai pada' : 'Dimulai pada' }}
                </small>
                <div class="small text-dark">
                  {{ formatDate(response.status === 'completed' ? response.completedAt : response.startedAt) }}
                </div>
                <div v-if="response.status === 'completed' && response.timeSpent" class="small text-muted mt-1">
                  Waktu: {{ formatTime(response.timeSpent) }}
                </div>
                <button v-if="response.status === 'in_progress'" @click="continueResponse(response.questionnaire?.id)"
                  class="btn btn-sm btn-primary mt-2 rounded-pill px-3">
                  <i class="bi bi-play-circle me-1"></i>Lanjutkan
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-5 fade-in">
      <i class="bi bi-inbox fs-1 text-muted opacity-50 mb-2"></i>
      <h6 class="fw-bold text-dark">Belum ada riwayat jawaban</h6>
      <p class="text-muted small mb-3">Anda belum mengerjakan kuesioner apapun. Mulai cari kuesioner yang sesuai.</p>
      <NuxtLink to="/questionnaires" class="btn btn-primary rounded-pill px-4">
        <i class="bi bi-clipboard-check me-1"></i>Mulai Mengerjakan
      </NuxtLink>
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

<style scoped>
.hero-section-clean {
  padding: 0.25rem 0 0.5rem 0;
}

.filter-toolbar {
  position: relative;
  border-radius: 16px;
  background: var(--qh-surface, #ffffff);
  border: 1px solid var(--qh-border, rgba(0, 0, 0, 0.07));
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.03);
}

.filter-label {
  font-size: 0.72rem;
  letter-spacing: 0.02em;
}

.stat-card {
  background: var(--qh-surface, #ffffff);
  border-radius: 16px;
  border: 1px solid var(--qh-border, #E4E9E7);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  height: 100%;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(24, 49, 83, 0.06);
  border-color: rgba(42, 127, 121, 0.3);
}

.stat-sublabel {
  font-size: 0.72rem;
  letter-spacing: 0.06em;
  font-weight: 700;
  color: var(--qh-text-secondary, #66727C);
}

.stat-footnote {
  font-size: 0.75rem;
}

.stat-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.stat-icon.primary { background: rgba(24, 49, 83, 0.1); color: var(--qh-primary, #183153); }
.stat-icon.success { background: rgba(33, 138, 97, 0.12); color: var(--qh-success, #218A61); }
.stat-icon.teal { background: var(--qh-accent-light, #EAF5F3); color: var(--qh-accent, #2A7F79); }

.text-teal { color: var(--qh-accent, #2A7F79) !important; }

.fade-in {
  animation: fadeIn 0.6s ease-out;
}

.stagger-1 { animation-delay: 0.1s; }
.stagger-2 { animation-delay: 0.2s; }
.stagger-3 { animation-delay: 0.3s; }

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 575.98px) {
  .stat-card {
    text-align: center;
  }
  .stat-icon {
    width: 52px;
    height: 52px;
    font-size: 1.6rem;
    margin-left: auto;
    margin-right: auto;
  }
}
</style>
