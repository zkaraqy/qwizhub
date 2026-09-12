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
     * Generate text response from AI (for general use)
     */
    async generateText(prompt: string, signal?: AbortSignal): Promise<string> {
        throw new Error('generateText must be implemented by subclass')
    }

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
1. Buat sejumlah pertanyaan penelitian yang relevan dengan topik, variabel, dan indikator penelitian.
2. Tentukan jumlah pertanyaan berdasarkan kebutuhan pengukuran penelitian. Jumlah pertanyaan tidak dibatasi pada rentang tertentu dan dapat melebihi 15 pertanyaan apabila diperlukan untuk merepresentasikan seluruh variabel dan indikator secara memadai.
3. Pastikan setiap variabel dan indikator penelitian memiliki minimal satu pertanyaan yang relevan dan representatif. Jangan membuat pertanyaan yang tidak memiliki keterkaitan jelas dengan variabel atau indikator penelitian.
4. Setiap pertanyaan harus mengukur satu konsep atau satu aspek yang jelas dan spesifik.
5. HINDARI BIAS:
   - Jangan menggunakan pertanyaan yang mengarahkan responden pada jawaban tertentu (leading question).
   - Jangan menggunakan kata atau pernyataan yang mengandung penilaian, tekanan, atau asumsi tertentu (loaded question).
   - Jangan menggunakan pertanyaan yang mengandung kecenderungan terhadap gender, ras, suku, agama, usia, status sosial, atau kelompok tertentu.
   - Jangan membuat asumsi implisit mengenai pengalaman, pengetahuan, perilaku, atau kondisi responden yang belum tentu dimiliki oleh responden.
6. HINDARI AMBIGUITAS:
   - Gunakan kalimat yang jelas, spesifik, dan mudah dipahami.
   - Hindari istilah yang memiliki makna ganda atau dapat ditafsirkan berbeda oleh responden.
   - Hindari penggunaan kata seperti "sering", "biasanya", "cukup", "baik", atau "efektif" apabila tidak terdapat konteks atau definisi yang jelas.
   - Gunakan periode waktu atau konteks yang spesifik apabila diperlukan.
7. HINDARI DOUBLE-BARRELED QUESTION:
   - Setiap pertanyaan hanya boleh mengukur satu hal.
   - Jangan menggabungkan dua atau lebih aspek dalam satu pertanyaan dengan kata seperti "dan", "atau", atau struktur kalimat yang menyebabkan responden harus memberikan satu jawaban untuk lebih dari satu konsep.
   - Jika terdapat dua aspek yang berbeda, buat menjadi pertanyaan yang terpisah.
8. HINDARI REDUNDANSI:
   - Jangan membuat beberapa pertanyaan yang memiliki makna atau tujuan pengukuran yang sama.
   - Setiap pertanyaan harus memberikan kontribusi pengukuran yang berbeda terhadap indikator atau variabel.
   - Periksa kemiripan makna antarpertanyaan sebelum menghasilkan hasil akhir dan hapus atau ubah pertanyaan yang tumpang tindih.
9. Gunakan bahasa Indonesia yang formal, akademis, objektif, dan mudah dipahami oleh responden sesuai dengan konteks penelitian.
10. Hindari pertanyaan yang terlalu panjang, kompleks, atau menggunakan istilah teknis yang tidak diperlukan. Jika istilah teknis wajib digunakan karena berkaitan dengan topik penelitian, gunakan istilah yang umum atau berikan konteks yang cukup.
11. Untuk setiap pertanyaan, tentukan tipe pertanyaan yang paling sesuai dari:
    - multiple_choice
    - text
    - rating_scale
    - checkbox
    - dropdown
12. Jika menggunakan rating_scale, tentukan skala yang paling sesuai:
    - likert_5
    - likert_7
    - guttman
    - custom
13. Untuk pertanyaan multiple_choice, checkbox, atau dropdown, berikan 3-7 opsi jawaban yang relevan, mutually exclusive apabila hanya satu jawaban diperbolehkan, dan mencakup pilihan yang diperlukan untuk menjawab pertanyaan.
14. Untuk pertanyaan rating_scale, pastikan pernyataan memiliki arah pengukuran yang jelas dan konsisten. Hindari penggunaan kalimat negatif atau reverse statement kecuali memang diperlukan secara metodologis.
15. DETEKSI KUALITAS PERTANYAAN:
    Untuk setiap pertanyaan, lakukan pemeriksaan terhadap:
    - bias
    - ambiguitas
    - double-barreled
    - redundansi
    - relevansi terhadap indikator
    - kejelasan
    - kesesuaian tipe pertanyaan
16. Jika pertanyaan mengandung salah satu masalah tersebut, jangan langsung memasukkannya ke hasil akhir. Perbaiki pertanyaan terlebih dahulu agar memenuhi kriteria kualitas.
17. Setelah pertanyaan diperbaiki, sertakan status pemeriksaan:
    - biasDetected: true/false
    - ambiguityDetected: true/false
    - doubleBarreledDetected: true/false
    - redundancyDetected: true/false
18. Jika salah satu status bernilai true, berikan catatan singkat mengenai masalah yang ditemukan dan jelaskan perbaikannya.
19. Prioritaskan kualitas dan keterukuran pertanyaan dibandingkan jumlah pertanyaan. Jangan menambahkan pertanyaan hanya untuk memenuhi jumlah tertentu.
20. Pastikan hasil akhir memiliki cakupan yang seimbang antarvariabel dan indikator serta tidak memiliki pertanyaan yang saling tumpang tindih.
21. Sebelum menghasilkan hasil akhir, lakukan validasi internal terhadap seluruh pertanyaan untuk memastikan tidak terdapat bias, ambiguitas, double-barreled question, atau redundansi yang dapat dihindari.

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
