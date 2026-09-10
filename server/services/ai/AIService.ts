import { OpenRouterProvider } from './OpenRouterProvider'
import type { AIGenerationInput, AIGenerationResponse } from './BaseAIProvider'

export class AIService {
    private openrouterProvider: OpenRouterProvider
    private timeout: number

    constructor(
        openrouterApiKey: string,
        model: string = 'deepseek/deepseek-chat',
        timeout: number = 30000
    ) {
        this.timeout = timeout
        this.openrouterProvider = new OpenRouterProvider(openrouterApiKey, model, timeout)
    }

    /**
     * Check if OpenRouter provider is available
     */
    isProviderAvailable(): boolean {
        return this.openrouterProvider.isAvailable()
    }

    /**
     * Generate questionnaire using OpenRouter
     */
    async generateQuestionnaire(input: AIGenerationInput): Promise<{
        response: AIGenerationResponse
        usedProvider: 'openrouter'
        fallbackUsed: boolean
    }> {
        if (!this.openrouterProvider.isAvailable()) {
            throw new Error('OpenRouter provider is not available. Check API key configuration.')
        }

        try {
            console.log('[AIService] Attempting generation with OpenRouter...')
            const response = await this.openrouterProvider.generateQuestionnaire(input)
            return {
                response,
                usedProvider: 'openrouter',
                fallbackUsed: false
            }
        } catch (error: any) {
            console.error('[AIService] OpenRouter failed:', error.message)
            throw new Error(`OpenRouter generation failed: ${error.message}`)
        }
    }

    /**
     * Get current model being used
     */
    getModel(): string {
        return process.env.OPENROUTER_MODEL || 'deepseek/deepseek-chat'
    }
}

/**
 * Create AIService instance from environment variables
 */
export function createAIService(): AIService {
    const openrouterKey = process.env.OPENROUTER_API_KEY || ''
    const model = process.env.OPENROUTER_MODEL || 'deepseek/deepseek-chat'
    const timeout = parseInt(process.env.AI_REQUEST_TIMEOUT_MS || '30000', 10)

    return new AIService(openrouterKey, model, timeout)
}

