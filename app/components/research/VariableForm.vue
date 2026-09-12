<template>
  <div class="mb-3">
    <label class="form-label fw-semibold">
      Nama Variabel <span class="text-danger">*</span>
    </label>
    <input
      v-model="formData.variableName"
      type="text"
      class="form-control"
      :class="{ 'is-invalid': errors.name }"
      placeholder="Contoh: Kepuasan Pelanggan"
      required
    />
    <div v-if="errors.name" class="invalid-feedback">{{ errors.name }}</div>
  </div>

  <div class="mb-3">
    <label class="form-label fw-semibold">
      Tipe Variabel <span class="text-danger">*</span>
    </label>
    <select
      v-model="formData.variableType"
      class="form-select"
      :class="{ 'is-invalid': errors.variableType }"
      required
    >
      <option value="">Pilih Tipe Variabel</option>
      <option value="independent">Variabel Independen (X)</option>
      <option value="dependent">Variabel Dependen (Y)</option>
      <option value="moderating">Variabel Moderating (Z)</option>
      <option value="intervening">Variabel Intervening</option>
      <option value="control">Variabel Kontrol</option>
    </select>
    <div v-if="errors.variableType" class="invalid-feedback">{{ errors.variableType }}</div>
    <small v-if="formData.variableType" class="form-text text-muted">
      {{ getVariableTypeDescription(formData.variableType) }}
    </small>
  </div>

  <div class="mb-3">
    <label class="form-label fw-semibold">Deskripsi</label>
    <textarea
      v-model="formData.description"
      class="form-control"
      rows="3"
      placeholder="Jelaskan definisi operasional variabel ini..."
    ></textarea>
  </div>

  <div class="d-flex gap-2">
    <UiBaseButton
      variant="primary"
      :loading="saving"
      @click="handleSubmit"
    >
      <i class="bi bi-check-lg me-1"></i>
      {{ mode === 'create' ? 'Tambah Variabel' : 'Update Variabel' }}
    </UiBaseButton>
    <UiBaseButton
      variant="outline-secondary"
      :disabled="saving"
      @click="handleCancel"
    >
      Batal
    </UiBaseButton>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { ResearchVariable, VariableType, CreateVariableData } from '~/types/research'
import { getVariableTypeDescription } from '~/types/research'

interface Props {
  variable?: ResearchVariable
  mode: 'create' | 'edit'
  saving?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variable: undefined,
  mode: 'create',
  saving: false
})

const emit = defineEmits<{
  submit: [data: CreateVariableData]
  cancel: []
}>()

const formData = ref<CreateVariableData>({
  variableName: '',
  description: '',
  variableType: '' as VariableType
})

const errors = ref<Record<string, string>>({})

// Populate form if editing
watch(() => props.variable, (newVariable) => {
  if (newVariable && props.mode === 'edit') {
    formData.value = {
      variableName: newVariable.variableName,
      description: newVariable.description || '',
      variableType: newVariable.variableType
    }
  }
}, { immediate: true })

const validateForm = (): boolean => {
  errors.value = {}
  
  if (!formData.value.variableName.trim()) {
    errors.value.name = 'Nama variabel harus diisi'
  }
  
  if (!formData.value.variableType) {
    errors.value.variableType = 'Tipe variabel harus dipilih'
  }
  
  return Object.keys(errors.value).length === 0
}

const handleSubmit = () => {
  if (validateForm()) {
    emit('submit', formData.value)
  }
}

const handleCancel = () => {
  emit('cancel')
}
</script>
