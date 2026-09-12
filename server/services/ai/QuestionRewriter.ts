import { BaseAIProvider } from './BaseAIProvider'
import type { QuestionType, ScaleType } from '~~/server/models/Question'

export interface QuestionRewriteInput {
    questionText: string
    questionType: QuestionType
    options?: Array<{ value: string; label: string }>
    variableName?: string
    indicatorName?: string
    detectedIssues?: {
        bias?: boolean
        ambiguity?: boolean
        doubleBarreled?: boolean
    }
}

export interface RewriteSuggestion {
    version: string
    questionText: string
    questionType: QuestionType
    scaleType?: ScaleType | null
    options?: Array<{ value: string; label: string }>
    rationale: string
}

export interface ScaleRecommendation {
    scaleType: ScaleType
    rationale: string
}

export interface QuestionRewriteResult {
    rewrites: RewriteSuggestion[]
    scaleRecommendation?: ScaleRecommendation
}

export class QuestionRewriter {
    constructor(private aiProvider: BaseAIProvider) {}

    async suggestRewrites(input: QuestionRewriteInput): Promise<QuestionRewriteResult> {
        const prompt = this.buildPrompt(input)

        try {
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 30000)

            try {
                const response = await this.aiProvider.generateText(prompt, controller.signal)
                clearTimeout(timeoutId)

                return this.parseResponse(response)
            } catch (error: any) {
                clearTimeout(timeoutId)
                throw error
            }
        } catch (error: any) {
            console.error('Question rewrite error:', error)
            throw new Error(`Failed to generate rewrites: ${error.message}`)
        }
    }

    private buildPrompt(input: QuestionRewriteInput): string {
        let issuesText = ''
        if (input.detectedIssues) {
            const issues = []
            if (input.detectedIssues.bias) issues.push('BIAS (leading question)')
            if (input.detectedIssues.ambiguity) issues.push('AMBIGUITAS')
            if (input.detectedIssues.doubleBarreled) issues.push('DOUBLE-BARRELED')
            if (issues.length > 0) {
                issuesText = `\n\nMASALAH TERDETEKSI:\n${issues.join(', ')}`
            }
        }

        let optionsText = ''
        if (input.options && input.options.length > 0) {
            optionsText = '\n\nOPSI JAWABAN SAAT INI:\n' + input.options.map(opt => `- ${opt.label}`).join('\n')
        }

        let contextText = ''
        if (input.variableName || input.indicatorName) {
            contextText = '\n\nKONTEKS:'
            if (input.variableName) contextText += `\nVariabel: ${input.variableName}`
            if (input.indicatorName) contextText += `\nIndikator: ${input.indicatorName}`
        }

        return `Anda adalah expert metodologi penelitian. Berikan 2-3 alternatif perbaikan pertanyaan kuesioner yang LENGKAP.

PERTANYAAN ASLI: "${input.questionText}"
Tipe: ${input.questionType}${optionsText}${issuesText}${contextText}

TUGAS:
1. Buat 2-3 versi perbaikan LENGKAP yang netral, jelas, dan fokus
2. Untuk SETIAP versi perbaikan:
   - Tentukan questionType yang paling sesuai (bisa berbeda dari tipe asli)
   - Tulis questionText yang diperbaiki
   - Jika questionType memerlukan opsi (multiple_choice, checkbox, dropdown, closed, mixed, filter), berikan 3-7 opsi jawaban yang:
     * Jelas dan spesifik
     * Mutually exclusive (tidak tumpang tindih)
     * Lengkap (mencakup semua kemungkinan jawaban)
     * Seimbang (tidak mengarahkan responden)
   - Jika questionType adalah likert atau rating_scale, tentukan scaleType (likert_5, likert_7, guttman, custom)
   - Jelaskan rationale untuk semua perubahan (tipe, teks, opsi)
3. Rekomendasikan skala pengukuran yang tepat secara keseluruhan

TIPE PERTANYAAN YANG TERSEDIA:
- text (terbuka, tanpa opsi)
- multiple_choice (pilihan ganda, butuh opsi)
- checkbox (checklist, butuh opsi)
- dropdown (dropdown, butuh opsi)
- closed (tertutup, butuh opsi)
- mixed (campuran, butuh opsi)
- filter (filter, butuh opsi)
- likert (skala likert, butuh scaleType)
- rating_scale (skala rating, butuh scaleType)

SKALA YANG TERSEDIA: likert_5, likert_7, guttman, custom

OUTPUT JSON (WAJIB):
{
  "rewrites": [
    {
      "version": "Versi Netral",
      "questionText": "Pertanyaan yang diperbaiki",
      "questionType": "multiple_choice",
      "scaleType": null,
      "options": [
        {"value": "1", "label": "Opsi 1"},
        {"value": "2", "label": "Opsi 2"},
        {"value": "3", "label": "Opsi 3"}
      ],
      "rationale": "Alasan perbaikan lengkap (tipe, teks, dan opsi)"
    },
    {
      "version": "Versi Alternatif Likert",
      "questionText": "Pertanyaan dalam bentuk pernyataan",
      "questionType": "likert",
      "scaleType": "likert_5",
      "options": [],
      "rationale": "Alasan mengubah ke likert"
    }
  ],
  "scaleRecommendation": {
    "scaleType": "likert_5",
    "rationale": "Alasan memilih skala ini"
  }
}

PENTING: 
- Berikan output HANYA dalam format JSON
- WAJIB sertakan questionType, questionText, dan rationale untuk setiap rewrite
- WAJIB sertakan options jika questionType memerlukan opsi (array kosong [] jika tidak perlu)
- Pastikan options relevan dan berkualitas tinggi`
    }

    private parseResponse(rawResponse: string): QuestionRewriteResult {
        try {
            let cleaned = rawResponse.trim()
            
            if (cleaned.startsWith('```json')) {
                cleaned = cleaned.replace(/```json\s*/g, '').replace(/```\s*$/g, '')
            } else if (cleaned.startsWith('```')) {
                cleaned = cleaned.replace(/```\s*/g, '')
            }

            const parsed = JSON.parse(cleaned)

            if (!parsed.rewrites || !Array.isArray(parsed.rewrites)) {
                throw new Error('Invalid rewrites array')
            }

            const rewrites: RewriteSuggestion[] = parsed.rewrites.map((r: any, i: number) => {
                if (!r.version || !r.questionText || !r.rationale || !r.questionType) {
                    throw new Error(`Rewrite ${i + 1}: missing required fields (version, questionText, questionType, or rationale)`)
                }
                
                // Validate questionType
                const validTypes = ['text', 'multiple_choice', 'checkbox', 'dropdown', 'closed', 'mixed', 'filter', 'likert', 'rating_scale']
                if (!validTypes.includes(r.questionType)) {
                    throw new Error(`Rewrite ${i + 1}: invalid questionType "${r.questionType}"`)
                }
                
                return {
                    version: r.version,
                    questionText: r.questionText,
                    questionType: r.questionType,
                    scaleType: r.scaleType || null,
                    options: r.options || [],
                    rationale: r.rationale
                }
            })

            const result: QuestionRewriteResult = { rewrites }

            if (parsed.scaleRecommendation) {
                result.scaleRecommendation = {
                    scaleType: parsed.scaleRecommendation.scaleType,
                    rationale: parsed.scaleRecommendation.rationale || ''
                }
            }

            return result
        } catch (error: any) {
            console.error('Failed to parse rewrite response:', rawResponse)
            throw new Error(`Failed to parse AI response: ${error.message}`)
        }
    }
}
