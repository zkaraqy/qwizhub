<template>
  <UiBaseModal
    :show="show"
    title="Petakan ke Indikator"
    size="lg"
    @close="emit('closed')"
  >
    <template #body>
      <!-- Search -->
      <div class="mb-3">
        <input
          v-model="searchQuery"
          type="text"
          class="form-control"
          placeholder="Cari indikator..."
        />
      </div>

      <!-- Current Mapping -->
      <div v-if="currentIndicatorId" class="alert alert-info">
        <i class="bi bi-link-45deg me-2"></i>
        Saat ini dipetakan ke indikator
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-4">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>

      <!-- Variables with Indicators -->
      <div v-else-if="variables.length > 0" class="variables-list">
        <div
          v-for="variable in filteredVariables"
          :key="variable.id"
          class="variable-section mb-4"
        >
          <h6 class="fw-bold text-primary mb-3">
            <i class="bi bi-folder2-open me-2"></i>
            {{ variable.variableName }}
          </h6>

          <div v-if="variable.indicators && variable.indicators.length > 0">
            <div
              v-for="indicator in variable.indicators"
              :key="indicator.id"
              class="indicator-item mb-2"
              :class="{ 'selected': selectedIndicatorId === indicator.id }"
              @click="handleSelectIndicator(indicator.id)"
            >
              <div class="d-flex align-items-start">
                <input
                  type="radio"
                  :checked="selectedIndicatorId === indicator.id"
                  class="form-check-input me-2 mt-1"
                  @click.stop
                />
                <div class="flex-grow-1">
                  <p class="mb-1">{{ indicator.indicatorText }}</p>
                  <div class="d-flex gap-2">
                    <span :class="getStatusBadgeClass(indicator.status)" class="badge badge-sm">
                      {{ getIndicatorStatusLabel(indicator.status) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <p v-else class="text-muted small mb-0">Belum ada indikator</p>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-4">
        <i class="bi bi-inbox text-muted" style="font-size: 3rem;"></i>
        <p class="text-muted mt-3 mb-0">Belum ada variabel dengan indikator</p>
      </div>
    </template>

    <template #footer>
      <UiBaseButton variant="outline-secondary" @click="emit('closed')">
        Batal
      </UiBaseButton>
      <UiBaseButton
        variant="primary"
        :loading="mapping"
        :disabled="!selectedIndicatorId"
        @click="handleSave"
      >
        <i class="bi bi-check-lg me-1"></i>
        Simpan Pemetaan
      </UiBaseButton>
    </template>
  </UiBaseModal>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useVariableManager } from '~/composables/useVariableManager'
import { useQuestionEnhancement } from '~/composables/useQuestionEnhancement'
import type { ResearchVariable } from '~/types/research'
import { getIndicatorStatusLabel } from '~/types/research'

interface Props {
  show: boolean
  questionId: string
  questionnaireId: string
  currentIndicatorId?: string | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  saved: []
  closed: []
}>()

const { variables, loading, fetchVariables } = useVariableManager()
const { mapping, mapIndicator } = useQuestionEnhancement()

const searchQuery = ref('')
const selectedIndicatorId = ref<string | null>(null)

// Initialize selected indicator
watch(() => props.currentIndicatorId, (newId) => {
  if (newId) {
    selectedIndicatorId.value = newId
  }
}, { immediate: true })

// Load variables when modal opens
watch(() => props.show, async (show) => {
  if (show) {
    await fetchVariables(props.questionnaireId)
  }
})

onMounted(async () => {
  if (props.show) {
    await fetchVariables(props.questionnaireId)
  }
})

const filteredVariables = computed(() => {
  if (!searchQuery.value) return variables.value

  const query = searchQuery.value.toLowerCase()
  return variables.value
    .map(variable => ({
      ...variable,
      indicators: variable.indicators?.filter(indicator =>
        indicator.indicatorText.toLowerCase().includes(query)
      )
    }))
    .filter(variable => 
      variable.variableName.toLowerCase().includes(query) ||
      (variable.indicators && variable.indicators.length > 0)
    )
})

const handleSelectIndicator = (indicatorId: string) => {
  selectedIndicatorId.value = indicatorId
}

const handleSave = async () => {
  if (!selectedIndicatorId.value) return

  try {
    await mapIndicator(props.questionnaireId, props.questionId, selectedIndicatorId.value)
    emit('saved')
    emit('closed')
  } catch (err) {
    console.error('Failed to map indicator:', err)
  }
}

const getStatusBadgeClass = (status: string): string => {
  const classes: Record<string, string> = {
    pending: 'bg-warning text-dark',
    accepted: 'bg-success',
    rejected: 'bg-danger'
  }
  return classes[status] || 'bg-secondary'
}
</script>

<style scoped>
.indicator-item {
  padding: 0.75rem;
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.indicator-item:hover {
  background: #f8f9fa;
  border-color: #0d6efd;
}

.indicator-item.selected {
  background: #e7f1ff;
  border-color: #0d6efd;
}

.variable-section {
  border-bottom: 1px solid #dee2e6;
  padding-bottom: 1rem;
}

.variable-section:last-child {
  border-bottom: none;
}
</style>
