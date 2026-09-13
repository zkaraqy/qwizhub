import { requireRole } from '~~/server/utils/auth'
import { Project, Questionnaire, Response, Question } from '~~/server/models'
import { Op } from 'sequelize'

export default defineEventHandler(async (event) => {
    try {
        const user = await requireRole(event, 'peneliti')
        const query = getQuery(event)

        const search = (query.search as string)?.trim().toLowerCase() || ''
        const status = (query.status as string) || 'all'

        // Get peneliti projects
        const projects = await Project.findAll({
            where: { penelitiId: user.id },
            attributes: ['id', 'title']
        })
        const projectIds = projects.map(p => p.id)

        if (projectIds.length === 0) {
            return {
                success: true,
                questionnaires: []
            }
        }

        const whereClause: any = {
            projectId: { [Op.in]: projectIds }
        }

        if (status !== 'all') {
            if (status === 'active') {
                whereClause.status = 'published'
            } else if (status === 'draft') {
                whereClause.status = 'draft'
            } else if (status === 'closed') {
                whereClause.status = 'published'
                // Will also check targetRespondents <= currentResponses in filter
            }
        }

        if (search) {
            whereClause[Op.or] = [
                { topic: { [Op.iLike]: `%${search}%` } },
                { researchObjective: { [Op.iLike]: `%${search}%` } }
            ]
        }

        const questionnaires = await Questionnaire.findAll({
            where: whereClause,
            include: [
                {
                    model: Project,
                    as: 'project',
                    attributes: ['id', 'title']
                },
                {
                    model: Question,
                    as: 'questions',
                    attributes: ['id']
                }
            ],
            order: [['createdAt', 'DESC']]
        })

        // Fetch response counts for all questionnaires
        const qIds = questionnaires.map(q => q.id)
        const responses = qIds.length > 0
            ? await Response.findAll({
                where: { questionnaireId: { [Op.in]: qIds } },
                attributes: ['id', 'questionnaireId', 'status', 'createdAt']
            })
            : []

        const enrichedList = questionnaires.map(q => {
            const qResponses = responses.filter(r => r.questionnaireId === q.id)
            const completedCount = qResponses.filter(r => r.status === 'completed').length
            const inProgressCount = qResponses.filter(r => r.status === 'in_progress').length
            const totalCount = qResponses.length

            // Compute effective status
            let computedStatus: 'draft' | 'active' | 'closed' = 'draft'
            if (q.status === 'published') {
                if (q.targetRespondents > 0 && totalCount >= q.targetRespondents) {
                    computedStatus = 'closed'
                } else {
                    computedStatus = 'active'
                }
            }

            const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

            // Find last response date
            const lastResponse = qResponses.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]

            return {
                id: q.id,
                projectId: q.projectId,
                projectTitle: q.project?.title || 'Project',
                topic: q.topic || 'Kuesioner Tanpa Judul',
                researchObjective: q.researchObjective || '',
                status: q.status,
                computedStatus,
                targetRespondents: q.targetRespondents || 0,
                currentResponses: totalCount,
                completedResponses: completedCount,
                inProgressResponses: inProgressCount,
                completionRate,
                questionsCount: q.questions?.length || 0,
                createdAt: q.createdAt,
                updatedAt: q.updatedAt,
                lastResponseAt: lastResponse ? lastResponse.createdAt : null
            }
        })

        // Extra filter for 'closed' if requested
        const filteredList = status === 'closed'
            ? enrichedList.filter(item => item.computedStatus === 'closed')
            : status === 'active'
            ? enrichedList.filter(item => item.computedStatus === 'active')
            : enrichedList

        return {
            success: true,
            questionnaires: filteredList
        }
    } catch (error: any) {
        if (error.statusCode) throw error
        console.error('Error fetching researcher questionnaires:', error)
        throw createError({
            statusCode: 500,
            statusMessage: error.message || 'Gagal memuat daftar kuesioner'
        })
    }
})
