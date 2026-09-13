import { ref } from 'vue'
import Swal from 'sweetalert2'
import type { QuestionReview, QuestionRewrite } from '~/types/research'

export const useQuestionEnhancement = () => {
  const reviewing = ref(false)
  const rewriting = ref(false)
  const mapping = ref(false)
  const error = ref<string | null>(null)

  /**
   * Review a question using AI
   */
  const reviewQuestion = async (
    questionnaireId: string,
    questionId: string
  ): Promise<QuestionReview | null> => {
    reviewing.value = true
    error.value = null
    
    try {
      const response = await $fetch(
        `/api/questionnaires/${questionnaireId}/questions/${questionId}/review`,
        { method: 'POST' }
      ) as any
      
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Review selesai (-5 token AI)',
        showConfirmButton: false,
        timer: 2000
      })

      // Refresh token balance in navbar/sidebar
      useAITokens().fetchBalance().catch(() => {})
      
      return response.review as QuestionReview
    } catch (err: any) {
      error.value = err.data?.statusMessage || 'Failed to review question'
      Swal.fire('Error', error.value!, 'error')
      throw err
    } finally {
      reviewing.value = false
    }
  }

  /**
   * Get rewrite suggestions for a question using AI
   */
  const rewriteQuestion = async (
    questionnaireId: string,
    questionId: string
  ): Promise<QuestionRewrite | null> => {
    rewriting.value = true
    error.value = null
    
    try {
      const response = await $fetch(
        `/api/questionnaires/${questionnaireId}/questions/${questionId}/rewrite`,
        { method: 'POST' }
      ) as any
      
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Saran perbaikan berhasil (-5 token AI)',
        showConfirmButton: false,
        timer: 2000
      })

      // Refresh token balance in navbar/sidebar
      useAITokens().fetchBalance().catch(() => {})
      
      return response.suggestions as QuestionRewrite
    } catch (err: any) {
      error.value = err.data?.statusMessage || 'Failed to rewrite question'
      Swal.fire('Error', error.value!, 'error')
      throw err
    } finally {
      rewriting.value = false
    }
  }

  /**
   * Map a question to an indicator
   */
  const mapIndicator = async (
    questionnaireId: string,
    questionId: string,
    indicatorId: string
  ) => {
    mapping.value = true
    error.value = null
    
    try {
      const response = await $fetch(
        `/api/questionnaires/${questionnaireId}/questions/${questionId}/map-indicator`,
        {
          method: 'POST',
          body: { indicatorId }
        }
      ) as any
      
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Pertanyaan berhasil dipetakan',
        showConfirmButton: false,
        timer: 2000
      })
      
      return response.question
    } catch (err: any) {
      error.value = err.data?.statusMessage || 'Failed to map indicator'
      Swal.fire('Error', error.value!, 'error')
      throw err
    } finally {
      mapping.value = false
    }
  }

  /**
   * Unmap indicator from a question
   */
  const unmapIndicator = async (
    questionnaireId: string,
    questionId: string
  ) => {
    mapping.value = true
    error.value = null
    
    try {
      const response = await $fetch(
        `/api/questionnaires/${questionnaireId}/questions/${questionId}/map-indicator`,
        {
          method: 'POST',
          body: { indicatorId: null }
        }
      ) as any
      
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Pemetaan indikator dihapus',
        showConfirmButton: false,
        timer: 2000
      })
      
      return response.question
    } catch (err: any) {
      error.value = err.data?.statusMessage || 'Failed to unmap indicator'
      Swal.fire('Error', error.value!, 'error')
      throw err
    } finally {
      mapping.value = false
    }
  }

  /**
   * Reset all state
   */
  const reset = () => {
    reviewing.value = false
    rewriting.value = false
    mapping.value = false
    error.value = null
  }

  return {
    // State
    reviewing,
    rewriting,
    mapping,
    error,
    
    // Methods
    reviewQuestion,
    rewriteQuestion,
    mapIndicator,
    unmapIndicator,
    reset
  }
}
