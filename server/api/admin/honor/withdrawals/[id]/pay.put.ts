import { requireAdmin } from '~~/server/utils/auth'
import { processWithdrawalPayment } from '~~/server/utils/honor'
import type { H3Event } from 'h3'

/**
 * PUT /api/admin/honor/withdrawals/:id/pay
 * Mark withdrawal as paid and update user balance (admin only)
 */
export default defineEventHandler(async (event: H3Event) => {
    try {
        const admin = await requireAdmin(event)

        const withdrawalId = event.context.params?.id

        if (!withdrawalId) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Withdrawal ID is required'
            })
        }

        // Process withdrawal payment
        await processWithdrawalPayment(withdrawalId, admin.id)

        return {
            success: true,
            message: 'Pencairan honor berhasil ditandai sebagai dibayar'
        }
    } catch (error: any) {
        if (error.statusCode) {
            throw error
        }
        console.error('Admin pay withdrawal error:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to process withdrawal payment'
        })
    }
})
