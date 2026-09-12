import { BaseAIProvider } from './BaseAIProvider'
import type { QuestionType } from '~~/server/models/Question'

export interface QuestionReviewInput {
    questionText: string
    questionType: QuestionType
    options?: Array<{ value: string; label: string }>
    variableName?: string
    indicatorName?: string
}

export interface QuestionReviewIssue {
    detected: boolean
    note: string | null
}

export interface QuestionReviewResult {
    hasIssues: boolean
    issues: {
        bias?: QuestionReviewIssue
        ambiguity?: QuestionReviewIssue
        doubleBarreled?: QuestionReviewIssue
        redundancy?: QuestionReviewIssue
        optionIssues?: QuestionReviewIssue
    }
    score: number
    reviewedAt: string
}

export class QuestionReviewer {
    constructor(private aiProvider: BaseAIProvider) {}

    async reviewQuestion(input: QuestionReviewInput): Promise<QuestionReviewResult> {
        const prompt = this.buildPrompt(input)

        try {
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 30000)

            try {
                const response = await this.aiProvider.generateText(prompt, controller.signal)
                clearTimeout(timeoutId)

                const review = this.parseResponse(response)
                return {
                    ...review,
                    reviewedAt: new Date().toISOString()
                }
            } catch (error: any) {
                clearTimeout(timeoutId)
                throw error
            }
        } catch (error: any) {
            console.error('Question review error:', error)
            throw new Error(`Failed to review question: ${error.message}`)
        }
    }

    private buildPrompt(input: QuestionReviewInput): string {
        let optionsText = ''
        if (input.options && input.options.length > 0) {
            optionsText = '\nOpsi Jawaban:\n' + input.options.map(opt => `- ${opt.label}`).join('\n')
        }

        let contextText = ''
        if (input.variableName || input.indicatorName) {
            contextText = '\n\nKONTEKS PENGUKURAN:'
            if (input.variableName) contextText += `\nVariabel: ${input.variableName}`
            if (input.indicatorName) contextText += `\nIndikator: ${input.indicatorName}`
        }

        return `Anda adalah expert dalam metodologi penelitian dan desain kuesioner.

PERTANYAAN: "${input.questionText}"
Tipe: ${input.questionType}${optionsText}${contextText}

Deteksi masalah pada PERTANYAAN dan OPSI JAWABAN (jika ada):
1. BIAS - mengarahkan jawaban responden
2. AMBIGUITAS - tidak jelas atau membingungkan
3. DOUBLE-BARRELED - menanya 2 hal sekaligus
4. REDUNDANCY - tumpang tindih dengan pertanyaan lain
5. OPTION ISSUES - masalah pada opsi jawaban (jika pertanyaan memiliki opsi):
   - Opsi tidak jelas atau ambigu
   - Opsi saling tumpang tindih (tidak mutually exclusive)
   - Opsi tidak lengkap (tidak mencakup semua kemungkinan)
   - Opsi bias atau mengarahkan
   - Opsi tidak konsisten dengan pertanyaan
   - Opsi tidak seimbang

INSTRUKSI:
- Review pertanyaan DAN opsi jawaban (jika ada)
- Berikan feedback spesifik untuk masalah opsi jika terdeteksi
- Beri skor 0-10 (10=sempurna, pertimbangkan kualitas pertanyaan DAN opsi)

OUTPUT JSON:
{
  "hasIssues": true/false,
  "issues": {
    "bias": {"detected": true/false, "note": "penjelasan atau null"},
    "ambiguity": {"detected": true/false, "note": "penjelasan atau null"},
    "doubleBarreled": {"detected": true/false, "note": "penjelasan atau null"},
    "redundancy": {"detected": true/false, "note": "penjelasan atau null"},
    "optionIssues": {"detected": true/false, "note": "penjelasan masalah opsi atau null"}
  },
  "score": 7.5
}`
    }

    private parseResponse(rawResponse: string): Omit<QuestionReviewResult, 'reviewedAt'> {
        try {
            let cleaned = rawResponse.trim()
            
            if (cleaned.startsWith('```json')) {
                cleaned = cleaned.replace(/```json\s*/g, '').replace(/```\s*$/g, '')
            } else if (cleaned.startsWith('```')) {
                cleaned = cleaned.replace(/```\s*/g, '')
            }

            const parsed = JSON.parse(cleaned)

            if (typeof parsed.hasIssues !== 'boolean') {
                throw new Error('Invalid hasIssues')
            }

            if (!parsed.issues || typeof parsed.issues !== 'object') {
                throw new Error('Invalid issues')
            }

            if (typeof parsed.score !== 'number' || parsed.score < 0 || parsed.score > 10) {
                throw new Error('Invalid score')
            }

            const issueTypes = ['bias', 'ambiguity', 'doubleBarreled', 'redundancy', 'optionIssues']
            for (const type of issueTypes) {
                if (!parsed.issues[type]) {
                    parsed.issues[type] = { detected: false, note: null }
                }
            }

            return {
                hasIssues: parsed.hasIssues,
                issues: parsed.issues,
                score: parsed.score
            }
        } catch (error: any) {
            console.error('Failed to parse review response:', rawResponse)
            throw new Error(`Failed to parse AI response: ${error.message}`)
        }
    }
}
