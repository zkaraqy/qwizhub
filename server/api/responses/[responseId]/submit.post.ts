import { defineEventHandler, readBody, createError } from 'h3'
import { getServerSession } from '#auth'
import { v4 as uuidv4 } from 'uuid'
import { Response, Questionnaire, Question, User, HonorTransaction } from '~~/server/models'

/**
 * POST /api/responses/:responseId/submit
 * Submit final response and trigger honor payment
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
        const response = await Response.findByPk(responseId, {
            include: [
                {
                    model: Questionnaire,
                    as: 'questionnaire',
                    include: [
                        {
                            model: Question,
                            as: 'questions'
                        }
                    ]
                }
            ]
        })

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

        // Validate all questions are answered
        const questionnaire = response.questionnaire
        if (!questionnaire) {
            throw createError({ statusCode: 400, statusMessage: 'Questionnaire not found' })
        }

        const totalQuestions = questionnaire.questions?.length || 0
        if (answers.length < totalQuestions) {
            throw createError({ 
                statusCode: 400, 
                statusMessage: `Please answer all questions. ${answers.length}/${totalQuestions} answered` 
            })
        }

        // Mark timestamps on all answers
        const timestampedAnswers = answers.map(answer => ({
            ...answer,
            answeredAt: answer.answeredAt || new Date()
        }))

        // Update response to completed
        response.answers = timestampedAnswers
        response.status = 'completed'
        response.completedAt = new Date()
        await response.save()

        // Increment questionnaire response count
        await questionnaire.incrementResponses()

        // Create honor transaction
        const honorTransaction = await HonorTransaction.create({
            id: uuidv4(),
            responseId: response.id,
            respondentId: response.respondentId,
            amount: response.honorAmount,
            status: 'pending'
        })

        // Mark honor as paid immediately (in real app, this would be async)
        await honorTransaction.markAsPaid()
        response.honorPaid = true
        await response.save()

        // Update user stats
        const user = await User.findByPk(response.respondentId)
        if (user) {
            user.totalQuestionnairesAnswered = (user.totalQuestionnairesAnswered || 0) + 1
            user.totalHonorEarned = (user.totalHonorEarned || 0) + response.honorAmount
            await user.save()
        }

        return {
            success: true,
            message: 'Response submitted successfully',
            data: {
                responseId: response.id,
                completedAt: response.completedAt,
                honorAmount: response.honorAmount,
                honorPaid: response.honorPaid,
                timeSpent: response.getTimeSpent()
            }
        }
    } catch (error: any) {
        console.error('Submit response error:', error)
        throw createError({
            statusCode: error.statusCode || 500,
            statusMessage: error.statusMessage || 'Failed to submit response'
        })
    }
})
