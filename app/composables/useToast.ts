import Swal from 'sweetalert2'

export interface ToastOptions {
  title?: string
  text?: string
  icon?: 'success' | 'error' | 'warning' | 'info' | 'question'
  timer?: number
  position?: 'top' | 'top-start' | 'top-end' | 'center' | 'center-start' | 'center-end' | 'bottom' | 'bottom-start' | 'bottom-end'
  showConfirmButton?: boolean
}

export const useToast = () => {
  const showToast = (options: ToastOptions) => {
    return Swal.fire({
      toast: true,
      position: options.position || 'top-end',
      icon: options.icon || 'info',
      title: options.title || options.text,
      showConfirmButton: options.showConfirmButton ?? false,
      timer: options.timer || 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
      }
    })
  }

  const success = (message: string, title?: string) => {
    return showToast({
      icon: 'success',
      title: title || 'Success',
      text: message
    })
  }

  const error = (message: string, title?: string) => {
    return showToast({
      icon: 'error',
      title: title || 'Error',
      text: message,
      timer: 5000
    })
  }

  const warning = (message: string, title?: string) => {
    return showToast({
      icon: 'warning',
      title: title || 'Warning',
      text: message
    })
  }

  const info = (message: string, title?: string) => {
    return showToast({
      icon: 'info',
      title: title || 'Info',
      text: message
    })
  }

  const confirm = async (options: {
    title?: string
    text?: string
    confirmButtonText?: string
    cancelButtonText?: string
  }) => {
    const result = await Swal.fire({
      title: options.title || 'Are you sure?',
      text: options.text || '',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#0d6efd',
      cancelButtonColor: '#6c757d',
      confirmButtonText: options.confirmButtonText || 'Yes',
      cancelButtonText: options.cancelButtonText || 'Cancel'
    })

    return result.isConfirmed
  }

  return {
    showToast,
    success,
    error,
    warning,
    info,
    confirm
  }
}
