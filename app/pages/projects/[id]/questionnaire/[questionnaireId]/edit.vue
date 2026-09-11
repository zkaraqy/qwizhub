<template>
  <LayoutPrivateLayout :user="userProfile" active-item="projects" @logout="handleSignOut">
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <div v-else-if="error" class="alert alert-danger shadow-sm rounded-4">
      {{ error }}
    </div>

    <div v-else>
      <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap">
        <div>
          <h2 class="fw-bold mb-1">Edit Kuesioner</h2>
          <p class="text-muted mb-0">Project: {{ questionnaire?.project?.title || 'Unknown' }}</p>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-secondary fw-semibold" @click="handleBack">
            Kembali
          </button>
          <button class="btn btn-primary fw-semibold" @click="saveChanges" :disabled="savingChanges">
            {{ savingChanges ? 'Menyimpan...' : 'Simpan' }}
          </button>
          <button class="btn btn-success fw-semibold" @click="showPublishModal = true"
            :disabled="questionnaire.status !== 'draft' || questions.length === 0">
            Publikasikan
          </button>
        </div>
      </div>

      <div class="card border-0 shadow-sm rounded-4 mb-4">
        <div class="card-body p-4">
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label fw-semibold">Topik Kuesioner</label>
              <input type="text" class="form-control" v-model="questionnaire.topic"
                :disabled="questionnaire.status !== 'draft'">
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label fw-semibold">Tujuan Penelitian</label>
              <input type="text" class="form-control" v-model="questionnaire.researchObjective"
                :disabled="questionnaire.status !== 'draft'">
            </div>
            <div class="col-md-12 mb-3">
              <label class="form-label fw-semibold">Variabel yang Akan Diukur</label>
              <textarea class="form-control" v-model="variablesInput" rows="2"
                placeholder="Pisahkan dengan koma: Kualitas Produk, Harga, Kepuasan Pelanggan"
                :disabled="questionnaire.status !== 'draft'"></textarea>
              <small class="text-muted">Contoh: Kualitas, Harga, Pelayanan (pisahkan dengan koma)</small>
            </div>
          </div>
        </div>
      </div>

      <div class="d-flex justify-content-between align-items-center mb-3 mt-5 flex-wrap">
        <h4 class="fw-bold m-0">Daftar Pertanyaan ({{ questions.length }})</h4>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-primary" @click="generateByAI"
            :disabled="generatingAI || questionnaire.status !== 'draft'">
            <i class="bi bi-robot me-2"></i>{{ generatingAI ? 'Generating...' : 'Generate by AI' }}
          </button>
          <button class="btn btn-primary" @click="showAddModal = true" :disabled="questionnaire.status !== 'draft'">
            <i class="bi bi-plus-lg me-2"></i>Tambah Pertanyaan
          </button>
        </div>
      </div>

      <div v-if="questions.length === 0" class="text-center p-5 bg-white rounded-4 shadow-sm">
        <i class="bi bi-ui-checks fs-1 text-muted opacity-50 mb-3 d-block"></i>
        <h5 class="fw-semibold">Belum ada pertanyaan</h5>
        <p class="text-muted">Gunakan Generate by AI atau tambahkan secara manual.</p>
      </div>

      <div v-else class="row g-3">
        <div v-for="(question, index) in questions" :key="question.id" class="col-12">
          <div class="card border-0 shadow-sm rounded-4 h-100">
            <div class="card-body p-4">
              <div class="d-flex justify-content-between align-items-start mb-3">
                <div class="flex-grow-1">
                  <div class="mb-2 d-flex justify-content-between align-items-center flex-wrap">
                    <div class="">
                      <span class="badge bg-primary bg-opacity-10 text-white me-2">{{
                        getQuestionTypeLabel(question.questionType) }}</span>
                      <span v-if="question.source === 'ai_generated'" class="badge bg-info bg-opacity-10 text-info">AI
                        Generated</span>
                    </div>
                    <div class="d-flex gap-2" v-if="questionnaire.status === 'draft'">
                      <!-- Save Button -->
                      <button @click="updateQuestion(question)" class="btn btn-sm btn-outline-success rounded-3"
                        :disabled="updatingQuestion === question.id">
                        <i class="bi bi-check2 me-1"></i>
                        {{ updatingQuestion === question.id ? 'Menyimpan...' : 'Simpan Perubahan' }}
                      </button>
                      <!-- Delete Button -->
                      <button class="btn btn-outline-danger btn-sm rounded-3 px-3" @click="deleteQuestion(question.id)">
                        <i class="bi bi-trash"></i> Hapus
                      </button>
                    </div>
                  </div>

                  <!-- Editable Question Text -->
                  <div class="mb-3">
                    <label class="small text-muted fw-semibold">Pertanyaan {{ index + 1 }}</label>
                    <textarea v-model="question.questionText" class="form-control" rows="2"
                      :disabled="questionnaire.status !== 'draft'"></textarea>
                  </div>

                  <!-- Editable Options -->
                  <div v-if="hasOptions(question)" class="ms-3">
                    <label class="small text-muted fw-semibold">Opsi Jawaban:</label>
                    <div v-for="(opt, idx) in question.options" :key="idx" class="mb-2">
                      <div class="input-group input-group-sm">
                        <span class="input-group-text">
                          <i v-if="question.questionType === 'checkbox'" class="bi bi-square"></i>
                          <i v-else class="bi bi-circle"></i>
                        </span>
                        <input v-model="opt.label" class="form-control" :disabled="questionnaire.status !== 'draft'" />
                      </div>
                    </div>
                  </div>


                </div>


              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Question Modal -->
    <div v-if="showAddModal" class="modal d-block" tabindex="-1" style="background: rgba(0,0,0,0.5)">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content rounded-4 border-0 shadow">
          <div class="modal-header border-bottom-0 pb-0">
            <h5 class="modal-title fw-bold">Tambah Pertanyaan Manual</h5>
            <button type="button" class="btn-close" @click="showAddModal = false"></button>
          </div>
          <div class="modal-body p-4">
            <div class="mb-3">
              <label class="form-label fw-semibold">Tipe Pertanyaan</label>
              <select v-model="questionForm.questionType" class="form-select rounded-3">
                <option value="text">Pertanyaan Terbuka</option>
                <option value="closed">Pertanyaan Tertutup</option>
                <option value="mixed">Pertanyaan Campuran</option>
                <option value="likert">Skala Likert</option>
                <option value="multiple_choice">Pertanyaan Pilihan Ganda</option>
                <option value="checkbox">Checklist</option>
                <option value="rating_scale">Pertanyaan Skala Peringkat</option>
                <option value="filter">Pertanyaan Filter</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label fw-semibold">Teks Pertanyaan</label>
              <textarea v-model="questionForm.questionText" class="form-control rounded-3" rows="3"
                placeholder="Tuliskan pertanyaan..."></textarea>
            </div>

            <div
              v-if="['multiple_choice', 'checkbox', 'dropdown', 'closed', 'filter', 'mixed'].includes(questionForm.questionType)"
              class="mb-3">
              <label class="form-label fw-semibold">Opsi Jawaban (pisahkan dengan koma)</label>
              <input type="text" class="form-control rounded-3" v-model="questionForm.optionsInput"
                placeholder="Sangat Baik, Baik, Cukup, Kurang">
            </div>
          </div>
          <div class="modal-footer border-top-0 pt-0">
            <button class="btn btn-light rounded-3" @click="showAddModal = false">Batal</button>
            <button class="btn btn-primary rounded-3 px-4" @click="saveQuestion" :disabled="saving">
              {{ saving ? 'Menyimpan...' : 'Tambah' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Publish / Payment Modal -->
    <div v-if="showPublishModal" class="modal d-block" tabindex="-1" style="background: rgba(0,0,0,0.5)">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content rounded-4 border-0 shadow">
          <div class="modal-header border-bottom-0 pb-0">
            <h5 class="modal-title fw-bold">Publikasikan Kuesioner</h5>
            <button type="button" class="btn-close" @click="showPublishModal = false"></button>
          </div>
          <div class="modal-body p-4">
            <p class="text-muted">Tentukan target responden dan honor untuk mempublikasikan kuesioner Anda.</p>
            <div class="mb-3">
              <label class="form-label fw-semibold">Target Responden</label>
              <input type="number" class="form-control rounded-3" v-model.number="publishForm.targetRespondents"
                min="1">
            </div>
            <div class="mb-4">
              <label class="form-label fw-semibold">Nominal Honor per Responden (Rp)</label>
              <input type="number" class="form-control rounded-3" v-model.number="publishForm.honorariumPerRespondent"
                min="0" step="1000">
            </div>

            <div class="bg-light p-3 rounded-4 mb-3">
              <div class="d-flex justify-content-between mb-2">
                <span class="text-muted">Total Honor ({{ publishForm.targetRespondents || 0 }} x Rp {{
                  publishForm.honorariumPerRespondent || 0 }})</span>
                <span class="fw-semibold">Rp {{ ((publishForm.targetRespondents || 0) *
                  (publishForm.honorariumPerRespondent || 0)).toLocaleString('id-ID') }}</span>
              </div>
              <div class="d-flex justify-content-between mb-2">
                <span class="text-muted">Fee Service</span>
                <span class="fw-semibold">Rp 5.000</span>
              </div>
              <hr>
              <div class="d-flex justify-content-between align-items-center">
                <span class="fw-bold">Total Pembayaran</span>
                <h4 class="fw-bold mb-0 text-primary">Rp {{ (((publishForm.targetRespondents || 0) *
                  (publishForm.honorariumPerRespondent || 0)) + 5000).toLocaleString('id-ID') }}</h4>
              </div>
            </div>
          </div>
          <div class="modal-footer border-top-0 pt-0">
            <button class="btn btn-light rounded-3" @click="showPublishModal = false"
              :disabled="publishing">Batal</button>
            <button class="btn btn-success rounded-3 px-4 fw-semibold" @click="proceedPublish"
              :disabled="publishing || !publishForm.targetRespondents">
              {{ publishing ? 'Memproses...' : 'Bayar & Publikasikan' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </LayoutPrivateLayout>
</template>

<script setup lang="ts">
import Swal from 'sweetalert2'

const route = useRoute()
const router = useRouter()
const projectId = route.params.id as string
const questionnaireId = route.params.questionnaireId as string

const { data: session, signOut } = useAuth()
const config = useRuntimeConfig()

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
  if (!session.value?.user) return null
  return {
    id: (session.value.user as any).id,
    name: session.value.user.name || '',
    email: session.value.user.email || '',
    image: session.value.user.image,
    role: (session.value.user as any).role
  }
})

const handleSignOut = async () => {
  await signOut({ callbackUrl: '/login' })
}

const loading = ref(true)
const error = ref<string | null>(null)
const questionnaire = ref<any>({ topic: '', researchObjective: '', status: 'draft', project: {} })
const questions = ref<any[]>([])

const savingChanges = ref(false)
const showAddModal = ref(false)
const saving = ref(false)
const generatingAI = ref(false)
const updatingQuestion = ref<string | null>(null)

const questionForm = ref({
  questionText: '',
  questionType: 'text',
  optionsInput: ''
})

// Variables input computed property
const variablesInput = computed({
  get: () => questionnaire.value.variables?.join(', ') || '',
  set: (val) => {
    questionnaire.value.variables = val
      .split(',')
      .map((v: string) => v.trim())
      .filter((v: string) => v)
  }
})

const showPublishModal = ref(false)
const publishing = ref(false)
const publishForm = ref({
  targetRespondents: 100,
  honorariumPerRespondent: 5000
})

onMounted(async () => {
  await fetchQuestionnaire()
})

async function fetchQuestionnaire() {
  loading.value = true
  error.value = null
  try {
    const response = await $fetch(`/api/questionnaires/${questionnaireId}`) as any
    questionnaire.value = response.questionnaire
    questions.value = response.questionnaire.questions || []

    // Also fetch project to get title
    const projResponse = await $fetch(`/api/projects/${projectId}`) as any
    questionnaire.value.project = projResponse
  } catch (err: any) {
    error.value = err.data?.statusMessage || 'Gagal memuat kuesioner'
  } finally {
    loading.value = false
  }
}

const getQuestionTypeLabel = (type: string) => {
  const map: Record<string, string> = {
    text: 'Pertanyaan Terbuka',
    closed: 'Pertanyaan Tertutup',
    mixed: 'Pertanyaan Campuran',
    likert: 'Skala Likert',
    multiple_choice: 'Pertanyaan Pilihan Ganda',
    checkbox: 'Checklist',
    rating_scale: 'Pertanyaan Skala Peringkat',
    filter: 'Pertanyaan Filter'
  }
  return map[type] || type
}

async function handleBack() {
  const result = await Swal.fire({
    title: 'Yakin Keluar?',
    text: "Perubahan pada info kuesioner (topik/tujuan) yang belum disimpan tidak akan tersimpan. Pertanyaan AI yang sudah di-generate sudah otomatis tersimpan.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Ya, Keluar',
    cancelButtonText: 'Batal'
  })

  if (result.isConfirmed) {
    router.push(`/projects/manage/${projectId}`)
  }
}

async function saveChanges() {
  savingChanges.value = true
  try {
    // Update questionnaire basic info including variables
    await $fetch(`/api/questionnaires/${questionnaireId}`, {
      method: 'PUT',
      body: {
        topic: questionnaire.value.topic,
        researchObjective: questionnaire.value.researchObjective,
        variables: questionnaire.value.variables
      }
    })
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Perubahan Info disimpan', showConfirmButton: false, timer: 2000 })
  } catch (err) {
    Swal.fire('Error', 'Gagal menyimpan perubahan.', 'error')
  } finally {
    savingChanges.value = false
  }
}

async function saveQuestion() {
  saving.value = true
  let options: any[] = []
  if (questionForm.value.optionsInput) {
    options = questionForm.value.optionsInput.split(',').map(opt => ({
      label: opt.trim(),
      value: opt.trim().toLowerCase().replace(/\s+/g, '_')
    })).filter(opt => opt.label)
  }

  try {
    await $fetch('/api/questions', {
      method: 'POST',
      body: {
        questionText: questionForm.value.questionText,
        questionType: questionForm.value.questionType,
        options: options,
        questionnaireId: questionnaireId,
        source: 'manual'
      }
    })

    await fetchQuestionnaire()
    showAddModal.value = false
    questionForm.value = { questionText: '', questionType: 'text', optionsInput: '' }
  } catch (err: any) {
    Swal.fire('Error', err.data?.statusMessage || 'Gagal menyimpan pertanyaan', 'error')
  } finally {
    saving.value = false
  }
}

async function generateByAI() {
  // Validate inputs
  if (!questionnaire.value.topic || !questionnaire.value.researchObjective) {
    Swal.fire('Error', 'Mohon isi Topik dan Tujuan Penelitian terlebih dahulu.', 'warning')
    return
  }

  generatingAI.value = true
  try {
    const response = await $fetch('/api/generate-questions', {
      method: 'POST',
      body: {
        topic: questionnaire.value.topic,
        objective: questionnaire.value.researchObjective,
        variables: questionnaire.value.variables || [],
        count: 5 // Default generate 5
      }
    }) as any

    // Save AI questions automatically
    const aiQuestions = response.questions || []
    for (const q of aiQuestions) {
      await $fetch('/api/questions', {
        method: 'POST',
        body: {
          questionText: q.questionText || q.text,
          questionType: q.questionType || 'multiple_choice',
          options: q.options || [],
          questionnaireId: questionnaireId,
          source: 'ai_generated'
        }
      })
    }

    await fetchQuestionnaire()
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'AI berhasil men-generate pertanyaan', showConfirmButton: false, timer: 3000 })
  } catch (err) {
    Swal.fire('Error', 'Gagal generate AI.', 'error')
  } finally {
    generatingAI.value = false
  }
}

