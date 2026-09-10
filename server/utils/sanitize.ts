/**
 * Sanitize text input to prevent prompt injection attacks
 */
export function sanitizePromptInput(text: string): string {
    if (!text || typeof text !== 'string') {
        return ''
    }

    return text
        // Remove common prompt injection patterns
        .replace(/system\s*:/gi, '')
        .replace(/assistant\s*:/gi, '')
        .replace(/user\s*:/gi, '')
        .replace(/<\|.*?\|>/g, '')
        .replace(/\[INST\]/gi, '')
        .replace(/\[\/INST\]/gi, '')
        .replace(/<<SYS>>/gi, '')
        .replace(/<\/SYS>>/gi, '')
        // Remove excessive whitespace
        .replace(/\s+/g, ' ')
        .trim()
}

/**
 * Sanitize array of text inputs
 */
export function sanitizePromptInputArray(texts: string[]): string[] {
    if (!Array.isArray(texts)) {
        return []
    }

    return texts
        .filter(t => t && typeof t === 'string')
        .map(t => sanitizePromptInput(t))
        .filter(t => t.length > 0)
}

/**
 * Validate research input for AI generation
 */
export function validateResearchInput(input: {
    topic?: string
    researchObjective?: string
    variables?: string[]
}): {
    valid: boolean
    errors: string[]
} {
    const errors: string[] = []

    if (!input.topic || input.topic.trim().length === 0) {
        errors.push('Topic is required')
    } else if (input.topic.length < 10) {
        errors.push('Topic must be at least 10 characters')
    } else if (input.topic.length > 500) {
        errors.push('Topic must not exceed 500 characters')
    }

    if (!input.researchObjective || input.researchObjective.trim().length === 0) {
        errors.push('Research objective is required')
    } else if (input.researchObjective.length < 20) {
        errors.push('Research objective must be at least 20 characters')
    } else if (input.researchObjective.length > 1000) {
        errors.push('Research objective must not exceed 1000 characters')
    }

    if (!input.variables || !Array.isArray(input.variables) || input.variables.length === 0) {
        errors.push('At least one variable is required')
    } else if (input.variables.length > 10) {
        errors.push('Maximum 10 variables allowed')
    } else {
        input.variables.forEach((v, i) => {
            if (!v || v.trim().length === 0) {
                errors.push(`Variable ${i + 1} is empty`)
            } else if (v.length > 200) {
                errors.push(`Variable ${i + 1} exceeds 200 characters`)
            }
        })
    }

    return {
        valid: errors.length === 0,
        errors
    }
}
