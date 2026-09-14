import { requireRole } from '~~/server/utils/auth'
import { getAvailableBalance } from '~~/server/utils/honor'
import { User } from '~~/server/models/User'
import { HonorWithdrawal } from '~~/server/models/HonorWithdrawal'
import type { H3Event } from 'h3'

/**
 * GET /api/honor/balance
 * Get available balance and stats for withdrawal
 */
export default defineEventHandler(async (event: H3Event) => {
    try {
        const user = await requireRole(event, 'responden')

        // Get available balance
        const availableBalance = await getAvailableBalance(user.id)

        // Get pending withdrawals amount
        const pendingAmount = await HonorWithdrawal.sum('amount', {
            where: { 
                respondentId: user.id, 
                status: 'sent' 
            }
        }) || 0

        return {
            success: true,
            data: {
                availableBalance,
                totalEarned: user.totalHonorEarned || 0,
                totalWithdrawn: user.totalHonorWithdrawn || 0,
                pendingAmount
            }
        }
    } catch (error: any) {
        if (error.statusCode) {
            throw error
        }
        console.error('Get balance error:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to get balance'
        })
    }
})
