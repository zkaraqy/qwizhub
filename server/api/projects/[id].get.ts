import { requireRole } from '~~/server/utils/auth'
import { Project } from '~~/server/models/Project'
import { Questionnaire } from '~~/server/models/Questionnaire'

export default defineEventHandler(async (event) => {
    try {
        const user = await requireRole(event, 'peneliti')
        const projectId = getRouterParam(event, 'id')

        if (!projectId) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Project ID is required'
            })
        }

        // Fetch project with questionnaires
        const project = await Project.findByPk(projectId, {
            include: [
                {
                    model: Questionnaire,
                    as: 'questionnaires',
                    attributes: ['id', 'topic', 'status', 'createdAt', 'updatedAt']
                }
            ]
        })

        if (!project) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Project not found'
            })
        }

        // Check ownership
        if (!project.isOwnedBy(user.id)) {
            throw createError({
                statusCode: 403,
                statusMessage: 'You do not have permission to view this project'
            })
        }

        return {
            success: true,
            project: {
                id: project.id,
                title: project.title,
                description: project.description,
                targetRespondents: project.targetRespondents,
                status: project.status,
                createdAt: project.createdAt,
                updatedAt: project.updatedAt,
                questionnaires: project.questionnaires?.map(q => ({
                    id: q.id,
                    topic: q.topic,
                    status: q.status,
                    createdAt: q.createdAt,
                    updatedAt: q.updatedAt
                })) || []
            }
        }
    } catch (error: any) {
        if (error.statusCode) {
            throw error
        }

        console.error('Get project error:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to fetch project'
        })
    }
})
