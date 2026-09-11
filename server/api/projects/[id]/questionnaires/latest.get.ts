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

        // Verify project exists and user owns it
        const project = await Project.findByPk(projectId)

        if (!project) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Project not found'
            })
        }

        if (!project.isOwnedBy(user.id)) {
            throw createError({
                statusCode: 403,
                statusMessage: 'You do not have permission to access this project'
            })
        }

        // Get latest questionnaire for this project
        const questionnaire = await Questionnaire.findOne({
            where: { projectId },
            order: [['createdAt', 'DESC']]
        })

        if (!questionnaire) {
            throw createError({
                statusCode: 404,
                statusMessage: 'No questionnaire found for this project'
            })
        }

        return {
            success: true,
            id: questionnaire.id,
            questionnaire: {
                id: questionnaire.id,
                projectId: questionnaire.projectId,
                topic: questionnaire.topic,
                researchObjective: questionnaire.researchObjective,
                variables: questionnaire.variables,
                status: questionnaire.status,
                paidForAccess: questionnaire.paidForAccess,
                createdAt: questionnaire.createdAt
            }
        }
    } catch (error: any) {
        if (error.statusCode) {
            throw error
        }

        console.error('Get latest questionnaire error:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to get latest questionnaire'
        })
    }
})

