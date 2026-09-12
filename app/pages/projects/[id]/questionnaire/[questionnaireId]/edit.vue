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
          <p class="text-muted mb-0">Project: {{ questionnaire?.project?.project?.title || 'Unknown' }}</p>
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

      <!-- Tab Navigation -->
      <ul class="nav nav-tabs mb-4" role="tablist">
        <li class="nav-item" role="presentation">
          <button class="nav-link" :class="{ active: activeTab === 'info' }" @click="activeTab = 'info'" type="button">
            <i class="bi bi-info-circle me-2"></i>Info Kuesioner
          </button>
        </li>
        <li class="nav-item" role="presentation">
          <button class="nav-link" :class="{ active: activeTab === 'variables' }" @click="activeTab = 'variables'"
            type="button">
            <i class="bi bi-diagram-3 me-2"></i>Variabel & Indikator
          </button>
        </li>
        <li class="nav-item" role="presentation">
          <button class="nav-link" :class="{ active: activeTab === 'questions' }" @click="activeTab = 'questions'"
            type="button">
            <i class="bi bi-ui-checks me-2"></i>Pertanyaan
            <span class="badge bg-primary ms-1">{{ questions.length }}</span>
          </button>
        </li>
      </ul>

      <!-- Tab Content -->
      <div class="tab-content">
        <!-- Info Tab -->
        <div v-if="activeTab === 'info'" class="tab-pane active">
          <div class="card border-0 shadow-sm rounded-4 mb-4">
            <div class="card-body p-4">
              <div class="row">
                <div class="col-12 mb-3">
                  <label class="form-label fw-semibold">Topik Kuesioner</label>
                  <input type="text" class="form-control" v-model="questionnaire.topic"
                    :disabled="questionnaire.status !== 'draft'" placeholder="Tuliskan topik kuesioner..." />
                </div>
                <div class="col-12 mb-3">
                  <label class="form-label fw-semibold">Tujuan Penelitian</label>
                  <textarea v-model="questionnaire.researchObjective" class="form-control mt-2" rows="3"
                    placeholder="Deskripsi kuesioner..." :disabled="questionnaire.status !== 'draft'"></textarea>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Variables Tab -->
        <div v-if="activeTab === 'variables'" class="tab-pane active">
          <ResearchVariableManager :questionnaire-id="questionnaireId" />
        </div>

        <!-- Questions Tab -->
        <div v-if="activeTab === 'questions'" class="tab-pane active">

          <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap">
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

          <!-- Draggable Question List -->
          <QuestionDraggableQuestionList v-if="questions.length > 0" v-model:questions="questions"
            :questionnaire-id="questionnaireId" :disabled="questionnaire.status !== 'draft'"
            @reordered="handleReordered">
            <template #default="{ question, index }">
              <div class="card border-0 shadow-sm rounded-4 h-100">
                <div class="card-body p-4">
                  <div class="d-flex align-items-start mb-3">
                    <!-- Drag Handle -->
                    <div v-if="questionnaire.status === 'draft' && questions.length > 1" class="drag-handle me-3 pt-1"
                      style="cursor: grab;" title="Drag untuk mengurutkan">
                      <i class="bi bi-grip-vertical fs-5 text-muted"></i>
                    </div>

                    <div class="flex-grow-1">
                      <div class="mb-2 d-flex justify-content-between align-items-center flex-wrap gap-2">
                        <div class="d-flex align-items-center gap-2 flex-wrap">
                          <!-- Question Type Selector -->
                          <QuestionQuestionTypeSelector v-if="questionnaire.status === 'draft'"
                            :current-type="question.questionType" @change="handleTypeChange(question, $event)" />
                          <span v-else class="badge bg-primary bg-opacity-10 text-white">
                            {{ getQuestionTypeLabel(question.questionType) }}
                          </span>

                          <span v-if="question.source === 'ai_generated'" class="badge bg-info bg-opacity-10 text-info">
                            AI Generated
                          </span>

                          <!-- Custom Options Badge -->
                          <span v-if="question.options && question.options.length > 0"
                            class="badge bg-success bg-opacity-10 text-white">
                            {{ getQuestionTypeLabel(question.questionType) }}
                          </span>
                        </div>

                        <div class="d-flex gap-2" v-if="questionnaire.status === 'draft'">
                          <!-- Edit Options Button -->
                          <button
                            v-if="hasOptions(question) || question.questionType === 'likert' || question.questionType === 'rating_scale'"
                            @click="openCustomOptions(question)" class="btn btn-sm btn-outline-secondary rounded-3">
                            <i class="bi bi-sliders me-1"></i>
                            Edit Opsi
                          </button>

                          <!-- Save Button -->
                          <button @click="updateQuestionText(question)" class="btn btn-sm btn-outline-success rounded-3"
                            :disabled="updatingQuestion === question.id">
                            <i class="bi bi-check2 me-1"></i>
                            {{ updatingQuestion === question.id ? 'Menyimpan...' : 'Simpan' }}
                          </button>

                          <!-- Delete Button -->
                          <button class="btn btn-outline-danger btn-sm rounded-3 px-3"
                            @click="deleteQuestion(question.id)">
                            <i class="bi bi-trash"></i>
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
                            <input v-model="opt.label" class="form-control"
                              :disabled="questionnaire.status !== 'draft'" />
                          </div>
                        </div>
                      </div>

                      <!-- Enhancement Actions -->
                      <div class="enhancement-actions mt-3 d-flex gap-2 flex-wrap"
                        v-if="questionnaire.status === 'draft'">
                        <button class="btn btn-sm btn-outline-info" @click="toggleReview(question.id)"
                          :class="{ active: activeReview === question.id }">
                          <i class="bi bi-shield-check me-1"></i>
                          {{ activeReview === question.id ? 'Hide Review' : 'Review' }}
                        </button>
                        <button class="btn btn-sm btn-outline-primary" @click="toggleRewrite(question.id)"
                          :class="{ active: activeRewrite === question.id }">
                          <i class="bi bi-pencil-square me-1"></i>
                          {{ activeRewrite === question.id ? 'Hide Rewrite' : 'Rewrite' }}
                        </button>
                        <!-- <button class="btn btn-sm btn-outline-success" @click="openMapper(question.id)">
                        <i class="bi bi-link-45deg me-1"></i>
                        Map to Indicator
                      </button> -->
                      </div>

                      <!-- Indicator Badge -->
                      <div v-if="question.indicatorId" class="mt-2">
                        <span class="badge bg-success">
                          <i class="bi bi-check-circle me-1"></i>Mapped to Indicator
                        </span>
                      </div>

                      <!-- Review Panel -->
                      <div v-if="activeReview === question.id" class="mt-3">
                        <ResearchQuestionReviewPanel :question-id="question.id" :questionnaire-id="questionnaireId"
                          :current-review="question.aiReview" @review-updated="handleReviewUpdated(question, $event)" />
                      </div>

                      <!-- Rewrite Panel -->
                      <div v-if="activeRewrite === question.id" class="mt-3">
                        <ResearchQuestionRewritePanel :question-id="question.id" :questionnaire-id="questionnaireId"
                          :current-text="question.questionText" :current-type="question.questionType"
                          :current-options="question.options" :current-rewrites="question.aiSuggestions"
                          @apply-rewrite="handleApplyRewrite(question, $event)"
                          @rewrite-updated="handleRewriteUpdated(question, $event)" />
                      </div>

                    </div>


                  </div>
                </div>
              </div>
            </template>
          </QuestionDraggableQuestionList>
        </div>
      </div>
    </div>
  </LayoutPrivateLayout>

  <!-- Indicator Mapper Modal -->
  <ResearchIndicatorMapperModal :show="showMapperModal" :question-id="mappingQuestionId"
    :questionnaire-id="questionnaireId" :current-indicator-id="currentMappingIndicatorId" @saved="handleMapperSaved"
    @closed="showMapperModal = false" />

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

  <!-- Custom Options Modal -->
  <QuestionCustomOptionsModal :show="showCustomOptionsModal" :question-type="editingQuestion?.questionType"
    :scale-type="editingQuestion?.scaleType" :current-options="editingQuestion?.options"
    @close="showCustomOptionsModal = false" @save="saveCustomOptions" />


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
            <input type="number" class="form-control rounded-3" v-model.number="publishForm.targetRespondents" min="1">
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

