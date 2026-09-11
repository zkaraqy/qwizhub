import { defineEventHandler, createError } from 'h3'
import { getServerSession } from '#auth'
import { Questionnaire, Question, Project, User, Response, Transaction } from '~~/server/models'

/**
 * GET /api/questionnaires/:id/detail
 * Get detailed view of questionnaire before starting (for respondents)
 */
export default defineEventHandler(async (event) => {
    try {
        const session = await getServerSession(event)
        if (!session || !session.user) {
            throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
        }

        // Only respondents can view
        if (session.user.role !== 'responden') {
            throw createError({ statusCode: 403, statusMessage: 'Only respondents can view this' })
        }

        const questionnaireId = event.context.params?.id

        if (!questionnaireId) {
            throw createError({ statusCode: 400, statusMessage: 'Questionnaire ID is required' })
        }

        // Fetch questionnaire with questions
        const questionnaire = await Questionnaire.findByPk(questionnaireId, {
            include: [
                {
                    model: Question,
                    as: 'questions',
                    attributes: ['id', 'questionText', 'questionType', 'orderIndex']
                },
                {
                    model: Project,
                    as: 'project',
                    include: [
                        {
                            model: User,
                            as: 'peneliti',
                            attributes: ['id', 'name']
                        }
                    ]
                },
                {
                    model: Transaction,
                    as: 'transactions',
                    where: { status: 'success' },
                    required: false,
                    limit: 1
                }
            ]
        })

        if (!questionnaire) {
            throw createError({ statusCode: 404, statusMessage: 'Questionnaire not found' })
        }

        if (questionnaire.status !== 'published') {
            throw createError({ statusCode: 400, statusMessage: 'Questionnaire is not published' })
        }

        // Check if user already responded
        const existingResponse = await Response.findOne({
            where: {
                questionnaireId: questionnaire.id,
                respondentId: session.user.id
            }
        })

        // Get honorarium from successful transaction
        const honorarium = questionnaire.transactions?.[0]?.honorariumPerRespondent || 0

        return {
            success: true,
            data: {
                id: questionnaire.id,
                topic: questionnaire.topic,
                researchObjective: questionnaire.researchObjective,
                targetRespondents: questionnaire.targetRespondents,
                currentResponses: questionnaire.currentResponses,
                remainingSlots: questionnaire.getRemainingSlots(),
                isAvailable: questionnaire.isAcceptingResponses(),
                hasResponded: !!existingResponse,
                questionCount: questionnaire.questions?.length || 0,
                estimatedTime: Math.ceil((questionnaire.questions?.length || 0) * 0.5), // 30 seconds per question
                honorarium,
                project: {
                    id: questionnaire.project?.id,
                    title: questionnaire.project?.title,
                    peneliti: questionnaire.project?.peneliti
                },
                createdAt: questionnaire.createdAt
            }
        }
    } catch (error: any) {
        console.error('Get questionnaire detail error:', error)
        throw createError({
            statusCode: error.statusCode || 500,
            statusMessage: error.statusMessage || 'Failed to fetch questionnaire detail'
        })
    }
})
