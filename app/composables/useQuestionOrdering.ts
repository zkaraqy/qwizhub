import { ref } from 'vue'
import type { Question } from '~/types/questionnaire'

interface QuestionOrder {
  id: string
  orderIndex: number
}

export const useQuestionOrdering = () => {
  const reordering = ref(false)
  const error = ref<string | null>(null)

  /**
   * Reorder questions by sending new order to backend
   */
  const reorderQuestions = async (
    questionnaireId: string,
    questions: Question[]
  ): Promise<boolean> => {
    reordering.value = true
    error.value = null

    try {
      // Build payload with new order indices
      const questionOrders: QuestionOrder[] = questions.map((q, index) => ({
        id: q.id,
        orderIndex: index + 1 // 1-based index
      }))

      // Call reorder API
      await $fetch(`/api/questions/reorder`, {
        method: 'POST',
        body: {
          questionnaireId,
          questionOrders
        }
      })

      // Success
      return true
    } catch (err: any) {
      error.value = err.message || 'Gagal menyimpan urutan pertanyaan'
      console.error('Reorder failed:', err)
      return false
    } finally {
      reordering.value = false
    }
  }

  return {
    reordering,
    error,
    reorderQuestions
  }
}