// Research assistant state
const activeTab = ref('questions') // Default to questions tab
const activeReview = ref<string | null>(null)
const activeRewrite = ref<string | null>(null)
const showMapperModal = ref(false)
const mappingQuestionId = ref<string | null>(null)
const currentMappingIndicatorId = ref<string | null>(null)

// Custom options modal state
const showCustomOptionsModal = ref(false)
const editingQuestion = ref<any>(null)

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
  return ['multiple_choice', 'checkbox', 'dropdown', 'closed', 'filter', 'mixed'].includes(question.questionType) &&
    question.options &&
    question.options.length > 0
}

// Update individual question text only
async function updateQuestionText(question: any) {
  updatingQuestion.value = question.id
  try {
    await $fetch(`/api/questions/${question.id}`, {
      method: 'PUT',
      body: {
        questionText: question.questionText
      }
    })
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Pertanyaan diperbarui', showConfirmButton: false, timer: 2000 })
  } catch (err: any) {
    Swal.fire('Error', err.data?.statusMessage || 'Gagal memperbarui pertanyaan', 'error')
  } finally {
    updatingQuestion.value = null
  }
}

// Handle question type change
async function handleTypeChange(question: any, newType: string) {
  updatingQuestion.value = question.id
  try {
    await $fetch(`/api/questions/${question.id}`, {
      method: 'PUT',
      body: {
        questionType: newType
      }
    })
    await fetchQuestionnaire()
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Tipe pertanyaan berhasil diubah',
      showConfirmButton: false,
      timer: 2000
    })
  } catch (err: any) {
    Swal.fire('Error', err.data?.statusMessage || 'Gagal mengubah tipe pertanyaan', 'error')
    await fetchQuestionnaire() // Refresh to revert changes
  } finally {
    updatingQuestion.value = null
  }
}

