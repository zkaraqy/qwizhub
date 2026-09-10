import { BaseAIProvider, type AIGenerationInput, type AIGenerationResponse } from './BaseAIProvider'

export class OpenRouterProvider extends BaseAIProvider {
    private apiKey: string
    private model: string
    private baseUrl = 'https://openrouter.ai/api/v1/chat/completions'

    constructor(apiKey: string, model?: string, timeout?: number) {
        super(timeout)
        this.apiKey = apiKey
        this.model = model || 'deepseek/deepseek-chat'
    }

    getProviderName(): 'gemini' | 'openai' {
        return 'openai' // Return 'openai' for compatibility with enum type
    }

    isAvailable(): boolean {
        return this.apiKey !== '' && this.apiKey !== 'your-openrouter-api-key-here'
    }

    async generateQuestionnaire(input: AIGenerationInput): Promise<AIGenerationResponse> {
        if (!this.isAvailable()) {
            throw new Error('OpenRouter provider is not available. Check API key.')
        }

        const startTime = Date.now()
        const sanitizedInput = this.sanitizeInput(input)
        const prompt = this.buildPrompt(sanitizedInput)

        try {
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), this.timeout)

            try {
                const response = await fetch(this.baseUrl, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json',
                        'HTTP-Referer': process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
                        'X-Title': 'QwizHub AI Questionnaire Generator'
                    },
                    body: JSON.stringify({
                        model: this.model,
                        messages: [
                            {
                                role: 'system',
                                content: 'You are an expert research assistant specialized in creating survey questionnaires. Generate questions in valid JSON format only. Detect potential biases in questions.'
                            },
                            {
                                role: 'user',
                                content: prompt
                            }
                        ],
                        temperature: 0.7,
                        max_tokens: 4096
                    }),
                    signal: controller.signal
                })

                clearTimeout(timeoutId)

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}))
                    throw new Error(
                        `OpenRouter API error (${response.status}): ${
                            errorData.error?.message || response.statusText
                        }`
                    )
                }

                const data = await response.json()

                if (!data.choices?.[0]?.message?.content) {
                    throw new Error('Empty response from OpenRouter API')
                }

                let content = data.choices[0].message.content.trim()
                
                // Remove <think> tags if present (for reasoning models)
                content = content.replace(/<think>[\s\S]*?<\/think>\s*/g, '')

                const questions = this.parseResponse(content)
                const executionTimeMs = Date.now() - startTime

                return {
                    questions,
                    metadata: {
                        provider: 'openrouter',
                        model: this.model,
                        tokensUsed: data.usage?.total_tokens,
                        executionTimeMs
                    }
                }
            } catch (error: any) {
                clearTimeout(timeoutId)
                if (error.name === 'AbortError') {
                    throw new Error(`OpenRouter API request timeout after ${this.timeout}ms`)
                }
                throw error
            }
        } catch (error: any) {
            const executionTimeMs = Date.now() - startTime
            console.error('OpenRouter generation error:', error)

            throw new Error(
                `OpenRouter API error (${executionTimeMs}ms): ${error.message || 'Unknown error'}`
            )
        }
    }
}
