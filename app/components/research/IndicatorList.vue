<template>
  <div class="indicator-list">
    <!-- Header with Actions -->
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h6 class="mb-0 fw-semibold">
        <i class="bi bi-list-check me-1"></i>
        Indikator ({{ indicators.length }})
      </h6>
      
      <div class="d-flex gap-2">
        <UiBaseButton
          v-if="hasPendingIndicators && !showForm"
          variant="success"
          size="sm"
          :loading="saving"
          @click="handleAcceptAll"
        >
          <i class="bi bi-check-all me-1"></i>
          Terima Semua
        </UiBaseButton>
        <UiBaseButton
          v-if="!showForm"
          variant="outline-primary"
          size="sm"
          :loading="generating"
          @click="handleGenerateAI"
        >
          <i class="bi bi-stars me-1"></i>
          Generate AI
        </UiBaseButton>
        <UiBaseButton
          v-if="!showForm"
          variant="outline-secondary"
          size="sm"
          @click="handleAddManual"
        >
          <i class="bi bi-plus-lg me-1"></i>
          Tambah Manual
        </UiBaseButton>
      </div>
    </div>

    <!-- Form Section -->
    <div v-if="showForm" class="mb-3">
      <div class="alert alert-info alert-sm">
        <i class="bi bi-info-circle me-2"></i>
        {{ formMode === 'create' ? 'Tambah indikator manual' : 'Edit indikator' }}
      </div>
      
      <ResearchIndicatorForm
        :indicator="editingIndicator"
        :mode="formMode"
        :saving="saving"
        @submit="handleFormSubmit"
        @cancel="handleFormCancel"
      />
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-3">
      <div class="spinner-border spinner-border-sm text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="indicators.length === 0 && !showForm" class="text-center py-3 text-muted">
      <i class="bi bi-list-ul" style="font-size: 2rem;"></i>
      <p class="mb-0 mt-2 small">Belum ada indikator</p>
    </div>

    <!-- Indicators List -->
    <div v-else-if="!showForm">
      <ResearchIndicatorCard
        v-for="indicator in indicators"
        :key="indicator.id"
        :indicator="indicator"
        @accept="handleAccept(indicator.id)"
        @reject="handleReject(indicator.id)"
        @edit="handleEdit(indicator)"
        @delete="handleDelete(indicator.id)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useIndicatorManager } from '~/composables/useIndicatorManager'
import type { VariableIndicator, CreateIndicatorData } from '~/types/research'
import Swal from 'sweetalert2'

interface Props {
  variableId: string
  questionnaireId: string
  indicators: VariableIndicator[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  refresh: []
}>()

const {
  loading,
  generating,
  saving,
  createIndicator,
  generateIndicators,
  updateIndicator,
  deleteIndicator,
  acceptIndicator,
  rejectIndicator,
  acceptAllIndicators
} = useIndicatorManager()

const showForm = ref(false)
const formMode = ref<'create' | 'edit'>('create')
const editingIndicator = ref<VariableIndicator | undefined>(undefined)

// Check if there are pending indicators
const hasPendingIndicators = computed(() => {
  return props.indicators.some(ind => ind.status === 'pending')
})

const handleAddManual = () => {
  showForm.value = true
  formMode.value = 'create'
  editingIndicator.value = undefined
}

const handleEdit = (indicator: VariableIndicator) => {
  showForm.value = true
  formMode.value = 'edit'
  editingIndicator.value = indicator
}

const handleFormSubmit = async (data: CreateIndicatorData) => {
  try {
    if (formMode.value === 'create') {
      await createIndicator(props.questionnaireId, props.variableId, data)
    } else if (editingIndicator.value) {
      await updateIndicator(
        props.questionnaireId,
        props.variableId,
        editingIndicator.value.id,
        data
      )
    }
    
    handleFormCancel()
    emit('refresh')
  } catch (err) {
    console.error('Failed to save indicator:', err)
  }
}

const handleFormCancel = () => {
  showForm.value = false
  formMode.value = 'create'
  editingIndicator.value = undefined
}

const handleGenerateAI = async () => {
  const { value: count } = await Swal.fire({
    title: 'Generate Indikator dengan AI',
    html: `
      <p>Berapa banyak indikator yang ingin di-generate?</p>
      <input type="range" id="count-range" min="4" max="6" value="5" class="form-range">
      <p class="mt-2"><strong id="count-display">5</strong> indikator</p>
    `,
    showCancelButton: true,
    confirmButtonText: 'Generate',
    cancelButtonText: 'Batal',
    didOpen: () => {
      const range = document.getElementById('count-range') as HTMLInputElement
      const display = document.getElementById('count-display')
      range?.addEventListener('input', () => {
        if (display) display.textContent = range.value
      })
    },
    preConfirm: () => {
      const range = document.getElementById('count-range') as HTMLInputElement
      return parseInt(range?.value || '5')
    }
  })

  if (count) {
    try {
      await generateIndicators(props.questionnaireId, props.variableId, count)
      emit('refresh')
    } catch (err) {
      console.error('Failed to generate indicators:', err)
    }
  }
}

const handleAccept = async (indicatorId: string) => {
  try {
    await acceptIndicator(props.questionnaireId, props.variableId, indicatorId)
    emit('refresh')
  } catch (err) {
    console.error('Failed to accept indicator:', err)
  }
}

const handleReject = async (indicatorId: string) => {
  try {
    await rejectIndicator(props.questionnaireId, props.variableId, indicatorId)
    emit('refresh')
  } catch (err) {
    console.error('Failed to reject indicator:', err)
  }
}

const handleDelete = async (indicatorId: string) => {
  try {
    const deleted = await deleteIndicator(props.questionnaireId, props.variableId, indicatorId)
    if (deleted) {
      emit('refresh')
    }
  } catch (err) {
    console.error('Failed to delete indicator:', err)
  }
}

const handleAcceptAll = async () => {
  try {
    const accepted = await acceptAllIndicators(props.questionnaireId, props.variableId)
    if (accepted) {
      emit('refresh')
    }
  } catch (err) {
    console.error('Failed to accept all indicators:', err)
  }
}
</script>
