<template>
  <LayoutPrivateLayout :user="userProfile" active-item="projects" @logout="handleSignOut">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="fw-bold mb-1">Buat Kuesioner Baru</h2>
        <p class="text-muted mb-0">Project: {{ projectTitle }}</p>
      </div>
      <button class="btn btn-outline-secondary" @click="handleCancel">
        <i class="bi bi-x-lg me-2"></i>Batal
      </button>
    </div>

    <!-- Step Indicator -->
    <div class="card border-0 shadow-sm rounded-4 mb-4">
      <div class="card-body p-4">
        <div class="d-flex align-items-center justify-content-center">
          <div class="d-flex align-items-center">
            <div :class="['step-circle', currentStep >= 1 ? 'active' : '']">1</div>
            <div class="step-label ms-2 me-4">Informasi Dasar</div>
          </div>
          <div class="step-line mx-3"></div>
          <div class="d-flex align-items-center">
            <div :class="['step-circle', currentStep >= 2 ? 'active' : '']">2</div>
            <div class="step-label ms-2">Kelola Pertanyaan</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Step 1: Basic Information -->
    <div v-if="currentStep === 1" class="card border-0 shadow-sm rounded-4">
      <div class="card-body p-4">
        <h5 class="fw-bold mb-4">Informasi Kuesioner</h5>
        
        <div class="mb-3">
          <label class="form-label fw-semibold">Topik Kuesioner <span class="text-danger">*</span></label>
          <input 
            type="text" 
            class="form-control rounded-3" 
            v-model="formData.topic"
            placeholder="Contoh: Kepuasan Pelanggan Terhadap Layanan"
            :disabled="questionnaireForm.loading.value"
          >
          <small class="text-muted">Jelaskan topik utama kuesioner Anda</small>
        </div>

        <div class="mb-4">
          <label class="form-label fw-semibold">Tujuan Penelitian <span class="text-danger">*</span></label>
          <textarea 
            class="form-control rounded-3" 
            rows="4"
            v-model="formData.researchObjective"
            placeholder="Contoh: Mengetahui tingkat kepuasan pelanggan dan area yang perlu ditingkatkan"
            :disabled="questionnaireForm.loading.value"
          ></textarea>
          <small class="text-muted">Jelaskan tujuan dan manfaat penelitian ini</small>
        </div>

        <div v-if="questionnaireForm.error.value" class="alert alert-danger rounded-3">
          {{ questionnaireForm.error.value }}
        </div>

        <div class="d-flex justify-content-end gap-2">
          <button 
            class="btn btn-primary px-4" 
            @click="createAndProceed"
            :disabled="!isStep1Valid || questionnaireForm.loading.value"
          >
            {{ questionnaireForm.loading.value ? 'Membuat...' : 'Lanjut ke Pertanyaan' }}
            <i class="bi bi-arrow-right ms-2"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Step 2: Question Management -->
    <div v-if="currentStep === 2">
      <!-- Questionnaire Info (Readonly) -->
      <div class="card border-0 shadow-sm rounded-4 mb-4">
        <div class="card-body p-4">
          <div class="row">
            <div class="col-md-6 mb-3 mb-md-0">
              <label class="form-label fw-semibold text-muted small">Topik</label>
              <p class="mb-0 fw-semibold">{{ createdQuestionnaire?.topic }}</p>
            </div>
            <div class="col-md-6">
              <label class="form-label fw-semibold text-muted small">Tujuan Penelitian</label>
              <p class="mb-0">{{ createdQuestionnaire?.researchObjective }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Question Management Header -->
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h4 class="fw-bold m-0">Daftar Pertanyaan ({{ questionManager.questions.value.length }})</h4>
        <div class="d-flex gap-2">
          <button 
            class="btn btn-outline-primary" 
            @click="handleGenerateAI"
            :disabled="questionManager.generatingAI.value"
          >
            <i class="bi bi-robot me-2"></i>
            {{ questionManager.generatingAI.value ? 'Generating...' : 'Generate by AI' }}
          </button>
          <button 
            class="btn btn-primary" 
            @click="showAddModal = true"
          >
            <i class="bi bi-plus-lg me-2"></i>Tambah Manual
          </button>
        </div>
      </div>

      <!-- Questions List -->
      <div v-if="questionManager.loading.value" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>

      <div v-else-if="questionManager.questions.value.length === 0" class="text-center p-5 bg-white rounded-4 shadow-sm">
        <i class="bi bi-ui-checks fs-1 text-muted opacity-50 mb-3 d-block"></i>
        <h5 class="fw-semibold">Belum ada pertanyaan</h5>
        <p class="text-muted">Gunakan Generate by AI atau tambahkan secara manual.</p>
      </div>

      <div v-else class="row g-3">
        <div v-for="(question, index) in questionManager.questions.value" :key="question.id" class="col-12">
          <div class="card border-0 shadow-sm rounded-4 h-100">
            <div class="card-body p-4">
              <div class="d-flex justify-content-between align-items-start">
                <div class="flex-grow-1">
                  <h5 class="fw-semibold mb-2">
                    {{ index + 1 }}. {{ question.questionText }}
                  </h5>
                  <div class="mb-2">
                    <span class="badge bg-primary bg-opacity-10 text-primary me-2">
                      {{ getQuestionTypeLabel(question.questionType) }}
                    </span>
                    <span v-if="question.source === 'ai_generated'" class="badge bg-info bg-opacity-10 text-info">
                      AI Generated
                    </span>
                  </div>
                  
                  <div v-if="hasOptions(question) && question.options && question.options.length > 0" class="mt-3">
                    <div class="text-muted small mb-2 fw-semibold">Opsi:</div>
                    <ul class="list-unstyled mb-0 ms-2">
                      <li v-for="opt in question.options" :key="opt.value" class="mb-1">
                        <i v-if="question.questionType === 'checkbox'" class="bi bi-square me-2 text-muted"></i>
                        <i v-else class="bi bi-circle me-2 text-muted"></i>
                        {{ opt.label }}
                      </li>
                    </ul>
                  </div>
                </div>
                <div class="ms-3">
                  <button 
                    class="btn btn-outline-danger btn-sm rounded-3 px-3" 
                    @click="handleDeleteQuestion(question.id)"
                  >
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="d-flex justify-content-between mt-4">
        <button class="btn btn-outline-secondary" @click="currentStep = 1">
          <i class="bi bi-arrow-left me-2"></i>Kembali
        </button>
        <button class="btn btn-success px-4" @click="handleSaveAndExit">
          <i class="bi bi-check-lg me-2"></i>Simpan & Keluar
        </button>
      </div>
    </div>



    <!-- Add Question Modal -->
    <div v-if="showAddModal" class="modal d-block" tabindex="-1" style="background: rgba(0,0,0,0.5)">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content rounded-4 border-0 shadow">
          <div class="modal-header border-bottom-0 pb-0">
            <h5 class="modal-title fw-bold">Tambah Pertanyaan Manual</h5>
            <button type="button" class="btn-close" @click="closeAddModal"></button>
          </div>
          <div class="modal-body p-4">
            <div class="mb-3">
              <label class="form-label fw-semibold">Tipe Pertanyaan</label>
              <select v-model="questionManager.questionForm.value.questionType" class="form-select rounded-3">
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
              <textarea 
                v-model="questionManager.questionForm.value.questionText" 
                class="form-control rounded-3" 
                rows="3" 
                placeholder="Tuliskan pertanyaan..."
              ></textarea>
            </div>
            <div v-if="requiresOptions(questionManager.questionForm.value.questionType)" class="mb-3">
              <label class="form-label fw-semibold">Opsi Jawaban (pisahkan dengan koma)</label>
              <input 
                type="text" 
                class="form-control rounded-3" 
                v-model="questionManager.questionForm.value.optionsInput" 
                placeholder="Sangat Baik, Baik, Cukup, Kurang"
              >
            </div>
          </div>
          <div class="modal-footer border-top-0 pt-0">
            <button class="btn btn-light rounded-3" @click="closeAddModal">Batal</button>
            <button 
              class="btn btn-primary rounded-3 px-4" 
              @click="handleAddQuestion"
              :disabled="questionManager.saving.value || !questionManager.questionForm.value.questionText"
            >
              {{ questionManager.saving.value ? 'Menyimpan...' : 'Tambah' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </LayoutPrivateLayout>
</template>

<script setup lang="ts">
import Swal from 'sweetalert2'
import { useQuestionnaireForm } from '~/composables/useQuestionnaireForm'
import { useQuestionManager } from '~/composables/useQuestionManager'
import { getQuestionTypeLabel } from '~/types/questionnaire'
import type { Questionnaire } from '~/types/questionnaire'

const route = useRoute()
const router = useRouter()
const projectId = route.params.id as string

const { data: session, signOut } = useAuth()

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

// Composables
const questionnaireForm = useQuestionnaireForm()
const questionManager = useQuestionManager()

// State
const currentStep = ref(1)
const projectTitle = ref('Loading...')
const createdQuestionnaire = ref<Questionnaire | null>(null)
const showAddModal = ref(false)

const formData = ref({
  topic: '',
  researchObjective: ''
})

// Computed
const isStep1Valid = computed(() => {
  return formData.value.topic.trim().length > 0 && 
         formData.value.researchObjective.trim().length > 0
})

// Load project info
onMounted(async () => {
  try {
    const response = await $fetch(`/api/projects/${projectId}`) as any
    projectTitle.value = response.project.title
  } catch (err) {
    projectTitle.value = 'Unknown Project'
  }
})

// Step 1: Create questionnaire and proceed to step 2
const createAndProceed = async () => {
  try {
    const questionnaire = await questionnaireForm.createQuestionnaire(projectId, {
      topic: formData.value.topic,
      researchObjective: formData.value.researchObjective
    })
    
    createdQuestionnaire.value = questionnaire
    currentStep.value = 2
    
    // Load questions (should be empty initially)
    await questionManager.fetchQuestions(questionnaire.id)
  } catch (err) {
    // Error already handled in composable
  }
}

// Step 2: Generate AI questions
const handleGenerateAI = async () => {
  if (!createdQuestionnaire.value) return
  
  try {
    await questionManager.generateAIQuestions(
      createdQuestionnaire.value.id,
      createdQuestionnaire.value.topic,
      createdQuestionnaire.value.researchObjective,
      5
    )
  } catch (err) {
    // Error already handled in composable
  }
}

// Step 2: Add manual question
const handleAddQuestion = async () => {
  if (!createdQuestionnaire.value) return
  
  try {
    await questionManager.addQuestion(createdQuestionnaire.value.id)
    closeAddModal()
  } catch (err) {
    // Error already handled in composable
  }
}

// Step 2: Delete question
const handleDeleteQuestion = async (questionId: string) => {
  if (!createdQuestionnaire.value) return
  
  try {
    await questionManager.deleteQuestion(questionId, createdQuestionnaire.value.id)
  } catch (err) {
    // Error already handled in composable
  }
}

// Close add modal
const closeAddModal = () => {
  showAddModal.value = false
  questionManager.resetForm()
}

// Save and exit
const handleSaveAndExit = () => {
  Swal.fire({
    title: 'Kuesioner Tersimpan',
    text: 'Kuesioner berhasil dibuat. Anda dapat mengedit atau mempublikasikannya nanti.',
    icon: 'success',
    confirmButtonText: 'OK'
  }).then(() => {
    router.push(`/projects/manage/${projectId}`)
  })
}

// Cancel creation
const handleCancel = async () => {
  const result = await Swal.fire({
    title: 'Batalkan Pembuatan?',
    text: currentStep.value === 2 
      ? 'Kuesioner dan pertanyaan yang sudah dibuat akan tetap tersimpan.' 
      : 'Data yang sudah diisi akan hilang.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Ya, Batalkan',
    cancelButtonText: 'Tidak'
  })
  
  if (result.isConfirmed) {
    router.push(`/projects/manage/${projectId}`)
  }
}

// Helper functions
const hasOptions = (question: any) => {
  return ['multiple_choice', 'checkbox', 'dropdown', 'closed', 'filter', 'mixed'].includes(question.questionType)
}

const requiresOptions = (questionType: string) => {
  return ['multiple_choice', 'checkbox', 'dropdown', 'closed', 'filter', 'mixed'].includes(questionType)
}
</script>



<style scoped>
.step-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #e9ecef;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: #6c757d;
}

.step-circle.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.step-line {
  width: 100px;
  height: 2px;
  background-color: #e9ecef;
}

.step-label {
  font-weight: 600;
  color: #6c757d;
}

.rounded-4 {
  border-radius: 1rem !important;
}
</style>
