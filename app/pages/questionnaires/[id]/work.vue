<template>
  <LayoutPrivateLayout :user="userProfile" active-item="surveys" @logout="handleSignOut">
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
    </div>
    <div v-else-if="questionnaire && response" class="row">
      <div class="col-lg-8 mx-auto">
        <div class="card shadow-sm mb-4">
          <div class="card-header bg-primary text-white">
            <div class="d-flex justify-content-between align-items-center">
              <h5 class="mb-0 text-white">{{ questionnaire.topic }}</h5>
              <span class="badge bg-light text-dark">
                {{ currentQuestionIndex + 1 }} / {{ questions.length }}
              </span>
            </div>
          </div>
          <div class="card-body">
            <div class="progress mb-4" style="height: 10px;">
              <div class="progress-bar" :style="{ width: progressPercentage + '%' }"></div>
            </div>

            <div v-if="currentQuestion" class="mb-4">
              <h5 class="mb-3">{{ currentQuestion.questionText }}</h5>

              <!-- Multiple Choice / Radio -->
              <div v-if="currentQuestion.questionType === 'multiple_choice'" class="options-list">
                <div v-for="option in currentQuestion.options" :key="option.value" class="form-check mb-2">
                  <input class="form-check-input" type="radio" :name="`question-${currentQuestion.id}`"
                    :id="`option-${option.value}`" :value="option.value" v-model="answers[currentQuestion.id]" />
                  <label class="form-check-label" :for="`option-${option.value}`">
                    {{ option.label }}
                  </label>
                </div>
              </div>

              <!-- Checkbox -->
              <div v-else-if="currentQuestion.questionType === 'checkbox'" class="options-list">
                <div v-for="option in currentQuestion.options" :key="option.value" class="form-check mb-2">
                  <input class="form-check-input" type="checkbox" :id="`option-${option.value}`" :value="option.value"
                    @change="toggleCheckbox(currentQuestion.id, option.value)"
                    :checked="isChecked(currentQuestion.id, option.value)" />
                  <label class="form-check-label" :for="`option-${option.value}`">
                    {{ option.label }}
                  </label>
                </div>
              </div>

              <!-- Text -->
              <div v-else-if="currentQuestion.questionType === 'text'">
                <textarea class="form-control" rows="4" v-model="answers[currentQuestion.id]"
                  placeholder="Tulis jawaban Anda..."></textarea>
              </div>

              <!-- Rating Scale / Likert -->
              <div
                v-else-if="currentQuestion.questionType === 'rating_scale' || currentQuestion.questionType === 'likert'"
                class="options-list">
                <div v-for="option in currentQuestion.options" :key="option.value" class="form-check mb-2">
                  <input class="form-check-input" type="radio" :name="`question-${currentQuestion.id}`"
                    :id="`option-${option.value}`" :value="option.value" v-model="answers[currentQuestion.id]" />
                  <label class="form-check-label" :for="`option-${option.value}`">
                    {{ option.label }}
                  </label>
                </div>
              </div>

              <!-- Dropdown -->
              <div v-else-if="currentQuestion.questionType === 'dropdown'">
                <select class="form-select" v-model="answers[currentQuestion.id]">
                  <option value="">Pilih jawaban...</option>
                  <option v-for="option in currentQuestion.options" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </option>
                </select>
              </div>
            </div>

            <div class="d-flex justify-content-between mt-4">
              <button @click="previousQuestion" class="btn btn-outline-secondary"
                :disabled="currentQuestionIndex === 0">
                <i class="bi bi-arrow-left me-2"></i>Sebelumnya
              </button>

              <button v-if="currentQuestionIndex < questions.length - 1" @click="nextQuestion" class="btn btn-primary">
                Selanjutnya<i class="bi bi-arrow-right ms-2"></i>
              </button>

              <button v-else @click="submitResponse" class="btn btn-success" :disabled="submitting">
                <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
                <i v-else class="bi bi-check-circle me-2"></i>
                Submit
              </button>
            </div>
          </div>
        </div>

        <div class="text-center text-muted small">
          <i class="bi bi-info-circle me-1"></i>
          Progress otomatis tersimpan setiap 30 detik
        </div>
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
const route = useRoute()
const router = useRouter()
const questionnaireId = route.params.id as string

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

