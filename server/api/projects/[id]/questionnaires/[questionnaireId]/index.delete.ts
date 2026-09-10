import { requireRole } from '~~/server/utils/auth'
import { Questionnaire } from '~~/server/models/Questionnaire'
import { Question } from '~~/server/models/Question'

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
                statusMessage: 'You do not have permission to delete this questionnaire'
            })
        }

        // Only allow deleting draft questionnaires
        if (!questionnaire.isDraft()) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Cannot delete published questionnaire'
            })
        }

        // Delete all questions first (cascade)
        await Question.destroy({
            where: { questionnaireId: questionnaireId }
        })

        // Delete questionnaire
        await questionnaire.destroy()

        return {
            success: true,
            message: 'Questionnaire deleted successfully'
        }
    } catch (error: any) {
        if (error.statusCode) {
            throw error
        }

        console.error('Delete questionnaire error:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to delete questionnaire'
        })
    }
})
