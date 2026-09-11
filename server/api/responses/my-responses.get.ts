import { defineEventHandler, getQuery, createError } from 'h3'
import { getServerSession } from '#auth'
import { Response, Questionnaire, Project } from '~~/server/models'

/**
 * GET /api/responses/my-responses
 * Get all responses for logged-in respondent
 * Query params: page, limit, status
 */
export default defineEventHandler(async (event) => {
    try {
        const session = await getServerSession(event)
        if (!session || !session.user) {
            throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
        }

        // Only respondents can access
        if (session.user.role !== 'responden') {
            throw createError({ statusCode: 403, statusMessage: 'Only respondents can access this' })
        }

        const query = getQuery(event)
        const page = parseInt((query.page as string) || '1')
        const limit = parseInt((query.limit as string) || '10')
        const status = query.status as string
        const offset = (page - 1) * limit

        // Build where clause
        const whereClause: any = {
            respondentId: session.user.id
        }

        if (status && ['in_progress', 'completed'].includes(status)) {
            whereClause.status = status
        }

        // Fetch responses
        const { rows: responses, count: total } = await Response.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: Questionnaire,
                    as: 'questionnaire',
                    include: [
                        {
                            model: Project,
                            as: 'project',
                            attributes: ['id', 'title']
                        }
                    ]
                }
            ],
            order: [['updatedAt', 'DESC']],
            limit,
            offset
        })

        const responsesData = responses.map(r => ({
            id: r.id,
            status: r.status,
            startedAt: r.startedAt,
            completedAt: r.completedAt,
            honorAmount: r.honorAmount,
            honorPaid: r.honorPaid,
            answeredQuestions: r.answers?.length || 0,
            timeSpent: r.getTimeSpent(),
            questionnaire: {
                id: r.questionnaire?.id,
                topic: r.questionnaire?.topic,
                project: r.questionnaire?.project
            }
        }))

        // Calculate summary stats
        const completedResponses = responses.filter(r => r.status === 'completed')
        const totalHonorEarned = completedResponses.reduce((sum, r) => sum + (r.honorAmount || 0), 0)

        return {
            success: true,
            data: responsesData,
            summary: {
                totalResponses: total,
                completedResponses: completedResponses.length,
                totalHonorEarned
            },
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        }
    } catch (error: any) {
        console.error('Get my responses error:', error)
        throw createError({
            statusCode: error.statusCode || 500,
            statusMessage: error.statusMessage || 'Failed to fetch responses'
        })
    }
})
