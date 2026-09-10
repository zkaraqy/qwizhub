import { requireRole } from '~~/server/utils/auth'
import { Project } from '~~/server/models/Project'
import { Questionnaire } from '~~/server/models/Questionnaire'
import { Question } from '~~/server/models/Question'
import { AIGenerationLog } from '~~/server/models/AIGenerationLog'
import { createAIService } from '~~/server/services/ai/AIService'
import { enforceRateLimit } from '~~/server/utils/rateLimiter'
import { validateResearchInput, sanitizePromptInput, sanitizePromptInputArray } from '~~/server/utils/sanitize'
import { v4 as uuidv4 } from 'uuid'

export default defineEventHandler(async (event) => {
    const startTime = Date.now()
    
    try {
        // Only peneliti can generate questionnaires
        const user = await requireRole(event, 'peneliti')

        // Check rate limit
        await enforceRateLimit(user.id)

        const body = await readBody(event)

        // Validate required fields
        if (!body.projectId) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Project ID is required'
            })
        }

        // Verify project exists and user owns it
        const project = await Project.findByPk(body.projectId)

        if (!project) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Project not found'
            })
        }

        if (!project.isOwnedBy(user.id)) {
            throw createError({
                statusCode: 403,
                statusMessage: 'You do not have permission to create questionnaire for this project'
            })
        }

        // Validate research input
        const validation = validateResearchInput({
            topic: body.topic,
            researchObjective: body.researchObjective,
            variables: body.variables
        })

        if (!validation.valid) {
            throw createError({
                statusCode: 400,
                statusMessage: validation.errors.join('; ')
            })
        }

        // Sanitize inputs
        const sanitizedInput = {
            topic: sanitizePromptInput(body.topic),
            researchObjective: sanitizePromptInput(body.researchObjective),
            variables: sanitizePromptInputArray(body.variables)
        }

        // Initialize AI service
        const aiService = createAIService()

        let questionnaireId: string | null = null
        let generationResult

        try {
            // Generate questionnaire with AI (with fallback)
            generationResult = await aiService.generateQuestionnaire(sanitizedInput)

            // Create questionnaire record
            const questionnaire = await Questionnaire.create({
                id: uuidv4(),
                projectId: project.id,
                topic: sanitizedInput.topic,
                researchObjective: sanitizedInput.researchObjective,
                variables: sanitizedInput.variables,
                status: 'draft'
            })

            questionnaireId = questionnaire.id

            // Create questions from AI response
            const questions = await Promise.all(
                generationResult.response.questions.map((q, index) =>
                    Question.create({
                        id: uuidv4(),
                        questionnaireId: questionnaire.id,
                        questionText: q.questionText,
                        questionType: q.questionType,
                        scaleType: q.scaleType || null,
                        options: q.options || [],
                        orderIndex: index,
                        source: 'ai_generated',
                        biasDetected: q.biasDetected,
                        biasNotes: q.biasNotes || null
                    })
                )
            )

            const executionTimeMs = Date.now() - startTime

            // Log successful generation
            await AIGenerationLog.create({
                id: uuidv4(),
                userId: user.id,
                questionnaireId: questionnaire.id,
                provider: generationResult.usedProvider,
                status: 'success',
                requestPayload: {
                    topic: sanitizedInput.topic,
                    researchObjective: sanitizedInput.researchObjective,
                    variables: sanitizedInput.variables
                },
                responseData: {
                    questionsCount: questions.length,
                    model: generationResult.response.metadata.model,
                    tokensUsed: generationResult.response.metadata.tokensUsed
                },
                errorMessage: null,
                executionTimeMs
            })

            return {
                success: true,
                message: 'Questionnaire generated successfully',
                questionnaire: {
                    id: questionnaire.id,
                    projectId: questionnaire.projectId,
                    topic: questionnaire.topic,
                    researchObjective: questionnaire.researchObjective,
                    variables: questionnaire.variables,
                    status: questionnaire.status,
                    createdAt: questionnaire.createdAt
                },
                questions: questions.map(q => ({
                    id: q.id,
                    questionText: q.questionText,
                    questionType: q.questionType,
                    scaleType: q.scaleType,
                    options: q.getFormattedOptions(),
                    orderIndex: q.orderIndex,
                    source: q.source,
                    biasDetected: q.biasDetected,
                    biasNotes: q.biasNotes
                })),
                metadata: {
                    provider: generationResult.usedProvider,
                    fallbackUsed: generationResult.fallbackUsed,
                    executionTimeMs
                }
            }
        } catch (aiError: any) {
            const executionTimeMs = Date.now() - startTime
            const logStatus = aiError.message?.includes('timeout') ? 'timeout' : 'failed'
            
            await AIGenerationLog.create({
                id: uuidv4(),
                userId: user.id,
                questionnaireId: questionnaireId,
                provider: 'gemini',
                status: logStatus,
                requestPayload: {
                    topic: sanitizedInput.topic,
                    researchObjective: sanitizedInput.researchObjective,
                    variables: sanitizedInput.variables
                },
                responseData: null,
                errorMessage: aiError.message,
                executionTimeMs
            })

            throw createError({
                statusCode: 500,
                statusMessage: `AI generation failed: ${aiError.message}`
            })
        }
    } catch (error: any) {
        if (error.statusCode) {
            throw error
        }

        console.error('Generate questionnaire error:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to generate questionnaire'
        })
    }
})

