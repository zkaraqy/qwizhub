import { requireRole } from '~~/server/utils/auth'
import { Question } from '~~/server/models/Question'
import { Questionnaire } from '~~/server/models/Questionnaire'

export default defineEventHandler(async (event) => {
    try {
        const user = await requireRole(event, 'peneliti')
        const questionId = getRouterParam(event, 'id')

        if (!questionId) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Question ID is required'
            })
        }

        const question = await Question.findByPk(questionId, {
            include: [{
                model: Questionnaire,
                as: 'questionnaire'
            }]
        })

        if (!question) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Question not found'
            })
        }

        // Check ownership via questionnaire
        if (!await question.questionnaire?.canEdit(user.id)) {
            throw createError({
                statusCode: 403,
                statusMessage: 'You do not have permission to delete this question'
            })
        }

        if (!question.questionnaire?.isDraft()) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Cannot delete questions from published questionnaire'
            })
        }

        await question.destroy()

        return {
            success: true,
            message: 'Question deleted successfully'
        }
    } catch (error: any) {
        if (error.statusCode) {
            throw error
        }

        console.error('Delete question error:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to delete question'
        })
    }
})
