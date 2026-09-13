import { requireRole } from '~~/server/utils/auth'
import { Question } from '~~/server/models/Question'
import { createAIService } from '~~/server/services/ai/AIService'
import { sanitizePromptInput } from '~~/server/utils/sanitize'
import { deductAITokens, AI_TOKEN_COST } from '~~/server/utils/aiTokens'
import { v4 as uuidv4 } from 'uuid'
import type { ResearchVariable } from '~~/app/types/research'

export default defineEventHandler(async (event) => {
    try {
        const user = await requireRole(event, 'peneliti')
        const body = await readBody(event)

        // Check AI token balance BEFORE doing anything
        if ((user.aiTokenBalance ?? 0) < AI_TOKEN_COST.GENERATE_QUESTIONS) {
            throw createError({
                statusCode: 402,
                statusMessage: `Saldo token AI tidak mencukupi. Dibutuhkan ${AI_TOKEN_COST.GENERATE_QUESTIONS} token, saldo Anda: ${user.aiTokenBalance ?? 0} token.`,
                data: {
                    code: 'INSUFFICIENT_AI_TOKENS',
                    required: AI_TOKEN_COST.GENERATE_QUESTIONS,
                    available: user.aiTokenBalance ?? 0
                }
            })
        }

        // Validate required fields
        if (!body.topic || body.topic.trim().length === 0) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Topic is required'
            })
        }

        if (!body.objective || body.objective.trim().length === 0) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Research objective is required'
            })
        }

        const count = body.count || 5 // Default 5 questions
        if (count < 1 || count > 20) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Question count must be between 1 and 20'
            })
        }

        // Get variables array
        const variables = body.variables || []

        // Sanitize inputs
        const sanitizedTopic = sanitizePromptInput(body.topic)
        const sanitizedObjective = sanitizePromptInput(body.objective)
        const sanitizedVariables = Array.isArray(variables) 
            ? variables.map((v: ResearchVariable) => `${sanitizePromptInput(v.variableName)} | Tipe Variabel: ${v.variableType || 'unknown'} | Indikator: ${v.indicators?.map(ind => sanitizePromptInput(ind.indicatorText)).join(', ') || 'none'}`).filter(v => v.length > 0)
            : []


        // Initialize AI service
        const aiService = createAIService()

        try {
            // Generate questions using AI with variables context
            const variablesText = sanitizedVariables.length > 0 
                ? sanitizedVariables.join(', ') 
                : 'Not specified'

            const input: any = {
                topic: sanitizedTopic,
                objective: sanitizedObjective,
                variables: sanitizedVariables,
                questionCount: count
            }

            // Use generateQuestionnaire method instead of generateText
            const aiResult = await aiService.generateQuestionnaire(input)
            const aiResponse = aiResult.response
            
            // Parse AI response - get questions from response
            let questions: any[] = []
            
            if (aiResponse.questions && Array.isArray(aiResponse.questions)) {
                questions = aiResponse.questions
            } else {
                throw new Error('No questions returned from AI')
            }

            // Validate and format questions
            const formattedQuestions = questions.map((q, index) => {
                const questionType = q.questionType || 'text'
                let options = q.options || []

                // Ensure options format is correct
                if (questionType !== 'text' && (!options || options.length === 0)) {
                    // Generate default options based on type
                    if (questionType === 'multiple_choice') {
                        options = [
                            { value: 'a', label: 'Option A' },
                            { value: 'b', label: 'Option B' },
                            { value: 'c', label: 'Option C' }
                        ]
                    } else if (questionType === 'likert' || questionType === 'rating_scale') {
                        options = [
                            { value: '1', label: 'Sangat Tidak Setuju' },
                            { value: '2', label: 'Tidak Setuju' },
                            { value: '3', label: 'Netral' },
                            { value: '4', label: 'Setuju' },
                            { value: '5', label: 'Sangat Setuju' }
                        ]
                    }
                }

                return {
                    questionText: q.questionText || q.text || `Question ${index + 1}`,
                    questionType: questionType,
                    scaleType: (questionType === 'likert' || questionType === 'rating_scale') ? 'likert_5' : null,
                    options: options,
                    source: 'ai_generated'
                }
            })

            // Deduct AI tokens after successful generation
            await deductAITokens(
                user.id,
                AI_TOKEN_COST.GENERATE_QUESTIONS,
                'Generate Pertanyaan AI',
                'question_generate',
                undefined
            )

            return {
                success: true,
                message: 'Questions generated successfully',
                questions: formattedQuestions,
                metadata: {
                    count: formattedQuestions.length,
                    provider: aiResult.usedProvider || 'openrouter'
                }
            }
        } catch (aiError: any) {
            console.error('AI generation error:', aiError)
            throw createError({
                statusCode: 500,
                statusMessage: `AI generation failed: ${aiError.message || 'Unknown error'}`
            })
        }
    } catch (error: any) {
        if (error.statusCode) {
            throw error
        }

        console.error('Generate questions error:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to generate questions'
        })
    }
})
