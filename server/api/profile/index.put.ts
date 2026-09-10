import { getAuthenticatedUser } from '~~/server/utils/auth'
import { User } from '~~/server/models/User'
import { RespondentProfile } from '~~/server/models/RespondentProfile'
import { v4 as uuidv4 } from 'uuid'

export default defineEventHandler(async (event) => {
  try {
    const user = await getAuthenticatedUser(event)
    const body = await readBody(event)

    // Update basic user info (name)
    if (body.name) {
      await user.update({ name: body.name })
    }

    // If user is responden, update demographic profile
    if (user.role === 'responden' && body.profile) {
      const profileData = body.profile

      // Find or create respondent profile
      let profile = await RespondentProfile.findOne({
        where: { userId: user.id }
      })

      if (!profile) {
        // Create new profile
        profile = await RespondentProfile.create({
          id: uuidv4(),
          userId: user.id,
          dateOfBirth: profileData.dateOfBirth || null,
          gender: profileData.gender || null,
          profession: profileData.profession || null,
          city: profileData.city || null,
          province: profileData.province || null,
          educationLevel: profileData.educationLevel || null,
          phoneNumber: profileData.phoneNumber || null
        })
      } else {
        // Update existing profile
        await profile.update({
          dateOfBirth: profileData.dateOfBirth !== undefined ? profileData.dateOfBirth : profile.dateOfBirth,
          gender: profileData.gender !== undefined ? profileData.gender : profile.gender,
          profession: profileData.profession !== undefined ? profileData.profession : profile.profession,
          city: profileData.city !== undefined ? profileData.city : profile.city,
          province: profileData.province !== undefined ? profileData.province : profile.province,
          educationLevel: profileData.educationLevel !== undefined ? profileData.educationLevel : profile.educationLevel,
          phoneNumber: profileData.phoneNumber !== undefined ? profileData.phoneNumber : profile.phoneNumber
        })
      }

      // Auto-verify if all required fields are complete
      if (profile.isComplete() && user.verificationStatus === 'unverified') {
        await user.update({ verificationStatus: 'verified' })
      }

      // Reload user to get updated verification status
      await user.reload()

      return {
        success: true,
        message: 'Profile updated successfully',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          verificationStatus: user.verificationStatus
        },
        profile: {
          dateOfBirth: profile.dateOfBirth,
          gender: profile.gender,
          profession: profile.profession,
          city: profile.city,
          province: profile.province,
          educationLevel: profile.educationLevel,
          phoneNumber: profile.phoneNumber
        }
      }
    }

    return {
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        verificationStatus: user.verificationStatus
      }
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error('Update profile error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