// Helper function to check if question has options
function hasOptions(question: any) {
  return ['multiple_choice', 'checkbox', 'dropdown', 'closed', 'filter'].includes(question.questionType) &&
    question.options &&
    question.options.length > 0
}

// Update individual question
async function updateQuestion(question: any) {
  updatingQuestion.value = question.id
  try {
    await $fetch(`/api/questions/${question.id}`, {
      method: 'PUT',
      body: {
        questionText: question.questionText,
        options: question.options
      }
    })
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Pertanyaan diperbarui', showConfirmButton: false, timer: 2000 })
  } catch (err: any) {
    Swal.fire('Error', err.data?.statusMessage || 'Gagal memperbarui pertanyaan', 'error')
  } finally {
    updatingQuestion.value = null
  }
}

async function deleteQuestion(id: string) {
  const result = await Swal.fire({
    title: 'Hapus Pertanyaan?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Ya',
    cancelButtonText: 'Batal'
  })

  if (result.isConfirmed) {
    try {
      await $fetch(`/api/questions/${id}`, { method: 'DELETE' })
      await fetchQuestionnaire()
    } catch (err) {
      Swal.fire('Error', 'Gagal menghapus.', 'error')
    }
  }
}

async function proceedPublish() {
  publishing.value = true
  try {
    const response = await $fetch(`/api/projects/${projectId}/questionnaires/${questionnaireId}/publish`, {
      method: 'POST',
      body: {
        targetRespondents: publishForm.value.targetRespondents,
        honorariumPerRespondent: publishForm.value.honorariumPerRespondent
      }
    }) as any

    console.log('Publish response:', response)
    showPublishModal.value = false

    // Trigger Midtrans Snap
    if (window.snap) {
      window.snap.pay(response.snapToken, {
        onSuccess: async function (result: any) {
          console.log('Payment success:', result)
          // Refresh questionnaire data to get updated status from webhook
          await fetchQuestionnaire()
          await Swal.fire({
            icon: 'success',
            title: 'Pembayaran Berhasil!',
            text: 'Kuesioner Anda sedang diproses untuk dipublikasikan.',
            confirmButtonText: 'OK'
          })
        },
        onPending: function (result: any) {
          console.log('Payment pending:', result)
          Swal.fire({
            icon: 'info',
            title: 'Pembayaran Pending',
            text: 'Menunggu pembayaran Anda. Kami akan memproses setelah pembayaran dikonfirmasi.',
            confirmButtonText: 'OK'
          })
        },
        onError: function (result: any) {
          console.error('Payment error:', result)
          Swal.fire({
            icon: 'error',
            title: 'Pembayaran Gagal',
            text: 'Pembayaran gagal. Silakan coba lagi.',
            confirmButtonText: 'OK'
          })
        },
        onClose: function () {
          console.log('Payment popup closed')
          Swal.fire({
            icon: 'warning',
            title: 'Pembayaran Dibatalkan',
            text: 'Anda menutup popup tanpa menyelesaikan pembayaran.',
            confirmButtonText: 'OK'
          })
        }
      })
    } else {
      console.error('Midtrans Snap not loaded')
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Midtrans library tidak termuat. Silakan refresh halaman dan coba lagi.',
        confirmButtonText: 'OK'
      })
    }
  } catch (err: any) {
    console.error('Publish error:', err)
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: err.data?.statusMessage || 'Gagal memproses pembayaran',
      confirmButtonText: 'OK'
    })
  } finally {
    publishing.value = false
  }
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
