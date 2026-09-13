import { requireRole } from '~~/server/utils/auth'
import { ResearchVariable } from '~~/server/models/ResearchVariable'
import { Questionnaire } from '~~/server/models/Questionnaire'
import { IndicatorGenerator } from '~~/server/services/ai/IndicatorGenerator'
import { AIService, createAIService } from '~~/server/services/ai/AIService'
import { VariableIndicator } from '~~/server/models/VariableIndicator'
import { deductAITokens, hasSufficientTokens, AI_TOKEN_COST } from '~~/server/utils/aiTokens'
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

        const rawCount = parseInt((body.count as string) || '5', 10)
        if (isNaN(rawCount) || rawCount < 1) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Invalid indicator count'
            })
        }
        const count = Math.min(Math.max(rawCount, 1), 10)
        const tokenCost = count * AI_TOKEN_COST.GENERATE_INDICATORS

        // Check if user has sufficient AI tokens (1 token per indicator)
        const hasTokens = await hasSufficientTokens(user.id, tokenCost)
        if (!hasTokens) {
            const currentBalance = await getTokenBalance(user.id)
            throw createError({
                statusCode: 402,
                statusMessage: `Saldo token AI tidak mencukupi untuk generate ${count} indikator. Dibutuhkan ${tokenCost} token (1 token per indikator), saldo Anda: ${currentBalance} token. Silakan top up saldo token Anda.`,
                data: {
                    code: 'INSUFFICIENT_AI_TOKENS',
                    required: tokenCost,
                    available: currentBalance
                }
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
        const questionnaire = await Questionnaire.findByPk(questionnaireId, {
            include: ['project']
        })

        if (!questionnaire) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Questionnaire not found'
            })
        }

        if (!await questionnaire.canEdit(user.id)) {
            throw createError({
                statusCode: 403,
                statusMessage: 'You do not have permission to generate indicators'
            })
        }

        // Initialize AI service
        const aiService = createAIService()
        const provider = aiService.getProvider()
        const generator = new IndicatorGenerator(provider)

        // Generate indicators
        const result = await generator.generateIndicators({
            variableName: variable.variableName,
            variableType: variable.variableType,
            researchTopic: questionnaire.topic || questionnaire.project?.title || 'Penelitian',
            researchObjective: questionnaire.researchObjective || questionnaire.project?.description || '',
            description: variable.description || undefined,
            indicatorCount: count
        })

        // Get next order index
        const maxOrder = await VariableIndicator.max('orderIndex', {
            where: { variableId }
        }) as number | null
        let nextOrder = (maxOrder || 0) + 1

        // Save indicators with pending status
        const savedIndicators = []
        for (const indicator of result.indicators) {
            const saved = await VariableIndicator.create({
                id: uuidv4(),
                variableId,
                indicatorText: indicator.indicatorText,
                indicatorSource: 'ai_generated',
                status: 'pending',
                orderIndex: nextOrder++
            })
            savedIndicators.push(saved)
        }

        // Deduct AI tokens (1 token per generated indicator)
        const actualCost = savedIndicators.length * AI_TOKEN_COST.GENERATE_INDICATORS
        const { balanceAfter } = await deductAITokens(
            user.id,
            actualCost,
            `Generate ${savedIndicators.length} indikator AI untuk variabel "${variable.variableName}" (${actualCost} token)`,
            'variable_indicator',
            variable.id
        )

        return {
            success: true,
            message: `Berhasil generate ${savedIndicators.length} indikator (${actualCost} token digunakan)`,
            tokensDeducted: actualCost,
            remainingBalance: balanceAfter,
            indicators: savedIndicators.map(ind => ({
                id: ind.id,
                indicatorText: ind.indicatorText,
                indicatorSource: ind.indicatorSource,
                status: ind.status,
                orderIndex: ind.orderIndex,
                createdAt: ind.createdAt
            })),
            metadata: result.metadata
        }
    } catch (error: any) {
        if (error.statusCode) {
            throw error
        }

        console.error('Generate indicators error:', error)
        throw createError({
            statusCode: 500,
            statusMessage: error.message || 'Failed to generate indicators'
        })
    }
})