// Open custom options modal
function openCustomOptions(question: any) {
  editingQuestion.value = question
  showCustomOptionsModal.value = true
}

// Save custom options
async function saveCustomOptions(options: any[], scaleType?: string) {
  if (!editingQuestion.value) return

  updatingQuestion.value = editingQuestion.value.id
  try {
    const body: any = { options }
    if (scaleType) {
      body.scaleType = scaleType
    }

    await $fetch(`/api/questions/${editingQuestion.value.id}`, {
      method: 'PUT',
      body
    })

    await fetchQuestionnaire()
    showCustomOptionsModal.value = false
    editingQuestion.value = null

    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Opsi jawaban berhasil disimpan',
      showConfirmButton: false,
      timer: 2000
    })
  } catch (err: any) {
    Swal.fire('Error', err.data?.statusMessage || 'Gagal menyimpan opsi', 'error')
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

// Research assistant handlers
function toggleReview(questionId: string) {
  activeReview.value = activeReview.value === questionId ? null : questionId
  activeRewrite.value = null // Close rewrite if open
}

function toggleRewrite(questionId: string) {
  activeRewrite.value = activeRewrite.value === questionId ? null : questionId
  activeReview.value = null // Close review if open
}

function openMapper(questionId: string) {
  const question = questions.value.find(q => q.id === questionId)
  mappingQuestionId.value = questionId
  currentMappingIndicatorId.value = question?.indicatorId || null
  showMapperModal.value = true
}

async function handleMapperSaved() {
  await fetchQuestionnaire()
  showMapperModal.value = false
  Swal.fire({
    toast: true,
    position: 'top-end',
    icon: 'success',
    title: 'Pertanyaan berhasil dipetakan ke indikator',
    showConfirmButton: false,
    timer: 2000
  })
}

async function handleApplyRewrite(question: any, suggestion: any) {
  try {
    const body: any = {
      questionText: suggestion.questionText,
      questionType: suggestion.questionType
    }

    // Add options if provided
    if (suggestion.options && suggestion.options.length > 0) {
      body.options = suggestion.options
    }

    // Add scaleType if provided
    if (suggestion.scaleType) {
      body.scaleType = suggestion.scaleType
    }

    await $fetch(`/api/questions/${question.id}`, {
      method: 'PUT',
      body
    })

    // Refresh to get updated question with all fields
    await fetchQuestionnaire()

    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Pertanyaan berhasil diperbarui dengan saran AI',
      showConfirmButton: false,
      timer: 2000
    })
  } catch (err: any) {
    Swal.fire('Error', err.data?.statusMessage || 'Gagal memperbarui pertanyaan', 'error')
  }
}

