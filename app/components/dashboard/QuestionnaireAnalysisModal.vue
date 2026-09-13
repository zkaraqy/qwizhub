<template>
  <div v-if="show" class="modal d-block modal-analysis-backdrop" tabindex="-1">
    <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content rounded-4 border-0 shadow-lg">
        <!-- Header -->
        <div class="modal-header border-bottom px-4 py-3 bg-light">
          <div class="d-flex align-items-center gap-3">
            <div class="analysis-icon bg-primary text-white rounded-3 p-2">
              <i class="bi bi-bar-chart-fill fs-5"></i>
            </div>
            <div>
              <div class="d-flex align-items-center gap-2">
                <h5 class="modal-title fw-bold text-dark mb-0">
                  {{ analysisData?.questionnaire?.topic || 'Analisis Kuesioner' }}
                </h5>
                <span v-if="analysisData?.questionnaire?.status" class="badge"
                  :class="analysisData.questionnaire.status === 'published' ? 'bg-success' : 'bg-secondary'">
                  {{ analysisData.questionnaire.status === 'published' ? 'Aktif' : 'Draft' }}
                </span>
              </div>
              <small class="text-muted">
                Proyek: {{ analysisData?.questionnaire?.projectTitle || '-' }}
              </small>
            </div>
          </div>

          <!-- Quick Action Buttons inside Header -->
          <div class="d-flex align-items-center gap-2">
            <div class="btn-group">
              <button
                class="btn btn-sm btn-outline-success d-flex align-items-center gap-1"
                :disabled="exporting || !analysisData?.summary?.totalResponses"
                @click="triggerExport('excel')"
              >
                <i class="bi bi-file-earmark-excel"></i>
                <span v-if="exporting && exportFormat === 'excel'" class="spinner-border spinner-border-sm"></span>
                <span v-else>Excel</span>
              </button>
              <button
                class="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                :disabled="exporting || !analysisData?.summary?.totalResponses"
                @click="triggerExport('csv')"
              >
                <i class="bi bi-file-earmark-text"></i>
                <span v-if="exporting && exportFormat === 'csv'" class="spinner-border spinner-border-sm"></span>
                <span v-else>CSV</span>
              </button>
            </div>
            <button type="button" class="btn-close" @click="$emit('close')"></button>
          </div>
        </div>

        <!-- Body -->
        <div class="modal-body p-4">
          <!-- Loading State -->
          <div v-if="loading" class="text-center py-5">
            <div class="spinner-border text-primary mb-3" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            <p class="text-muted">Memuat data analisis kuesioner...</p>
          </div>

          <!-- Error State -->
          <div v-else-if="error" class="alert alert-danger">
            <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ error }}
          </div>

          <!-- Content -->
          <div v-else-if="analysisData">
            <!-- Objective Info -->
            <div v-if="analysisData.questionnaire.researchObjective" class="alert alert-light border mb-4">
              <small class="fw-bold text-uppercase text-muted d-block mb-1" style="font-size: 0.72rem;">Tujuan Penelitian</small>
              <p class="mb-0 text-dark small">{{ analysisData.questionnaire.researchObjective }}</p>
            </div>

            <!-- Summary KPI Cards -->
            <div class="row g-3 mb-4">
              <div class="col-md-3 col-6">
                <div class="kpi-card p-3 rounded-3 bg-light border">
                  <span class="text-muted small d-block mb-1">Total Respons</span>
                  <h3 class="fw-bold mb-0 text-primary">{{ analysisData.summary.totalResponses }}</h3>
                  <small class="text-muted">Target: {{ analysisData.questionnaire.targetRespondents || 'Tidak dibatasi' }}</small>
                </div>
              </div>
              <div class="col-md-3 col-6">
                <div class="kpi-card p-3 rounded-3 bg-light border">
                  <span class="text-muted small d-block mb-1">Respons Selesai</span>
                  <h3 class="fw-bold mb-0 text-success">{{ analysisData.summary.completedResponses }}</h3>
                  <small class="text-muted">{{ analysisData.summary.inProgressResponses }} sedang mengisi</small>
                </div>
              </div>
              <div class="col-md-3 col-6">
                <div class="kpi-card p-3 rounded-3 bg-light border">
                  <span class="text-muted small d-block mb-1">Completion Rate</span>
                  <h3 class="fw-bold mb-0 text-info">{{ analysisData.summary.completionRate }}%</h3>
                  <div class="progress mt-1" style="height: 4px;">
                    <div class="progress-bar bg-info" :style="{ width: `${analysisData.summary.completionRate}%` }"></div>
                  </div>
                </div>
              </div>
              <div class="col-md-3 col-6">
                <div class="kpi-card p-3 rounded-3 bg-light border">
                  <span class="text-muted small d-block mb-1">Rata-rata Waktu</span>
                  <h3 class="fw-bold mb-0 text-warning">{{ formatDuration(analysisData.summary.avgTimeSpentSeconds) }}</h3>
                  <small class="text-muted">durasi pengerjaan</small>
                </div>
              </div>
            </div>

            <!-- No Responses Warning -->
            <div v-if="analysisData.summary.totalResponses === 0" class="text-center py-5 border rounded-3 bg-light mb-4">
              <i class="bi bi-inbox fs-1 text-muted opacity-50 mb-2"></i>
              <h6 class="fw-bold text-muted">Belum ada respons yang masuk</h6>
              <p class="text-muted small mb-0">Statistik jawaban akan muncul di sini setelah ada responden yang mengisi kuesioner.</p>
            </div>

            <!-- Questions Breakdown List -->
            <div v-else>
              <h6 class="fw-bold text-dark mb-3">
                <i class="bi bi-list-check me-2 text-primary"></i>Distribusi Jawaban per Pertanyaan ({{ analysisData.questionsAnalysis.length }})
              </h6>

              <div class="d-flex flex-column gap-3">
                <div
                  v-for="(qa, idx) in analysisData.questionsAnalysis"
                  :key="qa.id"
                  class="card border shadow-sm rounded-3 p-3 question-analysis-card"
                >
                  <!-- Question Header -->
                  <div class="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <span class="badge bg-light text-dark border me-2">No. {{ idx + 1 }}</span>
                      <span class="badge bg-secondary-subtle text-secondary me-2">{{ getQuestionTypeBadge(qa.questionType) }}</span>
                      <span v-if="qa.averageScore !== null" class="badge bg-warning-subtle text-dark border border-warning-subtle">
                        ⭐ Skor Rata-rata: {{ qa.averageScore }}
                      </span>
                    </div>
                    <small class="text-muted">{{ qa.totalAnswered }} dijawab ({{ qa.responseRate }}%)</small>
                  </div>

                  <h6 class="fw-semibold text-dark mb-3">{{ qa.questionText }}</h6>

                  <!-- Choice / Likert / Scale / Checkbox Distribution -->
                  <div v-if="qa.breakdown && qa.breakdown.length > 0" class="options-distribution">
                    <div v-for="opt in qa.breakdown" :key="opt.label" class="mb-2">
                      <div class="d-flex justify-content-between align-items-center mb-1 small">
                        <span class="text-dark fw-medium">{{ opt.label }}</span>
                        <span class="text-muted">
                          <strong>{{ opt.count }}</strong> pemilih ({{ opt.percentage }}%)
                        </span>
                      </div>
                      <div class="progress rounded-pill" style="height: 8px;">
                        <div
                          class="progress-bar"
                          :class="getProgressColor(opt.percentage)"
                          :style="{ width: `${opt.percentage}%` }"
                        ></div>
                      </div>
                    </div>
                  </div>

                  <!-- Text Answers Sample -->
                  <div v-else-if="qa.sampleTextAnswers && qa.sampleTextAnswers.length > 0" class="text-answers-section mt-2">
                    <small class="text-muted fw-bold d-block mb-2">Sampel Jawaban Terbuka ({{ qa.sampleTextAnswers.length }} dari {{ qa.totalTextAnswersCount }}):</small>
                    <div class="d-flex flex-column gap-2">
                      <div
                        v-for="(ans, aIdx) in qa.sampleTextAnswers"
                        :key="aIdx"
                        class="p-2 rounded bg-light border-start border-3 border-primary small text-muted fst-italic"
                      >
                        "{{ ans }}"
                      </div>
                    </div>
                  </div>

                  <!-- No Answers yet for this question -->
                  <div v-else class="text-muted small fst-italic">
                    Belum ada jawaban untuk pertanyaan ini.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="modal-footer border-top bg-light">
          <button type="button" class="btn btn-secondary px-4 rounded-3" @click="$emit('close')">
            Tutup
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  show: boolean
  questionnaireId: string | null
}

