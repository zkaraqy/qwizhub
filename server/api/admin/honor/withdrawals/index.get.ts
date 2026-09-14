import { requireAdmin } from '~~/server/utils/auth'
import { HonorWithdrawal } from '~~/server/models/HonorWithdrawal'
import { User } from '~~/server/models/User'
import { Op } from 'sequelize'
import type { H3Event } from 'h3'

/**
 * GET /api/admin/honor/withdrawals
 * Get all withdrawal requests (admin only)
 * Query params: ?status=sent|paid|all
 */
export default defineEventHandler(async (event: H3Event) => {
    try {
        await requireAdmin(event)

        const query = getQuery(event)
        const statusFilter = query.status as string || 'all'

        // Build where clause
        const whereClause: any = {}
        if (statusFilter !== 'all') {
            whereClause.status = statusFilter
        }

        // Get all withdrawals with respondent info
        const withdrawals = await HonorWithdrawal.findAll({
            where: whereClause,
            include: [
                {
                    model: User,
                    as: 'respondent',
                    attributes: [
                        'id', 
                        'name', 
                        'email', 
                        'totalQuestionnairesAnswered', 
                        'totalHonorEarned',
                        'totalHonorWithdrawn'
                    ]
                }
            ],
            order: [['createdAt', 'DESC']]
        })

        // Calculate stats
        const stats = {
            total: withdrawals.length,
            pending: withdrawals.filter(w => w.status === 'sent').length,
            paid: withdrawals.filter(w => w.status === 'paid').length,
            pendingAmount: withdrawals
                .filter(w => w.status === 'sent')
                .reduce((sum, w) => sum + w.amount, 0),
            paidToday: withdrawals.filter(w => {
                if (w.status !== 'paid' || !w.processedAt) return false
                const today = new Date()
                const processedDate = new Date(w.processedAt)
                return processedDate.toDateString() === today.toDateString()
            }).length
        }

        return {
            success: true,
            data: withdrawals,
            stats
        }
    } catch (error: any) {
        if (error.statusCode) {
            throw error
        }
        console.error('Admin get withdrawals error:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to get withdrawals'
        })
    }
})
