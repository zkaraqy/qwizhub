import bcrypt from 'bcryptjs'
import { User } from '~~/server/models/User'
import { PasswordResetToken } from '~~/server/models/PasswordResetToken'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { token, password } = body

    // Validasi input
    if (!token || !password) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Token and password are required'
      })
    }

    // Validasi panjang password
    if (password.length < 6) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Password must be at least 6 characters long'
      })
    }

    // Cari token di database
    const resetToken = await PasswordResetToken.findOne({
      where: { token },
      include: [{
        model: User,
        as: 'user'
      }]
    })

    if (!resetToken) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid or expired token'
      })
    }

    // Check if token is valid (not expired and not used)
    if (!resetToken.isValid()) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid or expired token'
      })
    }

    // Hash password baru
    const hashedPassword = await bcrypt.hash(password, 10)

    // Update password user
    await User.update(
      { password: hashedPassword },
      { where: { id: resetToken.userId } }
    )

    // Mark token as used
    await resetToken.update({ used: true })

    return {
      success: true,
      message: 'Password has been reset successfully'
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error('Reset password error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error during password reset'
    })
  }
})
