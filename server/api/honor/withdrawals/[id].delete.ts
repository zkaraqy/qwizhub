import { requireRole } from '~~/server/utils/auth'
import { HonorWithdrawal } from '~~/server/models/HonorWithdrawal'
import type { H3Event } from 'h3'

/**
 * DELETE /api/honor/withdrawals/:id
 * Cancel/delete a withdrawal request (only if status is 'sent')
 */
export default defineEventHandler(async (event: H3Event) => {
    try {
        const user = await requireRole(event, 'responden')
        const withdrawalId = event.context.params?.id

        if (!withdrawalId) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Withdrawal ID is required'
            })
        }

        // Find withdrawal
        const withdrawal = await HonorWithdrawal.findByPk(withdrawalId)

        if (!withdrawal) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Withdrawal not found'
            })
        }

        // Check ownership
        if (withdrawal.respondentId !== user.id) {
            throw createError({
                statusCode: 403,
                statusMessage: 'Forbidden'
            })
        }

        // Check if can be cancelled (only 'sent' status)
        if (!withdrawal.canCancel()) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Pengajuan yang sudah dibayar tidak dapat dibatalkan'
            })
        }

        // Delete withdrawal
        await withdrawal.destroy()

        return {
            success: true,
            message: 'Pengajuan pencairan berhasil dibatalkan'
        }
    } catch (error: any) {
        if (error.statusCode) {
            throw error
        }
        console.error('Delete withdrawal error:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to delete withdrawal'
        })
    }
})
