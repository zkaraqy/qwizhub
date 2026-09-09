import bcrypt from 'bcryptjs'
import { User } from '~~/server/models/User'
import { v4 as uuidv4 } from 'uuid'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { name, email, password } = body

    // Validasi input
    if (!name || !email || !password) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Name, email, and password are required'
      })
    }

    // Validasi format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid email format'
      })
    }

    // Validasi panjang password
    if (password.length < 6) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Password must be at least 6 characters long'
      })
    }

    // Cek apakah email sudah terdaftar
    const existingUser = await User.findOne({
      where: { email }
    })

    if (existingUser) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Email already registered'
      })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Buat user baru
    const newUser = await User.create({
      id: uuidv4(),
      name,
      email,
      password: hashedPassword,
      emailVerified: null,
      image: null
    })

    // Return user tanpa password
    return {
      success: true,
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email
      }
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    
    console.error('Registration error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error during registration'
    })
  }
})
