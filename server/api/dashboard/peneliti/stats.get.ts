import { requireRole } from '~~/server/utils/auth'
import { Project, Questionnaire, Response, Question, User } from '~~/server/models'
import { Op } from 'sequelize'

export default defineEventHandler(async (event) => {
    try {
        const user = await requireRole(event, 'peneliti')
        const query = getQuery(event)

        const questionnaireFilter = query.questionnaireId as string | undefined
        const statusFilter = query.status as string | undefined
        const dateRangeFilter = (query.dateRange as string) || 'all'
        const searchQuery = (query.search as string)?.trim().toLowerCase() || ''

        // 1. Get all projects owned by this peneliti
        const projects = await Project.findAll({
            where: { penelitiId: user.id },
            attributes: ['id', 'title']
        })
        const projectIds = projects.map(p => p.id)

        if (projectIds.length === 0) {
            return {
                success: true,
                summary: {
                    totalQuestionnaires: 0,
                    activeQuestionnaires: 0,
                    closedQuestionnaires: 0,
                    totalRespondents: 0,
                    totalResponses: 0,
                    completedResponses: 0,
                    avgResponsesPerQuestionnaire: 0,
                    overallCompletionRate: 0
                },
                charts: {
                    responsesOverTime: [],
                    responsesPerQuestionnaire: [],
                    statusDistribution: { draft: 0, published: 0, closed: 0 }
                },
                recentResponses: []
            }
        }

        // 2. Build questionnaire query
        const questionnaireWhere: any = {
            projectId: { [Op.in]: projectIds }
        }

        if (questionnaireFilter && questionnaireFilter !== 'all') {
            questionnaireWhere.id = questionnaireFilter
        }

        if (statusFilter && statusFilter !== 'all') {
            if (statusFilter === 'active') {
                questionnaireWhere.status = 'published'
            } else if (statusFilter === 'closed') {
                questionnaireWhere.status = 'published'
                // Or target reached
            } else {
                questionnaireWhere.status = statusFilter
            }
        }

        if (searchQuery) {
            questionnaireWhere[Op.or] = [
                { topic: { [Op.iLike]: `%${searchQuery}%` } },
                { researchObjective: { [Op.iLike]: `%${searchQuery}%` } }
            ]
        }

        const userQuestionnaires = await Questionnaire.findAll({
            where: questionnaireWhere,
            include: [
                {
                    model: Project,
                    as: 'project',
                    attributes: ['id', 'title']
                }
            ],
            order: [['createdAt', 'DESC']]
        })

        const allQuestionnaireIds = userQuestionnaires.map(q => q.id)

        // 3. Date range filter for responses
        const responseWhere: any = {
            questionnaireId: { [Op.in]: allQuestionnaireIds }
        }

        const now = new Date()
        if (dateRangeFilter === '7d') {
            const date7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            responseWhere.createdAt = { [Op.gte]: date7d }
        } else if (dateRangeFilter === '30d') {
            const date30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
            responseWhere.createdAt = { [Op.gte]: date30d }
        } else if (dateRangeFilter === 'custom' && query.startDate && query.endDate) {
            responseWhere.createdAt = {
                [Op.between]: [new Date(query.startDate as string), new Date(query.endDate as string)]
            }
        }

        // 4. Fetch responses
        const responses = allQuestionnaireIds.length > 0
            ? await Response.findAll({
                where: responseWhere,
                include: [
                    {
                        model: User,
                        as: 'respondent',
                        attributes: ['id', 'name', 'email']
                    },
                    {
                        model: Questionnaire,
                        as: 'questionnaire',
                        attributes: ['id', 'topic']
                    }
                ],
                order: [['createdAt', 'DESC']]
            })
            : []

        // 5. Calculate statistics
        const totalQuestionnaires = userQuestionnaires.length
        
        let activeCount = 0
        let closedCount = 0
        let draftCount = 0

        userQuestionnaires.forEach(q => {
            if (q.status === 'draft') {
                draftCount++
            } else if (q.status === 'published') {
                if (q.targetRespondents > 0 && q.currentResponses >= q.targetRespondents) {
                    closedCount++
                } else {
                    activeCount++
                }
            }
        })

        const totalResponses = responses.length
        const completedResponses = responses.filter(r => r.status === 'completed').length
        const uniqueRespondents = new Set(responses.map(r => r.respondentId)).size
        const avgResponsesPerQuestionnaire = totalQuestionnaires > 0
            ? Number((totalResponses / totalQuestionnaires).toFixed(1))
            : 0
        const overallCompletionRate = totalResponses > 0
            ? Math.round((completedResponses / totalResponses) * 100)
            : 0

        // 6. Build Chart Data: Responses over time (last 14 days or grouped by date)
        const dateMap: Record<string, { total: number; completed: number }> = {}
        // Initialize last 14 days if 'all' or '7d' or '30d'
        const daysToInit = dateRangeFilter === '7d' ? 7 : 14
        for (let i = daysToInit - 1; i >= 0; i--) {
            const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
            const dateStr = d.toISOString().split('T')[0]
            dateMap[dateStr] = { total: 0, completed: 0 }
        }

        responses.forEach(r => {
            const d = new Date(r.createdAt).toISOString().split('T')[0]
            if (!dateMap[d]) {
                dateMap[d] = { total: 0, completed: 0 }
            }
            dateMap[d].total++
            if (r.status === 'completed') {
                dateMap[d].completed++
            }
        })

        const responsesOverTime = Object.keys(dateMap)
            .sort()
            .slice(-30) // max 30 points
            .map(date => ({
                date,
                label: new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
                total: dateMap[date].total,
                completed: dateMap[date].completed
            }))

        // 7. Responses per Questionnaire chart
        const responsesPerQuestionnaire = userQuestionnaires.map(q => {
            const qResponses = responses.filter(r => r.questionnaireId === q.id)
            return {
                id: q.id,
                title: q.topic || 'Kuesioner Tanpa Judul',
                currentResponses: qResponses.length,
                completedResponses: qResponses.filter(r => r.status === 'completed').length,
                targetRespondents: q.targetRespondents || 0,
                progressPercentage: q.targetRespondents > 0
                    ? Math.min(100, Math.round((qResponses.length / q.targetRespondents) * 100))
                    : 0
            }
        })

        // 8. Recent Responses list (max 10)
        const recentResponses = responses.slice(0, 10).map(r => ({
            id: r.id,
            questionnaireId: r.questionnaireId,
            questionnaireTopic: r.questionnaire?.topic || '-',
            respondentName: r.respondent?.name || 'Responden Anonim',
            respondentEmail: r.respondent?.email || '-',
            status: r.status,
            answersCount: Array.isArray(r.answers) ? r.answers.length : 0,
            startedAt: r.startedAt,
            completedAt: r.completedAt,
            createdAt: r.createdAt,
            timeSpentSeconds: r.completedAt && r.startedAt
                ? Math.round((new Date(r.completedAt).getTime() - new Date(r.startedAt).getTime()) / 1000)
                : null
        }))

        return {
            success: true,
            summary: {
                totalQuestionnaires,
                activeQuestionnaires: activeCount,
                closedQuestionnaires: closedCount,
                draftQuestionnaires: draftCount,
                totalRespondents: uniqueRespondents,
                totalResponses,
                completedResponses,
                avgResponsesPerQuestionnaire,
                overallCompletionRate
            },
            charts: {
                responsesOverTime,
                responsesPerQuestionnaire,
                statusDistribution: {
                    draft: draftCount,
                    published: activeCount,
                    closed: closedCount
                }
            },
            recentResponses
        }
    } catch (error: any) {
        if (error.statusCode) throw error
        console.error('Error fetching researcher stats:', error)
        throw createError({
            statusCode: 500,
            statusMessage: error.message || 'Gagal memuat statistik dashboard peneliti'
        })
    }
})
