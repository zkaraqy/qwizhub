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

PENTING - PAHAMI TIPE SKALA DAN PENGGUNAANNYA:

1. SKALA LIKERT (likert_5, likert_7):
   - Digunakan untuk: Mengukur TINGKAT PERSETUJUAN/SIKAP terhadap PERNYATAAN
   - Opsi jawaban: Sangat Tidak Setuju, Tidak Setuju, Netral, Setuju, Sangat Setuju
   - Format pertanyaan: PERNYATAAN (bukan pertanyaan dengan kata tanya)
   - Contoh BENAR: "Sistem code review di tim saya berjalan dengan efektif"
   - Contoh SALAH: "Seberapa efektif sistem code review di tim Anda?" (ini pertanyaan FREKUENSI/TINGKAT, bukan pernyataan sikap)

2. SKALA GUTTMAN (guttman):
   - Digunakan untuk: Pertanyaan FAKTUAL dengan jawaban YA/TIDAK
   - Opsi jawaban: Ya, Tidak
   - Format pertanyaan: Pertanyaan tentang keberadaan, kepemilikan, atau fakta
   - Contoh BENAR: "Apakah tim Anda menggunakan version control (Git)?"
   - Contoh SALAH: "Apakah Anda setuju bahwa Git penting?" (ini OPINI, gunakan likert)

3. SKALA KUSTOM (custom) untuk rating_scale:
   - Digunakan untuk: Pertanyaan FREKUENSI, TINGKAT, INTENSITAS, atau RATING
   - Opsi jawaban: Disesuaikan dengan konteks (frekuensi, tingkat, rating)
   - Format pertanyaan: Bisa berbentuk pertanyaan dengan kata tanya
   - Contoh untuk FREKUENSI: 
     * Pertanyaan: "Seberapa sering tim Anda melakukan code review?"
     * Opsi: Tidak Pernah, Jarang, Kadang-kadang, Sering, Selalu
   - Contoh untuk TINGKAT:
     * Pertanyaan: "Seberapa puas Anda dengan tools yang digunakan?"
     * Opsi: Sangat Tidak Puas, Tidak Puas, Cukup Puas, Puas, Sangat Puas
   - Contoh untuk RATING:
     * Pertanyaan: "Bagaimana Anda menilai kualitas dokumentasi kode?"
     * Opsi: Sangat Buruk, Buruk, Cukup, Baik, Sangat Baik

4. MULTIPLE CHOICE / CHECKBOX / DROPDOWN:
   - Digunakan untuk: Pilihan kategori, karakteristik, atau pilihan spesifik
   - Opsi jawaban: Pilihan kategori yang mutually exclusive
   - Contoh: "Bahasa pemrograman utama yang Anda gunakan?" → JavaScript, Python, Java, Go, Lainnya

ATURAN KESELARASAN PERTANYAAN DAN SKALA (WAJIB DIIKUTI):

✓ JIKA pertanyaan menggunakan kata "seberapa sering", "berapa kali", "frekuensi":
  → Gunakan questionType: "rating_scale" dengan scaleType: "custom"
  → Berikan opsi frekuensi: Tidak Pernah, Jarang, Kadang-kadang, Sering, Selalu

✓ JIKA pertanyaan menggunakan kata "seberapa [sifat]" (seberapa puas, seberapa baik, seberapa mudah):
  → Gunakan questionType: "rating_scale" dengan scaleType: "custom"
  → Berikan opsi tingkat sesuai konteks: Sangat Rendah → Sangat Tinggi

✓ JIKA pertanyaan berbentuk PERNYATAAN untuk mengukur sikap/opini/persepsi:
  → Gunakan questionType: "likert" atau "rating_scale" dengan scaleType: "likert_5" atau "likert_7"
  → JANGAN gunakan kata tanya, gunakan PERNYATAAN

✓ JIKA pertanyaan tentang fakta keberadaan/kepemilikan (ya/tidak):
  → Gunakan questionType: "rating_scale" dengan scaleType: "guttman"

✓ JIKA pertanyaan memerlukan pilihan kategori/pilihan spesifik:
  → Gunakan questionType: "multiple_choice", "checkbox", atau "dropdown"
  → Berikan 3-7 opsi kategori yang jelas

