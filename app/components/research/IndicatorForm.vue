<template>
  <div class="mb-3">
    <label class="form-label fw-semibold">
      Teks Indikator <span class="text-danger">*</span>
    </label>
    <textarea
      v-model="formData.indicatorText"
      class="form-control"
      :class="{ 'is-invalid': errors.indicatorText }"
      rows="3"
      placeholder="Contoh: Tingkat kepuasan terhadap kualitas produk"
      required
    ></textarea>
    <div v-if="errors.indicatorText" class="invalid-feedback">{{ errors.indicatorText }}</div>
  </div>

  <div class="mb-3">
    <label class="form-label fw-semibold">Deskripsi (Opsional)</label>
    <textarea
      v-model="formData.description"
      class="form-control"
      rows="2"
      placeholder="Penjelasan tambahan tentang indikator ini..."
    ></textarea>
  </div>

  <div class="d-flex gap-2">
    <UiBaseButton
      variant="primary"
      :loading="saving"
      @click="handleSubmit"
    >
      <i class="bi bi-check-lg me-1"></i>
      {{ mode === 'create' ? 'Tambah Indikator' : 'Update Indikator' }}
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
import type { VariableIndicator, CreateIndicatorData } from '~/types/research'

interface Props {
  indicator?: VariableIndicator
  mode: 'create' | 'edit'
  saving?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  indicator: undefined,
  mode: 'create',
  saving: false
})

const emit = defineEmits<{
  submit: [data: CreateIndicatorData]
  cancel: []
}>()

const formData = ref<CreateIndicatorData>({
  indicatorText: '',
  description: ''
})

const errors = ref<Record<string, string>>({})

// Populate form if editing
watch(() => props.indicator, (newIndicator) => {
  if (newIndicator && props.mode === 'edit') {
    formData.value = {
      indicatorText: newIndicator.indicatorText,
      description: newIndicator.description || ''
    }
  }
}, { immediate: true })

const validateForm = (): boolean => {
  errors.value = {}
  
  if (!formData.value.indicatorText.trim()) {
    errors.value.indicatorText = 'Teks indikator harus diisi'
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
