import { requireRole } from '~~/server/utils/auth'
import { HonorTransaction } from '~~/server/models/HonorTransaction'
import { Response } from '~~/server/models/Response'
import { Questionnaire } from '~~/server/models/Questionnaire'
import type { H3Event } from 'h3'

/**
 * GET /api/honor/transactions
 * Get honor transaction history (completed questionnaires)
 */
export default defineEventHandler(async (event: H3Event) => {
    try {
        const user = await requireRole(event, 'responden')

        // Get all honor transactions for this respondent
        const transactions = await HonorTransaction.findAll({
            where: { 
                respondentId: user.id 
            },
            include: [
                {
                    model: Response,
                    as: 'response',
                    include: [
                        {
                            model: Questionnaire,
                            as: 'questionnaire',
                            attributes: ['id', 'topic', 'honorPerRespon']
                        }
                    ]
                }
            ],
            order: [['createdAt', 'DESC']]
        })

        return {
            success: true,
            data: transactions.map(t => ({
                id: t.id,
                amount: t.amount,
                status: t.status,
                paidAt: t.paidAt,
                createdAt: t.createdAt,
                questionnaire: t.response?.questionnaire ? {
                    id: t.response.questionnaire.id,
                    topic: t.response.questionnaire.topic
                } : null
            }))
        }
    } catch (error: any) {
        if (error.statusCode) {
            throw error
        }
        console.error('Get transactions error:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to get transactions'
        })
    }
})
