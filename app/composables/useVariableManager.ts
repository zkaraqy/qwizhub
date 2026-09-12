import { ref } from 'vue'
import Swal from 'sweetalert2'
import type { 
  ResearchVariable, 
  CreateVariableData, 
  UpdateVariableData 
} from '~/types/research'

export const useVariableManager = () => {
  const variables = ref<ResearchVariable[]>([])
  const loading = ref(false)
  const saving = ref(false)
  const error = ref<string | null>(null)

  /**
   * Fetch all variables for a questionnaire
   */
  const fetchVariables = async (questionnaireId: string) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await $fetch(`/api/questionnaires/${questionnaireId}/variables`) as any
      variables.value = response.variables || []
      return variables.value
    } catch (err: any) {
      error.value = err.data?.statusMessage || 'Failed to fetch variables'
      console.error('Failed to fetch variables:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Create a new variable
   */
  const createVariable = async (questionnaireId: string, data: CreateVariableData) => {
    saving.value = true
    error.value = null
    
    try {
      const response = await $fetch(`/api/questionnaires/${questionnaireId}/variables`, {
        method: 'POST',
        body: data
      }) as any
      
      // Refresh variables list
      await fetchVariables(questionnaireId)
      
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Variabel berhasil ditambahkan',
        showConfirmButton: false,
        timer: 2000
      })
      
      return response.variable
    } catch (err: any) {
      error.value = err.data?.statusMessage || 'Failed to create variable'
      Swal.fire('Error', error.value ?? 'Failed to create variable', 'error')
      throw err
    } finally {
      saving.value = false
    }
  }

  /**
   * Update an existing variable
   */
  const updateVariable = async (
    questionnaireId: string, 
    variableId: string, 
    data: UpdateVariableData
  ) => {
    saving.value = true
    error.value = null
    
    try {
      const response = await $fetch(
        `/api/questionnaires/${questionnaireId}/variables/${variableId}`, 
        {
          method: 'PUT',
          body: data
        }
      ) as any
      
      // Update local state
      const index = variables.value.findIndex(v => v.id === variableId)
      if (index !== -1) {
        variables.value[index] = { ...variables.value[index], ...response.variable }
      }
      
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Variabel berhasil diupdate',
        showConfirmButton: false,
        timer: 2000
      })
      
      return response.variable
    } catch (err: any) {
      error.value = err.data?.statusMessage || 'Failed to update variable'
      Swal.fire('Error', error.value ?? 'Failed to update variable', 'error')
      throw err
    } finally {
      saving.value = false
    }
  }

  /**
   * Delete a variable
   */
  const deleteVariable = async (questionnaireId: string, variableId: string) => {
    const result = await Swal.fire({
      title: 'Hapus Variabel?',
      text: 'Semua indikator terkait juga akan dihapus',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#dc3545'
    })
    
    if (!result.isConfirmed) return false

    saving.value = true
    error.value = null
    
    try {
      await $fetch(
        `/api/questionnaires/${questionnaireId}/variables/${variableId}`, 
        { method: 'DELETE' }
      )
      
      // Remove from local state
      variables.value = variables.value.filter(v => v.id !== variableId)
      
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Variabel berhasil dihapus',
        showConfirmButton: false,
        timer: 2000
      })
      
      return true
    } catch (err: any) {
      error.value = err.data?.statusMessage || 'Failed to delete variable'
      Swal.fire('Error', error.value ?? 'Failed to delete variable', 'error')
      throw err
    } finally {
      saving.value = false
    }
  }

  /**
   * Reset all state
   */
  const reset = () => {
    variables.value = []
    loading.value = false
    saving.value = false
    error.value = null
  }

  return {
    // State
    variables,
    loading,
    saving,
    error,
    
    // Methods
    fetchVariables,
    createVariable,
    updateVariable,
    deleteVariable,
    reset
  }
}
