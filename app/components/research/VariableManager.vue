<template>
  <UiBaseCard title="Variabel Penelitian" :shadow="true">
    <template #header>
      <div class="d-flex justify-content-between align-items-center">
        <h5 class="mb-0 fw-bold">
          <i class="bi bi-diagram-3 me-2"></i>
          Variabel Penelitian
        </h5>
        <UiBaseButton
          v-if="!showForm"
          variant="primary"
          size="sm"
          @click="handleAddNew"
        >
          <i class="bi bi-plus-lg me-1"></i>
          Tambah Variabel
        </UiBaseButton>
      </div>
    </template>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="text-muted mt-2">Memuat variabel...</p>
    </div>

    <!-- Form Section -->
    <div v-else-if="showForm" class="mb-4">
      <div class="alert alert-info">
        <i class="bi bi-info-circle me-2"></i>
        {{ formMode === 'create' ? 'Tambah variabel penelitian baru' : 'Edit variabel penelitian' }}
      </div>
      
      <ResearchVariableForm
        :variable="editingVariable"
        :mode="formMode"
        :saving="saving"
        @submit="handleFormSubmit"
        @cancel="handleFormCancel"
      />
    </div>

    <!-- Variables List -->
    <div v-else>
      <!-- Empty State -->
      <div v-if="variables.length === 0" class="text-center py-5">
        <i class="bi bi-diagram-3 text-muted" style="font-size: 4rem;"></i>
        <h5 class="text-muted mt-3">Belum Ada Variabel</h5>
        <p class="text-muted">
          Mulai dengan menambahkan variabel penelitian Anda
        </p>
        <UiBaseButton variant="primary" @click="handleAddNew">
          <i class="bi bi-plus-lg me-1"></i>
          Tambah Variabel Pertama
        </UiBaseButton>
      </div>

      <!-- Variables Cards -->
      <div v-else>
        <ResearchVariableCard
          v-for="variable in variables"
          :key="variable.id"
          :variable="variable"
          :expanded="expandedVariableId === variable.id"
          @edit="handleEdit(variable)"
          @delete="handleDelete(variable.id)"
          @generate-indicators="handleGenerateIndicators(variable)"
          @toggle="handleToggle(variable.id)"
        >
          <template #indicators>
            <ResearchIndicatorList
              :variable-id="variable.id"
              :questionnaire-id="questionnaireId"
              :indicators="variable.indicators || []"
              @refresh="handleRefreshVariable(variable.id)"
            />
          </template>
        </ResearchVariableCard>
      </div>
    </div>
  </UiBaseCard>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useVariableManager } from '~/composables/useVariableManager'
import { useAITokens } from '~/composables/useAITokens'
import type { ResearchVariable, CreateVariableData } from '~/types/research'
import Swal from 'sweetalert2'

interface Props {
  questionnaireId: string
}

const props = defineProps<Props>()
const router = useRouter()

const {
  variables,
  loading,
  saving,
  fetchVariables,
  createVariable,
  updateVariable,
  deleteVariable
} = useVariableManager()

const { balance, fetchBalance } = useAITokens()

const showForm = ref(false)
const formMode = ref<'create' | 'edit'>('create')
const editingVariable = ref<ResearchVariable | undefined>(undefined)
const expandedVariableId = ref<string | null>(null)

onMounted(async () => {
  await Promise.all([
    fetchVariables(props.questionnaireId),
    fetchBalance()
  ])
})

const handleAddNew = () => {
  showForm.value = true
  formMode.value = 'create'
  editingVariable.value = undefined
}

const handleEdit = (variable: ResearchVariable) => {
  showForm.value = true
  formMode.value = 'edit'
  editingVariable.value = variable
}

const handleFormSubmit = async (data: CreateVariableData) => {
  try {
    if (formMode.value === 'create') {
      await createVariable(props.questionnaireId, data)
    } else if (editingVariable.value) {
      await updateVariable(props.questionnaireId, editingVariable.value.id, data)
    }
    
    handleFormCancel()
    await fetchVariables(props.questionnaireId)
  } catch (err) {
    console.error('Failed to save variable:', err)
  }
}

const handleFormCancel = () => {
  showForm.value = false
  formMode.value = 'create'
  editingVariable.value = undefined
}

const handleDelete = async (variableId: string) => {
  await deleteVariable(props.questionnaireId, variableId)
  await fetchVariables(props.questionnaireId)
}

const handleToggle = (variableId: string) => {
  console.log('Toggling variable:', variableId)
  expandedVariableId.value = expandedVariableId.value === variableId ? null : variableId
}

const handleGenerateIndicators = async (variable: ResearchVariable) => {
  // Check token balance before opening generate modal
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
        <p class="mb-1 text-muted">Variabel: <strong>"${variable.variableName}"</strong></p>
        <div class="d-inline-flex align-items-center gap-1 px-2 py-1 rounded bg-light border text-primary small fw-semibold">
          <span>⚡ Biaya: <strong id="cost-display">5</strong> Token AI (1 token / indikator)</span>
          <span class="text-muted ms-1">(Saldo Anda: ${balance.value} token)</span>
        </div>
      </div>
      <div class="mb-2 text-start">
        <label for="swal-indicator-count" class="form-label fw-semibold small mb-1 d-flex justify-content-between">
          <span>Jumlah Indikator yang Di-generate:</span>
          <span id="count-display" class="badge bg-primary fs-6">5</span>
        </label>
        <input 
          type="range" 
          id="swal-indicator-count" 
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
    didOpen: () => {
      const range = document.getElementById('swal-indicator-count') as HTMLInputElement
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
      const range = document.getElementById('swal-indicator-count') as HTMLInputElement
      const c = parseInt(range?.value || '5', 10)
      if (c > balance.value) {
        Swal.showValidationMessage(`Saldo token Anda (${balance.value}) tidak mencukupi untuk generate ${c} indikator.`)
        return false
      }
      return c
    },
    showCancelButton: true,
    confirmButtonText: 'Generate (Gunakan 5 Token)',
    confirmButtonColor: '#137A7F',
    cancelButtonText: 'Batal'
  })

  if (count) {
    try {
      // Show loading
      Swal.fire({
        title: 'Generating...',
        text: `AI sedang membuat ${count} indikator...`,
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading()
        }
      })

      // Call API to generate indicators
      const res = await $fetch<{
        success: boolean
        message: string
        tokensDeducted: number
        remainingBalance: number
        indicators: any[]
      }>(`/api/questionnaires/${props.questionnaireId}/variables/${variable.id}/generate-indicators`, {
        method: 'POST',
        body: { count }
      })

      // Refresh variables & token balance
      await Promise.all([
        fetchVariables(props.questionnaireId),
        fetchBalance()
      ])
      
      // Expand to show results
      expandedVariableId.value = variable.id
      
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        html: `
          <p class="mb-1">${res.message || 'Indikator berhasil di-generate'}</p>
          <p class="text-muted small mb-0">Sisa saldo: <strong>${res.remainingBalance ?? balance.value} token</strong></p>
        `,
        timer: 3000,
        showConfirmButton: true,
        confirmButtonText: 'OK'
      })
    } catch (err: any) {
      await fetchBalance()
      Swal.fire({
        icon: 'error',
        title: 'Gagal Generate',
        text: err.data?.statusMessage || err.message || 'Terjadi kesalahan'
      })
    }
  }
}

const handleRefreshVariable = async (variableId: string) => {
  await fetchVariables(props.questionnaireId)
}
</script>
