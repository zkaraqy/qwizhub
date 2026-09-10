import { getAuthenticatedUser } from '~~/server/utils/auth'
import { RespondentProfile } from '~~/server/models/RespondentProfile'

export default defineEventHandler(async (event) => {
  try {
    const user = await getAuthenticatedUser(event)

    // Load respondent profile if user is a responden
    let profile = null
    if (user.role === 'responden') {
      profile = await RespondentProfile.findOne({
        where: { userId: user.id }
      })
    }

    return {
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        verificationStatus: user.verificationStatus,
        emailVerified: user.emailVerified,
        image: user.image,
        createdAt: user.createdAt
      },
      profile: profile ? {
        dateOfBirth: profile.dateOfBirth,
        gender: profile.gender,
        profession: profile.profession,
        city: profile.city,
        province: profile.province,
        educationLevel: profile.educationLevel,
        phoneNumber: profile.phoneNumber
      } : null
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error('Get profile error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
