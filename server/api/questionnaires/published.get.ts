import { defineEventHandler, getQuery, createError } from 'h3'
import { getServerSession } from '#auth'
import { Questionnaire, Project, User, Transaction, RespondentProfile } from '~~/server/models'
import { Op } from 'sequelize'

/**
 * GET /api/questionnaires/published
 * Browse published questionnaires available for respondents
 * Query params: search, page, limit, status (filter), specialization (filter)
 *   - specialization: '' or 'all' = show all accessible questionnaires (based on profile),
 *                     '<value>' = additionally filter by that specific specialization
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

        // Get user's specialization from profile
        const userId = session.user.id
        const userProfile = await RespondentProfile.findOne({
            where: { userId }
        })

        const userSpecialization = userProfile?.specialization || null

        const query = getQuery(event)
        const search = (query.search as string) || ''
        const page = parseInt((query.page as string) || '1')
        const limit = parseInt((query.limit as string) || '10')
        const statusFilter = (query.status as string) || 'all' // all, available, full, completed
        const offset = (page - 1) * limit

        // Specialization filter from frontend ('' or 'all' = no override, use profile-based logic)
        const specializationParam = (query.specialization as string) || ''
        // The effective specialization to use for filtering:
        //   - If frontend sends a specific value, use that (user manually selected)
        //   - Otherwise fall back to user's profile specialization
        const activeSpecialization = (specializationParam && specializationParam !== 'all')
            ? specializationParam
            : userSpecialization

        // Build where clause
        // Always show questionnaires that accept all specializations (empty array / null).
        // If an active specialization is resolved, also include questionnaires that specifically
        // require that specialization.
        const whereClause: any = {
            status: 'published',
            [Op.or]: [
                { requiredSpecializations: { [Op.eq]: [] } }, // Accept all specializations
                { requiredSpecializations: { [Op.is]: null } }, // Legacy data compatibility
                ...(activeSpecialization ? [{ requiredSpecializations: { [Op.contains]: [activeSpecialization] } }] : [])
            ]
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
        const { Response } = await import('~~/server/models')
        
        let questionnairesWithStatus = await Promise.all(
            questionnaires.map(async (q) => {
                const hasResponded = await Response.findOne({
                    where: {
                        questionnaireId: q.id,
                        respondentId: userId
                    }
                })
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
                    requiredSpecializations: q.requiredSpecializations || [],
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
            userSpecialization,
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
