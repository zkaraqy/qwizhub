<template>
  <LayoutPrivateLayout :user="userProfile" active-item="surveys" @logout="handleSignOut">
    <div class="row mb-4">
      <div class="col">
        <h1 class="h3 mb-3">Kuesioner Tersedia</h1>
        <p class="text-muted">Pilih kuesioner yang ingin Anda kerjakan dan dapatkan honor</p>
      </div>
    </div>

    <!-- Search and Filter -->
    <div class="row mb-4">
      <div class="col-md-6">
        <div class="input-group">
          <input
            v-model="searchQuery"
            type="text"
            class="form-control"
            placeholder="Cari kuesioner..."
            @input="debouncedSearch"
          />
          <button class="btn btn-outline-secondary" type="button" @click="loadQuestionnaires">
            <i class="bi bi-search"></i>
          </button>
        </div>
      </div>
      <div class="col-md-6 text-end">
        <NuxtLink to="/questionnaires/my-responses" class="btn btn-outline-primary">
          <i class="bi bi-clock-history me-2"></i>
          Riwayat Jawaban Saya
        </NuxtLink>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <!-- Questionnaires List -->
    <div v-else-if="questionnaires.length > 0" class="row g-4">
      <div v-for="questionnaire in questionnaires" :key="questionnaire.id" class="col-md-6 col-lg-4">
        <div class="card h-100 shadow-sm">
          <div class="card-body d-flex flex-column">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <h5 class="card-title mb-0">{{ questionnaire.topic }}</h5>
              <span 
                v-if="questionnaire.hasResponded" 
                class="badge bg-success"
              >
                <i class="bi bi-check-circle me-1"></i>Selesai
              </span>
              <span 
                v-else-if="!questionnaire.isAvailable" 
                class="badge bg-secondary"
              >
                Penuh
              </span>
              <span 
                v-else 
                class="badge bg-primary"
              >
                Tersedia
              </span>
            </div>

            <p class="text-muted small mb-3">{{ questionnaire.researchObjective }}</p>

            <div class="mb-3">
              <div class="d-flex justify-content-between text-sm mb-1">
                <span class="text-muted">Progress Responden:</span>
                <span class="fw-semibold">
                  {{ questionnaire.currentResponses }} / {{ questionnaire.targetRespondents }}
                </span>
              </div>
              <div class="progress" style="height: 6px;">
                <div
                  class="progress-bar"
                  :class="questionnaire.isAvailable ? 'bg-primary' : 'bg-success'"
                  :style="{ width: getProgressPercentage(questionnaire) + '%' }"
                ></div>
              </div>
              <small class="text-muted">
                {{ questionnaire.remainingSlots }} slot tersisa
              </small>
            </div>

            <div class="mb-3">
              <small class="text-muted d-block">
                <i class="bi bi-person me-1"></i>
                Peneliti: {{ questionnaire.project?.peneliti?.name }}
              </small>
              <small class="text-muted d-block">
                <i class="bi bi-folder me-1"></i>
                {{ questionnaire.project?.title }}
              </small>
              <small class="text-muted d-block">
                <i class="bi bi-calendar me-1"></i>
                {{ formatDate(questionnaire.createdAt) }}
              </small>
            </div>

            <div class="mt-auto">
              <NuxtLink
                :to="`/questionnaires/${questionnaire.id}/detail`"
                class="btn btn-primary w-100"
                :class="{ disabled: questionnaire.hasResponded }"
              >
                <template v-if="questionnaire.hasResponded">
                  <i class="bi bi-check-circle me-2"></i>Sudah Dikerjakan
                </template>
                <template v-else-if="!questionnaire.isAvailable">
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
    <div v-else class="text-center py-5">
      <i class="bi bi-inbox display-1 text-muted"></i>
      <p class="text-muted mt-3">Tidak ada kuesioner tersedia saat ini</p>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="row mt-4">
      <div class="col">
        <nav aria-label="Page navigation">
          <ul class="pagination justify-content-center">
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)">
                Previous
              </a>
            </li>
            <li
              v-for="page in totalPages"
              :key="page"
              class="page-item"
              :class="{ active: page === currentPage }"
            >
              <a class="page-link" href="#" @click.prevent="changePage(page)">
                {{ page }}
              </a>
            </li>
            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
              <a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)">
                Next
              </a>
            </li>
          </ul>
        </nav>
      </div>
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

onMounted(() => {
  loadQuestionnaires()
})
</script>

<style scoped>
.card {
  transition: transform 0.2s, box-shadow 0.2s;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
}

.progress {
  background-color: #e9ecef;
}

.text-sm {
  font-size: 0.875rem;
}
</style>
