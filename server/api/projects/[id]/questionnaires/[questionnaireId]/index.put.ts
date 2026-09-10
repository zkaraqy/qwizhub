import { requireRole } from '~~/server/utils/auth'
import { Questionnaire } from '~~/server/models/Questionnaire'

export default defineEventHandler(async (event) => {
    try {
        const user = await requireRole(event, 'peneliti')
        const projectId = getRouterParam(event, 'id')
        const questionnaireId = getRouterParam(event, 'questionnaireId')

        if (!projectId) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Project ID is required'
            })
        }

        if (!questionnaireId) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Questionnaire ID is required'
            })
        }

        const body = await readBody(event)

        // Fetch questionnaire with project for ownership check
        const questionnaire = await Questionnaire.findByPk(questionnaireId, {
            include: ['project']
        })

        if (!questionnaire) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Questionnaire not found'
            })
        }

        // Verify questionnaire belongs to the correct project
        if (questionnaire.projectId !== projectId) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Questionnaire does not belong to this project'
            })
        }

        // Check ownership
        if (!await questionnaire.canEdit(user.id)) {
            throw createError({
                statusCode: 403,
                statusMessage: 'You do not have permission to edit this questionnaire'
            })
        }

        // Only allow editing draft questionnaires
        if (!questionnaire.isDraft()) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Cannot edit published questionnaire'
            })
        }

        // Update fields
        if (body.topic !== undefined) {
            if (!body.topic || body.topic.trim().length === 0) {
                throw createError({
                    statusCode: 400,
                    statusMessage: 'Topic cannot be empty'
                })
            }
            questionnaire.topic = body.topic.trim()
        }

        if (body.researchObjective !== undefined) {
            if (!body.researchObjective || body.researchObjective.trim().length === 0) {
                throw createError({
                    statusCode: 400,
                    statusMessage: 'Research objective cannot be empty'
                })
            }
            questionnaire.researchObjective = body.researchObjective.trim()
        }

        if (body.variables !== undefined) {
            questionnaire.variables = body.variables
        }

        await questionnaire.save()

        return {
            success: true,
            message: 'Questionnaire updated successfully',
            questionnaire: {
                id: questionnaire.id,
                projectId: questionnaire.projectId,
                topic: questionnaire.topic,
                researchObjective: questionnaire.researchObjective,
                variables: questionnaire.variables,
                status: questionnaire.status,
                updatedAt: questionnaire.updatedAt
            }
        }
    } catch (error: any) {
        if (error.statusCode) {
            throw error
        }

        console.error('Update questionnaire error:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to update questionnaire'
        })
    }
})
