<template>
  <LayoutPrivateLayout :user="userProfile" active-item="surveys" @logout="handleSignOut">
    <!-- Hero Section - Flat SaaS Header -->
    <div class="hero-section-clean fade-in mb-4">
      <div class="d-flex justify-content-between align-items-start align-items-md-center flex-wrap gap-3">
        <div>
          <div class="d-flex align-items-center gap-2 mb-1">
            <span class="text-uppercase fw-bold small" style="color: var(--qh-accent); letter-spacing: 0.08em; font-size: 0.72rem;">
              KUESIONER
            </span>
          </div>
          <h2 class="fw-bold mb-1" style="color: var(--qh-primary); letter-spacing: -0.02em;">
            Kuesioner Tersedia
          </h2>
          <p class="text-secondary small mb-0">
            Pilih kuesioner yang ingin Anda kerjakan dan dapatkan honor penelitian.
          </p>
        </div>
        <NuxtLink to="/questionnaires/my-responses" class="btn btn-outline-secondary px-3 py-2 fw-semibold rounded-3 d-inline-flex align-items-center gap-2">
          <i class="bi bi-clock-history"></i>
          <span>Riwayat Jawaban Saya</span>
        </NuxtLink>
      </div>
    </div>

    <!-- Search Filter Toolbar -->
    <div class="filter-toolbar card border rounded-4 shadow-sm p-3 mb-4 fade-in stagger-1" style="border-color: var(--qh-border);">
      <div class="row g-2 align-items-center">
        <div class="col-lg-8 col-md-6">
          <label class="filter-label text-muted small fw-semibold mb-1 d-block">
            <i class="bi bi-search me-1" style="color: var(--qh-accent);"></i>Cari Kuesioner
          </label>
          <div class="input-group">
            <input
              v-model="searchQuery"
              type="text"
              class="form-control border-end-0"
              style="border-top-left-radius: 0.5rem; border-bottom-left-radius: 0.5rem;"
              :style="!searchQuery ? 'border-top-right-radius: 0.5rem; border-bottom-right-radius: 0.5rem; border-right: 1px solid #dee2e6 !important;' : ''"
              placeholder="Ketik topik kuesioner..."
              @input="debouncedSearch"
            />
            <button v-if="searchQuery" class="btn btn-outline-secondary border-start-0" style="border-top-right-radius: 0.5rem; border-bottom-right-radius: 0.5rem; border-color: #dee2e6;" type="button" @click="searchQuery = ''; loadQuestionnaires()">
              <i class="bi bi-x"></i>
            </button>
          </div>
        </div>
        <div class="col-lg-4 col-md-6 d-flex align-items-end">
          <div class="w-100">
            <label class="filter-label text-muted small fw-semibold mb-1 d-block d-none d-lg-block">&nbsp;</label>
            <button class="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center gap-1 rounded-3" @click="loadQuestionnaires">
              <i class="bi bi-arrow-clockwise"></i>
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary spinner-border-sm me-2"></div>
      Memuat kuesioner...
    </div>

    <!-- Questionnaires Grid -->
    <div v-else-if="questionnaires.length > 0" class="row g-3 fade-in stagger-2">
      <div v-for="questionnaire in questionnaires" :key="questionnaire.id" class="col-md-6 col-lg-4">
        <div class="questionnaire-card card border rounded-4 shadow-sm bg-white overflow-hidden h-100" style="border-color: var(--qh-border);">
          <div class="card-body d-flex flex-column p-3.5">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <h5 class="card-title fw-bold text-dark mb-0 me-2">{{ questionnaire.topic }}</h5>
              <span v-if="!questionnaire.isAvailable" class="badge bg-secondary-subtle text-secondary border border-secondary-subtle px-2 py-1 flex-shrink-0">
                Penuh
              </span>
              <span v-else class="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1 flex-shrink-0">
                Tersedia
              </span>
            </div>

            <div class="mb-3">
              <div class="d-flex justify-content-between text-sm mb-1">
                <span class="text-muted small">Progress Responden:</span>
                <span class="fw-semibold small">
                  {{ questionnaire.currentResponses }} / {{ questionnaire.targetRespondents }}
                </span>
              </div>
              <div class="progress rounded-pill" style="height: 6px;">
                <div class="progress-bar"
                  style="background-color: var(--qh-accent);"
                  :style="{ width: getProgressPercentage(questionnaire) + '%' }"></div>
              </div>
              <small class="text-muted">
                {{ questionnaire.remainingSlots }} slot tersisa
              </small>
            </div>

            <div class="mb-3">
              <small class="text-muted d-block">
                <i class="bi bi-person me-1" style="color: var(--qh-accent);"></i>
                Peneliti: {{ questionnaire.project?.peneliti?.name }}
              </small>
              <small class="text-muted d-block">
                <i class="bi bi-calendar me-1" style="color: var(--qh-accent);"></i>
                {{ formatDate(questionnaire.createdAt) }}
              </small>
            </div>

            <div class="mt-auto">
              <NuxtLink :to="`/questionnaires/${questionnaire.id}/detail`" class="btn btn-primary w-100 rounded-3"
                :class="{ disabled: !questionnaire.isAvailable }">
                <template v-if="!questionnaire.isAvailable">
                  <i class="bi bi-lock me-2"></i>Tidak Tersedia
                </template>
                <template v-else>
                  <i class="bi bi-clipboard-check me-2"></i>Lihat Detail
                </template>
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-5 fade-in">
      <i class="bi bi-inbox fs-1 text-muted opacity-50 mb-2"></i>
      <h6 class="fw-bold text-dark">Tidak ada kuesioner tersedia</h6>
      <p class="text-muted small mb-3">Tidak ada kuesioner yang tersedia saat ini. Coba lagi nanti.</p>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="d-flex justify-content-center mt-4 fade-in">
      <nav aria-label="Page navigation">
        <ul class="pagination mb-0">
          <li class="page-item" :class="{ disabled: currentPage === 1 }">
            <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)">
              <i class="bi bi-chevron-left"></i>
            </a>
          </li>
          <li v-for="page in totalPages" :key="page" class="page-item" :class="{ active: page === currentPage }">
            <a class="page-link" href="#" @click.prevent="changePage(page)">
              {{ page }}
            </a>
          </li>
          <li class="page-item" :class="{ disabled: currentPage === totalPages }">
            <a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)">
              <i class="bi bi-chevron-right"></i>
            </a>
          </li>
        </ul>
      </nav>
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

