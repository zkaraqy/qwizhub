import { GoogleGenerativeAI } from '@google/generative-ai'
import { BaseAIProvider, type AIGenerationInput, type AIGenerationResponse } from './BaseAIProvider'

export class GeminiProvider extends BaseAIProvider {
    private apiKey: string
    private client: GoogleGenerativeAI | null = null
    private model = 'gemini-1.5-pro'

    constructor(apiKey: string, timeout?: number) {
        super(timeout)
        this.apiKey = apiKey

        if (this.apiKey && this.apiKey !== 'your-gemini-api-key-here') {
            try {
                this.client = new GoogleGenerativeAI(this.apiKey)
            } catch (error) {
                console.error('Failed to initialize Gemini client:', error)
            }
        }
    }

    getProviderName(): 'gemini' | 'openai' {
        return 'gemini'
    }

    isAvailable(): boolean {
        return this.client !== null && this.apiKey !== 'your-gemini-api-key-here'
    }

    async generateQuestionnaire(input: AIGenerationInput): Promise<AIGenerationResponse> {
        if (!this.isAvailable()) {
            throw new Error('Gemini provider is not available. Check API key.')
        }

        const startTime = Date.now()
        const sanitizedInput = this.sanitizeInput(input)
        const prompt = this.buildPrompt(sanitizedInput)

        try {
            const model = this.client!.getGenerativeModel({ 
                model: this.model,
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 4096,
                }
            })

            // Create abort controller for timeout
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), this.timeout)

            try {
                const result = await model.generateContent(prompt)
                clearTimeout(timeoutId)

                const response = result.response
                const text = response.text()

                if (!text) {
                    throw new Error('Empty response from Gemini API')
                }

                const questions = this.parseResponse(text)
                const executionTimeMs = Date.now() - startTime

                return {
                    questions,
                    metadata: {
                        provider: 'gemini',
                        model: this.model,
                        tokensUsed: response.usageMetadata?.totalTokenCount,
                        executionTimeMs
                    }
                }
            } catch (error: any) {
                clearTimeout(timeoutId)
                if (error.name === 'AbortError') {
                    throw new Error(`Gemini API request timeout after ${this.timeout}ms`)
                }
                throw error
            }
        } catch (error: any) {
            const executionTimeMs = Date.now() - startTime
            console.error('Gemini generation error:', error)
            
            throw new Error(
                `Gemini API error (${executionTimeMs}ms): ${error.message || 'Unknown error'}`
            )
        }
    }
}

