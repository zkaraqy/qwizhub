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
    protected timeout: number = 60000 // 60 seconds default

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
        console.log('[BaseAIProvider] Building prompt for input:', {input})
        return `Anda adalah asisten AI yang membantu peneliti membuat kuesioner penelitian yang valid dan tidak bias.

TUGAS: Buatlah draf pertanyaan kuesioner berdasarkan informasi berikut:

TOPIK PENELITIAN:
${input.topic}

TUJUAN PENELITIAN:
${objective || 'Tidak ada tujuan penelitian yang diberikan'}

VARIABEL YANG AKAN DIUKUR:
${input.variables.length > 0 ? input.variables.map((v, i) => `${i + 1}. ${v}`).join('\n') : 'Tidak ada variabel yang diberikan'}

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

VALIDASI SEBELUM MENGHASILKAN OUTPUT:
Sebelum membuat setiap pertanyaan, periksa:
1. Apakah struktur pertanyaan (pernyataan vs pertanyaan) sesuai dengan scaleType?
2. Apakah kata-kata dalam pertanyaan cocok dengan jenis opsi jawaban?
3. Apakah opsi jawaban yang diberikan relevan dengan pertanyaan?
4. Jika ada ketidaksesuaian, UBAH pertanyaan atau scaleType agar selaras

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
    - multiple_choice (pilihan kategori dengan satu jawaban)
    - checkbox (pilihan kategori dengan banyak jawaban)
    - dropdown (pilihan kategori dalam dropdown)
    - text (jawaban terbuka)
    - likert (skala persetujuan terhadap PERNYATAAN)
    - rating_scale (skala rating/frekuensi/tingkat)
12. Jika menggunakan likert atau rating_scale, tentukan scaleType yang sesuai:
    - likert_5 atau likert_7: HANYA untuk pertanyaan berbentuk PERNYATAAN sikap/opini
    - guttman: HANYA untuk pertanyaan faktual Ya/Tidak
    - custom: untuk pertanyaan frekuensi/tingkat/rating dengan opsi kustom
13. WAJIB: Pastikan keselarasan antara struktur pertanyaan dan scaleType:
    - Jika scaleType adalah likert_5 atau likert_7, pertanyaan HARUS berbentuk PERNYATAAN (bukan pertanyaan dengan kata tanya)
    - Jika pertanyaan menggunakan "seberapa sering/berapa kali", scaleType HARUS "custom" dan berikan opsi frekuensi
    - Jika pertanyaan menggunakan "seberapa [sifat]", scaleType HARUS "custom" dan berikan opsi tingkat/rating
    - Jika pertanyaan faktual ya/tidak, scaleType HARUS "guttman"
14. Untuk pertanyaan multiple_choice, checkbox, atau dropdown, berikan 3-7 opsi jawaban yang relevan, mutually exclusive apabila hanya satu jawaban diperbolehkan, dan mencakup pilihan yang diperlukan untuk menjawab pertanyaan.
15. Untuk pertanyaan dengan scaleType "custom", WAJIB berikan opsi jawaban yang sesuai konteks:
    - Frekuensi: ["Tidak Pernah", "Jarang", "Kadang-kadang", "Sering", "Selalu"]
    - Tingkat Kepuasan: ["Sangat Tidak Puas", "Tidak Puas", "Cukup Puas", "Puas", "Sangat Puas"]
    - Rating Kualitas: ["Sangat Buruk", "Buruk", "Cukup", "Baik", "Sangat Baik"]
    - Tingkat Kesulitan: ["Sangat Sulit", "Sulit", "Sedang", "Mudah", "Sangat Mudah"]
16. Untuk pertanyaan rating_scale dengan scaleType likert, pastikan pernyataan memiliki arah pengukuran yang jelas dan konsisten. Hindari penggunaan kalimat negatif atau reverse statement kecuali memang diperlukan secara metodologis.
17. DETEKSI KUALITAS PERTANYAAN:
    Untuk setiap pertanyaan, lakukan pemeriksaan terhadap:
    - bias
    - ambiguitas
    - double-barreled
    - redundansi
    - relevansi terhadap indikator
    - kejelaran
    - kesesuaian tipe pertanyaan
    - KESELARASAN antara struktur pertanyaan dan scaleType (PENTING!)
18. Jika pertanyaan mengandung salah satu masalah tersebut, jangan langsung memasukkannya ke hasil akhir. Perbaiki pertanyaan terlebih dahulu agar memenuhi kriteria kualitas.
19. Setelah pertanyaan diperbaiki, sertakan status pemeriksaan:
    - biasDetected: true/false
    - ambiguityDetected: true/false
    - doubleBarreledDetected: true/false
    - redundancyDetected: true/false
20. Jika salah satu status bernilai true, berikan catatan singkat mengenai masalah yang ditemukan dan jelaskan perbaikannya.
21. Prioritaskan kualitas dan keterukuran pertanyaan dibandingkan jumlah pertanyaan. Jangan menambahkan pertanyaan hanya untuk memenuhi jumlah tertentu.
22. Pastikan hasil akhir memiliki cakupan yang seimbang antarvariabel dan indikator serta tidak memiliki pertanyaan yang saling tumpang tindih.
23. VALIDASI AKHIR: Sebelum menghasilkan hasil akhir, periksa SETIAP pertanyaan:
    - Apakah struktur pertanyaan sesuai dengan scaleType?
    - Apakah opsi jawaban sesuai dengan pertanyaan?
    - Apakah tidak ada mismatch antara pertanyaan dan skala?
    - Jika ada ketidaksesuaian, PERBAIKI sebelum output!

OUTPUT FORMAT (WAJIB JSON):
Berikan output HANYA dalam format JSON berikut, tanpa penjelasan tambahan:

{
  "questions": [
    {
      "questionText": "Sistem code review di tim saya berjalan dengan efektif",
      "questionType": "likert",
      "scaleType": "likert_5",
      "options": [],
      "biasDetected": false,
      "biasNotes": null,
      "recommendedScaleType": "likert_5"
    },
    {
      "questionText": "Seberapa sering tim Anda melakukan code review sebelum merilis versi baru?",
      "questionType": "rating_scale",
      "scaleType": "custom",
      "options": [
        {"value": "1", "label": "Tidak Pernah"},
        {"value": "2", "label": "Jarang"},
        {"value": "3", "label": "Kadang-kadang"},
        {"value": "4", "label": "Sering"},
        {"value": "5", "label": "Selalu"}
      ],
      "biasDetected": false,
      "biasNotes": null,
      "recommendedScaleType": "custom"
    },
    {
      "questionText": "Bahasa pemrograman utama yang Anda gunakan?",
      "questionType": "multiple_choice",
      "scaleType": null,
      "options": [
        {"value": "1", "label": "JavaScript"},
        {"value": "2", "label": "Python"},
        {"value": "3", "label": "Java"},
        {"value": "4", "label": "Go"},
        {"value": "5", "label": "Lainnya"}
      ],
      "biasDetected": false,
      "biasNotes": null,
      "recommendedScaleType": null
    },
    {
      "questionText": "Apakah tim Anda menggunakan version control (Git)?",
      "questionType": "rating_scale",
      "scaleType": "guttman",
      "options": [],
      "biasDetected": false,
      "biasNotes": null,
      "recommendedScaleType": "guttman"
    }
  ]
}

PENTING: 
- Respons Anda HARUS berupa valid JSON saja, tanpa markdown code blocks, tanpa penjelasan tambahan
- WAJIB pastikan setiap pertanyaan selaras dengan scaleType-nya
- Perhatikan contoh di atas: pertanyaan likert adalah PERNYATAAN, pertanyaan frekuensi menggunakan custom dengan opsi frekuensi`
    }

    /**
     * Comprehensive JSON repair with multiple strategies
     */
    protected repairJSON(jsonString: string): string {
        let repaired = jsonString
        
        // Strategy 1: Remove trailing commas
        repaired = repaired.replace(/,(\s*[}\]])/g, '$1')
        
        // Strategy 2: Fix truncated strings (incomplete quotes)
        // Count quotes to see if we have an odd number (unclosed string)
        const quoteCount = (repaired.match(/(?<!\\)"/g) || []).length
        if (quoteCount % 2 !== 0) {
            console.log('[BaseAIProvider] Detected unclosed string')
            // Find the last quote and truncate before it
            const lastQuoteIndex = repaired.lastIndexOf('"')
            if (lastQuoteIndex > 0) {
                // Find the last complete object before this quote
                let truncateAt = lastQuoteIndex
                for (let i = lastQuoteIndex - 1; i >= 0; i--) {
                    if (repaired[i] === '}') {
                        truncateAt = i + 1
                        break
                    }
                }
                repaired = repaired.substring(0, truncateAt)
            }
        }
        
        // Strategy 3: Fix truncated arrays/objects - close any unclosed structures
        let openBrackets = 0
        let openBraces = 0
        let inString = false
        let escapeNext = false
        
        for (let i = 0; i < repaired.length; i++) {
            const char = repaired[i]
            
            if (escapeNext) {
                escapeNext = false
                continue
            }
            
            if (char === '\\') {
                escapeNext = true
                continue
            }
            
            if (char === '"') {
                inString = !inString
            }
            
            if (!inString) {
                if (char === '[') openBrackets++
                if (char === ']') openBrackets--
                if (char === '{') openBraces++
                if (char === '}') openBraces--
            }
        }
        
        // Close any unclosed structures
        if (openBrackets > 0 || openBraces > 0) {
            console.log(`[BaseAIProvider] Detected unclosed structures: ${openBrackets} brackets, ${openBraces} braces`)
            
            // Remove any trailing incomplete content after the last complete object
            const lastCompleteObject = repaired.lastIndexOf('}')
            if (lastCompleteObject > 0) {
                repaired = repaired.substring(0, lastCompleteObject + 1)
                
                // Recount after truncation
                openBrackets = 0
                openBraces = 0
                inString = false
                escapeNext = false
                
                for (let i = 0; i < repaired.length; i++) {
                    const char = repaired[i]
                    
                    if (escapeNext) {
                        escapeNext = false
                        continue
                    }
                    
                    if (char === '\\') {
                        escapeNext = true
                        continue
                    }
                    
                    if (char === '"') {
                        inString = !inString
                    }
                    
                    if (!inString) {
                        if (char === '[') openBrackets++
                        if (char === ']') openBrackets--
                        if (char === '{') openBraces++
                        if (char === '}') openBraces--
                    }
                }
            }
            
            // Add closing brackets/braces
            while (openBrackets > 0) {
                repaired += ']'
                openBrackets--
            }
            while (openBraces > 0) {
                repaired += '}'
                openBraces--
            }
            
            console.log('[BaseAIProvider] Added closing structures')
        }
        
        return repaired
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

            // Try to extract JSON if there's extra text before/after
            const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
            if (jsonMatch) {
                cleaned = jsonMatch[0]
            }

            // Log for debugging (first 500 chars)
            if (cleaned.length > 500) {
                console.log('[BaseAIProvider] Parsing JSON response (truncated):', cleaned.substring(0, 500) + '...')
            } else {
                console.log('[BaseAIProvider] Parsing JSON response:', cleaned)
            }

            let parsed
            try {
                parsed = JSON.parse(cleaned)
            } catch (parseError: any) {
                // Log the exact position of the error for debugging
                console.error('[BaseAIProvider] JSON parse error:', parseError.message)
                console.error('[BaseAIProvider] Raw response (first 1000 chars):', rawResponse.substring(0, 1000))
                console.error('[BaseAIProvider] Cleaned response (first 1000 chars):', cleaned.substring(0, 1000))
                
                // Try to find and log the problematic area
                const errorMatch = parseError.message.match(/position (\d+)/)
                if (errorMatch) {
                    const position = parseInt(errorMatch[1])
                    const start = Math.max(0, position - 50)
                    const end = Math.min(cleaned.length, position + 50)
                    console.error('[BaseAIProvider] Context around error:', cleaned.substring(start, end))
                }
                
                // Attempt to repair JSON with comprehensive strategies
                console.log('[BaseAIProvider] Attempting to repair JSON with multiple strategies...')
                try {
                    // Use comprehensive repair method
                    const repaired = this.repairJSON(cleaned)
                    console.log('[BaseAIProvider] Repaired JSON (first 500 chars):', repaired.substring(0, 500) + '...')
                    parsed = JSON.parse(repaired)
                    console.log('[BaseAIProvider] Successfully repaired and parsed JSON')
                } catch (repairError: any) {
                    console.error('[BaseAIProvider] Repair failed:', repairError.message)
                    
                    // Last resort: try to extract partial valid JSON
                    console.log('[BaseAIProvider] Attempting to extract partial valid JSON...')
                    try {
                        // Find the last complete question object
                        const questionsMatch = cleaned.match(/"questions"\s*:\s*\[([\s\S]*)\]/)
                        if (questionsMatch) {
                            const questionsContent = questionsMatch[1]
                            const lastCompleteObject = questionsContent.lastIndexOf('}')
                            
                            if (lastCompleteObject > 0) {
                                // Extract up to last complete object
                                const truncatedQuestions = questionsContent?.substring(0, lastCompleteObject + 1)
                                const partialJSON = `{"questions":[${truncatedQuestions}]}`
                                
                                // Try to repair this partial JSON
                                const repairedPartial = this.repairJSON(partialJSON)
                                parsed = JSON.parse(repairedPartial)
                                console.log('[BaseAIProvider] Successfully extracted partial JSON with', parsed.questions?.length || 0, 'questions')
                            }
                        }
                    } catch (partialError) {
                        // If all repair attempts fail, throw the original error with more context
                        throw new Error(`${parseError.message}\n\nThis usually happens when the AI returns malformed JSON. Please try again.`)
                    }
                }
            }

            if (!parsed.questions || !Array.isArray(parsed.questions)) {
                throw new Error('Invalid response: missing questions array')
            }

            // Validate each question
            return parsed.questions.map((q: any, index: number) => {
                if (!q.questionText || typeof q.questionText !== 'string') {
                    throw new Error(`Question ${index + 1}: missing or invalid questionText`)
                }

                // Validate against all valid question types from Question model
                const validQuestionTypes = ['multiple_choice', 'text', 'rating_scale', 'checkbox', 'dropdown', 'closed', 'mixed', 'likert', 'filter']
                if (!validQuestionTypes.includes(q.questionType)) {
                    throw new Error(`Question ${index + 1}: invalid questionType "${q.questionType}". Valid types: ${validQuestionTypes.join(', ')}`)
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
