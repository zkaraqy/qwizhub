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
import { useVariableManager } from '~/composables/useVariableManager'
import type { ResearchVariable, CreateVariableData } from '~/types/research'
import Swal from 'sweetalert2'

interface Props {
  questionnaireId: string
}

const props = defineProps<Props>()

const {
  variables,
  loading,
  saving,
  fetchVariables,
  createVariable,
  updateVariable,
  deleteVariable
} = useVariableManager()

const showForm = ref(false)
const formMode = ref<'create' | 'edit'>('create')
const editingVariable = ref<ResearchVariable | undefined>(undefined)
const expandedVariableId = ref<string | null>(null)

onMounted(async () => {
  await fetchVariables(props.questionnaireId)
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
  const { value: count } = await Swal.fire({
    title: 'Generate Indikator dengan AI',
    text: `Berapa banyak indikator yang ingin di-generate untuk "${variable.variableName}"?`,
    icon: 'question',
    input: 'range',
    inputAttributes: {
      min: '3',
      max: '8',
      step: '1'
    },
    inputValue: 5,
    showCancelButton: true,
    confirmButtonText: 'Generate',
    cancelButtonText: 'Batal'
  })

  if (count) {
    try {
      // Show loading
      Swal.fire({
        title: 'Generating...',
        text: 'AI sedang membuat indikator...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading()
        }
      })

      // Call API to generate indicators
      await $fetch(`/api/questionnaires/${props.questionnaireId}/variables/${variable.id}/generate-indicators`, {
        method: 'POST',
        body: { count }
      })

      // Refresh data
      await fetchVariables(props.questionnaireId)
      
      // Expand to show results
      expandedVariableId.value = variable.id
      
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: `Indikator telah di-generate`,
        timer: 2000,
        showConfirmButton: false
      })
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal Generate',
        text: err.data?.statusMessage || 'Terjadi kesalahan'
      })
    }
  }
}

const handleRefreshVariable = async (variableId: string) => {
  await fetchVariables(props.questionnaireId)
}
</script>
