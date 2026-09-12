import { ref } from 'vue'
import Swal from 'sweetalert2'
import type { 
  Question, 
  QuestionFormData, 
  CreateQuestionData,
  QuestionOption, 
  QuestionType
} from '~/types/questionnaire'
import { parseOptionsInput } from '~/types/questionnaire'

export const useQuestionManager = () => {
  const questions = ref<Question[]>([])
  const loading = ref(false)
  const generatingAI = ref(false)
  const saving = ref(false)
  
  const questionForm = ref<QuestionFormData>({
    questionText: '',
    questionType: 'text',
    optionsInput: ''
  })

  /**
   * Fetch all questions for a questionnaire
   */
  const fetchQuestions = async (questionnaireId: string) => {
    loading.value = true
    
    try {
      const response = await $fetch(`/api/questionnaires/${questionnaireId}`) as any
      questions.value = response.questionnaire.questions || []
      return questions.value
    } catch (err: any) {
      console.error('Failed to fetch questions:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Add a single question manually
   */
  const addQuestion = async (questionnaireId: string, formData?: QuestionFormData) => {
    const data = formData || questionForm.value
    saving.value = true
    
    // Parse options from comma-separated input
    let options: QuestionOption[] = []
    if (['multiple_choice', 'checkbox', 'dropdown', 'closed', 'filter', 'mixed'].includes(data.questionType)) {
      options = parseOptionsInput(data.optionsInput)
    }

    const questionData: CreateQuestionData = {
      questionText: data.questionText,
      questionType: data.questionType,
      options: options,
      questionnaireId: questionnaireId,
      source: 'manual'
    }

    try {
      await $fetch('/api/questions', {
        method: 'POST',
        body: questionData
      })
      
      // Refresh questions list
      await fetchQuestions(questionnaireId)
      
      // Reset form
      resetForm()
      
      return true
    } catch (err: any) {
      Swal.fire('Error', err.data?.statusMessage || 'Failed to add question', 'error')
      throw err
    } finally {
      saving.value = false
    }
  }

  /**
   * Delete a question
   */
  const deleteQuestion = async (questionId: string, questionnaireId: string) => {
    const result = await Swal.fire({
      title: 'Hapus Pertanyaan?',
      text: 'Pertanyaan akan dihapus permanen',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#dc3545'
    })
    
    if (!result.isConfirmed) return false

    try {
      await $fetch(`/api/questions/${questionId}`, { 
        method: 'DELETE' 
      })
      
      // Refresh questions list
      await fetchQuestions(questionnaireId)
      
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Pertanyaan dihapus',
        showConfirmButton: false,
        timer: 2000
      })
      
      return true
    } catch (err: any) {
      Swal.fire('Error', 'Gagal menghapus pertanyaan', 'error')
      throw err
    }
  }

  /**
   * Generate questions using AI and auto-save them
   */
  const generateAIQuestions = async (
    questionnaireId: string,
    topic: string, 
    objective: string, 
    count: number = 5
  ) => {
    generatingAI.value = true
    
    try {
      // Call AI generation API
      const response = await $fetch('/api/generate-questions', {
        method: 'POST',
        body: {
          topic,
          objective,
          count
        }
      }) as any
      
      const aiQuestions = response.questions || []
      
      if (aiQuestions.length === 0) {
        Swal.fire('Warning', 'AI tidak menghasilkan pertanyaan', 'warning')
        return []
      }
      
      // Auto-save each AI-generated question
      for (const q of aiQuestions) {
        const questionData: CreateQuestionData = {
          questionText: q.questionText || q.text,
          questionType: q.questionType || 'multiple_choice',
          options: q.options || [],
          questionnaireId: questionnaireId,
          source: 'ai_generated'
        }
        
        await $fetch('/api/questions', {
          method: 'POST',
          body: questionData
        })
      }
      
      // Refresh questions list
      await fetchQuestions(questionnaireId)
      
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: `${aiQuestions.length} pertanyaan berhasil di-generate dan disimpan`,
        showConfirmButton: false,
        timer: 3000
      })
      
      return aiQuestions
    } catch (err: any) {
      Swal.fire('Error', err.data?.statusMessage || 'Gagal generate pertanyaan AI', 'error')
      throw err
    } finally {
      generatingAI.value = false
    }
  }

  /**
   * Reset question form
   */
  const resetForm = () => {
    questionForm.value = {
      questionText: '',
      questionType: 'text',
      optionsInput: ''
    }
  }

  /**
   * Reset all state
   */
  const reset = () => {
    questions.value = []
    loading.value = false
    generatingAI.value = false
    saving.value = false
    resetForm()
  }

  /**
   * Update a question (text, type, options, scaleType)
   */
  const updateQuestion = async (
    questionId: string, 
    questionnaireId: string,
    updates: {
      questionText?: string
      questionType?: QuestionType
      scaleType?: string | null
      options?: QuestionOption[]
    }
  ) => {
    try {
      await $fetch(`/api/questions/${questionId}`, {
        method: 'PUT',
        body: updates
      })
      
      // Refresh questions list
      await fetchQuestions(questionnaireId)
      
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Pertanyaan berhasil diperbarui',
        showConfirmButton: false,
        timer: 2000
      })
      
      return true
    } catch (err: any) {
      Swal.fire('Error', err.data?.statusMessage || 'Gagal memperbarui pertanyaan', 'error')
      throw err
    }
  }

  return {
    // State
    questions,
    loading,
    generatingAI,
    saving,
    questionForm,
    
    // Methods
    fetchQuestions,
    addQuestion,
    deleteQuestion,
    updateQuestion,
    generateAIQuestions,
    resetForm,
    reset
  }
}
