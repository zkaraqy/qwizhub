<template>
  <div class="question-rewrite-panel">
    <UiBaseCard :shadow="true">
      <template #header>
        <div class="d-flex justify-content-between align-items-center">
          <h6 class="mb-0 fw-bold">
            <i class="bi bi-pencil-square me-2"></i>
            Saran Perbaikan Pertanyaan
          </h6>
          <UiBaseButton
            v-if="!rewrite"
            variant="primary"
            size="sm"
            :loading="rewriting"
            @click="handleRewrite"
          >
            <i class="bi bi-stars me-1"></i>
            Generate Saran
          </UiBaseButton>
        </div>
      </template>

      <!-- Loading State -->
      <div v-if="rewriting" class="text-center py-4">
        <div class="spinner-border text-primary mb-3" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="text-muted mb-0">Membuat saran perbaikan dengan AI...</p>
        <small class="text-muted">Ini mungkin memakan waktu beberapa detik</small>
      </div>

      <!-- Empty State -->
      <div v-else-if="!rewrite" class="text-center py-4">
        <i class="bi bi-lightbulb text-muted" style="font-size: 3rem;"></i>
        <p class="text-muted mt-3 mb-0">
          Belum ada saran. Klik tombol "Generate Saran" untuk mendapatkan alternatif perbaikan pertanyaan.
        </p>
      </div>

      <!-- Rewrite Results -->
      <div v-else>
        <!-- Rewrite Suggestions -->
        <div class="mb-4">
          <h6 class="fw-bold mb-3">
            <i class="bi bi-list-ol me-2"></i>
            Alternatif Pertanyaan ({{ rewrite.rewrites.length }})
          </h6>

          <div
            v-for="(suggestion, index) in rewrite.rewrites"
            :key="index"
            class="rewrite-card mb-3"
          >
            <div class="d-flex justify-content-between align-items-start mb-2">
              <div class="d-flex gap-2 align-items-center">
                <span class="badge bg-primary">{{ suggestion.version }}</span>
                <span class="badge bg-secondary">{{ getQuestionTypeLabel(suggestion.questionType) }}</span>
                <span v-if="suggestion.scaleType" class="badge bg-info">{{ suggestion.scaleType }}</span>
              </div>
              <UiBaseButton
                variant="success"
                size="sm"
                @click="handleApply(suggestion)"
              >
                <i class="bi bi-check-lg me-1"></i>
                Gunakan Ini
              </UiBaseButton>
            </div>
            
            <p class="fw-medium mb-2">{{ suggestion.questionText }}</p>
            
            <!-- Show options if available -->
            <div v-if="suggestion.options && suggestion.options.length > 0" class="options-preview mb-2">
              <small class="text-muted fw-semibold d-block mb-1">
                <i class="bi bi-list-ul me-1"></i>Opsi Jawaban:
              </small>
              <ul class="small mb-0">
                <li v-for="(opt, idx) in suggestion.options" :key="idx">{{ opt.label }}</li>
              </ul>
            </div>
            
            <div class="rationale">
              <small class="text-muted">
                <i class="bi bi-info-circle me-1"></i>
                <strong>Alasan:</strong> {{ suggestion.rationale }}
              </small>
            </div>
          </div>
        </div>

        <!-- Scale Recommendation -->
        <div v-if="rewrite.scaleRecommendation" class="scale-recommendation">
          <h6 class="fw-bold mb-3">
            <i class="bi bi-sliders me-2"></i>
            Rekomendasi Skala Pengukuran
          </h6>
          
          <div class="alert alert-info">
            <div class="d-flex align-items-start">
              <i class="bi bi-lightbulb-fill me-2 mt-1"></i>
              <div>
                <strong>Skala yang Direkomendasikan:</strong>
                <span class="badge bg-primary ms-2">{{ rewrite.scaleRecommendation.scaleType }}</span>
                <p class="mb-0 mt-2 small">{{ rewrite.scaleRecommendation.rationale }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="mt-3">
          <UiBaseButton
            variant="outline-primary"
            size="sm"
            :loading="rewriting"
            @click="handleRewrite"
          >
            <i class="bi bi-arrow-clockwise me-1"></i>
            Generate Ulang
          </UiBaseButton>
        </div>
      </div>
    </UiBaseCard>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useQuestionEnhancement } from '~/composables/useQuestionEnhancement'
import type { QuestionRewrite, RewriteSuggestion } from '~/types/research'
import Swal from 'sweetalert2'

