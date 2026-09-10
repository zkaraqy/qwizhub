import { requireRole } from '~~/server/utils/auth'
import { Project } from '~~/server/models/Project'
import { Questionnaire } from '~~/server/models/Questionnaire'
import { v4 as uuidv4 } from 'uuid'

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

        const body = await readBody(event)

        // Validate required fields
        if (!body.topic || body.topic.trim().length === 0) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Topic is required'
            })
        }

        if (!body.researchObjective || body.researchObjective.trim().length === 0) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Research objective is required'
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
                statusMessage: 'You do not have permission to create questionnaire for this project'
            })
        }

        // Create questionnaire
        const questionnaire = await Questionnaire.create({
            id: uuidv4(),
            projectId: projectId,
            topic: body.topic.trim(),
            researchObjective: body.researchObjective.trim(),
            variables: body.variables || [],
            status: 'draft'
        })

        return {
            success: true,
            message: 'Questionnaire created successfully',
            id: questionnaire.id,
            questionnaire: {
                id: questionnaire.id,
                projectId: questionnaire.projectId,
                topic: questionnaire.topic,
                researchObjective: questionnaire.researchObjective,
                variables: questionnaire.variables,
                status: questionnaire.status,
                createdAt: questionnaire.createdAt,
                updatedAt: questionnaire.updatedAt
            }
        }
    } catch (error: any) {
        if (error.statusCode) {
            throw error
        }

        console.error('Create questionnaire error:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to create questionnaire'
        })
    }
})
