import OpenAI from 'openai'
import { BaseAIProvider, type AIGenerationInput, type AIGenerationResponse } from './BaseAIProvider'

export class OpenAIProvider extends BaseAIProvider {
    private apiKey: string
    private client: OpenAI | null = null
    private model = 'gpt-3.5-turbo'

    constructor(apiKey: string, timeout?: number) {
        super(timeout)
        this.apiKey = apiKey

        if (this.apiKey && this.apiKey !== 'your-openai-api-key-here') {
            try {
                this.client = new OpenAI({
                    apiKey: this.apiKey
                })
            } catch (error) {
                console.error('Failed to initialize OpenAI client:', error)
            }
        }
    }

    getProviderName(): 'gemini' | 'openai' {
        return 'openai'
    }

    isAvailable(): boolean {
        return this.client !== null && this.apiKey !== 'your-openai-api-key-here'
    }

    async generateQuestionnaire(input: AIGenerationInput): Promise<AIGenerationResponse> {
        if (!this.isAvailable()) {
            throw new Error('OpenAI provider is not available. Check API key.')
        }

        const startTime = Date.now()
        const sanitizedInput = this.sanitizeInput(input)
        const prompt = this.buildPrompt(sanitizedInput)

        try {
            const completion = await this.client!.chat.completions.create({
                model: this.model,
                messages: [
                    {
                        role: 'system',
                        content: 'You are an AI assistant that helps researchers create valid and unbiased research questionnaires. You MUST respond with valid JSON only.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 4096,
                timeout: this.timeout
            })

            const text = completion.choices[0]?.message?.content

            if (!text) {
                throw new Error('Empty response from OpenAI API')
            }

            const questions = this.parseResponse(text)
            const executionTimeMs = Date.now() - startTime

            return {
                questions,
                metadata: {
                    provider: 'openai',
                    model: this.model,
                    tokensUsed: completion.usage?.total_tokens,
                    executionTimeMs
                }
            }
        } catch (error: any) {
            const executionTimeMs = Date.now() - startTime
            console.error('OpenAI generation error:', error)

            if (error.code === 'ETIMEDOUT' || error.message?.includes('timeout')) {
                throw new Error(`OpenAI API request timeout after ${this.timeout}ms`)
            }

            throw new Error(
                `OpenAI API error (${executionTimeMs}ms): ${error.message || 'Unknown error'}`
            )
        }
    }
}