function handleReviewUpdated(question: any, reviewData: any) {
  // Update the question object with the new review data
  question.aiReview = reviewData
}

function handleRewriteUpdated(question: any, rewriteData: any) {
  // Update the question object with the new rewrite data
  question.aiSuggestions = rewriteData
}

// Handle reordered event from DraggableQuestionList
function handleReordered(newOrder: any[]) {
  // Questions already updated by v-model
  console.log('Questions reordered:', newOrder.map(q => q.id))
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
          console.log('Starting status update polling...')

          // Show loading notification while waiting for webhook
          Swal.fire({
            title: 'Memproses Pembayaran...',
            text: 'Mohon tunggu sebentar, kami sedang memproses pembayaran Anda',
            allowOutsideClick: false,
            allowEscapeKey: false,
            didOpen: () => {
              Swal.showLoading()
            }
          })

          // Wait for webhook to process (initial delay 3 seconds)
          console.log('Waiting 3 seconds for webhook to process...')
          await new Promise(resolve => setTimeout(resolve, 3000))

          // Poll for status update (max 5 attempts, 2 seconds apart = 10 seconds total)
          let attempts = 0
          const maxAttempts = 5

          while (attempts < maxAttempts) {
            attempts++
            console.log(`Poll attempt ${attempts}/${maxAttempts}...`)

            await fetchQuestionnaire()
            console.log(`Current status: ${questionnaire.value.status}`)

            if (questionnaire.value.status === 'published') {
              // Status successfully updated!
              console.log('✅ Status updated to published!')
              Swal.fire({
                icon: 'success',
                title: 'Pembayaran Berhasil!',
                text: 'Kuesioner Anda telah dipublikasikan.',
                confirmButtonText: 'OK'
              })
              return
            }

            if (attempts < maxAttempts) {
              // Wait 2 seconds before next attempt
              console.log(`Status still '${questionnaire.value.status}'. Waiting 2 seconds before next poll...`)
              await new Promise(resolve => setTimeout(resolve, 2000))
            }
          }

          // If still not published after polling, show info message
          console.log(`⚠️ Polling completed. Final status: ${questionnaire.value.status}`)
          console.log('Triggering fallback: auto refresh')
          Swal.fire({
            icon: 'info',
            title: 'Pembayaran Berhasil!',
            text: 'Kuesioner Anda sedang diproses. Silakan refresh halaman dalam beberapa saat.',
            confirmButtonText: 'OK'
          }).then(() => {
            // Auto refresh after user clicks OK
            console.log('Refreshing page...')
            window.location.reload()
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

.nav-tabs .nav-link {
  color: #6c757d;
  border: none;
  border-bottom: 2px solid transparent;
  padding: 0.75rem 1.25rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.nav-tabs .nav-link:hover {
  color: #0d6efd;
  border-bottom-color: #0d6efd;
}

.nav-tabs .nav-link.active {
  color: #0d6efd;
  background-color: transparent;
  border-bottom-color: #0d6efd;
}

.enhancement-actions .btn.active {
  background-color: #0d6efd;
  color: white;
  border-color: #0d6efd;
}

.enhancement-actions .btn-outline-info.active {
  background-color: #0dcaf0;
  border-color: #0dcaf0;
}

.enhancement-actions .btn-outline-primary.active {
  background-color: #0d6efd;
  border-color: #0d6efd;
}

/* Drag handle styles */
.drag-handle {
  cursor: grab;
  transition: all 0.2s ease;
  user-select: none;
}

.drag-handle:hover {
  color: #0d6efd !important;
}

.drag-handle:active {
  cursor: grabbing;
}

.drag-handle i {
  transition: color 0.2s ease;
}

.drag-handle:hover i {
  color: #0d6efd !important;
}
</style>
