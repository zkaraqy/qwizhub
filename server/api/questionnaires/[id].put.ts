import { requireRole } from '~~/server/utils/auth'
import { Questionnaire } from '~~/server/models/Questionnaire'

export default defineEventHandler(async (event) => {
    try {
        const user = await requireRole(event, 'peneliti')
        const questionnaireId = getRouterParam(event, 'id')

        if (!questionnaireId) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Questionnaire ID is required'
            })
        }

        const questionnaire = await Questionnaire.findByPk(questionnaireId)

        if (!questionnaire) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Questionnaire not found'
            })
        }

        // Check ownership
        if (!await questionnaire.canEdit(user.id)) {
            throw createError({
                statusCode: 403,
                statusMessage: 'You do not have permission to update this questionnaire'
            })
        }

        // Only allow updating if still draft
        if (!questionnaire.isDraft()) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Cannot update published questionnaire'
            })
        }

        const body = await readBody(event)

        // Update allowed fields
        if (body.topic !== undefined) {
            questionnaire.topic = body.topic
        }

        if (body.researchObjective !== undefined) {
            questionnaire.researchObjective = body.researchObjective
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
