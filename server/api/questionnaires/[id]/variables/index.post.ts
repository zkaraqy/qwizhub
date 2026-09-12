import { requireRole } from '~~/server/utils/auth'
import { ResearchVariable } from '~~/server/models/ResearchVariable'
import { Questionnaire } from '~~/server/models/Questionnaire'
import { v4 as uuidv4 } from 'uuid'

export default defineEventHandler(async (event) => {
    try {
        const user = await requireRole(event, 'peneliti')
        const questionnaireId = getRouterParam(event, 'id')
        const body = await readBody(event)

        if (!questionnaireId) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Questionnaire ID is required'
            })
        }

        // Validate required fields
        if (!body.variableName || body.variableName.trim().length === 0) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Variable name is required'
            })
        }

        if (!body.variableType) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Variable type is required'
            })
        }

        const validTypes = ['independent', 'dependent', 'moderating', 'intervening', 'control']
        if (!validTypes.includes(body.variableType)) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Invalid variable type'
            })
        }

        // Verify questionnaire exists and user can edit
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
                statusMessage: 'You do not have permission to add variables to this questionnaire'
            })
        }

        if (!questionnaire.isDraft()) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Cannot add variables to published questionnaire'
            })
        }

        // Get next order index
        const maxOrder = await ResearchVariable.max('orderIndex', {
            where: { questionnaireId }
        }) as number | null
        const nextOrder = (maxOrder || 0) + 1

        // Create variable
        const variable = await ResearchVariable.create({
            id: uuidv4(),
            questionnaireId,
            variableName: body.variableName.trim(),
            variableType: body.variableType,
            description: body.description ? body.description.trim() : null,
            orderIndex: nextOrder
        })

        return {
            success: true,
            message: 'Variable created successfully',
            variable: {
                id: variable.id,
                questionnaireId: variable.questionnaireId,
                variableName: variable.variableName,
                variableType: variable.variableType,
                variableTypeLabel: variable.getVariableTypeLabel(),
                description: variable.description,
                orderIndex: variable.orderIndex,
                createdAt: variable.createdAt
            }
        }
    } catch (error: any) {
        if (error.statusCode) {
            throw error
        }

        console.error('Create variable error:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to create variable'
        })
    }
})