const questionnaire = ref<any>(null)
const response = ref<any>(null)
const questions = ref<any[]>([])
const answers = ref<any>({})
const currentQuestionIndex = ref(0)
const loading = ref(true)
const submitting = ref(false)
let autoSaveInterval: NodeJS.Timeout

const currentQuestion = computed(() => questions.value[currentQuestionIndex.value])
const progressPercentage = computed(() => {
  if (questions.value.length === 0) return 0
  return ((currentQuestionIndex.value + 1) / questions.value.length) * 100
})

const loadQuestionnaire = async () => {
  loading.value = true
  try {
    const data = await $fetch(`/api/questionnaires/${questionnaireId}/start`, { method: 'POST' })
    questionnaire.value = data.questionnaire
    response.value = data.response
    questions.value = data.questionnaire.questions || []

    // Load existing answers
    if (data.response.answers && Array.isArray(data.response.answers)) {
      data.response.answers.forEach((ans: any) => {
        answers.value[ans.questionId] = ans.answer
      })
    }
  } catch (error: any) {
    alert(error.data?.message || 'Gagal memuat kuesioner')
    router.push('/questionnaires')
  } finally {
    loading.value = false
  }
}

const nextQuestion = () => {
  if (currentQuestionIndex.value < questions.value.length - 1) {
    currentQuestionIndex.value++
    saveProgress()
  }
}

const previousQuestion = () => {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--
  }
}

const toggleCheckbox = (questionId: string, value: string) => {
  if (!answers.value[questionId]) {
    answers.value[questionId] = []
  }
  const index = answers.value[questionId].indexOf(value)
  if (index > -1) {
    answers.value[questionId].splice(index, 1)
  } else {
    answers.value[questionId].push(value)
  }
}

const isChecked = (questionId: string, value: string) => {
  return answers.value[questionId]?.includes(value) || false
}

const saveProgress = async () => {
  if (!response.value) return

  const answersArray = Object.keys(answers.value).map(questionId => ({
    questionId,
    answer: answers.value[questionId],
    answeredAt: new Date()
  }))

  try {
    await $fetch(`/api/responses/${response.value.id}/progress`, {
      method: 'PUT',
      body: { answers: answersArray }
    })
  } catch (error) {
    console.error('Failed to save progress:', error)
  }
}

const submitResponse = async () => {
  // Validate all answered
  const unansweredCount = questions.value.filter(q => !answers.value[q.id]).length
  if (unansweredCount > 0) {
    alert(`Harap jawab semua pertanyaan. ${unansweredCount} pertanyaan belum dijawab.`)
    return
  }

  submitting.value = true
  const answersArray = Object.keys(answers.value).map(questionId => ({
    questionId,
    answer: answers.value[questionId],
    answeredAt: new Date()
  }))

  try {
    const result = await $fetch(`/api/responses/${response.value.id}/submit`, {
      method: 'POST',
      body: { answers: answersArray }
    })
    router.push(`/questionnaires/${questionnaireId}/thank-you?honor=${result.data.honorAmount}`)
  } catch (error: any) {
    alert(error.data?.message || 'Gagal submit jawaban')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadQuestionnaire()

  // Auto-save every 30 seconds
  autoSaveInterval = setInterval(() => {
    saveProgress()
  }, 30000)
})

onUnmounted(() => {
  if (autoSaveInterval) {
    clearInterval(autoSaveInterval)
  }
})
</script>

<style scoped>
.options-list .form-check {
  padding: 12px;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  transition: all 0.2s;
}

.options-list .form-check:hover {
  background-color: #f8f9fa;
  border-color: #0d6efd;
}

.options-list .form-check-input:checked+.form-check-label {
  font-weight: 600;
}
</style>
