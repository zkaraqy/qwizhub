import { requireRole } from '~~/server/utils/auth'
import { Question } from '~~/server/models/Question'
import { createAIService } from '~~/server/services/ai/AIService'
import { sanitizePromptInput } from '~~/server/utils/sanitize'
import { v4 as uuidv4 } from 'uuid'

export default defineEventHandler(async (event) => {
    try {
        const user = await requireRole(event, 'peneliti')
        const body = await readBody(event)

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

        // Sanitize inputs
        const sanitizedTopic = sanitizePromptInput(body.topic)
        const sanitizedObjective = sanitizePromptInput(body.objective)

        // Initialize AI service
        const aiService = createAIService()

        try {
            // Generate questions using AI
            const prompt = `Generate ${count} research questionnaire questions for the following:

Topic: ${sanitizedTopic}
Research Objective: ${sanitizedObjective}

Requirements:
- Generate diverse question types (multiple choice, text, rating scale, etc.)
- Questions should be relevant to the research objective
- Provide options for multiple choice and rating scale questions
- Keep questions clear and unbiased

Return a JSON array with this structure:
[
  {
    "questionText": "Question text here",
    "questionType": "multiple_choice" | "text" | "rating_scale" | "checkbox" | "likert",
    "options": [{"value": "opt1", "label": "Option 1"}, ...] // Only for non-text questions
  }
]`

            const aiResponse = await aiService.generateText(prompt)
            
            // Parse AI response
            let questions: any[] = []
            try {
                // Extract JSON from response
                const jsonMatch = aiResponse.match(/\[[\s\S]*\]/)
                if (jsonMatch) {
                    questions = JSON.parse(jsonMatch[0])
                } else {
                    throw new Error('No valid JSON found in AI response')
                }
            } catch (parseError) {
                console.error('Failed to parse AI response:', parseError)
                throw createError({
                    statusCode: 500,
                    statusMessage: 'Failed to parse AI generated questions'
                })
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
                    questionText: q.questionText || `Question ${index + 1}`,
                    questionType: questionType,
                    scaleType: (questionType === 'likert' || questionType === 'rating_scale') ? 'likert_5' : null,
                    options: options,
                    source: 'ai_generated'
                }
            })

            return {
                success: true,
                message: 'Questions generated successfully',
                questions: formattedQuestions,
                metadata: {
                    count: formattedQuestions.length,
                    provider: 'gemini'
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
