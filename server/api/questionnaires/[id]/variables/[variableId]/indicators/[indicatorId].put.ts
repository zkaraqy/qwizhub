import { requireRole } from '~~/server/utils/auth'
import { VariableIndicator } from '~~/server/models/VariableIndicator'
import { ResearchVariable } from '~~/server/models/ResearchVariable'
import { Questionnaire } from '~~/server/models/Questionnaire'

export default defineEventHandler(async (event) => {
    try {
        const user = await requireRole(event, 'peneliti')
        const questionnaireId = getRouterParam(event, 'id')
        const variableId = getRouterParam(event, 'variableId')
        const indicatorId = getRouterParam(event, 'indicatorId')
        const body = await readBody(event)

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
                statusMessage: 'You do not have permission to update this indicator'
            })
        }

        if (!questionnaire.isDraft()) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Cannot update indicators in published questionnaire'
            })
        }

        // Update fields
        if (body.indicatorText && body.indicatorText.trim().length > 0) {
            indicator.indicatorText = body.indicatorText.trim()
        }

        if (body.status) {
            const validStatuses = ['accepted', 'pending', 'rejected']
            if (!validStatuses.includes(body.status)) {
                throw createError({
                    statusCode: 400,
                    statusMessage: 'Invalid status'
                })
            }
            indicator.status = body.status
        }

        if (body.orderIndex !== undefined) {
            indicator.orderIndex = body.orderIndex
        }

        await indicator.save()

        return {
            success: true,
            message: 'Indicator updated successfully',
            indicator: {
                id: indicator.id,
                variableId: indicator.variableId,
                indicatorText: indicator.indicatorText,
                indicatorSource: indicator.indicatorSource,
                status: indicator.status,
                orderIndex: indicator.orderIndex,
                updatedAt: indicator.updatedAt
            }
        }
    } catch (error: any) {
        if (error.statusCode) {
            throw error
        }

        console.error('Update indicator error:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to update indicator'
        })
    }
})
