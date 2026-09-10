import { AIGenerationLog } from '~~/server/models/AIGenerationLog'

export interface RateLimitConfig {
    maxRequests: number
    windowMinutes: number
}

export interface RateLimitResult {
    allowed: boolean
    current: number
    limit: number
    resetAt: Date
}

/**
 * Check if user has exceeded rate limit for AI generation
 */
export async function checkRateLimit(
    userId: string,
    config?: RateLimitConfig
): Promise<RateLimitResult> {
    const maxRequests = config?.maxRequests || 
        parseInt(process.env.AI_RATE_LIMIT_REQUESTS || '5', 10)
    const windowMinutes = config?.windowMinutes || 
        parseInt(process.env.AI_RATE_LIMIT_WINDOW_MINUTES || '60', 10)

    const current = await AIGenerationLog.checkRateLimit(userId, windowMinutes)
    const resetAt = new Date(Date.now() + windowMinutes * 60 * 1000)

    return {
        allowed: current < maxRequests,
        current,
        limit: maxRequests,
        resetAt
    }
}

/**
 * Throw error if rate limit exceeded
 */
export async function enforceRateLimit(
    userId: string,
    config?: RateLimitConfig
): Promise<void> {
    const result = await checkRateLimit(userId, config)

    if (!result.allowed) {
        throw createError({
            statusCode: 429,
            statusMessage: `Rate limit exceeded. You have made ${result.current}/${result.limit} requests. Please try again after ${result.resetAt.toLocaleTimeString()}.`
        })
    }
}
