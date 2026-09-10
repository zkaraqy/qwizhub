import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { User, RespondentProfile, PasswordResetToken } from '../../server/models'
import { sequelize } from '../../server/plugins/sequelize.server'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'

/**
 * Unit tests untuk Modul Autentikasi & Manajemen Akun
 * Mencakup AUTH-1, AUTH-2, AUTH-3, AUTH-4
 */

describe('Authentication & Account Management Module', () => {
  beforeAll(async () => {
    // Ensure database connection is established
    await sequelize.authenticate()
  })

  afterAll(async () => {
    // Clean up test data
    await User.destroy({ where: { email: { $like: '%@test.qwizhub.com' } } })
    await sequelize.close()
  })

  describe('AUTH-1: User Registration', () => {
    it('should register a new user as Peneliti', async () => {
      const userData = {
        id: uuidv4(),
        name: 'Test Peneliti',
        email: `peneliti-${Date.now()}@test.qwizhub.com`,
        password: await bcrypt.hash('password123', 10),
        role: 'peneliti' as const,
        verificationStatus: 'unverified' as const
      }

      const user = await User.create(userData)

      expect(user).toBeDefined()
      expect(user.email).toBe(userData.email)
      expect(user.role).toBe('peneliti')
      expect(user.verificationStatus).toBe('unverified')

      // Verify password is hashed
      const isValidPassword = await bcrypt.compare('password123', user.password!)
      expect(isValidPassword).toBe(true)
    })

    it('should register a new user as Responden', async () => {
      const userData = {
        id: uuidv4(),
        name: 'Test Responden',
        email: `responden-${Date.now()}@test.qwizhub.com`,
        password: await bcrypt.hash('password123', 10),
        role: 'responden' as const,
        verificationStatus: 'unverified' as const
      }

      const user = await User.create(userData)

      expect(user).toBeDefined()
      expect(user.email).toBe(userData.email)
      expect(user.role).toBe('responden')
      expect(user.verificationStatus).toBe('unverified')
    })

    it('should not allow duplicate email registration', async () => {
      const email = `duplicate-${Date.now()}@test.qwizhub.com`

      await User.create({
        id: uuidv4(),
        name: 'First User',
        email,
        password: await bcrypt.hash('password123', 10),
        role: 'responden'
      })

      // Attempt to create another user with same email
      await expect(
        User.create({
          id: uuidv4(),
          name: 'Second User',
          email,
          password: await bcrypt.hash('password456', 10),
          role: 'peneliti'
        })
      ).rejects.toThrow()
    })
  })



  describe('AUTH-2: Respondent Profile Verification', () => {
    it('should create respondent profile with demographic data', async () => {
      const user = await User.create({
        id: uuidv4(),
        name: 'Test Responden Profile',
        email: `profile-${Date.now()}@test.qwizhub.com`,
        password: await bcrypt.hash('password123', 10),
        role: 'responden',
        verificationStatus: 'unverified'
      })

      const profile = await RespondentProfile.create({
        id: uuidv4(),
        userId: user.id,
        dateOfBirth: '1995-05-15',
        gender: 'male',
        profession: 'Software Engineer',
        city: 'Jakarta',
        province: 'DKI Jakarta',
        educationLevel: 's1',
        phoneNumber: '08123456789'
      })

      expect(profile).toBeDefined()
      expect(profile.userId).toBe(user.id)
      expect(profile.profession).toBe('Software Engineer')
      expect(profile.isComplete()).toBe(true)
    })

    it('should verify profile is complete when all required fields are filled', async () => {
      const profile = await RespondentProfile.create({
        id: uuidv4(),
        userId: uuidv4(),
        dateOfBirth: '1990-01-01',
        gender: 'female',
        profession: 'Teacher',
        city: 'Bandung',
        province: 'Jawa Barat',
        educationLevel: 's2',
        phoneNumber: null
      })

      expect(profile.isComplete()).toBe(true)
    })

    it('should indicate profile is incomplete when required fields are missing', async () => {
      const profile = await RespondentProfile.create({
        id: uuidv4(),
        userId: uuidv4(),
        dateOfBirth: '1990-01-01',
        gender: 'male',
        profession: null,
        city: 'Surabaya',
        province: 'Jawa Timur',
        educationLevel: 's1'
      })

      expect(profile.isComplete()).toBe(false)
    })
  })

  describe('AUTH-3: Login, Logout, Reset Password', () => {
    it('should validate correct password during login', async () => {
      const plainPassword = 'testPassword123'
      const user = await User.create({
        id: uuidv4(),
        name: 'Test Login',
        email: `login-${Date.now()}@test.qwizhub.com`,
        password: await bcrypt.hash(plainPassword, 10),
        role: 'peneliti'
      })

      const isValid = await bcrypt.compare(plainPassword, user.password!)
      expect(isValid).toBe(true)
    })

    it('should create password reset token', async () => {
      const user = await User.create({
        id: uuidv4(),
        name: 'Test Reset',
        email: `reset-${Date.now()}@test.qwizhub.com`,
        password: await bcrypt.hash('oldPassword', 10),
        role: 'peneliti'
      })

      const token = await PasswordResetToken.create({
        id: uuidv4(),
        userId: user.id,
        token: 'test-token-' + Date.now(),
        expires: new Date(Date.now() + 60 * 60 * 1000),
        used: false
      })

      expect(token).toBeDefined()
      expect(token.userId).toBe(user.id)
      expect(token.isValid()).toBe(true)
    })

    it('should reset password successfully', async () => {
      const user = await User.create({
        id: uuidv4(),
        name: 'Test Password Reset',
        email: `pwreset-${Date.now()}@test.qwizhub.com`,
        password: await bcrypt.hash('oldPassword123', 10),
        role: 'responden'
      })

      const newPassword = 'newSecurePassword456'
      const newHashedPassword = await bcrypt.hash(newPassword, 10)

      await user.update({ password: newHashedPassword })
      await user.reload()

      const isValidNew = await bcrypt.compare(newPassword, user.password!)
      const isValidOld = await bcrypt.compare('oldPassword123', user.password!)

      expect(isValidNew).toBe(true)
      expect(isValidOld).toBe(false)
    })
  })

  describe('AUTH-4: Profile Management', () => {
    it('should update user name', async () => {
      const user = await User.create({
        id: uuidv4(),
        name: 'Old Name',
        email: `update-${Date.now()}@test.qwizhub.com`,
        password: await bcrypt.hash('password123', 10),
        role: 'peneliti'
      })

      await user.update({ name: 'New Name' })
      await user.reload()

      expect(user.name).toBe('New Name')
    })

    it('should update respondent demographic data', async () => {
      const user = await User.create({
        id: uuidv4(),
        name: 'Test Demographics Update',
        email: `demo-${Date.now()}@test.qwizhub.com`,
        password: await bcrypt.hash('password123', 10),
        role: 'responden'
      })

      const profile = await RespondentProfile.create({
        id: uuidv4(),
        userId: user.id,
        dateOfBirth: '1990-01-01',
        gender: 'male',
        profession: 'Engineer',
        city: 'Jakarta',
        province: 'DKI Jakarta',
        educationLevel: 's1'
      })

      await profile.update({
        profession: 'Senior Engineer',
        city: 'Bandung',
        province: 'Jawa Barat'
      })
      await profile.reload()

      expect(profile.profession).toBe('Senior Engineer')
      expect(profile.city).toBe('Bandung')
      expect(profile.province).toBe('Jawa Barat')
    })
  })
})
