<template>
  <LayoutPrivateLayout :user="userProfile" active-item="projects">
    <!-- Hero Header - Compact & Transparent -->
    <div class="hero-section-transparent fade-in mb-3">
      <!-- Back Button on Top -->
      <div class="mb-2">
        <button class="btn btn-light border btn-sm px-2 py-1 back-btn" @click="router.push('/projects')" title="Kembali ke Proyek">
          <i class="bi bi-arrow-left fs-6"></i>
        </button>
      </div>

      <div class="d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div class="flex-grow-1" style="min-width: 0;">
          <h3 class="fw-bold mb-1 text-dark text-break">{{ project?.title || 'Loading...' }}</h3>
          <p class="mb-0 text-muted small">Manage questionnaires for this research project</p>
        </div>
        <button class="btn bg-primary text-white btn-sm px-3 fw-semibold hero-action-btn flex-shrink-0" @click="createQuestionnaire">
          <i class="bi bi-plus-lg me-1"></i>Create Questionnaire
        </button>
      </div>
    </div>

    <div v-if="loading" class="text-center py-5">
      <div class="skeleton" style="height: 400px; border-radius: 20px;"></div>
    </div>

    <div v-else-if="questionnaires.length === 0" class="text-center py-2 fade-in">
      <div class="glass-card p-5">
        <i class="bi bi-file-earmark-text display-1 text-muted opacity-25 mb-4 d-block"></i>
        <h4 class="fw-bold mb-3">No Questionnaires Yet</h4>
        <p class="text-muted mb-4">Create your first questionnaire to start collecting responses</p>
        <button class="btn bg-primary text-white btn-lg px-4" @click="createQuestionnaire">
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
              <td class="ps-4 py-4 align-middle">
                <div class="d-flex align-items-center">
                  <div class="d-flex align-items-center justify-content-center me-3 flex-shrink-0" style="width: 42px; height: 42px; font-size: 1.25rem; border-radius: 12px; background-color: #EBF5F3; color: #0E3B43;">
                    <i class="bi bi-file-earmark-text"></i>
                  </div>
                  <span v-if="q.topic" class="fw-semibold">{{ q.topic }}</span>
                  <span v-else class="text-muted fst-italic small">-</span>
                </div>
              </td>
              <td class="py-4 align-middle">
                <div v-if="q.researchObjective" class="text-truncate" style="max-width: 300px;" :title="q.researchObjective">
                  {{ q.researchObjective }}
                </div>
                <div v-else class="text-muted fst-italic small">
                  -
                </div>
              </td>
              <td class="py-4 align-middle">
                <span :class="statusBadgeClass(q.status)">
                  {{ statusLabel(q.status) }}
                </span>
              </td>
              <td class="py-4 text-muted align-middle">
                {{ formatDate(q.createdAt) }}
              </td>
              <td class="pe-4 py-4 text-end align-middle">
                <div class="d-flex gap-2 justify-content-end">
                  <button class="btn btn-sm btn-outline-secondary action-btn" @click="editQuestionnaire(q.id)" title="Edit">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button class="btn btn-sm btn-outline-danger action-btn" @click="deleteQuestionnaire(q.id)" title="Delete">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Payment Modal for Questionnaire Access -->
    <div v-if="showPaymentModal" class="modal d-block" tabindex="-1" style="background: rgba(0,0,0,0.5)">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content rounded-4 border-0 shadow">
          <div class="modal-header border-bottom-0 pb-0">
            <h5 class="modal-title fw-bold">Akses Form Kuesioner AI</h5>
            <button type="button" class="btn-close" @click="showPaymentModal = false"
              :disabled="processingPayment"></button>
          </div>
          <div class="modal-body p-4">
            <p class="text-muted mb-3">Bayar Rp 5.000 untuk mengakses form kuesioner dengan fitur AI generator
              pertanyaan.</p>
            <div class="alert alert-info bg-opacity-10 border-0 mb-4">
              <i class="bi bi-robot me-2"></i>
              <strong>Fitur AI membantu:</strong>
              <ul class="mb-0 mt-2">
                <li>Generate pertanyaan berkualitas</li>
                <li>Berdasarkan topik & tujuan penelitian</li>
                <li>Edit dan kustomisasi sesuka hati</li>
              </ul>
            </div>
            <div class="text-center bg-light p-4 rounded-3">
              <div class="text-muted small mb-1">Biaya Akses Form</div>
              <h2 class="fw-bold mb-0 text-primary">Rp 5.000</h2>
            </div>
          </div>
          <div class="modal-footer border-top-0 pt-0">
            <button class="btn btn-light rounded-3" @click="showPaymentModal = false" :disabled="processingPayment">
              Batal
            </button>
            <button class="btn btn-primary rounded-3 px-4 fw-semibold" @click="proceedPayment"
              :disabled="processingPayment">
              <i class="bi bi-credit-card me-2"></i>{{ processingPayment ? 'Memproses...' : 'Bayar Sekarang' }}
            </button>
          </div>
        </div>
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
const config = useRuntimeConfig()
const projectId = route.params.id as string
const questionnaireForm = useQuestionnaireForm()

