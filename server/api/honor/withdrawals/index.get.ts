import { requireRole } from '~~/server/utils/auth'
import { HonorWithdrawal } from '~~/server/models/HonorWithdrawal'
import type { H3Event } from 'h3'

/**
 * GET /api/honor/withdrawals
 * Get withdrawal requests for current respondent
 */
export default defineEventHandler(async (event: H3Event) => {
    try {
        const user = await requireRole(event, 'responden')

        // Get all withdrawals for this respondent
        const withdrawals = await HonorWithdrawal.findAll({
            where: { 
                respondentId: user.id 
            },
            order: [['createdAt', 'DESC']]
        })

        return {
            success: true,
            data: withdrawals
        }
    } catch (error: any) {
        if (error.statusCode) {
            throw error
        }
        console.error('Get withdrawals error:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to get withdrawals'
        })
    }
})
