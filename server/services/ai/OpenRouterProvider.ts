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
            const content = await this.generateText(prompt)
            const questions = this.parseResponse(content)
            const executionTimeMs = Date.now() - startTime

            return {
                questions,
                metadata: {
                    provider: 'openrouter',
                    model: this.model,
                    executionTimeMs
                }
            }
        } catch (error: any) {
            const executionTimeMs = Date.now() - startTime
            console.error('OpenRouter generation error:', error)

            throw new Error(
                `OpenRouter API error (${executionTimeMs}ms): ${error.message || 'Unknown error'}`
            )
        }
    }

    async generateText(prompt: string, signal?: AbortSignal): Promise<string> {
        if (!this.isAvailable()) {
            throw new Error('OpenRouter provider is not available. Check API key.')
        }

        try {
            const controller = signal ? undefined : new AbortController()
            const timeoutId = controller ? setTimeout(() => controller.abort(), this.timeout) : undefined

            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
                    'X-Title': 'QwizHub AI Research Assistant'
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: [
                        {
                            role: 'system',
                            content: 'You are an expert research assistant. Always respond in valid JSON format.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 2048
                }),
                signal: signal || controller?.signal
            })

            if (timeoutId) clearTimeout(timeoutId)

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

            let content = data.choices[0].message.content

            if (typeof content !== 'string') {
                throw new Error('Invalid response format: content is not a string')
            }

            content = content.trim()

            if (!content) {
                throw new Error('Empty content after trimming')
            }

            // Remove <think> tags if present
            content = content.replace(/<think>[\s\S]*?<\/think>\s*/g, '')

            return content
        } catch (error: any) {
            if (error.name === 'AbortError') {
                throw new Error(`OpenRouter API request timeout after ${this.timeout}ms`)
            }
            throw error
        }
    }
}
