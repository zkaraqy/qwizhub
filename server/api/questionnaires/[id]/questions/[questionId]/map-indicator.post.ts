import { requireRole } from '~~/server/utils/auth'
import { Question } from '~~/server/models/Question'
import { Questionnaire } from '~~/server/models/Questionnaire'
import { VariableIndicator } from '~~/server/models/VariableIndicator'

export default defineEventHandler(async (event) => {
    try {
        const user = await requireRole(event, 'peneliti')
        const questionnaireId = getRouterParam(event, 'id')
        const questionId = getRouterParam(event, 'questionId')
        const body = await readBody(event)

        if (!questionnaireId || !questionId) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Questionnaire ID and Question ID are required'
            })
        }

        // Find question
        const question = await Question.findByPk(questionId)

        if (!question || question.questionnaireId !== questionnaireId) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Question not found'
            })
        }

        // Verify questionnaire and permissions
        const questionnaire = await Questionnaire.findByPk(questionnaireId)

        if (!questionnaire) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Questionnaire not found'
            })
        }

        if (!await questionnaire.canEdit(user.id)) {
            throw createError({
                statusCode: 403,
                statusMessage: 'You do not have permission to map this question'
            })
        }

        if (!questionnaire.isDraft()) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Cannot map questions in published questionnaire'
            })
        }

        // Validate indicator exists if provided
        if (body.indicatorId) {
            const indicator = await VariableIndicator.findByPk(body.indicatorId)
            
            if (!indicator) {
                throw createError({
                    statusCode: 404,
                    statusMessage: 'Indicator not found'
                })
            }

            // Set both variable and indicator
            question.variableId = indicator.variableId
            question.indicatorId = body.indicatorId
        } else {
            // Clear mapping
            question.variableId = null
            question.indicatorId = null
        }

        await question.save()

        return {
            success: true,
            message: body.indicatorId ? 'Question mapped to indicator' : 'Question unmapped',
            question: {
                id: question.id,
                variableId: question.variableId,
                indicatorId: question.indicatorId,
                updatedAt: question.updatedAt
            }
        }
    } catch (error: any) {
        if (error.statusCode) {
            throw error
        }

        console.error('Map question error:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to map question'
        })
    }
})