// Load Midtrans Snap.js script
useHead({
  script: [
    {
      src: config.public.midtransSnapUrl,
      'data-client-key': config.public.midtransClientKey
    }
  ]
})

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
const showPaymentModal = ref(false)
const processingPayment = ref(false)

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
})

const createQuestionnaire = () => {
  showPaymentModal.value = true
}

const proceedPayment = async () => {
  processingPayment.value = true
  try {
    const response = await $fetch('/api/questionnaires/payment/access', {
      method: 'POST',
      body: { projectId }
    }) as any

    showPaymentModal.value = false

    // Store questionnaireId for later use
    const questionnaireId = response.questionnaireId

    // Trigger Midtrans Snap
    if (window.snap) {
      window.snap.pay(response.snapToken, {
        onSuccess: async function (result: any) {

          // Wait a bit for webhook to process
          await new Promise(resolve => setTimeout(resolve, 2000))

          await Swal.fire({
            icon: 'success',
            title: 'Pembayaran Berhasil!',
            text: 'Anda akan diarahkan ke form kuesioner.',
            confirmButtonText: 'OK',
            timer: 3000
          })

          // Redirect to edit form with questionnaireId from response
          router.push(`/projects/${projectId}/questionnaire/${questionnaireId}/edit`)
        },
        onPending: function (result: any) {
          Swal.fire({
            icon: 'info',
            title: 'Pembayaran Pending',
            text: 'Menunggu konfirmasi pembayaran Anda.',
            confirmButtonText: 'OK'
          })
        },
        onError: async function (result: any) {
          console.error('Payment error:', result)
          Swal.fire({
            icon: 'error',
            title: 'Pembayaran Gagal',
            text: 'Pembayaran gagal. Silakan coba lagi.',
            confirmButtonText: 'OK'
          })
          await questionnaireForm.deleteQuestionnaire(questionnaireId)
        },
        onClose: async function () {
          console.log('Payment popup closed')
          Swal.fire({
            icon: 'warning',
            title: 'Pembayaran Dibatalkan',
            text: 'Anda menutup popup tanpa menyelesaikan pembayaran.',
            confirmButtonText: 'OK'
          })
          await questionnaireForm.deleteQuestionnaire(questionnaireId)
        }
      })
    } else {
      console.error('Midtrans Snap not loaded')
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Midtrans library tidak termuat. Silakan refresh halaman.',
        confirmButtonText: 'OK'
      })
    }
  } catch (error: any) {
    console.error('Payment initiation error:', error)
    Swal.fire('Error', error.data?.statusMessage || 'Gagal memproses pembayaran', 'error')
  } finally {
    processingPayment.value = false
  }
}

const openAIGenerator = (questionnaireId: string) => {
  router.push(`/projects/${projectId}/questionnaire/${questionnaireId}/edit?mode=ai`)
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
  return status === 'published' 
    ? 'badge bg-success-subtle text-success border border-success-subtle px-2 py-1' 
    : 'badge bg-secondary-subtle text-secondary border border-secondary-subtle px-2 py-1'
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
/* Action Buttons */
.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  border-radius: 8px;
  font-size: 0.95rem;
  background: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.12);
}

.action-btn:active {
  transform: translateY(0);
}

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
  
  .hero-section-transparent .back-btn {
    width: auto !important;
  }

  .hero-section-transparent .hero-action-btn {
    width: 100%;
  }
}

.rounded-4 {
  border-radius: 1rem !important;
}

.shadow-sm {
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.035) !important;
}
</style>
