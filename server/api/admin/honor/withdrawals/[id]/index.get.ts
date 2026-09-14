import { requireAdmin } from '~~/server/utils/auth'
import { HonorWithdrawal } from '~~/server/models/HonorWithdrawal'
import { User } from '~~/server/models/User'
import { RespondentProfile } from '~~/server/models/RespondentProfile'
import type { H3Event } from 'h3'

/**
 * GET /api/admin/honor/withdrawals/:id
 * Get detailed withdrawal information with full respondent profile (admin only)
 */
export default defineEventHandler(async (event: H3Event) => {
    try {
        await requireAdmin(event)

        const withdrawalId = event.context.params?.id

        if (!withdrawalId) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Withdrawal ID is required'
            })
        }

        // Get withdrawal with full respondent info
        const withdrawal = await HonorWithdrawal.findByPk(withdrawalId, {
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
                        'totalHonorWithdrawn',
                        'verificationStatus',
                        'createdAt'
                    ],
                    include: [
                        {
                            model: RespondentProfile,
                            as: 'respondentProfile',
                            attributes: [
                                'dateOfBirth',
                                'gender',
                                'profession',
                                'city',
                                'province',
                                'educationLevel',
                                'phoneNumber'
                            ]
                        }
                    ]
                },
                {
                    model: User,
                    as: 'processor',
                    attributes: ['id', 'name', 'email']
                }
            ]
        })

        if (!withdrawal) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Withdrawal not found'
            })
        }

        return {
            success: true,
            data: withdrawal
        }
    } catch (error: any) {
        if (error.statusCode) {
            throw error
        }
        console.error('Admin get withdrawal detail error:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to get withdrawal detail'
        })
    }
})
