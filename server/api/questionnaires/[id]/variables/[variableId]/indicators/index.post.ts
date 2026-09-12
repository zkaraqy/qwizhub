import { requireRole } from '~~/server/utils/auth'
import { VariableIndicator } from '~~/server/models/VariableIndicator'
import { ResearchVariable } from '~~/server/models/ResearchVariable'
import { Questionnaire } from '~~/server/models/Questionnaire'
import { v4 as uuidv4 } from 'uuid'

export default defineEventHandler(async (event) => {
    try {
        const user = await requireRole(event, 'peneliti')
        const questionnaireId = getRouterParam(event, 'id')
        const variableId = getRouterParam(event, 'variableId')
        const body = await readBody(event)

        if (!questionnaireId || !variableId) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Questionnaire ID and Variable ID are required'
            })
        }

        if (!body.indicatorText || body.indicatorText.trim().length === 0) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Indicator text is required'
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
                statusMessage: 'You do not have permission to add indicators'
            })
        }

        if (!questionnaire.isDraft()) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Cannot add indicators to published questionnaire'
            })
        }

        // Get next order index
        const maxOrder = await VariableIndicator.max('orderIndex', {
            where: { variableId }
        })
        const nextOrder = (maxOrder || 0) + 1

        // Create indicator
        const indicator = await VariableIndicator.create({
            id: uuidv4(),
            variableId,
            indicatorText: body.indicatorText.trim(),
            indicatorSource: 'manual',
            status: 'accepted',
            orderIndex: nextOrder
        })

        return {
            success: true,
            message: 'Indicator created successfully',
            indicator: {
                id: indicator.id,
                variableId: indicator.variableId,
                indicatorText: indicator.indicatorText,
                indicatorSource: indicator.indicatorSource,
                status: indicator.status,
                orderIndex: indicator.orderIndex,
                createdAt: indicator.createdAt
            }
        }
    } catch (error: any) {
        if (error.statusCode) {
            throw error
        }

        console.error('Create indicator error:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to create indicator'
        })
    }
})
