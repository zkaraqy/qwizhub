<template>
  <div class="container mt-5">
    <h1 class="mb-4">Edit Kuesioner</h1>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <div v-else-if="error" class="alert alert-danger">
      {{ error }}
    </div>

    <div v-else>
      <div class="card mb-4">
        <div class="card-header">
          <h5>Informasi Kuesioner</h5>
        </div>
        <div class="card-body">
          <p><strong>Topik:</strong> {{ questionnaire.topic }}</p>
          <p><strong>Status:</strong> 
            <span :class="['badge', questionnaire.status === 'draft' ? 'bg-secondary' : 'bg-success']">
              {{ questionnaire.status }}
            </span>
          </p>
        </div>
      </div>

      <div class="d-flex justify-content-between align-items-center mb-3">
        <h4>Daftar Pertanyaan ({{ questions.length }})</h4>
        <button 
          class="btn btn-sm btn-success" 
          @click="showAddModal = true"
          :disabled="questionnaire.status !== 'draft'"
        >
          + Tambah Pertanyaan
        </button>
      </div>

      <div v-if="questions.length === 0" class="alert alert-info">
        Belum ada pertanyaan. Klik "Tambah Pertanyaan" untuk memulai.
      </div>

      <div v-else>
        <div v-for="(question, index) in questions" :key="question.id" class="card mb-3">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start">
              <div class="flex-grow-1">
                <h6 class="mb-2">
                  {{ index + 1 }}. {{ question.questionText }}
                  <span v-if="question.biasDetected" class="badge bg-warning text-dark ms-2">
                    Bias
                  </span>
                  <span class="badge bg-secondary ms-2">{{ question.source }}</span>
                </h6>
                <p class="mb-1"><small class="text-muted">Tipe: {{ question.questionType }}</small></p>
                <div v-if="question.options && question.options.length > 0">
                  <small class="text-muted">Opsi:</small>
                  <ul class="small mb-0">
                    <li v-for="opt in question.options.slice(0, 3)" :key="opt.value">
                      {{ opt.label }}
                    </li>
                    <li v-if="question.options.length > 3">... dan {{ question.options.length - 3 }} lainnya</li>
                  </ul>
                </div>
              </div>
              <div class="btn-group" v-if="questionnaire.status === 'draft'">
                <button 
                  class="btn btn-sm btn-outline-danger" 
                  @click="deleteQuestion(question.id)"
                  :disabled="deleting === question.id"
                >
                  {{ deleting === question.id ? '...' : 'Hapus' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="d-flex gap-2 mt-4">
        <button 
          class="btn btn-primary" 
          @click="publishQuestionnaire"
          :disabled="questionnaire.status !== 'draft' || questions.length === 0 || publishing"
        >
          {{ publishing ? 'Publishing...' : 'Publish Kuesioner' }}
        </button>
        <NuxtLink :to="`/projects`" class="btn btn-outline-secondary">
          Kembali ke Proyek
        </NuxtLink>
      </div>
    </div>

    <!-- Add Question Modal -->
    <div v-if="showAddModal" class="modal d-block" style="background: rgba(0,0,0,0.5)">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Tambah Pertanyaan</h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Teks Pertanyaan</label>
              <textarea v-model="questionForm.questionText" class="form-control" rows="3"></textarea>
            </div>
            <div class="mb-3">
              <label class="form-label">Tipe Pertanyaan</label>
              <select v-model="questionForm.questionType" class="form-select">
                <option value="text">Text</option>
                <option value="multiple_choice">Multiple Choice</option>
                <option value="rating_scale">Rating Scale</option>
              </select>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="closeModal">Batal</button>
            <button class="btn btn-primary" @click="saveQuestion" :disabled="saving">
              {{ saving ? 'Menyimpan...' : 'Simpan' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const questionnaireId = route.params.questionnaireId as string

const loading = ref(true)
const error = ref<string | null>(null)
const questionnaire = ref<any>(null)
const questions = ref<any[]>([])
const deleting = ref<string | null>(null)
const publishing = ref(false)

const showAddModal = ref(false)
const questionForm = ref({
  questionText: '',
  questionType: 'text'
})
const saving = ref(false)

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
  } catch (err: any) {
    error.value = err.data?.statusMessage || 'Gagal memuat kuesioner'
  } finally {
    loading.value = false
  }
}

function closeModal() {
  showAddModal.value = false
  questionForm.value = {
    questionText: '',
    questionType: 'text'
  }
}

async function saveQuestion() {
  saving.value = true
  
  try {
    await $fetch('/api/questions', {
      method: 'POST',
      body: {
        ...questionForm.value,
        questionnaireId
      }
    })
    
    await fetchQuestionnaire()
    closeModal()
  } catch (err: any) {
    alert(err.data?.statusMessage || 'Gagal menyimpan pertanyaan')
  } finally {
    saving.value = false
  }
}

async function deleteQuestion(questionId: string) {
  if (!confirm('Apakah Anda yakin ingin menghapus pertanyaan ini?')) {
    return
  }

  deleting.value = questionId
  
  try {
    await $fetch(`/api/questions/${questionId}`, {
      method: 'DELETE'
    })
    await fetchQuestionnaire()
  } catch (err: any) {
    alert(err.data?.statusMessage || 'Gagal menghapus pertanyaan')
  } finally {
    deleting.value = null
  }
}

async function publishQuestionnaire() {
  if (!confirm('Publish kuesioner ini? Setelah dipublish, kuesioner tidak bisa diedit lagi.')) {
    return
  }

  publishing.value = true
  
  try {
    await $fetch(`/api/questionnaires/${questionnaireId}/publish`, {
      method: 'POST'
    })
    await fetchQuestionnaire()
    alert('Kuesioner berhasil dipublish!')
  } catch (err: any) {
    alert(err.data?.statusMessage || 'Gagal publish kuesioner')
  } finally {
    publishing.value = false
  }
}
</script>

