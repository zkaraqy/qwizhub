import { ref } from 'vue'
import Swal from 'sweetalert2'
import type { 
  VariableIndicator, 
  CreateIndicatorData,
  UpdateIndicatorData
} from '~/types/research'

export const useIndicatorManager = () => {
  const indicators = ref<VariableIndicator[]>([])
  const loading = ref(false)
  const generating = ref(false)
  const saving = ref(false)
  const error = ref<string | null>(null)

  /**
   * Fetch indicators for a variable (usually part of variable fetch)
   */
  const setIndicators = (indicatorList: VariableIndicator[]) => {
    indicators.value = indicatorList
  }

  /**
   * Create a manual indicator
   */
  const createIndicator = async (
    questionnaireId: string,
    variableId: string,
    data: CreateIndicatorData
  ) => {
    saving.value = true
    error.value = null
    
    try {
      const response = await $fetch(
        `/api/questionnaires/${questionnaireId}/variables/${variableId}/indicators`,
        {
          method: 'POST',
          body: data
        }
      ) as any
      
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Indikator berhasil ditambahkan',
        showConfirmButton: false,
        timer: 2000
      })
      
      return response.indicator
    } catch (err: any) {
      error.value = err.data?.statusMessage || 'Failed to create indicator'
      Swal.fire('Error', error.value!, 'error')
      throw err
    } finally {
      saving.value = false
    }
  }

  /**
   * Generate indicators using AI
   */
  const generateIndicators = async (
    questionnaireId: string,
    variableId: string,
    count: number = 5
  ) => {
    generating.value = true
    error.value = null
    
    try {
      const response = await $fetch(
        `/api/questionnaires/${questionnaireId}/variables/${variableId}/generate-indicators`,
        {
          method: 'POST',
          body: { count }
        }
      ) as any
      
      const generatedIndicators = response.indicators || []
      
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: `${generatedIndicators.length} indikator berhasil di-generate`,
        showConfirmButton: false,
        timer: 3000
      })
      
      return generatedIndicators
    } catch (err: any) {
      error.value = err.data?.statusMessage || 'Failed to generate indicators'
      Swal.fire('Error', error.value!, 'error')
      throw err
    } finally {
      generating.value = false
    }
  }

  /**
   * Update an indicator
   */
  const updateIndicator = async (
    questionnaireId: string,
    variableId: string,
    indicatorId: string,
    data: UpdateIndicatorData
  ) => {
    saving.value = true
    error.value = null
    
    try {
      const response = await $fetch(
        `/api/questionnaires/${questionnaireId}/variables/${variableId}/indicators/${indicatorId}`,
        {
          method: 'PUT',
          body: data
        }
      ) as any
      
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Indikator berhasil diupdate',
        showConfirmButton: false,
        timer: 2000
      })
      
      return response.indicator
    } catch (err: any) {
      error.value = err.data?.statusMessage || 'Failed to update indicator'
      Swal.fire('Error', error.value!, 'error')
      throw err
    } finally {
      saving.value = false
    }
  }

  /**
   * Delete an indicator
   */
  const deleteIndicator = async (
    questionnaireId: string,
    variableId: string,
    indicatorId: string
  ) => {
    const result = await Swal.fire({
      title: 'Hapus Indikator?',
      text: 'Indikator akan dihapus permanen',
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
        `/api/questionnaires/${questionnaireId}/variables/${variableId}/indicators/${indicatorId}`,
        { method: 'DELETE' }
      )
      
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Indikator berhasil dihapus',
        showConfirmButton: false,
        timer: 2000
      })
      
      return true
    } catch (err: any) {
      error.value = err.data?.statusMessage || 'Failed to delete indicator'
      Swal.fire('Error', error.value!, 'error')
      throw err
    } finally {
      saving.value = false
    }
  }

  /**
   * Accept a pending indicator
   */
  const acceptIndicator = async (
    questionnaireId: string,
    variableId: string,
    indicatorId: string
  ) => {
    saving.value = true
    error.value = null
    
    try {
      const response = await $fetch(
        `/api/questionnaires/${questionnaireId}/variables/${variableId}/indicators/${indicatorId}/accept`,
        { method: 'POST' }
      ) as any
      
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Indikator diterima',
        showConfirmButton: false,
        timer: 2000
      })
      
      return response.indicator
    } catch (err: any) {
      error.value = err.data?.statusMessage || 'Failed to accept indicator'
      Swal.fire('Error', error.value!, 'error')
      throw err
    } finally {
      saving.value = false
    }
  }

  /**
   * Reject a pending indicator
   */
  const rejectIndicator = async (
    questionnaireId: string,
    variableId: string,
    indicatorId: string
  ) => {
    saving.value = true
    error.value = null
    
    try {
      const response = await $fetch(
        `/api/questionnaires/${questionnaireId}/variables/${variableId}/indicators/${indicatorId}/reject`,
        { method: 'POST' }
      ) as any
      
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Indikator ditolak',
        showConfirmButton: false,
        timer: 2000
      })
      
      return response.indicator
    } catch (err: any) {
      error.value = err.data?.statusMessage || 'Failed to reject indicator'
      Swal.fire('Error', error.value!, 'error')
      throw err
    } finally {
      saving.value = false
    }
  }

  /**
   * Accept all pending indicators for a variable
   */
  const acceptAllIndicators = async (
    questionnaireId: string,
    variableId: string
  ) => {
    const result = await Swal.fire({
      title: 'Terima Semua Indikator?',
      text: 'Semua indikator pending akan diterima.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Ya, Terima Semua',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#198754'
    })

    if (!result.isConfirmed) return false

    saving.value = true
    error.value = null
    
    try {
      const response = await $fetch(
        `/api/questionnaires/${questionnaireId}/variables/${variableId}/indicators/accept-all`,
        { method: 'PATCH' }
      ) as any
      
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: `${response.affectedCount} indikator telah diterima`,
        timer: 2000,
        showConfirmButton: false
      })
      
      return true
    } catch (err: any) {
      error.value = err.data?.statusMessage || 'Failed to accept all indicators'
      Swal.fire('Error', error.value!, 'error')
      return false
    } finally {
      saving.value = false
    }
  }

  /**
   * Reset all state
   */
  const reset = () => {
    indicators.value = []
    loading.value = false
    generating.value = false
    saving.value = false
    error.value = null
  }

  return {
    // State
    indicators,
    loading,
    generating,
    saving,
    error,
    
    // Methods
    setIndicators,
    createIndicator,
    generateIndicators,
    updateIndicator,
    deleteIndicator,
    acceptIndicator,
    rejectIndicator,
    acceptAllIndicators,
    reset
  }
}
