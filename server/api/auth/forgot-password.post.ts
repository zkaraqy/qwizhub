import { User } from '~~/server/models/User'
import { PasswordResetToken } from '~~/server/models/PasswordResetToken'
import { sendPasswordResetEmail } from '~~/server/utils/mailer'
import { v4 as uuidv4 } from 'uuid'
import crypto from 'crypto'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { email } = body

    // Validasi input
    if (!email) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Email is required'
      })
    }

    // Cari user berdasarkan email
    const user = await User.findOne({
      where: { email }
    })

    // Jangan reveal apakah email ada atau tidak (security best practice)
    // Selalu return success message
    if (!user) {
      return {
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent'
      }
    }

    // Generate secure random token
    const token = crypto.randomBytes(32).toString('hex')

    // Token expires in 1 hour
    const expires = new Date(Date.now() + 60 * 60 * 1000)

    // Simpan token ke database
    await PasswordResetToken.create({
      id: uuidv4(),
      userId: user.id,
      token,
      expires,
      used: false
    })

    // Kirim email reset password
    await sendPasswordResetEmail(email, token)

    return {
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent'
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error('Forgot password error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error during password reset request'
    })
  }
})
