import { ref } from 'vue'
import Swal from 'sweetalert2'
import type { PublishFormData } from '~/types/questionnaire'

export const usePublishModal = () => {
  const showModal = ref(false)
  const publishing = ref(false)
  
  const publishForm = ref<PublishFormData>({
    targetRespondents: 100,
    honorariumPerRespondent: 5000
  })

  /**
   * Calculate total payment
   */
  const totalPayment = computed(() => {
    const honorTotal = (publishForm.value.targetRespondents || 0) * (publishForm.value.honorariumPerRespondent || 0)
    const serviceFee = 5000
    return honorTotal + serviceFee
  })

  /**
   * Calculate honor total
   */
  const honorTotal = computed(() => {
    return (publishForm.value.targetRespondents || 0) * (publishForm.value.honorariumPerRespondent || 0)
  })

  /**
   * Publish questionnaire with Midtrans payment
   */
  const publishQuestionnaire = async (projectId: string, questionnaireId: string) => {
    publishing.value = true
    
    try {
      const response = await $fetch(`/api/projects/${projectId}/questionnaires/${questionnaireId}/publish`, {
        method: 'POST',
        body: {
          targetRespondents: publishForm.value.targetRespondents,
          honorariumPerRespondent: publishForm.value.honorariumPerRespondent
        }
      }) as any

      // Close modal
      showModal.value = false

      // Trigger Midtrans Snap
      if (window.snap) {
        window.snap.pay(response.snapToken, {
          onSuccess: function(result: any) {
            Swal.fire('Sukses', 'Pembayaran berhasil dan Kuesioner dipublikasikan!', 'success')
          },
          onPending: function(result: any) {
            Swal.fire('Pending', 'Menunggu pembayaran Anda.', 'info')
          },
          onError: function(result: any) {
            Swal.fire('Gagal', 'Pembayaran gagal. Silakan coba lagi.', 'error')
          },
          onClose: function() {
            Swal.fire('Batal', 'Anda menutup popup tanpa menyelesaikan pembayaran.', 'warning')
          }
        })
      } else {
        Swal.fire('Error', 'Midtrans library tidak termuat', 'error')
      }
      
      return true
    } catch (err: any) {
      Swal.fire('Error', err.data?.statusMessage || 'Gagal memproses pembayaran', 'error')
      throw err
    } finally {
      publishing.value = false
    }
  }

  /**
   * Open publish modal
   */
  const openModal = () => {
    showModal.value = true
  }

  /**
   * Close publish modal
   */
  const closeModal = () => {
    showModal.value = false
  }

  /**
   * Reset state
   */
  const reset = () => {
    showModal.value = false
    publishing.value = false
    publishForm.value = {
      targetRespondents: 100,
      honorariumPerRespondent: 5000
    }
  }

  return {
    // State
    showModal,
    publishing,
    publishForm,
    
    // Computed
    totalPayment,
    honorTotal,
    
    // Methods
    publishQuestionnaire,
    openModal,
    closeModal,
    reset
  }
}