const props = defineProps<Props>()
defineEmits(['close'])

const loading = ref(false)
const error = ref<string | null>(null)
const analysisData = ref<any>(null)
const exporting = ref(false)
const exportFormat = ref<'excel' | 'csv' | null>(null)

const fetchAnalysis = async (id: string) => {
  loading.value = true
  error.value = null
  try {
    const data = await $fetch<any>(`/api/questionnaires/${id}/analysis`)
    if (data.success) {
      analysisData.value = data
    } else {
      error.value = data.message || 'Gagal memuat data'
    }
  } catch (err: any) {
    error.value = err.data?.statusMessage || err.message || 'Gagal memuat analisis kuesioner'
  } finally {
    loading.value = false
  }
}

watch(
  () => [props.show, props.questionnaireId],
  ([show, id]) => {
    if (show && id) {
      fetchAnalysis(id as string)
    } else {
      analysisData.value = null
      error.value = null
    }
  }
)

const triggerExport = async (format: 'excel' | 'csv') => {
  if (!props.questionnaireId) return
  exporting.value = true
  exportFormat.value = format

  try {
    const url = `/api/dashboard/peneliti/export?questionnaireId=${props.questionnaireId}&format=${format}`
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', '')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (err: any) {
    alert(err.message || 'Gagal mengekspor data')
  } finally {
    setTimeout(() => {
      exporting.value = false
      exportFormat.value = null
    }, 1000)
  }
}

const formatDuration = (seconds?: number) => {
  if (!seconds || seconds <= 0) return '-'
  if (seconds < 60) return `${seconds} dtk`
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes} mnt`
}

const getQuestionTypeBadge = (type: string) => {
  const map: Record<string, string> = {
    multiple_choice: 'Pilihan Ganda',
    checkbox: 'Checklist',
    likert: 'Skala Likert',
    rating_scale: 'Rating Scale',
    text: 'Teks Terbuka',
    closed: 'Tertutup',
    dropdown: 'Dropdown',
    filter: 'Filter'
  }
  return map[type] || type
}

const getProgressColor = (percentage: number) => {
  if (percentage >= 50) return 'bg-success'
  if (percentage >= 25) return 'bg-primary'
  if (percentage >= 10) return 'bg-info'
  return 'bg-secondary'
}
</script>

<style scoped>
.modal-analysis-backdrop {
  background: rgba(14, 59, 67, 0.45);
  backdrop-filter: blur(4px);
  z-index: 1055;
}

.analysis-icon {
  background: #0E3B43 !important;
}

.question-analysis-card {
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.question-analysis-card:hover {
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.06) !important;
}

.kpi-card {
  transition: all 0.2s ease;
}

.kpi-card:hover {
  background: #ffffff !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}
</style>
