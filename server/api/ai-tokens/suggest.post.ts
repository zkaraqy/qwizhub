import { requireRole } from '~~/server/utils/auth'
import { createAIService } from '~~/server/services/ai/AIService'
import { deductAITokens, AI_TOKEN_COST } from '~~/server/utils/aiTokens'
import { sanitizePromptInput } from '~~/server/utils/sanitize'

export default defineEventHandler(async (event) => {
    try {
        const user = await requireRole(event, 'peneliti')
        const body = await readBody(event)

        // Check AI token balance
        if ((user.aiTokenBalance ?? 0) < AI_TOKEN_COST.AI_EDIT_SUGGESTION) {
            throw createError({
                statusCode: 402,
                statusMessage: `Saldo token AI tidak mencukupi. Dibutuhkan ${AI_TOKEN_COST.AI_EDIT_SUGGESTION} token, saldo Anda: ${user.aiTokenBalance ?? 0} token.`,
                data: {
                    code: 'INSUFFICIENT_AI_TOKENS',
                    required: AI_TOKEN_COST.AI_EDIT_SUGGESTION,
                    available: user.aiTokenBalance ?? 0
                }
            })
        }

        const { questionnaireId, topic, questions, instruction } = body

        if (!topic) {
            throw createError({ statusCode: 400, statusMessage: 'Topic is required' })
        }

        if (!questions || !Array.isArray(questions)) {
            throw createError({ statusCode: 400, statusMessage: 'Questions array is required' })
        }

        const sanitizedTopic = sanitizePromptInput(topic)
        const sanitizedInstruction = instruction ? sanitizePromptInput(instruction) : ''

        // Build prompt for AI suggestion
        const questionsText = questions.map((q: any, i: number) =>
            `${i + 1}. [${q.questionType || 'text'}] ${q.questionText}`
        ).join('\n')

        const prompt = `Kamu adalah asisten riset akademik yang membantu meningkatkan kualitas kuisioner.

Topik Penelitian: ${sanitizedTopic}
${sanitizedInstruction ? `Instruksi Khusus: ${sanitizedInstruction}` : ''}

Daftar Pertanyaan Saat Ini:
${questionsText}

Berikan saran perbaikan yang spesifik dan konstruktif dalam format JSON berikut:
{
  "overallFeedback": "Umpan balik umum tentang kuisioner",
  "suggestions": [
    {
      "questionIndex": 0,
      "originalQuestion": "...",
      "improvedQuestion": "...",
      "reason": "Alasan perbaikan"
    }
  ],
  "additionalQuestions": [
    {
      "questionText": "...",
      "questionType": "...",
      "reason": "Mengapa pertanyaan ini penting"
    }
  ]
}`

        const aiService = createAIService()
        const result = await aiService.generateText(prompt)

        // Parse JSON response
        let suggestions
        try {
            const jsonMatch = result.response.match(/\{[\s\S]*\}/)
            suggestions = jsonMatch ? JSON.parse(jsonMatch[0]) : { overallFeedback: result.response, suggestions: [], additionalQuestions: [] }
        } catch {
            suggestions = { overallFeedback: result.response, suggestions: [], additionalQuestions: [] }
        }

        // Deduct tokens after successful AI call
        await deductAITokens(
            user.id,
            AI_TOKEN_COST.AI_EDIT_SUGGESTION,
            'Saran/Edit AI Kuisioner',
            'ai_suggestion',
            questionnaireId ?? undefined
        )

        return {
            success: true,
            suggestions,
            tokenCost: AI_TOKEN_COST.AI_EDIT_SUGGESTION,
            newBalance: (user.aiTokenBalance ?? 0) - AI_TOKEN_COST.AI_EDIT_SUGGESTION
        }
    } catch (error: any) {
        if (error.statusCode) throw error

        console.error('AI suggest error:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Gagal mendapatkan saran AI'
        })
    }
})
