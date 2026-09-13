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
import { useRouter } from 'vue-router'
import { useIndicatorManager } from '~/composables/useIndicatorManager'
import { useAITokens } from '~/composables/useAITokens'
import type { VariableIndicator, CreateIndicatorData } from '~/types/research'
import Swal from 'sweetalert2'

interface Props {
  variableId: string
  questionnaireId: string
  indicators: VariableIndicator[]
}

const props = defineProps<Props>()
const router = useRouter()

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

const { balance, fetchBalance } = useAITokens()

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
  // Check token balance before generating
  if (balance.value < 1) {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Saldo Token AI Habis',
      html: `
        <p class="mb-2">Anda membutuhkan <strong>1 Token AI</strong> untuk generate indikator variabel ini.</p>
        <p class="text-muted small">Saldo Anda saat ini: <strong>0 token</strong></p>
      `,
      showCancelButton: true,
      confirmButtonText: 'Top Up Token',
      confirmButtonColor: '#137A7F',
      cancelButtonText: 'Batal'
    })
    if (result.isConfirmed) {
      router.push('/payments')
    }
    return
  }

  const { value: count } = await Swal.fire({
    title: 'Generate Indikator dengan AI',
    html: `
      <div class="text-start mb-3">
        <div class="d-inline-flex align-items-center gap-1 px-2 py-1 rounded bg-light border text-primary small fw-semibold">
          <span>⚡ Biaya: <strong id="cost-display">5</strong> Token AI (1 token / indikator)</span>
          <span class="text-muted ms-1">(Saldo Anda: ${balance.value} token)</span>
        </div>
      </div>
      <div class="mb-2 text-start">
        <label for="count-range" class="form-label fw-semibold small mb-1 d-flex justify-content-between">
          <span>Jumlah Indikator yang Di-generate:</span>
          <span id="count-display" class="badge bg-primary fs-6">5</span>
        </label>
        <input 
          type="range" 
          id="count-range" 
          min="2" 
          max="10" 
          value="5" 
          step="1"
          class="form-range"
        />
        <div class="d-flex justify-content-between text-muted small" style="font-size: 0.75rem;">
          <span>2 (Min)</span>
          <span>5 (Rekomendasi)</span>
          <span>10 (Maks)</span>
        </div>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: 'Generate (Gunakan 5 Token)',
    confirmButtonColor: '#137A7F',
    cancelButtonText: 'Batal',
    didOpen: () => {
      const range = document.getElementById('count-range') as HTMLInputElement
      const display = document.getElementById('count-display')
      const costDisplay = document.getElementById('cost-display')
      const confirmBtn = document.querySelector('.swal2-confirm') as HTMLButtonElement
      range?.addEventListener('input', () => {
        const val = range.value
        if (display) display.textContent = val
        if (costDisplay) costDisplay.textContent = val
        if (confirmBtn) confirmBtn.textContent = `Generate (Gunakan ${val} Token)`
      })
    },
    preConfirm: () => {
      const range = document.getElementById('count-range') as HTMLInputElement
      const c = parseInt(range?.value || '5', 10)
      if (c > balance.value) {
        Swal.showValidationMessage(`Saldo token Anda (${balance.value}) tidak mencukupi untuk generate ${c} indikator.`)
        return false
      }
      return c
    }
  })

  if (count) {
    try {
      await generateIndicators(props.questionnaireId, props.variableId, count)
      await fetchBalance()
      emit('refresh')
    } catch (err) {
      await fetchBalance()
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
