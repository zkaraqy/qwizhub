<template>
  <div class="question-review-panel">
    <UiBaseCard :shadow="true">
      <template #header>
        <div class="d-flex justify-content-between align-items-center">
          <h6 class="mb-0 fw-bold">
            <i class="bi bi-shield-check me-2"></i>
            Review Kualitas Pertanyaan
          </h6>
          <UiBaseButton
            v-if="!review"
            variant="primary"
            size="sm"
            :loading="reviewing"
            @click="handleReview"
          >
            <i class="bi bi-magic me-1"></i>
            Review dengan AI
          </UiBaseButton>
        </div>
      </template>

      <!-- Loading State -->
      <div v-if="reviewing" class="text-center py-4">
        <div class="spinner-border text-primary mb-3" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="text-muted mb-0">Menganalisis pertanyaan dengan AI...</p>
        <small class="text-muted">Ini mungkin memakan waktu beberapa detik</small>
      </div>

      <!-- Empty State -->
      <div v-else-if="!review" class="text-center py-4">
        <i class="bi bi-clipboard-check text-muted" style="font-size: 3rem;"></i>
        <p class="text-muted mt-3 mb-0">
          Belum ada review. Klik tombol "Review dengan AI" untuk menganalisis kualitas pertanyaan.
        </p>
      </div>

      <!-- Review Results -->
      <div v-else>
        <!-- Quality Score -->
        <div class="mb-4">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="fw-semibold">Skor Kualitas <i v-if="review.score < 7" :class="review.hasIssues ? 'bi bi-exclamation-triangle text-warning' : 'bi bi-check-circle'" class="me-2"></i></span>
            <span :class="`badge bg-${getQualityScoreColor(review.score)}`">
              {{ review.score }}/10
            </span>
          </div>
          <div class="progress" style="height: 8px;">
            <div
              class="progress-bar"
              :class="`bg-${getQualityScoreColor(review.score)}`"
              :style="{ width: `${review.score * 10}%` }"
              role="progressbar"
            ></div>
          </div>
          <small class="text-muted">{{ getQualityScoreLabel(review.score) }}</small>
        </div>

        <!-- Issues Detected -->
        <div v-if="review.hasIssues" class="issues-section">
          <h6 class="fw-bold mb-3">
            <i class="bi bi-bug me-2"></i>
            Masalah yang Terdeteksi
          </h6>

          <!-- Bias -->
          <div v-if="review.issues.bias.detected" class="issue-card mb-3">
            <div class="d-flex align-items-start">
              <i class="bi bi-exclamation-circle text-danger me-2 mt-1"></i>
              <div>
                <strong class="text-danger">Bias Terdeteksi</strong>
                <p class="mb-0 small text-muted mt-1">{{ review.issues.bias.note }}</p>
              </div>
            </div>
          </div>

          <!-- Ambiguity -->
          <div v-if="review.issues.ambiguity.detected" class="issue-card mb-3">
            <div class="d-flex align-items-start">
              <i class="bi bi-question-circle text-warning me-2 mt-1"></i>
              <div>
                <strong class="text-warning">Ambiguitas Terdeteksi</strong>
                <p class="mb-0 small text-muted mt-1">{{ review.issues.ambiguity.note }}</p>
              </div>
            </div>
          </div>

          <!-- Double-barreled -->
          <div v-if="review.issues.doubleBarreled.detected" class="issue-card mb-3">
            <div class="d-flex align-items-start">
              <i class="bi bi-arrow-left-right text-info me-2 mt-1"></i>
              <div>
                <strong class="text-info">Pertanyaan Ganda (Double-barreled)</strong>
                <p class="mb-0 small text-muted mt-1">{{ review.issues.doubleBarreled.note }}</p>
              </div>
            </div>
          </div>

          <!-- Redundancy -->
          <div v-if="review.issues.redundancy.detected" class="issue-card mb-3">
            <div class="d-flex align-items-start">
              <i class="bi bi-files text-secondary me-2 mt-1"></i>
              <div>
                <strong class="text-secondary">Redundansi Terdeteksi</strong>
                <p class="mb-0 small text-muted mt-1">{{ review.issues.redundancy.note }}</p>
              </div>
            </div>
          </div>

          <!-- Option Issues -->
          <div v-if="review.issues.optionIssues?.detected" class="issue-card mb-3">
            <div class="d-flex align-items-start">
              <i class="bi bi-list-check text-warning me-2 mt-1"></i>
              <div>
                <strong class="text-warning">Masalah Opsi Jawaban</strong>
                <p class="mb-0 small text-muted mt-1">{{ review.issues.optionIssues.note }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- No Issues -->
        <div v-else class="text-center py-3">
          <i class="bi bi-check-circle-fill text-success" style="font-size: 3rem;"></i>
          <p class="text-muted mt-2 mb-0">Tidak ada masalah terdeteksi</p>
        </div>

        <!-- Actions -->
        <div class="mt-3">
          <UiBaseButton
            variant="outline-primary"
            size="sm"
            :loading="reviewing"
            @click="handleReview"
          >
            <i class="bi bi-arrow-clockwise me-1"></i>
            Review Ulang
          </UiBaseButton>
        </div>
      </div>
    </UiBaseCard>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useQuestionEnhancement } from '~/composables/useQuestionEnhancement'
import type { QuestionReview } from '~/types/research'
import { getQualityScoreColor, getQualityScoreLabel } from '~/types/research'

interface Props {
  questionId: string
  questionnaireId: string
  currentReview?: QuestionReview | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'review-updated': [review: QuestionReview]
}>()

const { reviewing, reviewQuestion } = useQuestionEnhancement()

const review = ref<QuestionReview | null>(null)

// Load existing review if available - sync with prop always
watch(() => props.currentReview, (newReview) => {
  review.value = newReview || null
}, { immediate: true })

const handleReview = async () => {
  try {
    const result = await reviewQuestion(props.questionnaireId, props.questionId)
    if (result) {
      review.value = result
      // Emit event to parent to update question object
      emit('review-updated', result)
    }
  } catch (err) {
    console.error('Failed to review question:', err)
  }
}
</script>

<style scoped>
.issue-card {
  background: #f8f9fa;
  border-radius: 0.5rem;
  padding: 1rem;
  border-left: 3px solid currentColor;
}
</style>

