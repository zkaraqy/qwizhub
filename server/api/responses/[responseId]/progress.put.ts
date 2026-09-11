import { defineEventHandler, readBody, createError } from 'h3'
import { getServerSession } from '#auth'
import { Response } from '~~/server/models'

/**
 * PUT /api/responses/:responseId/progress
 * Save progress (auto-save) for a response
 */
export default defineEventHandler(async (event) => {
    try {
        const session = await getServerSession(event)
        if (!session || !session.user) {
            throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
        }

        const responseId = event.context.params?.responseId

        if (!responseId) {
            throw createError({ statusCode: 400, statusMessage: 'Response ID is required' })
        }

        const body = await readBody(event)
        const { answers } = body

        if (!answers || !Array.isArray(answers)) {
            throw createError({ statusCode: 400, statusMessage: 'Answers must be an array' })
        }

        // Fetch response
        const response = await Response.findByPk(responseId)

        if (!response) {
            throw createError({ statusCode: 404, statusMessage: 'Response not found' })
        }

        // Check ownership
        if (response.respondentId !== session.user.id) {
            throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
        }

        // Check status
        if (response.status === 'completed') {
            throw createError({ statusCode: 400, statusMessage: 'Response is already completed' })
        }

        // Update answers
        response.answers = answers
        await response.save()

        return {
            success: true,
            message: 'Progress saved',
            data: {
                id: response.id,
                answers: response.answers,
                updatedAt: response.updatedAt
            }
        }
    } catch (error: any) {
        console.error('Save progress error:', error)
        throw createError({
            statusCode: error.statusCode || 500,
            statusMessage: error.statusMessage || 'Failed to save progress'
        })
    }
})