interface Props {
  questionId: string
  questionnaireId: string
  currentText: string
  currentType: string
  currentOptions?: Array<{ value: string; label: string }>
  currentRewrites?: QuestionRewrite | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'apply-rewrite': [suggestion: RewriteSuggestion]
  'rewrite-updated': [rewrite: QuestionRewrite]
}>()

const { rewriting, rewriteQuestion } = useQuestionEnhancement()

const rewrite = ref<QuestionRewrite | null>(null)

// Load existing rewrites if available - sync with prop always
watch(() => props.currentRewrites, (newRewrites) => {
  rewrite.value = newRewrites || null
}, { immediate: true })

const handleRewrite = async () => {
  try {
    const result = await rewriteQuestion(props.questionnaireId, props.questionId)
    if (result) {
      rewrite.value = result
      // Emit event to parent to update question object
      emit('rewrite-updated', result)
    }
  } catch (err) {
    console.error('Failed to rewrite question:', err)
  }
}

const getQuestionTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    text: 'Terbuka',
    multiple_choice: 'Pilihan Ganda',
    checkbox: 'Checklist',
    dropdown: 'Dropdown',
    closed: 'Tertutup',
    mixed: 'Campuran',
    filter: 'Filter',
    likert: 'Likert',
    rating_scale: 'Rating Scale'
  }
  return labels[type] || type
}

const handleApply = async (suggestion: RewriteSuggestion) => {
  // Build comparison HTML
  let currentOptionsHtml = ''
  if (props.currentOptions && props.currentOptions.length > 0) {
    currentOptionsHtml = `
      <p class="mb-1 mt-2"><strong class="small">Opsi saat ini:</strong></p>
      <ul class="small text-start mb-0">
        ${props.currentOptions.map(opt => `<li>${opt.label}</li>`).join('')}
      </ul>
    `
  }

  let newOptionsHtml = ''
  if (suggestion.options && suggestion.options.length > 0) {
    newOptionsHtml = `
      <p class="mb-1 mt-2"><strong class="small">Opsi baru:</strong></p>
      <ul class="small text-start mb-0">
        ${suggestion.options.map(opt => `<li>${opt.label}</li>`).join('')}
      </ul>
    `
  }

  const result = await Swal.fire({
    title: 'Gunakan Saran Ini?',
    html: `
      <div class="text-start">
        <p class="mb-2"><strong>Tipe saat ini:</strong> <span class="badge bg-secondary">${getQuestionTypeLabel(props.currentType)}</span></p>
        <p class="mb-2"><strong>Tipe baru:</strong> <span class="badge bg-primary">${getQuestionTypeLabel(suggestion.questionType)}</span></p>
        
        <hr class="my-3">
        
        <p class="mb-2"><strong>Pertanyaan saat ini:</strong></p>
        <p class="text-muted small">${props.currentText}</p>
        ${currentOptionsHtml}
        
        <hr class="my-3">
        
        <p class="mb-2"><strong>Akan diubah menjadi:</strong></p>
        <p class="fw-medium small">${suggestion.questionText}</p>
        ${newOptionsHtml}
      </div>
    `,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Ya, Gunakan',
    cancelButtonText: 'Batal',
    confirmButtonColor: '#198754',
    width: '600px'
  })

  if (result.isConfirmed) {
    emit('apply-rewrite', suggestion)
  }
}

onMounted(() => {
  // If there's an existing rewrite, we can optionally auto-apply it or just display it
  if (rewrite.value && rewrite.value.rewrites.length > 0) {
    console.log('Existing rewrites loaded:', rewrite.value)
  }
})
</script>

<style scoped>
.options-preview {
  background: #f8f9fa;
  border-radius: 0.25rem;
  padding: 0.75rem;
  border-left: 3px solid #0d6efd;
}

.options-preview ul {
  padding-left: 1.25rem;
  margin-bottom: 0;
}

.rewrite-card {
  background: #f8f9fa;
  border-radius: 0.5rem;
  padding: 1rem;
  border: 1px solid #dee2e6;
  transition: all 0.2s ease;
}

.rewrite-card:hover {
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  border-color: #0d6efd;
}

.rationale {
  background: white;
  border-radius: 0.25rem;
  padding: 0.75rem;
  margin-top: 0.75rem;
}

.scale-recommendation {
  border-top: 1px solid #dee2e6;
  padding-top: 1rem;
  margin-top: 1rem;
}
</style>
