import { defineEventHandler, getQuery, createError } from 'h3'
import { getServerSession } from '#auth'
import { Questionnaire, Project, User, Transaction } from '~~/server/models'
import { Op } from 'sequelize'

/**
 * GET /api/questionnaires/published
 * Browse published questionnaires available for respondents
 * Query params: search, page, limit, status (filter)
 */
export default defineEventHandler(async (event) => {
    try {
        const session = await getServerSession(event)
        if (!session || !session.user) {
            throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
        }

        // Only respondents can browse
        if (session.user.role !== 'responden') {
            throw createError({ statusCode: 403, statusMessage: 'Only respondents can browse questionnaires' })
        }

        const query = getQuery(event)
        const search = (query.search as string) || ''
        const page = parseInt((query.page as string) || '1')
        const limit = parseInt((query.limit as string) || '10')
        const statusFilter = (query.status as string) || 'all' // all, available, full, completed
        const offset = (page - 1) * limit

        // Build where clause
        const whereClause: any = {
            status: 'published'
        }

        // Add search filter
        if (search) {
            whereClause.topic = {
                [Op.iLike]: `%${search}%`
            }
        }

        // Fetch questionnaires
        const { rows: questionnaires, count: total } = await Questionnaire.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: Project,
                    as: 'project',
                    include: [
                        {
                            model: User,
                            as: 'peneliti',
                            attributes: ['id', 'name', 'email']
                        }
                    ]
                },
                {
                    model: Transaction,
                    as: 'transactions',
                    where: { status: 'success', transactionType: 'questionnaire_publish' },
                    required: false,
                    limit: 1,
                    attributes: ['id', 'honorariumPerRespondent', 'createdAt']
                }
            ],
            order: [['createdAt', 'DESC']],
            limit,
            offset,
            distinct: true
        })

        // Check if user has already responded to each questionnaire
        const userId = session.user.id
        const { Response } = await import('~~/server/models')
        
        let questionnairesWithStatus = await Promise.all(
            questionnaires.map(async (q) => {
                const hasResponded = await Response.findOne({
                    where: {
                        questionnaireId: q.id,
                        respondentId: userId
                    }
                })
                console.log(`[Transaction] Questionnaire ID: ${q.topic}, Trx: ${JSON.stringify(q.dataValues)}`)
                const honorarium = q.transactions?.[0]?.honorariumPerRespondent || 0
                const publishedAt = q.transactions?.[0]?.createdAt || q.createdAt

                return {
                    id: q.id,
                    topic: q.topic,
                    researchObjective: q.researchObjective,
                    targetRespondents: q.targetRespondents,
                    currentResponses: q.currentResponses,
                    remainingSlots: q.getRemainingSlots(),
                    isAvailable: q.isAcceptingResponses(),
                    hasResponded: !!hasResponded,
                    honorariumPerRespondent: honorarium,
                    publishedAt: publishedAt,
                    createdAt: q.createdAt,
                    project: {
                        id: q.project?.id,
                        title: q.project?.title,
                        peneliti: q.project?.peneliti
                    }
                }
            })
        )

        // Apply status filter
        if (statusFilter !== 'all') {
            questionnairesWithStatus = questionnairesWithStatus.filter(q => {
                if (statusFilter === 'available') return q.isAvailable && !q.hasResponded
                if (statusFilter === 'full') return !q.isAvailable && !q.hasResponded
                if (statusFilter === 'completed') return q.hasResponded
                return true
            })
        }

        return {
            success: true,
            data: questionnairesWithStatus,
            pagination: {
                page,
                limit,
                total: questionnairesWithStatus.length,
                totalPages: Math.ceil(questionnairesWithStatus.length / limit)
            }
        }
    } catch (error: any) {
        console.error('Browse questionnaires error:', error)
        throw createError({
            statusCode: error.statusCode || 500,
            statusMessage: error.statusMessage || 'Failed to fetch questionnaires'
        })
    }
})
