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
                statusMessage: 'You do not have permission to update this question'
            })
        }

        if (!question.questionnaire?.isDraft()) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Cannot update questions in published questionnaire'
            })
        }

        const body = await readBody(event)

        // Update allowed fields
        if (body.questionText !== undefined) {
            question.questionText = body.questionText
        }

        if (body.questionType !== undefined) {
            question.questionType = body.questionType
        }

        if (body.scaleType !== undefined) {
            question.scaleType = body.scaleType
        }

        if (body.options !== undefined) {
            question.options = body.options
        }

        await question.save()

        return {
            success: true,
            message: 'Question updated successfully',
            question: {
                id: question.id,
                questionText: question.questionText,
                questionType: question.questionType,
                scaleType: question.scaleType,
                options: question.getFormattedOptions(),
                orderIndex: question.orderIndex,
                updatedAt: question.updatedAt
            }
        }
    } catch (error: any) {
        if (error.statusCode) {
            throw error
        }

        console.error('Update question error:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to update question'
        })
    }
})
