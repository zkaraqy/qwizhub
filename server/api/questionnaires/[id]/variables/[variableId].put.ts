import { requireRole } from '~~/server/utils/auth'
import { ResearchVariable } from '~~/server/models/ResearchVariable'
import { Questionnaire } from '~~/server/models/Questionnaire'

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
                statusMessage: 'You do not have permission to update this variable'
            })
        }

        if (!questionnaire.isDraft()) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Cannot update variables in published questionnaire'
            })
        }

        // Update fields
        if (body.variableName && body.variableName.trim().length > 0) {
            variable.variableName = body.variableName.trim()
        }

        if (body.variableType) {
            const validTypes = ['independent', 'dependent', 'moderating', 'intervening', 'control']
            if (!validTypes.includes(body.variableType)) {
                throw createError({
                    statusCode: 400,
                    statusMessage: 'Invalid variable type'
                })
            }
            variable.variableType = body.variableType
        }

        if (body.description !== undefined) {
            variable.description = body.description ? body.description.trim() : null
        }

        if (body.orderIndex !== undefined) {
            variable.orderIndex = body.orderIndex
        }

        await variable.save()

        return {
            success: true,
            message: 'Variable updated successfully',
            variable: {
                id: variable.id,
                questionnaireId: variable.questionnaireId,
                variableName: variable.variableName,
                variableType: variable.variableType,
                variableTypeLabel: variable.getVariableTypeLabel(),
                description: variable.description,
                orderIndex: variable.orderIndex,
                updatedAt: variable.updatedAt
            }
        }
    } catch (error: any) {
        if (error.statusCode) {
            throw error
        }

        console.error('Update variable error:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to update variable'
        })
    }
})
