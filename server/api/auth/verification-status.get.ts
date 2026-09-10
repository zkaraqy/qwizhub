import { getAuthenticatedUser } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  try {
    const user = await getAuthenticatedUser(event)

    return {
      success: true,
      verificationStatus: user.verificationStatus,
      role: user.role
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error('Verification status error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
