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
                statusMessage: 'You do not have permission to publish this questionnaire'
            })
        }

        // Check if can publish
        if (!await questionnaire.canPublish()) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Cannot publish questionnaire. It must be in draft status and have at least one question.'
            })
        }

        // Update status to published
        questionnaire.status = 'published'
        await questionnaire.save()

        return {
            success: true,
            message: 'Questionnaire published successfully',
            questionnaire: {
                id: questionnaire.id,
                status: questionnaire.status,
                updatedAt: questionnaire.updatedAt
            }
        }
    } catch (error: any) {
        if (error.statusCode) {
            throw error
        }

        console.error('Publish questionnaire error:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to publish questionnaire'
        })
    }
})
