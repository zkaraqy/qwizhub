<template>
  <div class="draggable-question-list">
    <draggable 
      v-model="localQuestions"
      :disabled="disabled || reordering"
      @change="handleChange"
      handle=".drag-handle"
      item-key="id"
      :animation="200"
      ghost-class="ghost"
      drag-class="dragging"
    >
      <template #item="{ element: question, index }">
        <div class="question-wrapper">
          <slot :question="question" :index="index" :dragging="isDragging" />
        </div>
      </template>
    </draggable>

    <!-- Loading overlay -->
    <div v-if="reordering" class="reordering-overlay">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Menyimpan urutan...</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import draggable from 'vuedraggable'
import type { Question } from '~/types/questionnaire'
import { useQuestionOrdering } from '~/composables/useQuestionOrdering'
import Swal from 'sweetalert2'

interface Props {
  questions: Question[]
  questionnaireId: string
  disabled?: boolean
}

interface Emits {
  (e: 'update:questions', questions: Question[]): void
  (e: 'reordered', questions: Question[]): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { reordering, reorderQuestions } = useQuestionOrdering()
const isDragging = ref(false)

// Local copy of questions for v-model
const localQuestions = computed({
  get: () => props.questions,
  set: (value) => emit('update:questions', value)
})

/**
 * Handle drag change event
 */
const handleChange = async (evt: any) => {
  if (!evt.moved) return

  isDragging.value = false

  // Get new order
  const newOrder = localQuestions.value

  // Save to backend
  const success = await reorderQuestions(props.questionnaireId, newOrder)

  if (success) {
    // Success toast
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
    })

    Toast.fire({
      icon: 'success',
      title: 'Urutan pertanyaan berhasil diperbarui'
    })

    emit('reordered', newOrder)
  } else {
    // Revert on error
    Swal.fire({
      icon: 'error',
      title: 'Gagal Menyimpan',
      text: 'Terjadi kesalahan saat menyimpan urutan. Silakan coba lagi.',
      confirmButtonText: 'OK'
    })

    // Force refresh to revert
    emit('update:questions', [...props.questions])
  }
}

// Detect drag start
watch(() => reordering.value, (val) => {
  isDragging.value = val
})
</script>

<style scoped>
.draggable-question-list {
  position: relative;
}

.question-wrapper {
  margin-bottom: 1rem;
}

/* Ghost element while dragging */
.ghost {
  opacity: 0.5;
  background: #f8f9fa;
  border: 2px dashed #0d6efd;
}

/* Element being dragged */
.dragging {
  opacity: 0.8;
  transform: rotate(2deg);
  cursor: grabbing !important;
}

/* Loading overlay */
.reordering-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  border-radius: 0.5rem;
}
</style>
