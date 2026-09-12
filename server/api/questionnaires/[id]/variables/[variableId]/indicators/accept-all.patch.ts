import { requireRole } from '~~/server/utils/auth'
import { VariableIndicator } from '~~/server/models/VariableIndicator'
import { ResearchVariable } from '~~/server/models/ResearchVariable'
import { Questionnaire } from '~~/server/models/Questionnaire'

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

        // Verify variable exists
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
                statusMessage: 'You do not have permission to accept indicators'
            })
        }

        if (!questionnaire.isDraft()) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Cannot accept indicators in published questionnaire'
            })
        }

        // Update all pending indicators to accepted
        const [affectedCount] = await VariableIndicator.update(
            { status: 'accepted' },
            {
                where: {
                    variableId,
                    status: 'pending'
                }
            }
        )

        return {
            success: true,
            message: `${affectedCount} indicators accepted`,
            affectedCount
        }
    } catch (error: any) {
        if (error.statusCode) {
            throw error
        }

        console.error('Accept all indicators error:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to accept indicators'
        })
    }
})
