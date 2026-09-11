import type { QuestionType, ScaleType } from '~~/server/models/Question'

export interface AIGeneratedQuestion {
    questionText: string
    questionType: QuestionType
    scaleType?: ScaleType | null
    options?: Array<{ value: string; label: string }>
    biasDetected: boolean
    biasNotes?: string | null
    recommendedScaleType?: ScaleType
}

export interface AIGenerationResponse {
    questions: AIGeneratedQuestion[]
    metadata: {
        provider: 'gemini' | 'openai' | 'openrouter'
        model: string
        tokensUsed?: number
        executionTimeMs: number
    }
}

export interface AIGenerationInput {
    topic: string
    objective?: string
    researchObjective?: string
    variables: string[]
    questionCount?: number
}

export abstract class BaseAIProvider {
    protected timeout: number = 30000 // 30 seconds default

    constructor(timeout?: number) {
        if (timeout) {
            this.timeout = timeout
        }
    }

    /**
     * Generate questionnaire based on research input
     * Must return structured JSON response
     */
    abstract generateQuestionnaire(input: AIGenerationInput): Promise<AIGenerationResponse>

    /**
     * Get provider name
     */
    abstract getProviderName(): 'gemini' | 'openai'

    /**
     * Check if provider is available (has API key)
     */
    abstract isAvailable(): boolean

    /**
     * Validate and sanitize input to prevent prompt injection
     */
    protected sanitizeInput(input: AIGenerationInput): AIGenerationInput {
        // Support both objective and researchObjective field names
        const objectiveText = input.objective || input.researchObjective || ''
        
        return {
            topic: this.sanitizeText(input.topic),
            objective: this.sanitizeText(objectiveText),
            researchObjective: this.sanitizeText(objectiveText),
            variables: input.variables.map(v => this.sanitizeText(v)),
            questionCount: input.questionCount
        }
    }

    /**
     * Basic text sanitization
     */
    protected sanitizeText(text: string): string {
        // Handle null/undefined
        if (!text || typeof text !== 'string') {
            return ''
        }
        
        // Remove potential prompt injection patterns
        return text
            .replace(/system\s*:/gi, '')
            .replace(/assistant\s*:/gi, '')
            .replace(/user\s*:/gi, '')
            .replace(/<\|.*?\|>/g, '')
            .trim()
            .slice(0, 5000) // Max 5000 chars per field
    }

    /**
     * Build prompt template that forces JSON output
     */
    protected buildPrompt(input: AIGenerationInput): string {
        const objective = input.objective || input.researchObjective || ''
        
        return `Anda adalah asisten AI yang membantu peneliti membuat kuesioner penelitian yang valid dan tidak bias.

TUGAS: Buatlah draf pertanyaan kuesioner berdasarkan informasi berikut:

TOPIK PENELITIAN:
${input.topic}

TUJUAN PENELITIAN:
${objective}

VARIABEL YANG AKAN DIUKUR:
${input.variables.map((v, i) => `${i + 1}. ${v}`).join('\n')}

INSTRUKSI:
1. Buat 8-15 pertanyaan yang relevan dengan topik dan variabel penelitian
2. Untuk setiap pertanyaan, tentukan tipe yang paling sesuai: multiple_choice, text, rating_scale, checkbox, atau dropdown
3. Jika menggunakan rating_scale, rekomendasikan skala: likert_5, likert_7, guttman, atau custom
4. Untuk pertanyaan multiple_choice/checkbox/dropdown, berikan 3-7 opsi jawaban yang sesuai
5. DETEKSI BIAS: Identifikasi apakah pertanyaan mengandung bias (leading question, loaded question, double-barreled, bias gender/ras/agama, asumsi implisit). Jika ada bias, set biasDetected=true dan berikan catatan singkat.
6. Gunakan bahasa Indonesia yang formal dan akademis

OUTPUT FORMAT (WAJIB JSON):
Berikan output HANYA dalam format JSON berikut, tanpa penjelasan tambahan:

{
  "questions": [
    {
      "questionText": "Teks pertanyaan di sini",
      "questionType": "rating_scale",
      "scaleType": "likert_5",
      "options": [],
      "biasDetected": false,
      "biasNotes": null,
      "recommendedScaleType": "likert_5"
    },
    {
      "questionText": "Pertanyaan lain di sini",
      "questionType": "multiple_choice",
      "scaleType": null,
      "options": [
        {"value": "1", "label": "Opsi 1"},
        {"value": "2", "label": "Opsi 2"}
      ],
      "biasDetected": false,
      "biasNotes": null,
      "recommendedScaleType": null
    }
  ]
}

PENTING: Respons Anda HARUS berupa valid JSON saja, tanpa markdown code blocks, tanpa penjelasan tambahan.`
    }

    /**
     * Parse and validate AI response
     */
    protected parseResponse(rawResponse: string): AIGeneratedQuestion[] {
        try {
            // Remove markdown code blocks if present
            let cleaned = rawResponse.trim()
            if (cleaned.startsWith('```json')) {
                cleaned = cleaned.replace(/```json\s*/g, '').replace(/```\s*$/g, '')
            } else if (cleaned.startsWith('```')) {
                cleaned = cleaned.replace(/```\s*/g, '')
            }

            const parsed = JSON.parse(cleaned)

            if (!parsed.questions || !Array.isArray(parsed.questions)) {
                throw new Error('Invalid response: missing questions array')
            }

            // Validate each question
            return parsed.questions.map((q: any, index: number) => {
                if (!q.questionText || typeof q.questionText !== 'string') {
                    throw new Error(`Question ${index + 1}: missing or invalid questionText`)
                }

                if (!['multiple_choice', 'text', 'rating_scale', 'checkbox', 'dropdown'].includes(q.questionType)) {
                    throw new Error(`Question ${index + 1}: invalid questionType`)
                }

                return {
                    questionText: q.questionText,
                    questionType: q.questionType,
                    scaleType: q.scaleType || null,
                    options: q.options || [],
                    biasDetected: q.biasDetected || false,
                    biasNotes: q.biasNotes || null,
                    recommendedScaleType: q.recommendedScaleType || q.scaleType || null
                }
            })
        } catch (error: any) {
            throw new Error(`Failed to parse AI response: ${error.message}`)
        }
    }
}