interface Questionnaire {
  id: string
  topic: string
  researchObjective: string
  targetRespondents: number
  currentResponses: number
  remainingSlots: number
  isAvailable: boolean
  hasResponded: boolean
  createdAt: string
  project?: {
    id: string
    title: string
    peneliti?: {
      name: string
    }
  }
}

const questionnaires = ref<Questionnaire[]>([])
const loading = ref(false)
const searchQuery = ref('')
const currentPage = ref(1)
const totalPages = ref(1)
const limit = 12

const loadQuestionnaires = async () => {
  loading.value = true
  try {
    const response = await $fetch('/api/questionnaires/published', {
      query: {
        search: searchQuery.value,
        page: currentPage.value,
        limit
      }
    })

    questionnaires.value = response.data
    totalPages.value = response.pagination.totalPages
  } catch (error: any) {
    console.error('Failed to load questionnaires:', error)
  } finally {
    loading.value = false
  }
}

const changePage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    loadQuestionnaires()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

// Debounced search
let searchTimeout: NodeJS.Timeout
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    loadQuestionnaires()
  }, 500)
}

const getProgressPercentage = (questionnaire: Questionnaire) => {
  if (questionnaire.targetRespondents === 0) return 0
  return Math.min(100, (questionnaire.currentResponses / questionnaire.targetRespondents) * 100)
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

onMounted(async () => {
  await loadQuestionnaires()
})
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

.questionnaire-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.questionnaire-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(24, 49, 83, 0.08) !important;
  border-color: rgba(42, 127, 121, 0.3) !important;
}

.progress {
  background-color: rgba(42, 127, 121, 0.08);
}

.text-sm {
  font-size: 0.875rem;
}

/* Pagination Navy + Teal */
.pagination .page-link {
  color: var(--qh-text-secondary, #66727C);
  border-color: var(--qh-border, #E4E9E7);
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.85rem;
  margin: 0 2px;
  transition: all 0.18s ease;
}

.pagination .page-item.active .page-link {
  background-color: var(--qh-primary, #183153);
  border-color: var(--qh-primary, #183153);
  color: #fff;
  box-shadow: 0 2px 8px rgba(24, 49, 83, 0.2);
}

.pagination .page-link:hover {
  background-color: var(--qh-accent-light, #EAF5F3);
  color: var(--qh-accent, #2A7F79);
  border-color: var(--qh-accent-light, #EAF5F3);
}

.pagination .page-item.disabled .page-link {
  color: #c4ccd4;
  background-color: transparent;
}

.fade-in {
  animation: fadeIn 0.6s ease-out;
}

.stagger-1 { animation-delay: 0.1s; }
.stagger-2 { animation-delay: 0.2s; }

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
</style>
