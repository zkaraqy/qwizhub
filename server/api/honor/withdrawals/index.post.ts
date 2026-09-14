import { requireRole } from '~~/server/utils/auth'
import { getAvailableBalance, hasPendingWithdrawal, validateWithdrawalAmount, MIN_WITHDRAWAL_AMOUNT } from '~~/server/utils/honor'
import { HonorWithdrawal } from '~~/server/models/HonorWithdrawal'
import { RespondentProfile } from '~~/server/models/RespondentProfile'
import { v4 as uuidv4 } from 'uuid'
import type { H3Event } from 'h3'

/**
 * POST /api/honor/withdrawals
 * Create a new withdrawal request
 */
export default defineEventHandler(async (event: H3Event) => {
    try {
        const user = await requireRole(event, 'responden')
        const body = await readBody(event)

        const { amount, notes } = body

        // Validate amount
        if (!amount || typeof amount !== 'number') {
            throw createError({
                statusCode: 400,
                statusMessage: 'Amount is required and must be a number'
            })
        }

        // Check if user has pending withdrawal
        const hasPending = await hasPendingWithdrawal(user.id)
        if (hasPending) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Anda masih memiliki pengajuan pencairan yang sedang diproses. Batalkan terlebih dahulu untuk membuat pengajuan baru.'
            })
        }

        // Get phone number from RespondentProfile
        const profile = await RespondentProfile.findOne({
            where: { userId: user.id }
        })

        if (!profile || !profile.phoneNumber) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Nomor telepon (GoPay) belum terdaftar. Silakan lengkapi profil Anda terlebih dahulu.'
            })
        }

        // Get available balance
        const availableBalance = await getAvailableBalance(user.id)

        // Validate amount
        const validation = validateWithdrawalAmount(amount, availableBalance)
        if (!validation.valid) {
            throw createError({
                statusCode: 400,
                statusMessage: validation.message
            })
        }

        // Create withdrawal request with status 'sent'
        const withdrawal = await HonorWithdrawal.create({
            id: uuidv4(),
            respondentId: user.id,
            amount,
            status: 'sent',
            phoneNumber: profile.phoneNumber,
            notes: notes || null
        })

        return {
            success: true,
            message: 'Pengajuan pencairan honor berhasil dikirim',
            data: withdrawal
        }
    } catch (error: any) {
        if (error.statusCode) {
            throw error
        }
        console.error('Create withdrawal error:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to create withdrawal request'
        })
    }
})
