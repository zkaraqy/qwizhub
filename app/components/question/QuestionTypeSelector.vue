<template>
  <div class="question-type-selector">
    <select 
      v-model="selectedType" 
      class="form-select form-select-sm"
      @change="handleTypeChange"
      :disabled="disabled"
    >
      <option value="text">Pertanyaan Terbuka</option>
      <option value="closed">Pertanyaan Tertutup</option>
      <option value="mixed">Pertanyaan Campuran</option>
      <option value="likert">Skala Likert</option>
      <option value="multiple_choice">Pertanyaan Pilihan Ganda</option>
      <option value="checkbox">Checklist</option>
      <option value="rating_scale">Pertanyaan Skala Peringkat</option>
      <option value="filter">Pertanyaan Filter</option>
      <option value="dropdown">Dropdown</option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { QuestionType } from '~/types/questionnaire'
import { getTypeChangeWarning } from '~/utils/questionOptions'
import Swal from 'sweetalert2'

interface Props {
  currentType: QuestionType
  disabled?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'change': [newType: QuestionType]
}>()

const selectedType = ref<QuestionType>(props.currentType)

// Update selected type when prop changes
watch(() => props.currentType, (newType) => {
  selectedType.value = newType
})

async function handleTypeChange() {
  const newType = selectedType.value
  const oldType = props.currentType

  if (newType === oldType) return

  // Get warning message
  const warning = getTypeChangeWarning(oldType, newType)

  if (warning) {
    const result = await Swal.fire({
      title: 'Ubah Tipe Pertanyaan?',
      html: `
        <p class="mb-2"><strong>Dari:</strong> ${getQuestionTypeLabel(oldType)}</p>
        <p class="mb-3"><strong>Ke:</strong> ${getQuestionTypeLabel(newType)}</p>
        <div class="alert alert-warning mb-0">
          <i class="bi bi-exclamation-triangle me-2"></i>
          ${warning}
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Ubah',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#0d6efd'
    })

    if (result.isConfirmed) {
      emit('change', newType)
    } else {
      // Revert selection
      selectedType.value = oldType
    }
  } else {
    emit('change', newType)
  }
}

function getQuestionTypeLabel(type: QuestionType): string {
  const labels: Record<QuestionType, string> = {
    text: 'Pertanyaan Terbuka',
    closed: 'Pertanyaan Tertutup',
    mixed: 'Pertanyaan Campuran',
    likert: 'Skala Likert',
    multiple_choice: 'Pertanyaan Pilihan Ganda',
    checkbox: 'Checklist',
    rating_scale: 'Pertanyaan Skala Peringkat',
    filter: 'Pertanyaan Filter',
    dropdown: 'Dropdown'
  }
  return labels[type] || type
}
</script>

<style scoped>
.question-type-selector {
  min-width: 200px;
}
</style>
