import { requireRole } from '~~/server/utils/auth'
import { VariableIndicator } from '~~/server/models/VariableIndicator'
import { ResearchVariable } from '~~/server/models/ResearchVariable'
import { Questionnaire } from '~~/server/models/Questionnaire'
import { Question } from '~~/server/models/Question'

export default defineEventHandler(async (event) => {
    try {
        const user = await requireRole(event, 'peneliti')
        const questionnaireId = getRouterParam(event, 'id')
        const variableId = getRouterParam(event, 'variableId')
        const indicatorId = getRouterParam(event, 'indicatorId')

        if (!questionnaireId || !variableId || !indicatorId) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Required IDs are missing'
            })
        }

        // Find indicator
        const indicator = await VariableIndicator.findByPk(indicatorId)

        if (!indicator || indicator.variableId !== variableId) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Indicator not found'
            })
        }

        // Verify variable and questionnaire
        const variable = await ResearchVariable.findByPk(variableId)
        if (!variable || variable.questionnaireId !== questionnaireId) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Variable not found'
            })
        }

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
                statusMessage: 'You do not have permission to delete this indicator'
            })
        }

        if (!questionnaire.isDraft()) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Cannot delete indicators from published questionnaire'
            })
        }

        // Count related questions
        const questionCount = await Question.count({
            where: { indicatorId }
        })

        // Delete indicator
        await indicator.destroy()

        return {
            success: true,
            message: 'Indicator deleted successfully',
            affectedQuestions: questionCount
        }
    } catch (error: any) {
        if (error.statusCode) {
            throw error
        }

        console.error('Delete indicator error:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to delete indicator'
        })
    }
})
