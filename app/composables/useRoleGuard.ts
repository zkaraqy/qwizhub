export const useRoleGuard = () => {
  const { data } = useAuth()

  const hasRole = (role: 'peneliti' | 'responden') => {
    return (data.value?.user as any)?.role === role
  }

  const isPeneliti = computed(() => {
    return hasRole('peneliti')
  })

  const isResponden = computed(() => {
    return hasRole('responden')
  })

  const requireRole = (role: 'peneliti' | 'responden') => {
    if (!hasRole(role)) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden: Insufficient permissions'
      })
    }
  }

  const getVerificationStatus = computed(() => {
    return (data.value?.user as any)?.verificationStatus || 'unverified'
  })

  const isVerified = computed(() => {
    return getVerificationStatus.value === 'verified'
  })

  return {
    hasRole,
    isPeneliti,
    isResponden,
    requireRole,
    getVerificationStatus,
    isVerified
  }
}