TUGAS:
1. Buat 2-3 versi perbaikan LENGKAP yang netral, jelas, dan fokus
2. Untuk SETIAP versi perbaikan:
   - Tentukan questionType yang paling sesuai (bisa berbeda dari tipe asli)
   - Tulis questionText yang diperbaiki
   - WAJIB: Pastikan struktur pertanyaan selaras dengan scaleType yang dipilih:
     * Jika scaleType adalah likert_5 atau likert_7, pertanyaan HARUS berbentuk PERNYATAAN
     * Jika pertanyaan menggunakan "seberapa sering/berapa kali", scaleType HARUS "custom" dengan opsi frekuensi
     * Jika pertanyaan menggunakan "seberapa [sifat]", scaleType HARUS "custom" dengan opsi tingkat/rating
   - Jika questionType memerlukan opsi (multiple_choice, checkbox, dropdown, closed, mixed, filter), berikan 3-7 opsi jawaban yang:
     * Jelas dan spesifik
     * Mutually exclusive (tidak tumpang tindih)
     * Lengkap (mencakup semua kemungkinan jawaban)
     * Seimbang (tidak mengarahkan responden)
   - Jika questionType adalah likert atau rating_scale, tentukan scaleType (likert_5, likert_7, guttman, custom)
   - Jika scaleType adalah "custom", WAJIB berikan opsi yang sesuai konteks:
     * Frekuensi: Tidak Pernah, Jarang, Kadang-kadang, Sering, Selalu
     * Tingkat Kepuasan: Sangat Tidak Puas, Tidak Puas, Cukup Puas, Puas, Sangat Puas
     * Rating Kualitas: Sangat Buruk, Buruk, Cukup, Baik, Sangat Baik
     * Tingkat Kesulitan: Sangat Sulit, Sulit, Sedang, Mudah, Sangat Mudah
   - Jelaskan rationale untuk semua perubahan (tipe, teks, opsi, dan KESELARASAN dengan scaleType)
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
      "version": "Versi Frekuensi (Custom Scale)",
      "questionText": "Seberapa sering tim Anda melakukan code review sebelum merilis versi baru perangkat lunak?",
      "questionType": "rating_scale",
      "scaleType": "custom",
      "options": [
        {"value": "1", "label": "Tidak Pernah"},
        {"value": "2", "label": "Jarang"},
        {"value": "3", "label": "Kadang-kadang"},
        {"value": "4", "label": "Sering"},
        {"value": "5", "label": "Selalu"}
      ],
      "rationale": "Pertanyaan ini menggunakan kata 'seberapa sering' yang menanyakan FREKUENSI, sehingga harus menggunakan scaleType 'custom' dengan opsi frekuensi yang jelas. Opsi jawaban disesuaikan dengan konteks frekuensi, bukan skala persetujuan likert."
    },
    {
      "version": "Versi Likert (Pernyataan Sikap)",
      "questionText": "Tim saya secara rutin melakukan code review sebelum merilis versi baru perangkat lunak",
      "questionType": "likert",
      "scaleType": "likert_5",
      "options": [],
      "rationale": "Mengubah dari pertanyaan frekuensi menjadi PERNYATAAN sikap yang sesuai dengan skala likert. Pernyataan ini mengukur persepsi responden tentang praktik tim mereka, dan responden akan menjawab dengan tingkat persetujuan (Sangat Tidak Setuju hingga Sangat Setuju)."
    },
    {
      "version": "Versi Ya/Tidak (Fakta)",
      "questionText": "Apakah tim Anda melakukan code review sebelum merilis versi baru perangkat lunak?",
      "questionType": "rating_scale",
      "scaleType": "guttman",
      "options": [],
      "rationale": "Mengubah menjadi pertanyaan faktual sederhana tentang keberadaan praktik code review. Cocok jika peneliti hanya ingin tahu apakah praktik ini dilakukan atau tidak, tanpa mengukur frekuensi atau sikap."
    }
  ],
  "scaleRecommendation": {
    "scaleType": "custom",
    "rationale": "Jika tujuan penelitian adalah mengukur FREKUENSI praktik code review, gunakan scaleType 'custom' dengan opsi frekuensi. Jika tujuan adalah mengukur SIKAP/PERSEPSI tentang praktik code review, gunakan 'likert_5'. Jika hanya ingin tahu KEBERADAAN praktik, gunakan 'guttman'."
  }
}

PENTING: 
- Berikan output HANYA dalam format JSON
- WAJIB sertakan questionType, questionText, scaleType, dan rationale untuk setiap rewrite
- WAJIB sertakan options jika questionType memerlukan opsi atau jika scaleType adalah "custom" (array kosong [] jika tidak perlu)
- Pastikan options relevan dan berkualitas tinggi
- WAJIB: Pastikan KESELARASAN antara struktur pertanyaan dan scaleType
- Perhatikan contoh: pertanyaan frekuensi menggunakan custom dengan opsi frekuensi, pertanyaan likert adalah PERNYATAAN`
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
