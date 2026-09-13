import { BaseAIProvider } from './BaseAIProvider'

export interface IndicatorGenerationInput {
    variableName: string
    variableType: 'independent' | 'dependent' | 'moderating' | 'intervening' | 'control'
    researchTopic: string
    researchObjective: string
    description?: string
    indicatorCount: number
}

export interface GeneratedIndicator {
    indicatorText: string
    rationale?: string
}

export interface IndicatorGenerationResponse {
    indicators: GeneratedIndicator[]
    metadata: {
        provider: 'gemini' | 'openai' | 'openrouter'
        model: string
        tokensUsed?: number
        executionTimeMs: number
    }
}

export class IndicatorGenerator {
    private timeout: number

    constructor(private aiProvider: BaseAIProvider, timeout: number = 60000) {
        this.timeout = timeout
    }

    async generateIndicators(input: IndicatorGenerationInput): Promise<IndicatorGenerationResponse> {
        const startTime = Date.now()
        const prompt = this.buildPrompt(input)

        let lastError: any = null
        for (let attempt = 1; attempt <= 2; attempt++) {
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), this.timeout)

            try {
                const response = await this.aiProvider.generateText(prompt, controller.signal)
                clearTimeout(timeoutId)

                const indicators = this.parseResponse(response)
                const executionTimeMs = Date.now() - startTime

                return {
                    indicators,
                    metadata: {
                        provider: 'openrouter',
                        model: this.aiProvider.getProviderName(),
                        executionTimeMs
                    }
                }
            } catch (error: any) {
                clearTimeout(timeoutId)
                lastError = error
                console.warn(`[IndicatorGenerator] Percobaan ${attempt} gagal (${Date.now() - startTime}ms): ${error.message}`)
                if (attempt < 2) {
                    await new Promise(res => setTimeout(res, 1500))
                }
            }
        }

        const executionTimeMs = Date.now() - startTime
        console.error('Indicator generation error after retries:', lastError)
        throw new Error(`Gagal generate indikator AI (${executionTimeMs}ms): ${lastError?.message || 'Timeout'}`)
    }

    private buildPrompt(input: IndicatorGenerationInput): string {
        const variableTypeLabel = this.getVariableTypeLabel(input.variableType)
        
        return `Anda adalah asisten AI yang membantu peneliti mengidentifikasi indikator pengukuran untuk variabel penelitian.

KONTEKS PENELITIAN:
Topik: ${input.researchTopic}
Tujuan: ${input.researchObjective}

VARIABEL YANG AKAN DIUKUR:
Nama Variabel: ${input.variableName}
Tipe Variabel: ${variableTypeLabel}
${input.description ? `Deskripsi: ${input.description}` : ''}

TUGAS:
Buatlah ${input.indicatorCount} indikator pengukuran yang spesifik, terukur, dan relevan untuk variabel "${input.variableName}" dalam konteks penelitian ini.

KRITERIA INDIKATOR YANG BAIK:
1. Spesifik dan jelas (tidak ambigu)
2. Terukur (dapat dikuantifikasi atau dikualifikasi)
3. Relevan dengan variabel dan konteks penelitian
4. Tidak tumpang tindih satu sama lain
5. Komprehensif mencakup aspek utama variabel

OUTPUT FORMAT (WAJIB JSON):
Berikan output HANYA dalam format JSON berikut:

{
  "indicators": [
    {
      "indicatorText": "Nama indikator yang spesifik",
      "rationale": "Penjelasan singkat mengapa indikator ini penting"
    }
  ]
}

CONTOH:
Untuk variabel "Kepuasan Pengguna", indikator yang baik:
- "Kesesuaian dengan harapan"
- "Kepuasan pengalaman penggunaan"
- "Niat menggunakan kembali"
- "Kesediaan merekomendasikan"

PENTING: Respons Anda HARUS berupa valid JSON saja, tanpa markdown, tanpa penjelasan tambahan.`
    }

    private parseResponse(rawResponse: string): GeneratedIndicator[] {
        try {
            let cleaned = rawResponse.trim()
            
            // Remove markdown code blocks if present
            if (cleaned.startsWith('```json')) {
                cleaned = cleaned.replace(/```json\s*/g, '').replace(/```\s*$/g, '')
            } else if (cleaned.startsWith('```')) {
                cleaned = cleaned.replace(/```\s*/g, '')
            }

            const parsed = JSON.parse(cleaned)

            if (!parsed.indicators || !Array.isArray(parsed.indicators)) {
                throw new Error('Invalid response: missing indicators array')
            }

            return parsed.indicators.map((ind: any, index: number) => {
                if (!ind.indicatorText || typeof ind.indicatorText !== 'string') {
                    throw new Error(`Indicator ${index + 1}: missing or invalid indicatorText`)
                }

                return {
                    indicatorText: ind.indicatorText.trim(),
                    rationale: ind.rationale ? ind.rationale.trim() : undefined
                }
            })
        } catch (error: any) {
            console.error('Failed to parse indicator response:', rawResponse)
            throw new Error(`Failed to parse AI response: ${error.message}`)
        }
    }

    private getVariableTypeLabel(type: string): string {
        const labels: Record<string, string> = {
            independent: 'Variabel Independen (X) - Variabel yang mempengaruhi',
            dependent: 'Variabel Dependen (Y) - Variabel yang dipengaruhi',
            moderating: 'Variabel Moderating - Variabel yang memperkuat/memperlemah hubungan',
            intervening: 'Variabel Intervening - Variabel perantara',
            control: 'Variabel Kontrol - Variabel yang dikontrol'
        }
        return labels[type] || type
    }
}
