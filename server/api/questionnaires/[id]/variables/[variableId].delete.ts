import { requireRole } from '~~/server/utils/auth'
import { ResearchVariable } from '~~/server/models/ResearchVariable'
import { Questionnaire } from '~~/server/models/Questionnaire'
import { VariableIndicator } from '~~/server/models/VariableIndicator'
import { Question } from '~~/server/models/Question'

export default defineEventHandler(async (event) => {
    try {
        const user = await requireRole(event, 'peneliti')
        const questionnaireId = getRouterParam(event, 'id')
        const variableId = getRouterParam(event, 'variableId')

        if (!questionnaireId || !variableId) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Questionnaire ID and Variable ID are required'
            })
        }

        // Find variable
        const variable = await ResearchVariable.findByPk(variableId)

        if (!variable || variable.questionnaireId !== questionnaireId) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Variable not found'
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
                statusMessage: 'You do not have permission to delete this variable'
            })
        }

        if (!questionnaire.isDraft()) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Cannot delete variables from published questionnaire'
            })
        }

        // Count related questions
        const questionCount = await Question.count({
            where: { variableId }
        })

        // Delete variable (cascade will handle indicators and update questions)
        await variable.destroy()

        return {
            success: true,
            message: 'Variable deleted successfully',
            affectedQuestions: questionCount
        }
    } catch (error: any) {
        if (error.statusCode) {
            throw error
        }

        console.error('Delete variable error:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to delete variable'
        })
    }
})
