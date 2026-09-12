import { requireRole } from '~~/server/utils/auth'
import { ResearchVariable } from '~~/server/models/ResearchVariable'
import { VariableIndicator } from '~~/server/models/VariableIndicator'
import { Questionnaire } from '~~/server/models/Questionnaire'

export default defineEventHandler(async (event) => {
    try {
        const user = await requireRole(event, 'peneliti')
        const questionnaireId = getRouterParam(event, 'id')

        if (!questionnaireId) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Questionnaire ID is required'
            })
        }

        // Verify questionnaire exists and user can view
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
                statusMessage: 'You do not have permission to view variables for this questionnaire'
            })
        }

        // Fetch variables with indicators
        const variables = await ResearchVariable.findAll({
            where: { questionnaireId },
            include: [
                {
                    model: VariableIndicator,
                    as: 'indicators',
                    order: [['orderIndex', 'ASC']]
                }
            ],
            order: [['orderIndex', 'ASC']]
        })

        return {
            success: true,
            variables: variables.map(variable => ({
                id: variable.id,
                questionnaireId: variable.questionnaireId,
                variableName: variable.variableName,
                variableType: variable.variableType,
                variableTypeLabel: variable.getVariableTypeLabel(),
                description: variable.description,
                orderIndex: variable.orderIndex,
                createdAt: variable.createdAt,
                updatedAt: variable.updatedAt,
                indicators: variable.indicators?.map(ind => ({
                    id: ind.id,
                    indicatorText: ind.indicatorText,
                    indicatorSource: ind.indicatorSource,
                    status: ind.status,
                    orderIndex: ind.orderIndex,
                    createdAt: ind.createdAt
                })) || []
            }))
        }
    } catch (error: any) {
        if (error.statusCode) {
            throw error
        }

        console.error('Get variables error:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to fetch variables'
        })
    }
})
