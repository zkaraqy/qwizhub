<template>
  <LayoutPrivateLayout :user="userProfile" active-item="projects" @logout="handleSignOut">
    <div class="row justify-content-center">
      <div class="col-md-10">
        <h1 class="mb-4">Generate Kuesioner dengan AI</h1>

        <div v-if="error" class="alert alert-danger alert-dismissible fade show">
          {{ error }}
          <button type="button" class="btn-close" @click="error = null"></button>
        </div>

        <div v-if="!generated">
          <form @submit.prevent="generateQuestionnaire">
            <div class="mb-3">
              <label for="topic" class="form-label">Topik Penelitian *</label>
              <input
                type="text"
                class="form-control"
                id="topic"
                v-model="form.topic"
                required
                maxlength="500"
                placeholder="Contoh: Pengaruh Media Sosial terhadap Kesehatan Mental Remaja"
              />
              <small class="text-muted">Minimal 10 karakter</small>
            </div>

            <div class="mb-3">
              <label for="researchObjective" class="form-label">Tujuan Penelitian *</label>
              <textarea
                class="form-control"
                id="researchObjective"
                v-model="form.researchObjective"
                required
                rows="4"
                maxlength="1000"
                placeholder="Jelaskan tujuan penelitian Anda secara detail..."
              ></textarea>
              <small class="text-muted">Minimal 20 karakter</small>
            </div>

            <div class="mb-3">
              <label class="form-label">Variabel yang Akan Diukur *</label>
              <div v-for="(variable, index) in form.variables" :key="index" class="input-group mb-2">
                <input
                  type="text"
                  class="form-control"
                  v-model="form.variables[index]"
                  :placeholder="`Variabel ${index + 1}`"
                  maxlength="200"
                />
                <button 
                  type="button" 
                  class="btn btn-outline-danger" 
                  @click="removeVariable(index)"
                  :disabled="form.variables.length === 1"
                >
                  Hapus
                </button>
              </div>
              <button 
                type="button" 
                class="btn btn-sm btn-outline-secondary" 
                @click="addVariable"
                :disabled="form.variables.length >= 10"
              >
                + Tambah Variabel
              </button>
              <small class="text-muted d-block mt-1">Maksimal 10 variabel</small>
            </div>

            <div class="d-flex gap-2">
              <button type="submit" class="btn btn-primary" :disabled="generating">
                <span v-if="generating" class="spinner-border spinner-border-sm me-2"></span>
                {{ generating ? 'Generating... (max 30s)' : 'Generate Kuesioner' }}
              </button>
              <NuxtLink :to="`/projects`" class="btn btn-outline-secondary">
                Kembali
              </NuxtLink>
            </div>
          </form>
        </div>

        <div v-else>
          <div class="alert alert-success">
            <strong>Berhasil!</strong> Kuesioner telah di-generate menggunakan {{ metadata.provider }}.
            <span v-if="metadata.fallbackUsed">(Fallback digunakan)</span>
          </div>

          <div class="card mb-3">
            <div class="card-header">
              <h5>Informasi Kuesioner</h5>
            </div>
            <div class="card-body">
              <p><strong>Topik:</strong> {{ questionnaire.topic }}</p>
              <p><strong>Tujuan:</strong> {{ questionnaire.researchObjective }}</p>
              <p><strong>Variabel:</strong> {{ questionnaire.variables.join(', ') }}</p>
              <p><strong>Jumlah Pertanyaan:</strong> {{ questions.length }}</p>
            </div>
          </div>

          <h4 class="mb-3">Pertanyaan yang Di-generate</h4>
          <div v-for="(question, index) in questions" :key="question.id" class="card mb-3">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start">
                <h6 class="mb-2">{{ index + 1 }}. {{ question.questionText }}</h6>
                <span v-if="question.biasDetected" class="badge bg-warning text-dark">
                  Bias Detected
                </span>
              </div>
              <p class="mb-1"><small class="text-muted">Tipe: {{ question.questionType }}</small></p>
              <p v-if="question.scaleType" class="mb-1">
                <small class="text-muted">Skala: {{ question.scaleType }}</small>
              </p>
              <div v-if="question.options && question.options.length > 0">
                <small class="text-muted">Opsi Jawaban:</small>
                <ul class="mb-0">
                  <li v-for="opt in question.options" :key="opt.value">{{ opt.label }}</li>
                </ul>
              </div>
              <div v-if="question.biasNotes" class="alert alert-warning mt-2 mb-0">
                <small><strong>Catatan Bias:</strong> {{ question.biasNotes }}</small>
              </div>
            </div>
          </div>

          <div class="d-flex gap-2 mt-4">
            <NuxtLink 
              :to="`/projects/${projectId}/questionnaire/${questionnaire.id}/edit`" 
              class="btn btn-primary"
            >
              Edit Pertanyaan
            </NuxtLink>
            <button @click="resetForm" class="btn btn-outline-secondary">
              Generate Ulang
            </button>
          </div>
        </div>
      </div>
    </div>
  </LayoutPrivateLayout>
</template>

<script setup lang="ts">
const route = useRoute()
const projectId = route.params.id as string
const { data: session, signOut } = useAuth()

const userProfile = computed(() => {
  if (!session.value?.user) return null
  return {
    id: session.value.user.id,
    name: session.value.user.name || '',
    email: session.value.user.email || '',
    image: session.value.user.image,
    role: session.value.user.role
  }
})

const handleSignOut = async () => {
  await signOut({ callbackUrl: '/login' })
}

const form = ref({
  topic: '',
  researchObjective: '',
  variables: ['']
})

const generating = ref(false)
const generated = ref(false)
const error = ref<string | null>(null)
const questionnaire = ref<any>(null)
const questions = ref<any[]>([])
const metadata = ref<any>(null)

function addVariable() {
  if (form.value.variables.length < 10) {
    form.value.variables.push('')
  }
}

function removeVariable(index: number) {
  if (form.value.variables.length > 1) {
    form.value.variables.splice(index, 1)
  }
}

async function generateQuestionnaire() {
  error.value = null
  generating.value = true

  try {
    const response = await $fetch('/api/questionnaires/generate', {
      method: 'POST',
      body: {
        projectId,
        topic: form.value.topic,
        researchObjective: form.value.researchObjective,
        variables: form.value.variables.filter(v => v.trim() !== '')
      }
    })

    questionnaire.value = response.questionnaire
    questions.value = response.questions
    metadata.value = response.metadata
    generated.value = true
  } catch (err: any) {
    error.value = err.data?.statusMessage || 'Gagal generate kuesioner'
  } finally {
    generating.value = false
  }
}

function resetForm() {
  generated.value = false
  questionnaire.value = null
  questions.value = []
  metadata.value = null
  form.value = {
    topic: '',
    researchObjective: '',
    variables: ['']
  }
}
</script>

